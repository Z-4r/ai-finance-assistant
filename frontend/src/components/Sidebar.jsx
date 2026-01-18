import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp,Bot, PieChart, MessageSquare, LogOut, Wallet, Briefcase } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const menuItems = [
        { path: "/", icon: LayoutDashboard, label: "Dashboard" },
        // 2. Add the new pages here
        { path: "/portfolio", icon: Briefcase, label: "Portfolio" }, 
        { path: "/transactions", icon: Wallet, label: "Transactions" },
        { path: "/predictor", icon: TrendingUp, label: "Market Predictor" },
        { path: "/advisor", icon: PieChart, label: "Robo Advisor" },
        { path: "/chat", icon: Bot, label: "AI Assistant" },
    ];

    return (
        <div className="h-screen w-64 bg-card border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
            
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    AI
                </div>
                <h1 className="text-xl font-bold text-white tracking-wide">Finance<span className="text-primary">AI</span></h1>
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
                                ? "bg-primary text-white shadow-lg shadow-blue-500/25" 
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <item.icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors"} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-slate-800">
                <button 
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;