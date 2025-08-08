import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from urllib.parse import parse_qs
from .models import Post, GroupChatMessage
from .serializers import GroupChatMessageSerializer

User = get_user_model()

class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.post_id = self.scope['url_route']['kwargs']['post_id']
            self.post_group_name = f'groupchat_{self.post_id}'
            
            query_string = self.scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]
            
            if not token:
                await self.close(code=4000)
                return
                
            self.user = await self.get_user_from_token(token)
            if not self.user:
                await self.close(code=4001)
                return
                
            is_member = await self.check_user_membership()
            if not is_member:
                await self.close(code=4003)
                return
                
            await self.accept()
            await self.channel_layer.group_add(
                self.post_group_name,
                self.channel_name
            )
            
            # Send existing messages to the newly connected user
            await self.send_existing_messages()
            
            print(f"User {self.user.username} connected to chat {self.post_id}")
            
        except Exception as e:
            print(f"Connection error: {e}")
            await self.close(code=4002)

    async def disconnect(self, close_code):
        if hasattr(self, 'post_group_name'):
            await self.channel_layer.group_discard(
                self.post_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Only process messages with the correct type
            if data.get('type') != 'message':
                return
                
            message = data.get('message', '').strip()
            if not message:
                return
                
            # Save and broadcast message
            saved_message = await self.save_message(message)
            if saved_message:
                await self.channel_layer.group_send(
                    self.post_group_name,
                    {
                        'type': 'chat_message',
                        'message': saved_message
                    }
                )
                
        except json.JSONDecodeError:
            print("Received invalid JSON")
        except Exception as e:
            print(f"Error processing message: {e}")

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            **event['message']
        }))

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            UntypedToken(token)  # Validate token
            access_token = AccessToken(token)
            return User.objects.get(id=access_token['user_id'])
        except (InvalidToken, TokenError, User.DoesNotExist) as e:
            print(f"Token validation error: {e}")
            return None

    @database_sync_to_async
    def check_user_membership(self):
        try:
            post = Post.objects.get(id=self.post_id)
            return self.user in post.attendees.all()
        except Post.DoesNotExist:
            print(f"Post {self.post_id} not found")
            return False
        except Exception as e:
            print(f"Membership check error: {e}")
            return False

    @database_sync_to_async
    def save_message(self, message_text):
        try:
            post = Post.objects.get(id=self.post_id)
            message = GroupChatMessage.objects.create(
                post=post,
                sender=self.user,
                message=message_text
            )
            serializer = GroupChatMessageSerializer(message)
            return {
                'id': serializer.data['id'],
                'username': serializer.data['sender_username'],
                'message': serializer.data['message'],
                'timestamp': serializer.data['timestamp']
            }
        except Exception as e:
            print(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def get_existing_messages(self):
        try:
            messages = GroupChatMessage.objects.filter(
                post_id=self.post_id
            ).order_by('timestamp')[:50]  # Limit to 50 most recent messages
            serializer = GroupChatMessageSerializer(messages, many=True)
            return [
                {
                    'id': msg['id'],
                    'username': msg['sender_username'],
                    'message': msg['message'],
                    'timestamp': msg['timestamp']
                }
                for msg in serializer.data
            ]
        except Exception as e:
            print(f"Error loading messages: {e}")
            return []

    async def send_existing_messages(self):
        messages = await self.get_existing_messages()
        if messages:
            await self.send(text_data=json.dumps({
                'type': 'existing_messages',
                'messages': messages
            }))