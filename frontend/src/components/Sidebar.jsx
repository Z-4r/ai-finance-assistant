import { Link, useLocation, useNavigate } from "react-router-dom"; // <--- 1. Import useNavigate
import { LayoutDashboard, TrendingUp, Bot, PieChart, LogOut, Wallet, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate(); // <--- 2. Initialize hook
    const { logout } = useAuth();

    const menuItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/portfolio", icon: Briefcase, label: "Portfolio" }, 
        { path: "/transactions", icon: Wallet, label: "Transactions" },
        { path: "/predictor", icon: TrendingUp, label: "Market Predictor" },
        { path: "/advisor", icon: PieChart, label: "Robo Advisor" },
        { path: "/chat", icon: Bot, label: "AI Assistant" },
    ];

    // <--- 3. Custom Logout Handler
    const handleLogout = () => {
        logout();        // Clear token/state
        navigate("/");   // Redirect to Landing Page
    };

    return (
        <div className="h-screen w-64 bg-[#0f0f0f] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
            
            {/* Logo Area */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-black font-bold">
                    <TrendingUp size={20} />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Finance<span className="text-blue-600">AI</span>
                </h1>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                ? "bg-blue-600 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] font-bold" 
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <item.icon size={20} className={isActive ? "text-black" : "text-gray-500 group-hover:text-white transition-colors"} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/10">
                <button 
                    onClick={handleLogout} // <--- 4. Use the new handler
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;