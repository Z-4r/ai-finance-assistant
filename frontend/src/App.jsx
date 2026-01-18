import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";

// Pages
import LandingPage from './pages/LandingPage';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Portfolio from "./pages/Portfolio";
import Predictor from "./pages/Predictor";
import Advisor from "./pages/Advisor";
import Chat from "./pages/Chat";

// --- WRAPPERS ---

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="text-white p-10">Loading...</div>;
    
    // If logged in, go to Dashboard
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="text-white p-10">Loading...</div>;

    // --- FIX IS HERE ---
    // If NOT logged in, go to Landing Page ("/") instead of "/login"
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return children;
};

// --- LAYOUT ---
const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-black text-white"> 
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto bg-[#0a0a0a]">
                {children}
            </div>
        </div>
    );
};

// --- APP ---
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
                    <Route path="/portfolio" element={<ProtectedRoute><Layout><Portfolio /></Layout></ProtectedRoute>} />
                    <Route path="/predictor" element={<ProtectedRoute><Layout><Predictor /></Layout></ProtectedRoute>} />
                    <Route path="/advisor" element={<ProtectedRoute><Layout><Advisor /></Layout></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;