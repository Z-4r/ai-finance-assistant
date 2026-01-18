import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import api from "../api/axios";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Adjust the endpoint if your backend uses "/register" or "/signup"
            // Standard FastAPI often uses POST /users/
            await api.post("/register/", formData);
            
            // Redirect to login on success
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card w-full max-w-md p-8 rounded-2xl border border-slate-800 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-slate-400">Start your AI financial journey today</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full bg-dark border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary outline-none transition-colors"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-dark border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary outline-none transition-colors"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-dark border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Sign Up"} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="text-center text-slate-400 mt-6 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:text-blue-400 font-medium hover:underline">
                        Log In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;