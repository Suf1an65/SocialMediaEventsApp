import React from "react";
import { useState, useEffect } from "react";
import api from "../api";
import ProfileCard from "../components/ProfileCard";
import EditProfileForm from "../components/EditProfileForm";
import Banner from "../components/Banner";

// Profile.jsx
function Profile() {
    const [profile, setProfile] = useState(null); // Initialize as null
    const [loading, setLoading] = useState(true); // Start in loading state

    const getProfile = async () => {
        try {
            const res = await api.get("api/profile/me/");
            console.log('API Response:', res.data); // Verify raw response
            setProfile(res.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null); // Explicitly set to null on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    //console.log('Current profile state:', profile); // Debug current state

    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>No profile data available</div>;

    return (
        <div>
            <Banner/>
            <ProfileCard profile={profile} />
            <EditProfileForm profileData={profile} setProfile={setProfile} />
        </div>
    );
}

export default Profile;