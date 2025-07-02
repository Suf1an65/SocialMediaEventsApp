import { useState} from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";

function RegistrationForm({route, method}) {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault()

        try {
            const res = await api.post(route, { email, username, password})
            navigate("/login")
            

        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
        }
    }
    return <form onSubmit={handleSubmit} className="form-container">
        <h1>Register</h1>
        <input 
        className="form-input"
        type="email"
        value = {email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        />
        <input 
        className="form-input"
        type="text"
        value = {username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        />
        <input 
        className="form-input"
        type="password"
        value = {password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        />
        {loading && <LoadingIndicator/>} 
        <button className = "form-button" type="submit">
            {name}
        </button>

    </form>

}
export default RegistrationForm;