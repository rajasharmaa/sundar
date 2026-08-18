import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface MachineAnimationProps {
  progress: MotionValue<number>;
}

export const MachineAnimation: React.FC<MachineAnimationProps> = ({ progress }) => {
  // Map progress (0-1) to animation states

  // 1. Film Path Length
  const filmProgress = useTransform(progress, [0, 0.7], [0, 1]);

  // 2. Roller rotation continuous based on progress
  const rollerRotation = useTransform(progress, [0, 1], [0, 3600]);

  // 3. Printing Cylinder rotation (slower, opposite direction)
  const cylinderRotation = useTransform(progress, [0, 1], [0, -1800]);

  // 4. Winding roll growth
  const rollScale = useTransform(progress, [0.4, 0.9], [0.2, 1]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-auto max-w-5xl drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="30%" stopColor="#f1f5f9" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="blueMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="beigeFrame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5f5f4" />
            <stop offset="50%" stopColor="#e7e5e4" />
            <stop offset="100%" stopColor="#d6d3d1" />
          </linearGradient>

          <linearGradient id="filmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.95)" />
          </linearGradient>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="6" stdDeviation="4" floodOpacity="0.3" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <pattern id="printPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0L20 10L10 20L0 10Z" fill="#ea580c" opacity="0.8"/>
            <path d="M10 5L15 10L10 15L5 10Z" fill="#1e293b" opacity="0.6"/>
          </pattern>
        </defs>

        {/* Floor Line */}
        <path d="M 0 550 L 1000 550" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M 0 553 L 1000 553" stroke="#94a3b8" strokeWidth="8" />

        {/* Background depth shadows */}
        <path d="M 100 550 L 900 550 L 850 480 L 150 480 Z" fill="rgba(0,0,0,0.05)" />

        <g filter="url(#shadow)">
          {/* Main Central Beige Frame (Large structure) */}
          <path d="M 250 500 L 250 150 L 800 150 L 800 500 Z" fill="url(#beigeFrame)" stroke="#a8a29e" strokeWidth="2" />
          
          {/* Top blue casing */}
          <path d="M 240 150 L 810 150 L 790 80 L 260 80 Z" fill="url(#blueMetal)" />
          {/* Top vents */}
          <rect x="300" y="100" width="100" height="20" fill="#1e293b" rx="2" />
          <rect x="450" y="100" width="100" height="20" fill="#1e293b" rx="2" />
          <rect x="600" y="100" width="100" height="20" fill="#1e293b" rx="2" />

          {/* Left Cutout in beige frame */}
          <rect x="300" y="250" width="150" height="150" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="4" rx="10" />
          <path d="M 300 250 L 450 250 L 450 400 L 300 400 Z" fill="rgba(0,0,0,0.8)" />

          {/* Right Cutout */}
          <rect x="600" y="250" width="120" height="200" fill="#e7e5e4" stroke="#a8a29e" strokeWidth="4" rx="10" />
          <path d="M 600 250 L 720 250 L 720 450 L 600 450 Z" fill="rgba(0,0,0,0.8)" />

          {/* Machine base supports */}
          <rect x="280" y="500" width="60" height="50" fill="#475569" />
          <rect x="700" y="500" width="60" height="50" fill="#475569" />
          <rect x="480" y="500" width="80" height="50" fill="#475569" />

          {/* Unwind Station (Left) */}
          <path d="M 50 500 L 150 500 L 150 250 L 50 250 Z" fill="url(#beigeFrame)" />
          <rect x="40" y="200" width="120" height="50" fill="url(#blueMetal)" />
          
          {/* Rewind Station (Right) */}
          <path d="M 850 500 L 950 500 L 950 250 L 850 250 Z" fill="url(#beigeFrame)" />
          <rect x="840" y="200" width="120" height="50" fill="url(#blueMetal)" />

          {/* Left Printing / Lamination Unit (Blue protruding blocks) */}
          <rect x="180" y="320" width="100" height="80" fill="url(#blueMetal)" rx="4" />
          <rect x="150" y="350" width="80" height="40" fill="url(#blueMetal)" rx="4" />
          <rect x="180" y="200" width="100" height="80" fill="url(#blueMetal)" rx="4" />

          {/* Right Printing Unit */}
          <rect x="520" y="300" width="100" height="120" fill="url(#blueMetal)" rx="4" />
          <rect x="480" y="340" width="60" height="50" fill="url(#blueMetal)" rx="4" />

          {/* Pipes and Details */}
          <circle cx="375" cy="200" r="15" fill="url(#blueMetal)" />
          <circle cx="660" cy="200" r="15" fill="url(#blueMetal)" />
          <rect x="350" y="150" width="10" height="50" fill="url(#metal)" />
          <rect x="655" y="150" width="10" height="50" fill="url(#metal)" />

          {/* Multiple structural circles/bolts on beige frame */}
          {[270, 310, 350, 400, 480, 520, 580, 750, 780].map((x, i) => (
            <circle key={`bolt1-${i}`} cx={x} cy="180" r="6" fill="#94a3b8" stroke="#64748b" />
          ))}
          {[280, 480, 520, 580, 750].map((x, i) => (
            <circle key={`bolt2-${i}`} cx={x} cy="460" r="8" fill="#94a3b8" stroke="#64748b" />
          ))}
          
          <circle cx="480" cy="280" r="12" fill="#94a3b8" stroke="#64748b" />
          <circle cx="480" cy="380" r="12" fill="#94a3b8" stroke="#64748b" />
          <circle cx="750" cy="280" r="12" fill="#94a3b8" stroke="#64748b" />
          <circle cx="750" cy="380" r="12" fill="#94a3b8" stroke="#64748b" />
        </g>

        {/* --- FILM WEB PATH (The actual material) --- */}
        {/* We use a thick stroke with gradient for the material web. */}
        <motion.path
          d="
            M 100 220 
            L 100 120 
            L 220 120 
            L 220 250 
            L 280 250 
            L 280 420 
            L 400 420 
            L 400 280 
            L 500 280 
            L 500 400 
            L 650 400 
            L 650 320 
            L 750 320 
            L 750 180 
            L 850 180 
            L 900 220
          "
          fill="none"
          stroke="url(#filmGradient)"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: filmProgress }}
          filter="url(#glow)"
        />
        
        {/* Film border to give it depth */}
        <motion.path
          d="
            M 100 220 L 100 120 L 220 120 L 220 250 L 280 250 L 280 420 
            L 400 420 L 400 280 L 500 280 L 500 400 L 650 400 L 650 320 
            L 750 320 L 750 180 L 850 180 L 900 220
          "
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: filmProgress }}
        />

        {/* --- ROLLERS AND CYLINDERS --- */}
        {/* Unwind Roll */}
        <g>
          <circle cx="100" cy="220" r="60" fill="url(#filmGradient)" />
          <circle cx="100" cy="220" r="60" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <motion.circle cx="100" cy="220" r="10" fill="#334155" style={{ rotate: rollerRotation }} />
        </g>

        {/* Rewind Roll (Growing) */}
        <g>
          <motion.circle cx="900" cy="220" r="60" fill="url(#filmGradient)" style={{ scale: rollScale }} />
          <motion.circle cx="900" cy="220" r="60" fill="none" stroke="#e2e8f0" strokeWidth="2" style={{ scale: rollScale }} />
          <motion.circle cx="900" cy="220" r="10" fill="#334155" style={{ rotate: rollerRotation }} />
        </g>

        {/* Guide Rollers (Along the web path) */}
        {[
          {x: 100, y: 120, r: 15},
          {x: 220, y: 120, r: 15},
          {x: 220, y: 250, r: 15},
          {x: 280, y: 250, r: 15},
          {x: 280, y: 420, r: 15},
          {x: 400, y: 420, r: 15},
          {x: 400, y: 280, r: 15},
          {x: 500, y: 280, r: 15},
          {x: 500, y: 400, r: 15},
          {x: 650, y: 400, r: 15},
          {x: 650, y: 320, r: 15},
          {x: 750, y: 320, r: 15},
          {x: 750, y: 180, r: 15},
          {x: 850, y: 180, r: 15},
        ].map((roller, i) => (
          <g key={`roller-${i}`}>
            <circle cx={roller.x} cy={roller.y} r={roller.r} fill="url(#metal)" filter="url(#shadow)" />
            <motion.circle 
              cx={roller.x} 
              cy={roller.y} 
              r={roller.r} 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="2" 
              strokeDasharray="8 4" 
              style={{ rotate: rollerRotation }} 
            />
            <circle cx={roller.x} cy={roller.y} r={roller.r * 0.3} fill="#0f172a" />
          </g>
        ))}

        {/* --- PRINTING CYLINDERS (Large patterned rollers) --- */}
        {/* Cylinder 1 */}
        <g>
          <circle cx="280" cy="335" r="45" fill="url(#printPattern)" filter="url(#shadow)" />
          <circle cx="280" cy="335" r="45" fill="rgba(0,0,0,0.2)" />
          <motion.circle cx="280" cy="335" r="45" fill="none" stroke="#1e293b" strokeWidth="4" strokeDasharray="20 10" style={{ rotate: cylinderRotation }} />
          <circle cx="280" cy="335" r="10" fill="#0f172a" />
        </g>
        
        {/* Cylinder 2 */}
        <g>
          <circle cx="500" cy="340" r="45" fill="url(#printPattern)" filter="url(#shadow)" />
          <circle cx="500" cy="340" r="45" fill="rgba(0,0,0,0.2)" />
          <motion.circle cx="500" cy="340" r="45" fill="none" stroke="#1e293b" strokeWidth="4" strokeDasharray="20 10" style={{ rotate: cylinderRotation }} />
          <circle cx="500" cy="340" r="10" fill="#0f172a" />
        </g>

        {/* --- LABELS --- */}
        <g opacity="0.9">
          <rect x="70" y="160" width="60" height="20" fill="#1e293b" rx="2" />
          <text x="100" y="174" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">UNWIND</text>

          <rect x="230" y="160" width="100" height="20" fill="#1e293b" rx="2" />
          <text x="280" y="174" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">STATION 1</text>

          <rect x="450" y="160" width="100" height="20" fill="#1e293b" rx="2" />
          <text x="500" y="174" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">STATION 2</text>

          <rect x="870" y="160" width="60" height="20" fill="#1e293b" rx="2" />
          <text x="900" y="174" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">REWIND</text>
        </g>

      </svg>
    </div>
  );
};
