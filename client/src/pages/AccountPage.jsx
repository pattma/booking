import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5173"); // Replace with WebSocket server URL

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
    // Update user data in your context or state
    setUser(updatedData);
  });

  // Add this line to debug WebSocket events in AccountPage.jsx
  socket.on("Header", (updatedData) => {
    // console.log("Received WebSocket event in AccountPage.jsx:", updatedData);
    // Update user data in your context or state
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

    // Perform any other logout actions (e.g., clearing cookies)
  }

  // Checking for account page
  if (ready && !user && !redirect) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to={"/login"} />;
  } else if (!ready) {
    // While data is being fetched, display a loading message
    return "Loading...";
  }

  const linkClasses = (type = null) => {
    let classes = "py-2 px-6";
    if (type === subpage || (subpage === undefined && type === "profile")) {
      classes += " bg-primary text-white rounded-full";
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
          My profile
        </Link>
        <Link className={linkClasses("bookings")} to={"/account/bookings"}>
          My bookings
        </Link>
        <Link className={linkClasses("places")} to={"/account/places"}>
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
    </div>
  );
};

export default AccountPage;