import axios from "axios";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null); // Initialize user as null
  const [ready, setReady] = useState(false);

  // add propTypes
  UserContextProvider.propTypes = {
    children: PropTypes.any,
  };

  // useEffect(() => {
  //   if (!user) {
  //     axios.get("/profile").then(({ data }) => {
  //       setUser(data);
  //       setReady(true);
  //     });
  //   }
  // }, []);

  useEffect(() => {
    // Check if user data is in localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse the stored JSON string
      setReady(true);
    } else {
      // If user data is not in localStorage, fetch it from the server
      axios.get("/profile").then(({ data }) => {
        setUser(data);
        setReady(true);
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data)); // Store as JSON string
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
