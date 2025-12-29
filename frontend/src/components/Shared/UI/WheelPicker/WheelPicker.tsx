import React, { useRef, useCallback, useEffect } from 'react';

interface WheelPickerProps {
    onActiveIndexChange: (index: number) => void;
    children: React.ReactNode;
}

const WheelPicker: React.FC<WheelPickerProps> = ({ onActiveIndexChange, children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeIndexRef = useRef(0);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;

        window.requestAnimationFrame(() => {
            const center = container.scrollLeft + container.clientWidth / 2;
            let closestIndex = 0;
            let minDistance = Infinity;

            const childrenElements = container.children;
            // Skip first and last spacers
            for (let i = 1; i < childrenElements.length - 1; i++) {
                const child = childrenElements[i] as HTMLElement;
                const childCenter = child.offsetLeft + child.clientWidth / 2;
                const distance = Math.abs(center - childCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i - 1;
                }
            }

            if (closestIndex !== activeIndexRef.current) {
                activeIndexRef.current = closestIndex;
                onActiveIndexChange(closestIndex);
            }
        });
    }, [onActiveIndexChange]);

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="w-full flex overflow-x-auto no-scrollbar snap-x snap-mandatory relative z-10 scroll-smooth will-change-scroll"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* Left Spacer */}
            <div className="flex-none w-[50%]" />

            {children}

            {/* Right Spacer */}
            <div className="flex-none w-[50%]" />
        </div>
    );
};

export default WheelPicker;
