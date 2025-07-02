from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Profile
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


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'bio', 'profile_picture']
        read_only_fields = ['username', 'email']
    
    def get_profile_picture(self, obj):
        if not obj.profile_picture:
            return None
            
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.profile_picture.url)
            
        return f"{settings.BASE_URL}{obj.profile_picture.url}" if settings.BASE_URL else obj.profile_picture.url
    

        