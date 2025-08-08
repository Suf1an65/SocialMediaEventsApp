from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NotDelete.as_view(), name="delete-note"),
    path('profile/me/', views.ProfileMeView.as_view(), name="profile"),
    path('post/create/', views.CreatePostView.as_view(), name="post" ),
    path("post/my-posts/", views.MyPostsView.as_view(), name = "post-list"),
    path('post/delete/<int:pk>/', views.DeletePostView.as_view(), name='delete-post'),
    path('post/view-all-posts/', views.ViewAllPosts.as_view(), name ='every-post'),
    path("post/join/<int:post_id>/", views.JoinPostView.as_view(), name="join-post"),
    path("geocode/", views.GeocodeLocationView.as_view(), name="geocode-location"),
    path('groupchat/<int:post_id>/', views.GroupChatMessageListCreate.as_view(), name='groupchat-messages'),
    path('joined-events/', views.JoinPostView.as_view(), name="joined-events"),
    path("social/send-follow/<str:username>/", views.FollowUserView.as_view(), name="send-follow"),
    path("social/send-friend/<str:username>/", views.FriendRequestView.as_view(), name="send-friend"),
    path("social/accept-friend/<str:username>/", views.AcceptFriendRequestView.as_view(), name="accept-friend"),
    path("social/my-connections/", views.SocialConnectionsView.as_view(), name="my-connections"),


]
