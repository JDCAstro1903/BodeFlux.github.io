import { Camera } from 'lucide-react';
import { useState } from 'react';

export function FloatingActionButton() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`fixed bottom-24 md:bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#0071E3] to-[#005BB5] shadow-2xl hover:shadow-[0_20px_60px_rgba(0,113,227,0.4)] flex items-center justify-center transition-all z-40 ${
        isPressed ? 'scale-90' : 'hover:scale-110'
      }`}
      style={{
        boxShadow: '0 12px 40px rgba(0, 113, 227, 0.35)',
      }}
      aria-label="Escanear código QR"
    >
      <Camera size={28} className="text-white" />

      {/* Pulse Animation */}
      <span className="absolute inset-0 rounded-full bg-[#0071E3] animate-ping opacity-20" />
    </button>
  );
}
