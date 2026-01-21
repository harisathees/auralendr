import React, { useRef, useCallback } from 'react';

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

    // Inertial Scroll Logic for Wheel
    const targetScrollPos = useRef(0);
    const isAnimatingWheel = useRef(false);
    const animationFrameId = useRef<number>(0);

    const animateWheel = useCallback(() => {
        if (!scrollRef.current) return;

        const current = scrollRef.current.scrollLeft;
        const target = targetScrollPos.current;
        const diff = target - current;

        // Stop if close enough
        if (Math.abs(diff) < 1) {
            scrollRef.current.scrollLeft = target;
            isAnimatingWheel.current = false;
            return;
        }

        // Linear Interpolation (Lerp) for smoothness
        const ease = 0.15;
        scrollRef.current.scrollLeft = current + diff * ease;
        animationFrameId.current = requestAnimationFrame(animateWheel);
    }, []);

    // Drag Scroll Logic
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Stop any ongoing inertial scroll when user grabs the picker
        if (isAnimatingWheel.current) {
            isAnimatingWheel.current = false;
            cancelAnimationFrame(animationFrameId.current);
        }

        isDragging.current = true;
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grabbing';
            startX.current = e.pageX - scrollRef.current.offsetLeft;
            scrollLeft.current = scrollRef.current.scrollLeft;
        }
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // scroll-fast
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    // Native Wheel Listener with Intertia
    React.useEffect(() => {
        const currentRef = scrollRef.current;
        if (!currentRef) return;

        const onWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                e.preventDefault();

                // If not currently animating, start from current position
                if (!isAnimatingWheel.current) {
                    targetScrollPos.current = currentRef.scrollLeft;
                    isAnimatingWheel.current = true;
                    // Start the loop
                    animationFrameId.current = requestAnimationFrame(animateWheel);
                }

                // Accumulate delta to target
                targetScrollPos.current += e.deltaY;

                // Clamp target to bounds to prevent infinite scrolling past edges
                const maxScroll = currentRef.scrollWidth - currentRef.clientWidth;
                targetScrollPos.current = Math.max(0, Math.min(targetScrollPos.current, maxScroll));
            }
        };

        currentRef.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            currentRef.removeEventListener('wheel', onWheel);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [animateWheel]);

    return (
        <div
            ref={scrollRef}
            // onScroll handles the snapping logic
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            // Remove React onWheel to avoid conflict/double handling if we use native
            className="w-full flex overflow-x-auto no-scrollbar snap-x snap-proximity relative z-10 will-change-scroll cursor-grab active:cursor-grabbing"
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
