from django.db import models
from django.contrib.auth.models import User
import uuid
import os

# Create your models here.
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title


def upload_to(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return f'profile_pictures/{filename}'

def upload_post_url(instance, filename):
    ext = filename.split('.')[-1]  
    filename = f'{uuid.uuid4()}.{ext}'
    return f'banners/{filename}'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(default="profile_pictures/default_profile_pic.jpeg", upload_to=upload_to,
    blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    
class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100)
    description = models.TextField()
    planned_date = models.DateTimeField()
    location = models.CharField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)  # Optional limit
    attendees = models.ManyToManyField(User, blank=True, related_name='attending_events')
    banner = models.ImageField(upload_to=upload_post_url, blank=True, null=True)

    def __str__(self):
        return f"{self.author}'s Post"
    
    def is_sold_out(self):
        return self.capacity is not None and self.attendees.count() >= self.capacity
    

# models.py
class GroupChatMessage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} in {self.post.title}: {self.message[:20]}"
    
class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')


class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='friend_requests_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friend_requests_received', on_delete=models.CASCADE)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')



    

