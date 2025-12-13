import React from 'react';

export interface GoldCoinSpinnerProps {
    text?: string;
}

const GoldCoinSpinner: React.FC<GoldCoinSpinnerProps> = ({ text = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center py-20 h-full w-full" aria-label="Loading">
        <svg className="coin-spinner w-16 h-16 filter drop-shadow-md" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="gold_gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: '#FEF08A' }} />
                    <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#gold_gradient)" stroke="#B45309" strokeWidth="4" />
            <text x="50" y="68" textAnchor="middle" fontSize="48" fill="#B45309" fontWeight="bold">₹</text>
        </svg>
        <p className="mt-4 text-sm font-semibold text-secondary-text dark:text-text-muted">{text}</p>
    </div>
);

export default GoldCoinSpinner;
