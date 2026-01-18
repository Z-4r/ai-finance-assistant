import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 text-${color}-500`}>
                <Icon size={100} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                    <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                        <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
                
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-accent' : 'text-danger'}`}>
                        <span>{trend === 'up' ? '▲' : '▼'} {trendValue}</span>
                        <span className="text-slate-500 ml-2">vs last month</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;