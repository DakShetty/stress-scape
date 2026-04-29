import { useState, useRef, useEffect } from 'react';

export default function SmartAdvisor({ locations }) {
  const [selectedLocId, setSelectedLocId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Default select first loc if available
  useEffect(() => {
    if (locations?.length > 0 && !selectedLocId) {
      setSelectedLocId(locations[0].id || locations[0]._id);
    }
  }, [locations, selectedLocId]);

  // Scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedLocId) return;

    const userPlan = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userPlan }]);
    setIsLoading(true);

    const targetLoc = locations.find(l => (l.id || l._id) === selectedLocId);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5100'}/api/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: userPlan,
          aqi: targetLoc.aqi,
          temp: targetLoc.temperature,
          crowd: targetLoc.crowdDensity,
          noise: targetLoc.noiseLevel || 0,
          stress: targetLoc.stressScore || 0
        })
      });

      const data = await response.json();
      if (data.advice) {
        setMessages(prev => [...prev, { role: 'ai', content: data.advice, risk: data.risk }]);
      }
    } catch (error) {
      console.error("Advice error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Unable to fetch smart advice right now. Please try again.', risk: 'Unknown' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (riskId) => {
    switch (riskId?.toLowerCase()) {
      case 'low': return 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10';
      case 'medium': return 'border-amber-500/50 text-amber-400 bg-amber-500/10';
      case 'high': return 'border-red-500/50 text-red-400 bg-red-500/10';
      default: return 'border-mist/50 text-mist bg-mist/10';
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-soft overflow-hidden h-[500px] transition-all hover:border-slate-300">
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 p-4 shrink-0 shadow-sm z-10">
        <h2 className="font-display text-sm font-bold text-slate-800 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
          AI Smart Advisor
        </h2>
        
        {locations?.length > 0 ? (
          <select 
            value={selectedLocId} 
            onChange={e => setSelectedLocId(e.target.value)}
            className="w-full mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
          >
            {locations.map(loc => (
              <option key={loc.id || loc._id} value={loc.id || loc._id}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="mt-2 text-xs text-slate-500">No locations loaded.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm pb-0">
        {messages.length === 0 && (
          <p className="text-slate-400 text-center text-xs mt-10">Select an area and explicitly declare your plan to get AI health & safety advice.</p>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col animate-message-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-slate-400 mb-1 ml-1 font-medium tracking-wide uppercase">{msg.role === 'user' ? 'You' : 'Advisor'}</span>
            
            <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20' 
                : 'bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>

            {msg.role === 'ai' && msg.risk && (
               <span className={`mt-2 ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskColor(msg.risk)}`}>
                 Risk: {msg.risk}
               </span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start animate-message-in">
             <span className="text-[10px] text-slate-400 mb-1 ml-1 font-medium tracking-wide uppercase">Advisor</span>
             <div className="p-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl rounded-tl-sm text-slate-600 flex gap-2 items-center shadow-sm">
                <span className="text-xs">Analyzing area</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      <div className="p-4 shrink-0 bg-slate-50/80 backdrop-blur-md border-t border-slate-200/60 mt-auto z-10">
        <form onSubmit={sendMessage} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., I want to jog here..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-24 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 shadow-sm"
            disabled={isLoading || !locations?.length}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || !locations?.length}
            className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 text-xs font-bold text-white transition-all duration-300 disabled:opacity-40 hover:shadow-glow-violet active:scale-95"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
