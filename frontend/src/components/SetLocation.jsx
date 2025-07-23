import { useState } from "react";
import api from "../api";

function SetLocation({ onLocationSet }) {
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const res = await api.post("api/geocode/", { address });
        const data = res.data;

        console.log("Geocode API response:", data);

        if (data.lat && data.lng) {
            localStorage.setItem("userLocation", JSON.stringify({ lat: data.lat, lng: data.lng }));
            onLocationSet({ lat: data.lat, lng: data.lng });
        } else {
            setError("Could not find that location.");
        }
    } catch (err) {
        console.error("Error setting location:", err);
        setError("Failed to fetch location.");
    } finally {
        setLoading(false);
    }
    };


    return (
        <div style={{ marginBottom: "1rem" }}>
            <h3>Set Your Location</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your city, postcode, etc."
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Setting..." : "Set Location"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default SetLocation;
