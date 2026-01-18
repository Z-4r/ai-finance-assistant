import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

// 1. Create the Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on page load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                // Ideally verify token with backend here, for now we trust presence
                setUser({ token }); 
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Login Function
    const login = async (email, password) => {
        const params = new URLSearchParams();
        
        // FastAPI's OAuth2PasswordRequestForm REQUIRES the key to be "username"
        params.append("username", email); 
        params.append("password", password);
        
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            // Send to the correct endpoint "/login" (or "/token" depending on your backend)
            const res = await api.post("/login", params, config);
            
            // Save the token
            const token = res.data.access_token;
            localStorage.setItem("token", token);
            
            // Update State
            setUser({ token });
            
            return res.data; // Return data in case Login.jsx needs it
        } catch (error) {
            console.error("Login failed:", error);
            throw error; // Throw error so Login.jsx can catch it and show "Invalid password"
        }
    };

    // Logout Function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 2. Export the Custom Hook (CRITICAL for App.jsx to work)
export const useAuth = () => {
    return useContext(AuthContext);
};