import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap, CheckCircle, Fingerprint, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-green-500 selection:text-black">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#020202]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-black w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FinanceAI</span>
          </div>

          {/* Center Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-green-400 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a>
          </div>

          {/* AUTH BUTTONS - LINKED TO YOUR PAGES */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold py-2.5 px-5 rounded-md transition-all hover:scale-105 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
        
        {/* Background Glow */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            The future of finance is <br />
            <span className="inline-flex items-center gap-3">
              <Fingerprint className="w-12 h-12 text-gray-400 opacity-50" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Human</span> 
            </span>
            <span className="mx-4 font-light text-green-500">+</span> 
            <span className="inline-flex items-center gap-3">
              <span className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">AI</span>
              <Sparkles className="w-10 h-10 text-green-400 fill-green-400/20" />
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Map your financial future, track your assets, and close the gap to financial freedom in a GenAI world.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-green-500 hover:bg-green-400 text-black text-lg font-bold py-4 px-8 rounded-full transition-all hover:scale-105 flex items-center gap-2 group"
            >
              Join The Community
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* --- ADVENTURE CARDS --- */}
      <div className="py-24 bg-[#050505]" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Choose your <span className="text-green-400 italic font-serif">adventure</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: Investors */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-10 rounded-3xl bg-[#0f0f0f] border border-white/10 hover:border-green-500/50 transition-colors group relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-green-900/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
                <Shield className="text-green-400 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">For Investors</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Refine your portfolio with AI-driven insights. Track performance and prepare for market shifts.
              </p>
              
              <div className="space-y-4 mb-8">
                {['Track total asset proficiency', 'Prepare for market shifts', 'AI-driven long term signals'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl border border-white/10 group-hover:bg-green-500 group-hover:text-black group-hover:border-green-500 transition-all font-bold">
                Explore Investor Hub
              </button>
            </motion.div>

            {/* Card 2: Traders */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-10 rounded-3xl bg-[#0f0f0f] border border-white/10 hover:border-white/30 transition-colors group relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Zap className="text-white w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">For Day Traders</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Get your strategy GenAI ready. Process real-time signals and manage risk with split-second precision.
              </p>
              
              <div className="space-y-4 mb-8">
                {['Real-time buy/sell signals', 'Upskill risk management', 'High-frequency data streams'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl border border-white/10 group-hover:bg-white group-hover:text-black transition-all font-bold">
                Start Trading Pro
              </button>
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 py-12 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <p>© 2024 FinanceAI.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-green-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-400 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;