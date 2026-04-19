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
    <div className="flex flex-col rounded-2xl border border-white/10 bg-ink-900/60 backdrop-blur-xl shadow-xl shadow-black/30 overflow-hidden h-[500px] transition-all hover:border-white/20">
      <div className="bg-ink-900/80 backdrop-blur-md border-b border-white/10 p-4 shrink-0 shadow-sm z-10">
        <h2 className="font-display text-sm font-semibold text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
          Smart Area Advisor
        </h2>
        
        {locations?.length > 0 ? (
          <select 
            value={selectedLocId} 
            onChange={e => setSelectedLocId(e.target.value)}
            className="w-full mt-3 rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white outline-none focus:border-accent"
          >
            {locations.map(loc => (
              <option key={loc.id || loc._id} value={loc.id || loc._id}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="mt-2 text-xs text-mist/60">No locations loaded.</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm pb-0">
        {messages.length === 0 && (
          <p className="text-mist/50 text-center text-xs mt-10">Select an area and explicitly declare your plan to get AI health & safety advice.</p>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col animate-message-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-mist/40 mb-1 ml-1 font-medium tracking-wide uppercase">{msg.role === 'user' ? 'You' : 'Advisor'}</span>
            
            <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-accent to-accent-dim text-white rounded-tr-sm shadow-accent/20' 
                : 'bg-ink-900/80 backdrop-blur-sm border border-white/10 text-mist rounded-tl-sm'
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
             <span className="text-[10px] text-mist/40 mb-1 ml-1 font-medium tracking-wide uppercase">Advisor</span>
             <div className="p-3 bg-ink-900/80 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm text-mist flex gap-2 items-center shadow-md">
                <span className="text-xs">Analyzing area</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-accent/60 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-accent/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} className="h-4" />
      </div>

      <div className="p-4 shrink-0 bg-ink-950/80 backdrop-blur-md border-t border-white/5 mt-auto z-10">
        <form onSubmit={sendMessage} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., I want to jog here..."
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 px-4 py-3 pr-24 text-sm text-white placeholder-mist/40 outline-none transition-all focus:border-accent focus:bg-ink-900 focus:shadow-[0_0_15px_rgba(13,148,136,0.15)] focus:ring-1 focus:ring-accent"
            disabled={isLoading || !locations?.length}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || !locations?.length}
            className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-accent px-4 text-xs font-semibold text-white transition-all duration-300 disabled:opacity-50 hover:bg-accent-dim hover:shadow-[0_0_10px_rgba(13,148,136,0.3)] active:scale-95"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
