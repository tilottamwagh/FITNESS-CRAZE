import React from 'react';

interface LogoProps {
    className?: string;
}

// FIX: Export the Logo component so it can be imported by other modules.
export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
    return (
        <svg
            viewBox="0 0 300 100"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Fitness Craze Logo"
        >
            <defs>
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <style>
                {`
                .logo-text {
                    font-family: 'Exo 2', sans-serif;
                    font-weight: 900;
                    font-size: 24px;
                    letter-spacing: 2px;
                }
                `}
            </style>
            
            <g className="text-gray-300 fill-current">
                <rect x="15" y="42" width="10" height="16" rx="2" />
                <rect x="25" y="46" width="40" height="8" rx="2" />
                <rect x="65" y="42" width="10" height="16" rx="2" />
                <rect x="10" y="44" width="5" height="12" rx="2" />
                <rect x="75" y="44" width="5" height="12" rx="2" />
            </g>

            <g transform="translate(90 0)">
                 <text x="0" y="45" className="logo-text fill-yellow-400" filter="url(#neon-glow)">
                    FITNESS
                </text>
                 <text x="110" y="45" className="logo-text fill-yellow-400" filter="url(#neon-glow)">
                    CRAZE
                </text>
                <text x="0" y="65" fontSize="10" letterSpacing="1" className="fill-gray-400">
                    WORK IT OUT
                </text>
                <line x1="0" y1="72" x2="200" y2="72" strokeWidth="1" className="stroke-gray-600" />
            </g>
        </svg>
    );
};

export const AppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`relative flex items-center justify-center bg-gray-800 rounded-full p-4 ${className}`}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-700"></div>
        <div className="relative z-10 text-center">
            <svg
                viewBox="0 0 60 30"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-auto mx-auto fill-current text-gray-300"
            >
                <rect x="5" y="9" width="8" height="12" rx="1" />
                <rect x="13" y="12" width="34" height="6" rx="1" />
                <rect x="47" y="9" width="8" height="12" rx="1" />
                <rect x="2" y="10" width="3" height="10" rx="1" />
                <rect x="55" y="10" width="3" height="10" rx="1" />
            </svg>
            <div className="font-black text-yellow-400" style={{ filter: 'drop-shadow(0 0 3px #facc15)', textShadow: '0 0 5px #facc15' }}>
                <p className="text-sm tracking-wider">FITNESS</p>
                <p className="text-sm tracking-wider">CRAZE</p>
            </div>
        </div>
    </div>
);