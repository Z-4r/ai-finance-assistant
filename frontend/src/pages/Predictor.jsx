import React, { useState } from 'react';
import api from "../api/axios";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Activity, 
  Clock, 
  Calendar 
} from 'lucide-react';

const Predictor = () => {
  const [symbol, setSymbol] = useState('');
  const [period, setPeriod] = useState('1yr'); // Default to 1 Year
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    // 1. Validation
    if (!symbol) {
      setError('Please enter a stock symbol (e.g., RELIANCE)');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      // 2. The API Call - MUST send 'period' here!
      const response = await api.post('/predict/intraday', {
        symbol: symbol.toUpperCase(),
        period: period // <--- THIS IS KEY. It sends "1mo", "7d", etc.
      });

      // 3. Handle Errors from Backend
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setPrediction(response.data);
      }
    } catch (err) {
      console.error("API Error:", err);
      setError('Prediction failed. Ensure Backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI Stock Predictor
          </h1>
          <p className="text-slate-400">Institutional-Grade Algo Trading Signals</p>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Symbol Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-4 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Enter Symbol (e.g. TCS, INFY)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white text-lg outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Time Period Dropdown */}
            <div className="relative w-full md:w-48">
              <Calendar className="absolute left-4 top-4 text-slate-500" size={20} />
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full h-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white text-lg outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                {/* 1 Day removed because Daily data needs at least 2 days for a trend */}
                <option value="1yr">1 Year</option>
                <option value="6mo">6 Months</option>
                <option value="3mo">3 Months</option>
                <option value="1mo">1 Month</option>
                <option value="7d">7 Days</option>
              </select>
              {/* Custom Arrow for Dropdown */}
              <div className="absolute right-4 top-5 pointer-events-none">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Activity className="animate-spin" /> Analyzing...
                </span>
              ) : (
                "Predict"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {prediction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            
            {/* Main Signal Card */}
            <div className={`p-6 rounded-2xl border ${
              prediction.signal.includes("BUY") ? "bg-emerald-500/10 border-emerald-500/50" : 
              prediction.signal.includes("SELL") ? "bg-red-500/10 border-red-500/50" : 
              "bg-slate-700/50 border-slate-600"
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{prediction.symbol}</h2>
                  <p className="text-slate-400 text-sm">Timeframe: {prediction.period_analyzed}</p>
                </div>
                <div className={`px-4 py-1 rounded-full text-sm font-bold ${
                   prediction.signal.includes("BUY") ? "bg-emerald-500 text-white" : 
                   prediction.signal.includes("SELL") ? "bg-red-500 text-white" : 
                   "bg-slate-500 text-white"
                }`}>
                  {prediction.signal}
                </div>
              </div>

              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-bold text-white">₹{prediction.predicted_target}</span>
                <span className="text-slate-400 mb-2">Target</span>
              </div>
              <p className="text-sm text-slate-400">Current: ₹{prediction.current_price}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Stop Loss</p>
                <p className="text-xl font-mono text-red-400">₹{prediction.stop_loss}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">RSI Score</p>
                <p className={`text-xl font-mono ${prediction.rsi > 70 ? 'text-red-400' : prediction.rsi < 30 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {prediction.rsi}
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-400 text-sm">Confidence Level</p>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">High Accuracy</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">{prediction.confidence}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Predictor;