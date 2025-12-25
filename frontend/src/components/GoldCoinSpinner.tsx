import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
    text?: string;
    svgClassName?: string;
}

const GoldCoinSpinner: React.FC<Props> = ({ text, svgClassName = "w-10 h-10" }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <Loader2 className={`animate-spin text-amber-500 ${svgClassName}`} />
            {text && <p className="mt-2 text-sm text-gray-500">{text}</p>}
        </div>
    );
};

export default GoldCoinSpinner;
