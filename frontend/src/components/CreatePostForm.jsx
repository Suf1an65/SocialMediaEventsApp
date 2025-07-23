import api from "../api";
import { useState } from "react";

function CreatePostForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [planned_date, setPlanned_date] = useState("");
    const [location, setLocation] = useState("")
    const [banner, setBanner] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [capacity, setCapacity] = useState("");

    const createPost = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("location", location);
        formData.append("planned_date", planned_date);
        formData.append("capacity", capacity);
        if (banner) {
            formData.append("banner", banner);
        }

        try {
            const res = await api.post("api/post/create/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Post created:", res.data);
            setSuccess(true);
            setTitle("");
            setDescription("");
            setPlanned_date("");
            setLocation("");
            setBanner(null);
        } catch (err) {
            console.error("Post creation failed:", err);
            setError("Failed to create post.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h1>Post a New Event</h1>
            <form onSubmit={createPost}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Location</label>
                    <input
                        type="text"
                        value={location}
                        placeholder="Enter a postcode or full street + city to get better accuracy."
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        
                    />
                </div>
                <div>
                    <label>Planned Date:</label>
                    <input
                        type="datetime-local"
                        value={planned_date}
                        onChange={(e) => setPlanned_date(e.target.value)}
                        required
                    />
                </div>
                <div>
                <label>Capacity (optional):</label>
                <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min="1"
                />
                </div>
                <div>
                    <label>Banner Image (optional):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBanner(e.target.files[0])}
                    />
                </div>
                <button type="submit" disabled={saving}>
                    {saving ? "Creating..." : "Create Post"}
                </button>
                {success && <p style={{ color: "green" }}>Post created successfully!</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}

export default CreatePostForm;
