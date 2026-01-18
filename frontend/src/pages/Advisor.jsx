import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Shield, Clock, IndianRupee, PieChart, CheckCircle, ArrowRight, Banknote } from "lucide-react";
import api from "../api/axios";

const Advisor = () => {
    // Form State
    const [formData, setFormData] = useState({
        monthly_income: 50000,
        investable_amount: 10000,
        risk_appetite: "medium",
        target_amount: 500000,
        time_horizon_years: 3
    });

    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);

    // --- MOCK DATA FOR UI TESTING ---
    const generateMockPlan = () => {
        return {
            timeline: `${formData.time_horizon_years} Years`,
            immediate_action: [
                {
                    instrument: "Recurring Deposit (RD)",
                    name: "HDFC Bank RD",
                    amount_per_month: formData.investable_amount * 0.4,
                    details: "Interest Rate: 6.5% | Safe & Guaranteed"
                },
                {
                    instrument: "Mutual Fund SIP",
                    name: "Nifty 50 Index Fund",
                    amount_per_month: formData.investable_amount * 0.3,
                    details: "Category: Large Cap | Moderate Growth"
                },
                {
                    instrument: "Direct Equity",
                    name: "RELIANCE (NSE)",
                    amount_per_month: formData.investable_amount * 0.3,
                    details: "Buy ~2 shares monthly for long term."
                }
            ],
            future_strategy: `**Step 1:** Continue the RD and SIPs for ${formData.time_horizon_years} years.\n**Step 2:** When your RD matures annually, move the lump sum into a **Fixed Deposit (FD)** to lock in profits.\n**Step 3:** Review portfolio every 6 months.`,
            projection: {
                projected_corpus: formData.target_amount * 1.12, // Fake successful projection
                status: "Achievable",
                message: "You are on track to exceed your goal!"
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPlan(null);

        try {
            const response = await api.post("/recommend/portfolio", formData);
            setPlan(response.data);
            await new Promise(r => setTimeout(r, 1500));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <PieChart className="text-accent" size={40} />
                    Robo Advisor
                </h1>
                <p className="text-slate-400">Personalized investment plans based on your life goals.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. INPUT FORM */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 bg-card p-6 rounded-2xl border border-slate-800 shadow-xl h-fit"
                >
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Your Profile</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Monthly Income (₹)</label>
                            <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white focus:border-accent outline-none" />
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Investable Amount (₹)</label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input type="number" name="investable_amount" value={formData.investable_amount} onChange={handleChange} className="w-full bg-dark border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none font-bold text-accent" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Target Goal (₹)</label>
                            <div className="relative">
                                <Target className="absolute left-3 top-3 text-slate-500" size={18} />
                                <input type="number" name="target_amount" value={formData.target_amount} onChange={handleChange} className="w-full bg-dark border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Horizon (Yrs)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 text-slate-500" size={18} />
                                    <input type="number" name="time_horizon_years" value={formData.time_horizon_years} onChange={handleChange} className="w-full bg-dark border border-slate-700 rounded-lg p-3 pl-10 text-white focus:border-accent outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Risk Profile</label>
                                <select name="risk_appetite" value={formData.risk_appetite} onChange={handleChange} className="w-full bg-dark border border-slate-700 rounded-lg p-3 text-white focus:border-accent outline-none">
                                    <option value="low">Low (Safe)</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High (Aggressive)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-accent hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-4 flex justify-center items-center gap-2"
                        >
                            {loading ? "Generating Plan..." : "Create Plan"} <ArrowRight size={18} />
                        </button>
                    </form>
                </motion.div>

                {/* 2. RESULTS DISPLAY */}
                <div className="lg:col-span-2 space-y-6">
                    {plan && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Status Banner */}
                            <div className={`p-4 rounded-xl border mb-6 flex items-start gap-4 ${
                                plan.projection.status === 'Achievable' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            }`}>
                                <CheckCircle size={24} className="mt-1" />
                                <div>
                                    <h4 className="font-bold text-lg">{plan.projection.status}</h4>
                                    <p className="text-slate-300 text-sm">{plan.projection.message}</p>
                                    <p className="mt-1 font-mono font-bold text-white">
                                        Projected Corpus: ₹{Math.round(plan.projection.projected_corpus).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4">Immediate Action (Monthly)</h3>
                            
                            {/* Allocation Cards */}
                            <div className="grid grid-cols-1 gap-4 mb-8">
                                {plan.immediate_action.map((item, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-card p-4 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-accent font-bold text-xl">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{item.instrument}</h4>
                                                <p className="text-accent">{item.name}</p>
                                                <p className="text-slate-500 text-xs mt-1">{item.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-sm">Invest</p>
                                            <p className="text-xl font-bold text-white">₹{item.amount_per_month}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Future Strategy Text */}
                            <div className="bg-linear-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Shield size={20} className="text-blue-400" />
                                    Lifecycle Strategy
                                </h3>
                                <div className="text-slate-300 space-y-2 text-sm leading-relaxed whitespace-pre-line">
                                    {plan.future_strategy}
                                </div>
                            </div>

                        </motion.div>
                    )}
                    
                    {!plan && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl p-12">
                            <Target size={60} className="mb-4 opacity-50" />
                            <p>Fill the form to generate your AI investment plan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Advisor;