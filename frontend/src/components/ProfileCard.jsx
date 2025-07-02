// ProfileCard.jsx
import { useState } from "react";

function ProfileCard({ profile }) {
    // Debug the received props
    //console.log('ProfileCard received:', profile);
    const [imgError, setImgError] = useState(false);

    // Handle both absolute and relative URLs
    const getImageUrl = () => {
        if (!profile?.profile_picture) return null;
        
        // If already absolute URL
        if (profile.profile_picture.startsWith('http')) {
            return profile.profile_picture;
        }
        
        // Handle default image path
        if (profile.profile_picture.includes('default_profile_pic')) {
            return `${window.location.origin}/static${profile.profile_picture.replace('profile_pictures/', '')}`;
        }
        
        // Regular media file
        return `${window.location.origin}${profile.profile_picture}`;
    };

    const imageUrl = getImageUrl();

    
    return (
        <div className="profile-container">
            <div className="profile-field">
                <h2>Username</h2>
                <p>{profile?.username || "Not set"}</p>
            </div>
            
            <div className="profile-field">
                <h2>Email</h2>
                <p>{profile?.email || "Not set"}</p>
            </div>
            
            <div className="profile-field">
                <h2>Bio</h2>
                <p>{profile?.bio || "No bio provided"}</p>
            </div>
            
            {imageUrl && !imgError ? (
                <img 
                    src={imageUrl}
                    alt="Profile"
                    onError={() => {
                        console.error('Failed to load image:', imageUrl);
                        setImgError(true);
                    }}
                    className="profile-img"
                />
            ) : (
                <div className="default-avatar">
                    <img 
                        src={`${window.location.origin}/static/default_profile_pic.jpeg`} 
                        alt="Default profile"
                        className="profile-img"
                    />
                </div>
            )}

        </div>
    );
}
export default ProfileCard