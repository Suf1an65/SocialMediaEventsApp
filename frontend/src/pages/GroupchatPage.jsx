// GroupChatPage.jsx
import { useEffect, useState } from "react";
import api from "../api";
import GroupChat from "../components/Groupchat";

function GroupChatPage() {
    const [joinedPosts, setJoinedPosts] = useState([]);
    const [activePostId, setActivePostId] = useState(null);

    // Get all posts user has joined
    const fetchJoinedEvents = async () => {
        try {
            const res = await api.get("/api/joined-events/");
            setJoinedPosts(res.data);
        } catch (err) {
            console.error("Error fetching joined events:", err);
        }
    };

    useEffect(() => {
        fetchJoinedEvents();
    }, []);

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Your Group Chats</h2>
            <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "30%", borderRight: "1px solid #ddd", paddingRight: "1rem" }}>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {joinedPosts.map((post) => (
                            <li key={post.id}>
                                <button
                                    onClick={() => setActivePostId(post.id)}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "0.5rem",
                                        backgroundColor: activePostId === post.id ? "#eee" : "white",
                                        border: "1px solid #ccc",
                                        marginBottom: "0.5rem",
                                        borderRadius: "8px"
                                    }}
                                >
                                    💬 {post.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ flex: 1 }}>
                    {activePostId ? (
                        <GroupChat postId={activePostId} />
                    ) : (
                        <p>Select a group chat to start chatting</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GroupChatPage;
