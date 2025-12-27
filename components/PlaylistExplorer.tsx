
import React, { useState, useMemo } from 'react';
import { Category, Country, Language } from '../types';

interface PlaylistExplorerProps {
  categories: Category[];
  countries: Country[];
  languages: Language[];
  onSelectPlaylist: (type: 'category' | 'country' | 'language', value: string) => void;
  onClose: () => void;
}

const PlaylistExplorer: React.FC<PlaylistExplorerProps> = ({ 
  categories, 
  countries, 
  languages, 
  onSelectPlaylist, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'countries' | 'categories' | 'languages'>('countries');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    switch (activeTab) {
      case 'countries':
        return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
      case 'categories':
        return categories.filter(c => c.name.toLowerCase().includes(q));
      case 'languages':
        return languages.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
  }, [activeTab, search, countries, categories, languages]);

  const handleCopyM3U = (e: React.MouseEvent, type: string, id: string) => {
    e.stopPropagation();
    let url = '';
    if (type === 'country') url = `https://iptv-org.github.io/iptv/countries/${id.toLowerCase()}.m3u`;
    if (type === 'category') url = `https://iptv-org.github.io/iptv/categories/${id.toLowerCase()}.m3u`;
    if (type === 'language') url = `https://iptv-org.github.io/iptv/languages/${id.toLowerCase()}.m3u`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-full max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
              Playlist Explorer
            </h2>
            <p className="text-slate-400 text-sm mt-1">Discover curated channel collections from IPTV-org</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Navigation & Search */}
        <div className="p-6 bg-slate-900/50 flex flex-col md:flex-row gap-4 border-b border-slate-800">
          <div className="flex bg-slate-800 p-1 rounded-xl">
            {(['countries', 'categories', 'languages'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List Grid */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems?.map((item: any) => {
              const id = 'id' in item ? item.id : item.code;
              const type = activeTab === 'countries' ? 'country' : activeTab === 'categories' ? 'category' : 'language';
              
              return (
                <div 
                  key={id}
                  onClick={() => onSelectPlaylist(type, id)}
                  className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono uppercase mt-1 tracking-widest">{id}</p>
                    </div>
                    {activeTab === 'countries' && (
                      <span className="text-2xl filter drop-shadow-sm">{item.flag || '🏳️'}</span>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <button className="text-[11px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      Explore channels
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                    <button 
                      onClick={(e) => handleCopyM3U(e, type, id)}
                      className={`p-2 rounded-lg transition-all ${
                        copiedId === id ? 'bg-green-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                      title="Copy M3U Playlist URL"
                    >
                      {copiedId === id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredItems?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <p className="text-lg font-medium">No results for "{search}"</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-center">
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-[0.2em]">Source: iptv-org/iptv Playlists</p>
        </div>
      </div>
    </div>
  );
};

export default PlaylistExplorer;
