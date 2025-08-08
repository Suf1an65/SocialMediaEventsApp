from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ProfileSerializer
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, PostSerializer, GroupChatMessageSerializer, FollowSerializer, FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework import status
from .models import Note, Profile, Post, GroupChatMessage, Follow, FriendRequest
from django.conf import settings
from opencage.geocoder import OpenCageGeocode
from .utils import haversine
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NotDelete(generics.DestroyAPIView):
        serializer_class = NoteSerializer
        permission_classes = [IsAuthenticated]

        def get_queryset(self):
            user = self.request.user
            return Note.objects.filter(author=user)

##needed for filtering by location

class GeocodeLocationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        address = request.data.get("address")
        if not address:
            return Response({"error": "No address provided"}, status=status.HTTP_400_BAD_REQUEST)

        geocoder = OpenCageGeocode(settings.OPENCAGE_API_KEY)
        results = geocoder.geocode(address)

        if results and len(results):
            lat = results[0]['geometry']['lat']
            lng = results[0]['geometry']['lng']
            return Response({"lat": lat, "lng": lng})
        else:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
        
def convert_location(location):
    geocoder = OpenCageGeocode(settings.OPENCAGE_API_KEY)
    results = geocoder.geocode(location)

    if results and len(results):
        lat = results[0]['geometry']['lat']
        lng = results[0]['geometry']['lng']
        return lat, lng
    else:
        return None, None


class CreatePostView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            location = serializer.validated_data.get("location")
            latitude, longitude = convert_location(location)
            if latitude is None or longitude is None:
                return Response(
                    {"error": "Could not determine location. Please enter a more specific or valid location."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save post without committing to set lat/lng before final save
            post = serializer.save(author=request.user)
            post.latitude = latitude
            post.longitude = longitude
            post.save()

            # Re-serialize the post to include latitude/longitude in the response
            response_serializer = PostSerializer(post, context={'request': request})


            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JoinPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        if post.is_sold_out():
            return Response({"error": "This event is sold out."}, status=status.HTTP_400_BAD_REQUEST)

        # Add user to attendees if not already joined
        if request.user in post.attendees.all():
            return Response({"message": "You have already joined this event."}, status=status.HTTP_200_OK)

        post.attendees.add(request.user)
        return Response({"message": "Successfully joined the event."}, status=status.HTTP_200_OK)
    
    def get(self, request):
        posts = Post.objects.filter(attendees=request.user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    
class ViewAllPosts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all posts
        posts = Post.objects.order_by('-created_at')

        # Get user's location from query params
        user_lat = request.query_params.get("lat")
        user_lng = request.query_params.get("lng")
        max_distance_km = request.query_params.get("distance")  # e.g., 10 for 10km

        if user_lat and user_lng and max_distance_km:
            try:
                user_lat = float(user_lat)
                user_lng = float(user_lng)
                max_distance_km = float(max_distance_km)

                # Filter posts within distance
                filtered_posts = []
                for post in posts:
                    if post.latitude is not None and post.longitude is not None:
                        dist = haversine(user_lat, user_lng, post.latitude, post.longitude)
                        if dist <= max_distance_km:
                            filtered_posts.append(post)
                posts = filtered_posts
            except ValueError:
                return Response({"error": "Invalid lat/lng/distance"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class MyPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class DeletePostView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            post = Post.objects.get(pk=pk, author=request.user)
        except Post.DoesNotExist:
            return Response({"error": "Post not found or unauthorized"}, status=status.HTTP_404_NOT_FOUND)

        post.delete()
        return Response({"message": "Post deleted"}, status=status.HTTP_204_NO_CONTENT)

## views for profiles
class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        try:
            return self.request.user.profile
        except Profile.DoesNotExist:
            raise NotFound("Profile Not Found", code=404)

    def get(self, request):
        profile = self.get_object()
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        profile = self.get_object()
        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# views.py


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


## views for groupchats

class GroupChatMessageListCreate(generics.ListCreateAPIView):
    serializer_class = GroupChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        post = Post.objects.get(id=post_id)

        if self.request.user not in post.attendees.all():
            raise PermissionDenied("You must join this event to view or send messages.")

        return GroupChatMessage.objects.filter(post=post).order_by("timestamp")

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = Post.objects.get(id=post_id)

        if self.request.user not in post.attendees.all():
            raise PermissionDenied("You must join this event to send messages.")

        try:
            serializer.save(sender=self.request.user, post=post)
        except Exception as e:
            print("Serializer error:", serializer.errors)
            raise

##views for following another user 
class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            if target_user == request.user:
                return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

            follow, created = Follow.objects.get_or_create(
                follower=request.user,
                following=target_user
            )
            if not created:
                return Response({"detail": "You already follow this user."}, status=status.HTTP_400_BAD_REQUEST)

            return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            follow = Follow.objects.filter(follower=request.user, following=target_user).first()
            if not follow:
                return Response({"detail": "You do not follow this user."}, status=status.HTTP_400_BAD_REQUEST)
            follow.delete()
            return Response({"detail": "Unfollowed successfully."}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            target_user = User.objects.get(username=username)
            if target_user == request.user:
                return Response({"detail": "You cannot friend yourself."}, status=status.HTTP_400_BAD_REQUEST)

            fr, created = FriendRequest.objects.get_or_create(
                from_user=request.user,
                to_user=target_user
            )
            if not created:
                return Response({"detail": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)

            return Response(FriendRequestSerializer(fr).data, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            from_user = User.objects.get(username=username)
            fr = FriendRequest.objects.filter(from_user=from_user, to_user=request.user, is_accepted=False).first()

            if not fr:
                return Response({"detail": "No pending request from this user."}, status=status.HTTP_400_BAD_REQUEST)

            fr.is_accepted = True
            fr.save()
            return Response({"detail": "Friend request accepted."}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class SocialConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get accepted friend requests where user is either from_user or to_user
        friendships = FriendRequest.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            is_accepted=True
        )

        # Collect friend IDs from both sides of the friendship
        friend_ids = set()
        for fr in friendships:
            if fr.from_user != user:
                friend_ids.add(fr.from_user.id)
            if fr.to_user != user:
                friend_ids.add(fr.to_user.id)

        friends_qs = User.objects.filter(id__in=friend_ids)

        # Friend requests sent TO the user and not accepted yet
        friend_requests = FriendRequest.objects.filter(
            to_user=user, is_accepted=False
        ).values_list("from_user", flat=True)

        # Users that the current user follows
        follows = Follow.objects.filter(follower=user).values_list("following", flat=True)

        # For now, no follow requests pending (adjust if you implement this)
        follow_requests = []

        friend_request_users = User.objects.filter(id__in=friend_requests)
        follow_users = User.objects.filter(id__in=follows)

        return Response({
            "friends": UserSerializer(friends_qs, many=True).data,
            "friend_requests": UserSerializer(friend_request_users, many=True).data,
            "follows": UserSerializer(follow_users, many=True).data,
            "follow_requests": follow_requests,  # empty list or implement if needed
        })

