// GroupChat.js
import { useState, useEffect } from "react";
import api from "../api";

function GroupChat({ postId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/groupchat/${postId}/`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    // Send a new message
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            console.log("Sending message:", newMessage);
            await api.post(`/api/groupchat/${postId}/`, { message: newMessage });

            setNewMessage("");
            fetchMessages(); // refresh messages after sending
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    // Poll every 3 seconds
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // poll every 3s
        return () => clearInterval(interval); // cleanup on unmount
    }, []);

    return (
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
            <h3>Group Chat</h3>
            <div style={{ maxHeight: "300px", overflowY: "scroll", marginBottom: "1rem", border: "1px solid #eee", padding: "0.5rem" }}>
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <strong>{msg.sender_username}:</strong> {msg.message}
                        <br />
                        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                        <hr />
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    style={{ width: "80%", padding: "0.5rem" }}
                />
                <button onClick={sendMessage} style={{ padding: "0.5rem" }}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default GroupChat;
