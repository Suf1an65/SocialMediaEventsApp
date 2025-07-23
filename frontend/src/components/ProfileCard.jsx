import { useState } from "react";

function ProfileCard({ profile, event, currentUser, onJoin }) {
    const [imgError, setImgError] = useState(false);

    const getImageUrl = () => {
        if (!profile?.profile_picture) return null;

        if (profile.profile_picture.startsWith('http')) {
            return profile.profile_picture;
        }

        if (profile.profile_picture.includes('default_profile_pic')) {
            return `${window.location.origin}/static${profile.profile_picture.replace('profile_pictures/', '')}`;
        }

        return `${window.location.origin}${profile.profile_picture}`;
    };

    const imageUrl = getImageUrl();

    // Join button conditions
    const isAuthor = event?.author?.id === currentUser?.id;
    const isSoldOut = event?.attendees?.length >= event?.capacity;
    const hasJoined = event?.attendees?.some(u => u.id === currentUser?.id);

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

            {/* Join Button */}
            {!isAuthor && !isSoldOut && !hasJoined && (
                <button
                    onClick={() => {
                        if(onJoin) onJoin(event.id);
                    }}
                    className="join-button"
                >
                    Join
                </button>
            )}

            {isSoldOut && <p className="sold-out-text">Event Sold Out</p>}
            {hasJoined && <p className="joined-text">You have joined this event</p>}
        </div>
    );
}

export default ProfileCard;
