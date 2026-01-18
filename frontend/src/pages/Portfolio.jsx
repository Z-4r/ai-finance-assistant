import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, RefreshCw, Trash2, Pencil, X, IndianRupee, Save } from "lucide-react";
import api from "../api/axios";

const Portfolio = () => {
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // Track which ID we are editing
    
    const [form, setForm] = useState({
        symbol: "",
        quantity: "",
        buy_price: "",
        asset_type: "stock"
    });

    const fetchPerformance = async () => {
        setLoading(true);
        try {
            const res = await api.get("/portfolio/performance");
            setPerformance(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, []);

    // Handle Form Submit (Both Add and Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                quantity: parseFloat(form.quantity),
                buy_price: parseFloat(form.buy_price)
            };

            if (editingId) {
                // UPDATE Mode: PUT request
                await api.put(`/assets/${editingId}`, payload);
                setEditingId(null); // Exit edit mode
            } else {
                // ADD Mode: POST request
                await api.post("/assets/", payload);
            }
            
            // Reset Form and Refresh
            setForm({ symbol: "", quantity: "", buy_price: "", asset_type: "stock" });
            fetchPerformance(); 
        } catch (err) {
            alert("Operation failed. Check inputs.");
        }
    };

    // Load data into form for editing
    const handleEdit = (asset) => {
        setEditingId(asset.id);
        setForm({
            symbol: asset.symbol,
            quantity: asset.quantity,
            buy_price: asset.buy_price,
            asset_type: "stock"
        });
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ symbol: "", quantity: "", buy_price: "", asset_type: "stock" });
    };

    const handleDelete = async (id, symbol) => {
        if (!window.confirm(`Are you sure you want to delete ${symbol}?`)) return;
        try {
            await api.delete(`/assets/${id}`);
            fetchPerformance();
        } catch (err) {
            alert("Failed to delete asset.");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-linear-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white shadow-lg">
                    <p className="text-blue-200 text-sm font-medium mb-1">Total Portfolio Value</p>
                    <h1 className="text-4xl font-bold flex items-center gap-1">
                        <IndianRupee size={32} />
                        {performance?.total_portfolio_value?.toLocaleString("en-IN") || "0.00"}
                    </h1>
                </motion.div>

                {/* ADD / EDIT Form */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.1}} className={`md:col-span-2 p-6 rounded-2xl border transition-colors ${editingId ? 'bg-blue-900/20 border-blue-500/50' : 'bg-card border-slate-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold text-white flex items-center gap-2 ${editingId ? "text-blue-400" : ""}`}>
                            {editingId ? <><Pencil size={18}/> Edit Asset</> : <><PlusCircle size={18}/> Add New Asset</>}
                        </h3>
                        {editingId && (
                            <button onClick={handleCancelEdit} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
                                <X size={14} /> Cancel
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs text-slate-400 block mb-1">Symbol (e.g. RELIANCE.NS)</label>
                            <input 
                                type="text" 
                                value={form.symbol} 
                                onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} 
                                className="w-full bg-dark border border-slate-700 rounded-lg p-2 text-white uppercase focus:border-primary outline-none" 
                                required 
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-xs text-slate-400 block mb-1">Quantity</label>
                            <input 
                                type="number" 
                                value={form.quantity} 
                                onChange={e => setForm({...form, quantity: e.target.value})} 
                                className="w-full bg-dark border border-slate-700 rounded-lg p-2 text-white focus:border-primary outline-none" 
                                required 
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-xs text-slate-400 block mb-1">Avg Price (₹)</label>
                            <input 
                                type="number" 
                                value={form.buy_price} 
                                onChange={e => setForm({...form, buy_price: e.target.value})} 
                                className="w-full bg-dark border border-slate-700 rounded-lg p-2 text-white focus:border-primary outline-none" 
                                required 
                            />
                        </div>
                        <button 
                            type="submit" 
                            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${editingId ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-primary hover:bg-blue-600 text-white'}`}
                        >
                            {editingId ? <><Save size={18}/> Update</> : "Add"}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Holdings Table */}
            <div className="bg-card rounded-2xl border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Your Holdings</h3>
                    <button onClick={fetchPerformance} className="text-primary hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="p-4">Symbol</th>
                                <th className="p-4">Qty</th>
                                <th className="p-4">Avg Price</th>
                                <th className="p-4">Current Price</th>
                                <th className="p-4">Total Value</th>
                                <th className="p-4 text-right">Profit/Loss</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-800">
                            {performance?.holdings?.map((asset, i) => (
                                <tr key={i} className={`transition-colors ${editingId === asset.id ? 'bg-blue-900/20' : 'hover:bg-slate-800/50'}`}>
                                    <td className="p-4 font-bold text-white">{asset.symbol}</td>
                                    <td className="p-4">{asset.quantity}</td>
                                    <td className="p-4">₹{asset.buy_price.toLocaleString("en-IN")}</td>
                                    <td className="p-4">₹{asset.current_price.toLocaleString("en-IN")}</td>
                                    <td className="p-4 font-bold text-white">₹{asset.total_value.toLocaleString("en-IN")}</td>
                                    <td className={`p-4 text-right font-bold ${asset.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {asset.profit_loss >= 0 ? '+' : ''}₹{asset.profit_loss.toLocaleString("en-IN")}
                                    </td>
                                    {/* Action Buttons */}
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleEdit(asset)}
                                                className="text-slate-500 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                                                title="Edit Asset"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(asset.id, asset.symbol)}
                                                className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
                                                title="Delete Asset"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!performance?.holdings || performance.holdings.length === 0) && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">No assets found. Add one above!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;