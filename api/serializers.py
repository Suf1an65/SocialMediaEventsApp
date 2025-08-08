from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Profile, Post, GroupChatMessage, Follow, FriendRequest
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
        extra_kwargs = {"password": {"write_only" : True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author" : {"read_only": True}}

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    banner = serializers.ImageField(required=False)
    attendees_count = serializers.SerializerMethodField()
    is_sold_out = serializers.SerializerMethodField()
    user_has_joined = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "created_at", "title", "description", "planned_date", "banner",
                   "location", 
                   "longitude", 
                   "latitude",
                   "attendees_count",
                   "is_sold_out",
                   "user_has_joined"]
        
    def get_attendees_count(self, obj):
        return obj.attendees.count()

    def get_is_sold_out(self, obj):
        return obj.is_sold_out()
    
    def get_user_has_joined(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False

class GroupChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = GroupChatMessage
        fields = ["id", "post", "sender", "sender_username", "message", "timestamp"]
        read_only_fields = ["id", "post", "sender", "timestamp", "sender_username"]



class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'bio', 'profile_picture']
        read_only_fields = ['username', 'email']
    
## following and followed
class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower', 'created_at']


class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'is_accepted', 'created_at']
        read_only_fields = ['from_user', 'created_at']

        