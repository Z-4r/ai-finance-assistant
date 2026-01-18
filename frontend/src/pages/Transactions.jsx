import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, IndianRupee, Trash2 } from "lucide-react"; // Imported IndianRupee
import api from "../api/axios";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customCategory, setCustomCategory] = useState(""); // State for custom input
    
    // Form State
    const [form, setForm] = useState({
        amount: "",
        category: "Food", // Default
        type: "expense",  // Default
        description: "" 
    });

    const categories = ["Food", "Transport", "Salary", "Entertainment", "Utilities", "Rent", "Shopping", "Health", "Other"];

    // 1. Fetch Transactions
    const fetchTransactions = async () => {
        try {
            const res = await api.get("/transactions/?limit=50");
            setTransactions(res.data);
        } catch (err) {
            console.error("Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // 2. Add Transaction
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Determine final category (Dropdown vs Custom Input)
            const finalCategory = form.category === "Other" ? customCategory : form.category;

            if (!finalCategory.trim()) {
                alert("Please enter a category");
                return;
            }

            const payload = { 
                ...form, 
                amount: parseFloat(form.amount),
                category: finalCategory // Send the actual text
            };

            await api.post("/transactions/", payload);
            
            // Reset Form
            setForm({ amount: "", category: "Food", type: "expense", description: "" });
            setCustomCategory("");
            fetchTransactions(); // Refresh list
        } catch (err) {
            alert("Failed to add transaction");
        }
    };

    // 3. Delete Transaction (Optional but recommended)
    // Note: Ensure your backend has @app.delete("/transactions/{id}") for this to work.
    // If not, this button will just error out safely.
    const handleDelete = async (id) => {
        if(!window.confirm("Delete this transaction?")) return;
        try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
        } catch (err) {
            console.log("Delete not implemented in backend yet, or failed.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Add Transaction Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                <div className="bg-card p-6 rounded-2xl border border-slate-800 shadow-xl sticky top-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Wallet className="text-primary" /> Add Transaction
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setForm({...form, type: 'expense'})}
                                    className={`p-2 rounded-xl text-sm font-bold transition-all ${form.type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-dark border border-slate-700 text-slate-400'}`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({...form, type: 'income'})}
                                    className={`p-2 rounded-xl text-sm font-bold transition-all ${form.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-dark border border-slate-700 text-slate-400'}`}
                                >
                                    Income
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Amount (₹)</label>
                            <div className="relative">
                                <IndianRupee size={16} className="absolute left-3 top-3.5 text-slate-500"/>
                                <input 
                                    type="number" 
                                    value={form.amount}
                                    onChange={(e) => setForm({...form, amount: e.target.value})}
                                    className="w-full bg-dark border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-primary"
                                    placeholder="0.00"
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Category</label>
                            <select 
                                value={form.category}
                                onChange={(e) => setForm({...form, category: e.target.value})}
                                className="w-full bg-dark border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary mb-2"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {/* Show Text Input if "Other" is selected */}
                            {form.category === "Other" && (
                                <input 
                                    type="text" 
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="Enter custom category..."
                                    className="w-full bg-dark border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-primary animate-in fade-in slide-in-from-top-2"
                                    required
                                />
                            )}
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <Plus size={18} /> Add Entry
                        </button>
                    </form>
                </div>
            </motion.div>

            {/* RIGHT: Transaction History */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
                <h2 className="text-xl font-bold text-white mb-6">Recent History</h2>
                
                {loading ? <p className="text-slate-500">Loading...</p> : (
                    <div className="space-y-3">
                        {transactions.length === 0 && <p className="text-slate-500">No transactions yet.</p>}
                        
                        {transactions.map((t) => (
                            <div key={t.id} className="bg-card p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-600 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {t.type === 'income' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white capitalize">{t.category}</h4>
                                        <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString("en-IN")}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold text-lg ${
                                        t.type === 'income' ? 'text-emerald-400' : 'text-white'
                                    }`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString("en-IN")}
                                    </span>
                                    
                                    {/* Delete Button (Visible on Hover) */}
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity p-2"
                                        title="Delete Transaction"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Transactions;