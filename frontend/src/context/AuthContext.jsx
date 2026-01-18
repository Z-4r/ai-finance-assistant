import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const login = async (email, password) => {
        // This calls your FastAPI /token endpoint
        const params = new URLSearchParams();
        
        // 2. Map 'email' to 'username'
        // FastAPI's OAuth2PasswordRequestForm REQUIRES the key to be "username"
        params.append("username", email); 
        params.append("password", password);
        
        // 3. Set the Header explicitly
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        // 4. Send to the correct endpoint "/login"
        const res = await api.post("/login", params, config);
        
        // 5. Save the token
        const token = res.data.access_token;
        localStorage.setItem("token", token);
        setUser({ token });
    };

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