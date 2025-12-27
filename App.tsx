import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllData } from './services/iptvService';
import { CombinedChannel, Category, Country, Language } from './types';
import ChannelCard from './components/ChannelCard';
import VideoPlayer from './components/VideoPlayer';
import PlaylistExplorer from './components/PlaylistExplorer';
import AssistantPanel from './components/AssistantPanel';

const App: React.FC = () => {
  const [data, setData] = useState<{
    channels: CombinedChannel[];
    categories: Category[];
    countries: Country[];
    languages: Language[];
  }>({ channels: [], categories: [], countries: [], languages: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExplorer, setShowExplorer] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('iptv_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [filters, setFilters] = useState({
    category: null as string | null,
    country: 'IN' as string | null, // Default to India
    language: null as string | null,
    search: '',
    showOnlyFavorites: false,
    letter: null as string | null
  });

  const [activeChannel, setActiveChannel] = useState<CombinedChannel | null>(null);
  const [visibleCount, setVisibleCount] = useState(48);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await fetchAllData();
        setData(result);
      } catch (err) {
        setError('Failed to load IPTV data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem('iptv_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  }, []);

  const filteredChannels = useMemo(() => {
    const searchQuery = filters.search.toLowerCase();
    return data.channels.filter(ch => {
      if (!ch) return false;
      
      const chCategories = Array.isArray(ch.categories) ? ch.categories : [];
      const chLanguages = Array.isArray(ch.languages) ? ch.languages : [];

      const matchesSearch = !filters.search || 
        (ch.name && ch.name.toLowerCase().includes(searchQuery)) ||
        chCategories.some(c => c && c.toLowerCase().includes(searchQuery));
      
      const matchesCategory = !filters.category || chCategories.includes(filters.category);
      const matchesCountry = !filters.country || ch.country === filters.country;
      const matchesLanguage = !filters.language || chLanguages.includes(filters.language);
      const matchesFavorite = !filters.showOnlyFavorites || favorites.includes(ch.id);
      
      let matchesLetter = true;
      if (filters.letter && ch.name) {
        if (filters.letter === '#') {
          matchesLetter = /^\d/.test(ch.name);
        } else {
          matchesLetter = ch.name.toUpperCase().startsWith(filters.letter);
        }
      }

      return matchesSearch && matchesCategory && matchesCountry && matchesLanguage && matchesFavorite && matchesLetter;
    });
  }, [data.channels, filters, favorites]);

  const displayedChannels = useMemo(() => {
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
      setVisibleCount(prev => prev + 24);
    }
  }, [loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleExplorerSelection = (type: 'category' | 'country' | 'language', value: string) => {
    setFilters(prev => ({
      category: null,
      country: null,
      language: null,
      search: '',
      letter: null,
      showOnlyFavorites: false,
      [type]: value
    }));
    setVisibleCount(48);
    setShowExplorer(false);
  };

  const handleApplyAIFilters = (category: string | null, country: string | null, search: string) => {
    setFilters(prev => ({
      ...prev,
      category,
      country,
      search,
      letter: null,
      showOnlyFavorites: false
    }));
    setVisibleCount(48);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-medium animate-pulse">Initializing GlobalStream...</h1>
        <p className="text-slate-500 mt-2 text-sm">Fetching channels from around the world</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 rounded-lg font-bold">Try Again</button>
      </div>
    );
  }

  const currentContext = `Viewing ${filteredChannels.length} channels. Filters: country=${filters.country || 'any'}, category=${filters.category || 'any'}, language=${filters.language || 'any'}.`;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">GlobalStream</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{data.channels.length} CHANNELS</p>
              </div>
            </div>

            <div className="flex flex-1 max-w-2xl items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Quick search..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                    setVisibleCount(48);
                  }}
                />
              </div>
              
              <button 
                onClick={() => setShowExplorer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span className="hidden sm:inline">Browse Playlists</span>
              </button>

              <button 
                onClick={() => setFilters(prev => ({ ...prev, showOnlyFavorites: !prev.showOnlyFavorites }))}
                className={`p-2 rounded-xl border transition-all ${
                  filters.showOnlyFavorites 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filters.showOnlyFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
              <select 
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                value={filters.category || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, category: e.target.value || null }));
                  setVisibleCount(48);
                }}
              >
                <option value="">Categories</option>
                {data.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select 
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                value={filters.country || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, country: e.target.value || null }));
                  setVisibleCount(48);
                }}
              >
                <option value="">Countries</option>
                {data.countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>

              <select 
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                value={filters.language || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, language: e.target.value || null }));
                  setVisibleCount(48);
                }}
              >
                <option value="">Languages</option>
                {data.languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>

              {(filters.category || filters.country || filters.language || filters.search || filters.showOnlyFavorites || filters.letter) ? (
                <button 
                  onClick={() => setFilters({ category: null, country: null, language: null, search: '', showOnlyFavorites: false, letter: null })}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 flex items-center gap-1 whitespace-nowrap font-bold"
                >
                  Reset
                </button>
              ) : null}
            </div>

            {/* A-Z Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar items-center border-t border-slate-800 pt-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-2 whitespace-nowrap">A-Z:</span>
              <button 
                onClick={() => { setFilters(prev => ({ ...prev, letter: null })); setVisibleCount(48); }}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${!filters.letter ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              >
                ALL
              </button>
              {alphabet.map(l => (
                <button 
                  key={l}
                  onClick={() => { setFilters(prev => ({ ...prev, letter: l })); setVisibleCount(48); }}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${filters.letter === l ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex flex-wrap items-center gap-2">
            {filters.showOnlyFavorites ? 'Favorites' : 'Channels'}
            {filters.country && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] rounded border border-blue-500/20">{data.countries.find(c => c.code === filters.country)?.name}</span>}
            {filters.category && <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] rounded border border-purple-500/20 capitalize">{filters.category}</span>}
            {filters.language && <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20">{data.languages.find(l => l.code === filters.language)?.name}</span>}
            {filters.letter && <span className="px-2 py-0.5 bg-slate-700 text-white text-[10px] rounded">Starting with {filters.letter}</span>}
          </h2>
          <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {filteredChannels.length} total
          </div>
        </div>

        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {displayedChannels.map(channel => (
              <ChannelCard 
                key={channel.id} 
                channel={channel} 
                isFavorite={favorites.includes(channel.id)}
                onToggleFavorite={toggleFavorite}
                onPlay={setActiveChannel}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-xl font-bold text-slate-300">No channels found</h3>
            <p className="text-slate-500 mt-2">Try different filters or browse all playlists.</p>
            <button 
              onClick={() => setFilters({ category: null, country: null, language: null, search: '', showOnlyFavorites: false, letter: null })}
              className="mt-6 px-6 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}

        {displayedChannels.length < filteredChannels.length && (
          <div className="flex justify-center mt-12 pb-10">
            <span className="text-slate-500 text-sm animate-pulse">Scroll to load more...</span>
          </div>
        )}
      </main>

      {/* Explorer Overlay */}
      {showExplorer && (
        <PlaylistExplorer 
          categories={data.categories}
          countries={data.countries}
          languages={data.languages}
          onSelectPlaylist={handleExplorerSelection}
          onClose={() => setShowExplorer(false)}
        />
      )}

      {/* Assistant Overlay */}
      <AssistantPanel 
        categories={data.categories.map(c => c.id)}
        countries={data.countries.map(c => c.code)}
        onApplyFilters={handleApplyAIFilters}
        context={currentContext}
      />

      {/* Video Overlay */}
      {activeChannel && activeChannel.streamUrl && (
        <VideoPlayer 
          url={activeChannel.streamUrl} 
          title={activeChannel.name}
          onClose={() => setActiveChannel(null)}
        />
      )}
    </div>
  );
};

export default App;