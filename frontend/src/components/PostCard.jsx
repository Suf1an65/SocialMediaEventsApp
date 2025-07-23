import { useState } from "react";
import api from "../api";

function PostCard({ post, currentUsername, onDelete }) {
    const [joined, setJoined] = useState(post.user_has_joined || false); // optionally passed from backend
    const [isSoldOut, setIsSoldOut] = useState(post.is_sold_out);

    const handleDelete = async () => {
        try {
            await api.delete(`api/post/delete/${post.id}/`);
            onDelete(post.id);
        } catch (err) {
            console.error("Failed to delete post:", err);
        }
    };

    const handleJoin = async () => {
        try {
            const res = await api.post(`api/post/join/${post.id}/`);
            if (res.status === 200) {
                setJoined(true);
                if (res.data.updated_capacity === 0) {
                    setIsSoldOut(true);
                }
            }
        } catch (err) {
            console.error("Failed to join event:", err);
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <h2>{post.title}</h2>
            <p><strong>By:</strong> {post.author}</p>
            <p><strong>Planned:</strong> {new Date(post.planned_date).toLocaleString()}</p>
            <p>{post.description}</p>
            {post.banner && (
                <img src={post.banner} alt="Event banner" style={{ maxWidth: "100%" }} />
            )}
            <p>Location: {post.location}</p>
            <p>Attendees: {post.attendees_count}</p>
            {isSoldOut && <p style={{ color: "red" }}>⚠️ Sold Out</p>}

            {/* Delete button for author */}
            {post.author === currentUsername && (
                <button onClick={handleDelete} style={{ marginTop: "0.5rem", color: "red" }}>
                    Delete Post
                </button>
            )}

            {/* Join button for others */}
            {post.author !== currentUsername && !isSoldOut && !joined && (
                <button onClick={handleJoin} style={{ marginTop: "0.5rem" }}>
                    Join Event
                </button>
            )}

            {/* Already joined message */}
            {joined && (
                <button disabled style={{ marginTop: "0.5rem", backgroundColor: "#ccc" }}>
                    ✅ Already Joined
                </button>
            )}
        </div>
    );
}

export default PostCard;
