import { useEffect, useState } from "react";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "../components/PostCard";
import api from "../api";
import Banner from "../components/Banner";

function MyEvents() {
    const [posts, setPosts] = useState([]);
    const [username, setUsername] = useState("");

    useEffect(() => {
        fetchPosts();
        fetchUsername();
    }, []);

    const fetchUsername = async () => {
        try {
            const res = await api.get("api/profile/me/");
            setUsername(res.data.username); // Adjust if needed
        } catch (err) {
            console.error("Failed to fetch username:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await api.get("api/post/my-posts/");
            setPosts(res.data);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handleDelete = (id) => {
        setPosts(posts.filter((post) => post.id !== id));
    };

    return (
        <div>
            <Banner/>
            <CreatePostForm onPostCreated={handlePostCreated} />
            <h2>My Events</h2>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUsername={username} onDelete={handleDelete} />
            ))}
        </div>
    );
}

export default MyEvents;
