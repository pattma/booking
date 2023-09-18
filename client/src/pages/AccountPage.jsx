import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import PlacePage from "./PlacePage";

const socket = io(import.meta.env.SOCKET_SERVER_URL);

const AccountPage = () => {
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
  const userName = user && user.data ? user.data.name : "";
  const userEmail = user && user.data ? user.data.email : "";
  let { subpage } = useParams();

  // Set subpage to "profile" if it's undefined
  if (subpage === undefined) {
    subpage = "profile";
  }

  useEffect(() => {
    // Fetch user data only if it's not available and the page is being accessed
    if (ready && !user && !redirect) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("/profile");
          setUser(response.data);
        } catch (error) {
          // Handle error or redirect to login page on fetch failure
          console.error("Error fetching user data:", error);
          setRedirect("/login");
        }
      };
      fetchUserData();
    }
  }, [ready, user, setUser, redirect]);

  // Subscribe to WebSocket events for profile updates
  socket.on("Header", (updatedData) => {
    // Update user data in context or state
    setUser(updatedData);
  });

  // Call API to reset cookie when logout
  const logout = async () => {
    await axios.post("/logout");
    setRedirect("/");
    // Clear user data from state
    setUser(null);
    // Remove user data from localStorage
    localStorage.removeItem("user");
  };

  // Checking for account page
  if (ready && !user && !redirect) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to={"/login"} />;
  } else if (!ready) {
    // While data is being fetched, display a loading message
    return "Loading...";
  }

  const linkClasses = (type = null) => {
    let classes = "inline-flex gap-1 py-2 px-6 rounded-full";
    if (type === subpage) {
      classes += " bg-primary text-white";
    } else {
      classes += " bg-gray-200";
    }
    return classes;
  };

  // Comeback to homepage
  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <nav className="w-full flex justify-center mt-8 gap-2 mb-8">
        <Link className={linkClasses("profile")} to={"/account"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          My profile
        </Link>
        <Link className={linkClasses("bookings")} to={"/account/bookings"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          My bookings
        </Link>
        <Link className={linkClasses("places")} to={"/account/places"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
            />
          </svg>
          My accommodation
        </Link>
      </nav>
      {subpage === "profile" && (
        <div className="text-center max-w-lg mx-auto">
          Logged in as {userName} ({userEmail})<br />
          <button onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>
      )}
      {subpage === "places" && <PlacePage />}
    </div>
  );
};

export default AccountPage;
