import React, { useState } from 'react';
import api from '../api';

function EditProfileForm({ profileData, setProfile }) {
    const [bio, setBio] = useState(profileData.bio || '');
    const [profilePicture, setProfilePicture] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append('bio', bio);
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }

        try {
            const res = await api.patch('api/profile/me/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(res.data.profile_picture + "this is a string btw")
            console.log(profilePicture)
            setProfile(res.data); // update parent
        } catch (err) {
            console.error('Profile update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Bio:</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div>
                <label>Profile Picture:</label>
                <input type="file" accept="image/*" onChange={(e) => setProfilePicture(e.target.files[0])} />
            </div>
            <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
            </button>
        </form>
    );
}

export default EditProfileForm;
