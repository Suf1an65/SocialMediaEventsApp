import { useEffect, useState } from "react";
import api from "../api";
import PostCard from "../components/PostCard";
import Banner from "../components/Banner";
import SetLocation from "../components/SetLocation"; // Add this at the top

function ViewEvents() {
    const [events, setEvents] = useState([]);
    const [username, setUsername] = useState("");
    const [distance, setDistance] = useState(""); // "" means no filter

    const [userLocation, setUserLocation] = useState(() => {
        const saved = localStorage.getItem("userLocation");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        fetchUsername();
        fetchPosts();
    }, []);

    useEffect(() => {
    if (userLocation) {
        fetchPosts();
    }
}, [userLocation, distance]); // <-- run whenever location or distance changes

    const fetchUsername = async () => {
        try {
            const res = await api.get("api/profile/me/");
            setUsername(res.data.username);
        } catch (err) {
            console.error("Failed to fetch username:", err);
        }
    };

    const fetchPosts = async () => {
    try {
        let url = "api/post/view-all-posts/";

        if (userLocation && distance) {
            const params = new URLSearchParams({
                lat: userLocation.lat,
                lng: userLocation.lng,
                distance,
            }).toString();
            url += `?${params}`;
        }

        const res = await api.get(url);
        setEvents(res.data);
    } catch (err) {
        console.error("Failed to fetch all the events", err);
    }
};

    const handleDelete = (deletedId) => {
        setEvents((prevEvents) => prevEvents.filter(event => event.id !== deletedId));
    };

    const handleLocationSet = (loc) => {
        setUserLocation(loc);
    };

    return (
        <div>
            <Banner />
            <h2>Events</h2>
            <SetLocation onLocationSet={handleLocationSet} />
            <label>Filter by distance: </label>
            <select value={distance} onChange={(e) => setDistance(e.target.value)}>
                <option value="">All distances</option>
                <option value="5">Within 5km</option>
                <option value="10">Within 10km</option>
                <option value="25">Within 25km</option>
                <option value="50">Within 50km</option>
            </select>

            {events.map((event) => (
                <PostCard
                    key={event.id}
                    post={event}
                    currentUsername={username}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
} export default ViewEvents;

