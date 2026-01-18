import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Using the custom hook

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const { login } = useAuth(); // cleaner hook usage
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white relative overflow-hidden">
            
            {/* Background Glow (Matches Landing Page) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative"
            >
                <div className="text-center mb-8">
                    <div className="bg-green-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <LogIn size={32} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Access your financial dashboard</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 mb-6 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-green-500 outline-none transition-colors placeholder:text-gray-600"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-green-500 outline-none transition-colors placeholder:text-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2 mt-4"
                    >
                        Log In <ArrowRight size={18} />
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-8 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-green-400 hover:text-green-300 font-bold hover:underline">
                        Register
                    </Link>
                </p>
                
            </motion.div>
        </div>
    );
};

export default Login;