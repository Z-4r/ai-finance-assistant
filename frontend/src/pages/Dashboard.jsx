import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, Activity, ArrowRight } from "lucide-react";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
    // 1. State for Data & Market Status
    const [data, setData] = useState({
        user_name: 'Trader',
        portfolio_value: 0,
        total_profit: 0,
        profit_percent: 0,
        active_count: 0,
        chart_data: []
    });
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // 2. Helper: Format Currency (₹12,45,000)
    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // 3. Logic: Check Indian Market Status (Mon-Fri, 9:15 - 3:30 IST)
    const checkMarketStatus = () => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const ist = new Date(utc + (3600000 * 5.5)); // UTC + 5:30

        const day = ist.getDay(); // 0=Sun, 6=Sat
        const hour = ist.getHours();
        const minute = ist.getMinutes();
        const currentTime = hour * 60 + minute;

        // Market Open: 9:15 AM (555 mins) -> 3:30 PM (930 mins)
        // Weekdays only
        const isOpen = (day >= 1 && day <= 5) && (currentTime >= 555 && currentTime <= 930);
        setIsMarketOpen(isOpen);
    };

    // 4. Fetch Data on Load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Dashboard Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        checkMarketStatus();
        const interval = setInterval(checkMarketStatus, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-900 text-white font-sans">
            {/* Header */}
            <div className="flex justify-between items-end">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-slate-400">Welcome back, {data.user_name}</p>
                </motion.div>

                {/* Live Market Status */}
                <div className="text-right hidden md:block">
                    <p className="text-sm text-slate-500 mb-1">Market Status</p>
                    <div className={`flex items-center justify-end gap-2 ${isMarketOpen ? "text-blue-600" : "text-red-400"}`}>
                        <div className={`w-2 h-2 rounded-full ${isMarketOpen ? "bg-blue-600 animate-pulse" : "bg-red-400"}`} />
                        <span className="font-medium">
                            {isMarketOpen ? "Live Market Open" : "Market Closed"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Now using Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Invested" 
                    value={loading ? "..." : formatINR(data.portfolio_value)} 
                    icon={Wallet} 
                    trend="up" 
                    trendValue={data.profit_percent > 0 ? `+${data.profit_percent.toFixed(2)}%` : "0%"} 
                    color="primary"
                />
                <StatCard 
                    title="Total Profit" 
                    value={loading ? "..." : formatINR(data.total_profit)} 
                    icon={TrendingUp} 
                    trend="up" 
                    trendValue="All Time" 
                    color="accent"
                />
                <StatCard 
                    title="Active Predictions" 
                    value={loading ? "..." : `${data.active_count} Stocks`} 
                    icon={Activity} 
                    trend="neutral" 
                    trendValue="Active" 
                    color="primary"
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Chart Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Portfolio Growth</h3>
                        <select className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-1 text-sm outline-none">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    
                    <div className="h-75 w-full min-h-75">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chart_data.length > 0 ? data.chart_data : []}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                                <YAxis 
                                    stroke="#64748b" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tickFormatter={(val) => `₹${val/1000}k`} 
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                    formatter={(value) => formatINR(value)}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Quick Actions (Unchanged Visuals) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col justify-between"
                >
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                        <p className="text-slate-400 text-sm mb-6">AI-powered tools to help you make better decisions.</p>
                        
                        <div className="space-y-4">
                            <Link to="/predictor" className="block p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Stock Predictor</h4>
                                            <p className="text-xs text-slate-500">Analyze future trends</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </Link>

                            <Link to="/advisor" className="block p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 text-blue-600 rounded-lg">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">Robo Advisor</h4>
                                            <p className="text-xs text-slate-500">Get portfolio advice</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-linear-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-1">Upgrade Plan</h4>
                            <p className="text-xs text-blue-100 mb-3">Get unlimited AI predictions</p>
                            <button className="text-xs bg-white text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-50 transition-colors">View Plans</button>
                        </div>
                        <div className="absolute -right-5 -bottom-5 opacity-20 text-white">
                            <Wallet size={100} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;