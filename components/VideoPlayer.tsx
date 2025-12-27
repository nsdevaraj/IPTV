
import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hls: any;
    const video = videoRef.current;

    if (!video || !url) return;

    // Check if HLS.js is available (loaded via CDN in index.html)
    if ((window as any).Hls && (window as any).Hls.isSupported()) {
      hls = new (window as any).Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Auto-play failed:", e));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Auto-play failed:", e));
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8">
      <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white truncate pr-8">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <video 
          ref={videoRef} 
          className="w-full h-full" 
          controls 
          autoPlay 
          playsInline
        />

        <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider animate-pulse">Live</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
