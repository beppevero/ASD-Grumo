import React from 'react';

interface LogoGrumoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  lightText?: boolean;
}

export const LogoGrumo: React.FC<LogoGrumoProps> = ({
  className = '',
  size = 48,
  showText = false,
  lightText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0 rounded-full shadow-sm"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-sm select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Outer Ring */}
          <circle
            cx="250"
            cy="250"
            r="236"
            fill="#FFFFFF"
            stroke="#0B4FBA"
            strokeWidth="20"
          />

          {/* Left Side - ASD Grumo Royal Blue Head Silhouette */}
          <path
            d="M 230 40 
               C 180 40, 100 80, 80 150 
               C 70 185, 75 225, 90 260 
               C 105 295, 130 330, 160 365 
               C 175 385, 185 410, 190 435 
               C 195 450, 205 460, 215 455 
               C 225 450, 220 430, 215 410 
               C 225 435, 235 445, 245 440 
               C 255 435, 245 405, 240 380 
               C 255 350, 255 300, 250 250 
               L 245 220 
               C 240 180, 235 120, 230 40 Z"
            fill="#0B4FBA"
          />

          {/* White Fleece / Horn Curves on Top Left */}
          <path
            d="M 120 180
               C 105 160, 100 130, 115 110
               C 130 90, 160 85, 185 95
               C 170 75, 190 55, 215 60
               C 235 65, 245 85, 240 110
               C 230 140, 210 160, 185 170
               C 160 175, 140 170, 120 180 Z"
            fill="#FFFFFF"
          />

          {/* Ram Horn Texture */}
          <path
            d="M 175 140 
               C 160 145, 145 160, 140 180 
               C 155 175, 175 170, 190 160 Z"
            fill="#0B4FBA"
          />

          {/* Eye in pure white */}
          <ellipse
            cx="165"
            cy="265"
            rx="14"
            ry="7"
            transform="rotate(-20 165 265)"
            fill="#FFFFFF"
          />

          {/* Snout Contour */}
          <path
            d="M 215 285 
               C 228 290, 235 295, 225 310 
               C 215 315, 205 310, 200 305 Z"
            fill="#FFFFFF"
          />

          {/* Stylized Beard curls in Royal Blue */}
          <path
            d="M 160 365 
               C 150 395, 140 425, 150 445 
               C 155 455, 165 450, 165 435 
               C 165 415, 175 390, 185 375 Z"
            fill="#0B4FBA"
          />

          {/* Right Side - Volleyball panels in Carmine Red #C8102E */}
          {/* Top Panel */}
          <path
            d="M 270 60
               C 310 65, 360 85, 395 125
               C 420 155, 435 190, 440 230
               C 410 215, 360 205, 315 200
               C 275 195, 260 180, 255 140
               C 250 100, 255 70, 270 60 Z"
            fill="#C8102E"
          />

          {/* Center-right vertical volley panel */}
          <path
            d="M 265 225
               C 300 230, 335 240, 350 265
               C 365 290, 360 330, 345 365
               C 335 390, 315 415, 285 435
               C 280 395, 285 350, 290 310
               C 295 270, 285 240, 265 225 Z"
            fill="#C8102E"
          />

          {/* Outer Right volley panel */}
          <path
            d="M 375 225
               C 410 250, 430 285, 435 330
               C 440 370, 420 405, 390 430
               C 375 395, 375 350, 385 305
               C 390 280, 385 250, 375 225 Z"
            fill="#C8102E"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-display text-2xl font-bold tracking-tight uppercase leading-none ${
              lightText ? 'text-white' : 'text-[#0B4FBA]'
            }`}
          >
            ASD GRUMO
          </span>
          <span
            className={`text-xs font-semibold tracking-wider uppercase ${
              lightText ? 'text-blue-100' : 'text-[#C8102E]'
            }`}
          >
            PALLAVOLO & SPORT
          </span>
        </div>
      )}
    </div>
  );
};
