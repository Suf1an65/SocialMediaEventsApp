import { Link } from 'react-router-dom';
import "../styles/Banner.css";

function Banner() {
  return (
    <header className="banner">
      <div className="banner-logo">
        <Link to="/">MyApp</Link>
      </div>
      <nav className="banner-nav">
        <Link to="/profile">Profile</Link>
        <Link to="/myevents">My Events</Link>
        <Link to="/viewevents">Search Events</Link>
        <Link to="/myChats">My chats</Link>
        <Link to="/friends">Friends</Link>
      </nav>
    </header>
  );
}

export default Banner;
