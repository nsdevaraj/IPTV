
import React, { useState } from 'react';
import { chatWithAssistant, getAIRecommendations } from '../services/geminiService';

interface AssistantPanelProps {
  categories: string[];
  countries: string[];
  onApplyFilters: (category: string | null, country: string | null, search: string) => void;
  context: string;
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({ categories, countries, onApplyFilters, context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Hi! I'm your GlobalStream AI helper. Ask me to find specific content, like 'news from Germany' or 'sports channels'." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Get logical filters if possible
      const recs = await getAIRecommendations(userMsg, categories, countries);
      
      // Get conversation
      const response = await chatWithAssistant(userMsg, context);
      
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      
      if (recs && (recs.suggestedCategory || recs.suggestedCountry || recs.searchKeywords)) {
        // Maybe offer a button to apply
        const applyText = `Would you like me to filter for ${recs.suggestedCategory || ''} channels in ${recs.suggestedCountry || 'this region'}?`;
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            text: recs.reasoning + " I can set the filters for you."
        }]);
        
        // Auto-apply logic for demo purposes or show button
        // For this UX, we'll auto-apply and notify
        onApplyFilters(recs.suggestedCategory || null, recs.suggestedCountry || null, recs.searchKeywords || '');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isOpen ? 'w-80 md:w-96' : 'w-14'}`}>
      {isOpen ? (
        <div className="bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl flex flex-col h-[500px] overflow-hidden">
          <div className="p-4 bg-blue-600 flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 14.9"></path><path d="M12 12l9.9 2.9"></path><circle cx="12" cy="12" r="3"></circle></svg>
                AI Navigator
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none border border-slate-600">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for recommendations..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 14.9"></path><path d="M12 12l9.9 2.9"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      )}
    </div>
  );
};

export default AssistantPanel;
