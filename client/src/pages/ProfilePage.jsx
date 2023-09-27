import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import PlacePage from "./PlacesPage";
import AccountNav from "../AccountNav";

const socket = io(import.meta.env.SOCKET_SERVER_URL);

const ProfilePage = () => {
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

  // Comeback to homepage
  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <AccountNav />
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

export default ProfilePage;
