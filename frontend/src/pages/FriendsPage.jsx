import { useState, useEffect } from "react";
import api from "../api";
import Banner from "../components/Banner";

function FriendsPage() {
    const [username, setUsername] = useState("");
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [follows, setFollows] = useState([]);
    const [followRequests, setFollowRequests] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchFriendData();
    }, []);

    const acceptFriendRequest = async (username) => {
    try {
        await api.post(`/api/social/accept-friend/${username}/`);
        setMessage(`Accepted friend request from ${username}`);
        fetchFriendData();
    } catch (err) {
        console.error(err);
        setMessage("Failed to accept friend request.");
    }
    };

    const unfollowUser = async (username) => {
    try {
        await api.delete(`/api/social/send-follow/${username}/`);
        setMessage(`Unfollowed ${username}`);
        fetchFriendData();
    } catch (err) {
        setMessage("Failed to unfollow.");
        console.error(err);
    }
    };


    const fetchFriendData = async () => {
        try {
            const res = await api.get("/api/social/my-connections/");
            setFriends(res.data.friends);
            setFriendRequests(res.data.friend_requests);
            setFollows(res.data.follows);
            setFollowRequests(res.data.follow_requests);
        } catch (err) {
            console.error("Failed to fetch friends data", err);
        }
    };

    const sendRequest = async (type) => {
        try {
            await api.post(`/api/social/send-${type}/${username}/`);
            setMessage(`${type === "friend" ? "Friend" : "Follow"} request sent.`);
            setUsername("");
            fetchFriendData();
        } catch (err) {
            setMessage("Failed to send request.");
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h2>Friends & Follows</h2>

            <div>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={() => sendRequest("friend")}>Add Friend</button>
                <button onClick={() => sendRequest("follow")}>Follow</button>
            </div>
            {message && <p>{message}</p>}

            <div style={{ marginTop: "2rem" }}>
                <h3>Your Friends</h3>
                <ul>
                    {friends.map((u) => <li key={u.id}>{u.username}</li>)}
                </ul>

                <h3>Friend Requests</h3>
                <ul>
                {friendRequests.map((u) => (
                    <li key={u.id}>
                    {u.username}
                    <button onClick={() => acceptFriendRequest(u.username)} style={{ marginLeft: '1rem' }}>
                        Accept
                    </button>
                    </li>
                ))}
                </ul>

               

                <h3>You Follow</h3>
                    <ul>
                    {follows.map((u) => (
                        <li key={u.id}>
                        {u.username}
                        <button onClick={() => unfollowUser(u.username)} style={{ marginLeft: '1rem' }}>
                            Unfollow
                        </button>
                        </li>
                    ))}
                    </ul>


                <h3>Follow Requests</h3>
                <ul>
                    {followRequests.map((u) => <li key={u.id}>{u.username}</li>)}
                </ul>
            </div>
            

        </div>
    );
}

export default FriendsPage;
