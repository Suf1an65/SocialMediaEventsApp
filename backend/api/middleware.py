# api/middleware.py
from urllib.parse import parse_qs
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
from django.db import close_old_connections
from channels.db import database_sync_to_async

User = get_user_model()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        close_old_connections()
        
        try:
            # Extract token from query string
            query_string = scope.get("query_string", b"").decode()
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]
            
            if not token:
                raise ValueError("No token provided")
                
            # Validate token
            UntypedToken(token)
            
            # Get user from token
            user = await self.get_user(token)
            
            if not user:
                raise ValueError("User not found")
                
            scope["user"] = user
            return await self.app(scope, receive, send)
            
        except (InvalidToken, TokenError, ValueError) as e:
            print(f"WebSocket auth error: {e}")
            await send({
                "type": "websocket.close",
                "code": 4000,  # Custom close code for auth failures
            })

    @database_sync_to_async
    def get_user(self, token):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            return User.objects.get(id=user_id)
        except Exception as e:
            print(f"Error getting user from token: {e}")
            return None