import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Predictor from "./pages/Predictor";
import Advisor from "./pages/Advisor";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions"; // Import this
import Portfolio from "./pages/Portfolio";


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-dark text-white">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
                    <Route path="/portfolio" element={<ProtectedRoute><Layout><Portfolio /></Layout></ProtectedRoute>} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/predictor" element={<ProtectedRoute><Layout><Predictor /></Layout></ProtectedRoute>} />
                    <Route path="/advisor" element={<ProtectedRoute><Layout><Advisor /></Layout></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;