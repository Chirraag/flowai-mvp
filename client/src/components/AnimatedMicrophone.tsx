import { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface AnimatedMicrophoneProps {
  isActive: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

export function AnimatedMicrophone({ isActive, isConnecting, isSpeaking, onClick }: AnimatedMicrophoneProps) {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (isSpeaking && isActive) {
      const interval = setInterval(() => {
        setPulseScale(s => s === 1 ? 1.1 : 1);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isSpeaking, isActive]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rings animation */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-400" 
               style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full animate-ping opacity-15 bg-blue-400" 
               style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute inset-0 rounded-full animate-ping opacity-10 bg-blue-400" 
               style={{ animationDuration: '2s', animationDelay: '1s' }} />
        </>
      )}

      {/* Speaking animation */}
      {isSpeaking && isActive && (
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-pulse" 
             style={{ animationDuration: '0.3s' }} />
      )}

      {/* Main button - Much bigger */}
      <button
        onClick={onClick}
        disabled={isConnecting}
        className={`
          relative z-10 rounded-full p-16 transition-all duration-500 transform
          ${isActive 
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl' 
            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl'
          }
          ${isConnecting ? 'cursor-wait opacity-75 animate-pulse' : 'cursor-pointer hover:scale-110'}
          ${isSpeaking ? `scale-${Math.floor(pulseScale * 100)}` : 'scale-100'}
        `}
        style={{
          transform: `scale(${isSpeaking ? pulseScale : 1})`,
          boxShadow: isActive 
            ? '0 20px 80px rgba(239, 68, 68, 0.4), 0 0 120px rgba(239, 68, 68, 0.2)' 
            : '0 20px 80px rgba(59, 130, 246, 0.4), 0 0 120px rgba(59, 130, 246, 0.2)',
          width: '200px',
          height: '200px'
        }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {isConnecting ? (
            <div className="animate-spin">
              <Phone className="h-20 w-20 text-white" />
            </div>
          ) : isActive ? (
            <PhoneOff className="h-20 w-20 text-white" />
          ) : (
            <Mic className="h-20 w-20 text-white" />
          )}
        </div>
      </button>
    </div>
  );
}