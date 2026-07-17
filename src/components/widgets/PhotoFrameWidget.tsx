import { useState, useEffect, useRef } from 'react';
import { Upload, ChevronLeft, ChevronRight, Trash2, RefreshCw, Pause } from 'lucide-react';
import { useStore, getSkinColors } from '../../store';

export default function PhotoFrameWidget() {
  const skin = useStore(s => s.skin);
  const { color, glow } = getSkinColors(skin);
  const { photos, addPhoto, removePhoto } = useStore();
  const [idx, setIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoPlay && photos.length > 1) {
      timerRef.current = setInterval(() => {
        setIdx(i => (i + 1) % photos.length);
      }, 5000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, photos.length]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        addPhoto({ id: Date.now().toString() + Math.random(), dataUrl: ev.target?.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  }

  const current = photos[idx];

  return (
    <div className="widget-card h-full flex flex-col select-none overflow-hidden" style={{ borderColor: `${color}20` }}>
      <div className="text-xs font-mono uppercase tracking-widest px-3 pt-3 pb-1 shrink-0" style={{ color: 'rgba(226,232,240,0.3)' }}>
        photos <span style={{ color: `${color}80` }}>({photos.length}/20)</span>
      </div>

      {/* Photo display */}
      <div className="flex-1 relative" style={{ border: `4px solid ${color}25`, margin: '0 8px' }}>
        {current ? (
          <img
            src={current.dataUrl}
            alt={current.name}
            className="w-full h-full object-cover"
            style={{ transition: 'opacity 0.5s ease' }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.02)' }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={24} style={{ color: 'rgba(226,232,240,0.2)' }} />
            <span className="text-xs" style={{ color: 'rgba(226,232,240,0.25)' }}>tap to upload photos</span>
          </div>
        )}

        {photos.length > 1 && (
          <>
            <button
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => setIdx((idx + 1) % photos.length)}
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <div className="flex gap-1.5">
          <button
            className="btn-ghost btn-pill !px-2 !py-1"
            onClick={() => fileRef.current?.click()}
            title="Upload photos"
          >
            <Upload size={11} />
          </button>
          {photos.length > 0 && (
            <>
              <button
                className="btn-ghost btn-pill !px-2 !py-1"
                onClick={() => setAutoPlay(!autoPlay)}
                title={autoPlay ? 'Pause slideshow' : 'Start slideshow'}
              >
                {autoPlay ? <Pause size={11} /> : <RefreshCw size={11} />}
              </button>
              <button
                className="btn-ghost btn-pill !px-2 !py-1"
                onClick={() => { removePhoto(current?.id); setIdx(0); }}
                title="Remove photo"
                style={{ color: 'rgba(239,68,68,0.6)' }}
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-1">
            {photos.map((_, i) => (
              <span key={i} style={{ width: i === idx ? 12 : 5, height: 5, borderRadius: 3, background: i === idx ? color : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }} onClick={() => setIdx(i)} />
            ))}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  );
}
