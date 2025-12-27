import React, { useState } from 'react';
import { CombinedChannel } from '../types';

interface ChannelCardProps {
  channel: CombinedChannel;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlay: (channel: CombinedChannel) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ 
  channel, 
  isFavorite, 
  onToggleFavorite, 
  onPlay 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (channel.streamUrl) {
      navigator.clipboard.writeText(channel.streamUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const categories = Array.isArray(channel.categories) ? channel.categories : [];

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-video bg-slate-900 flex items-center justify-center p-6 relative">
        {channel.logo ? (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="max-w-full max-h-full object-contain filter drop-shadow-md"
            loading="lazy"
            onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=1e293b&color=f8fafc&size=128`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 font-bold text-2xl uppercase">
            {channel.name ? channel.name.substring(0, 2) : 'TV'}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={() => onPlay(channel)}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform"
            title="Play Stream"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          
          <button 
            onClick={handleCopy}
            className={`p-3 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-all ${
              copied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
            title="Copy M3U8 URL"
            aria-label="Copy stream URL"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
          </button>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${
            isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 bg-black/20 hover:text-white'
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white truncate mb-1" title={channel.name}>
          {channel.name}
        </h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {categories.slice(0, 2).map(cat => (
            <span key={cat} className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full uppercase tracking-wider font-medium">
              {cat}
            </span>
          ))}
          <span className="text-[10px] px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded-full uppercase tracking-wider font-medium">
            {channel.country}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;