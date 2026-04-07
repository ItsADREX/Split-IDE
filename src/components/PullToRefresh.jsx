import React, { memo, useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

const PullToRefresh = memo(({ onRefresh, children }) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef(null);

    const PULL_THRESHOLD = 80;
    const MAX_PULL = 120;

    const handleTouchStart = (e) => {
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    };

    const handleTouchMove = (e) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY.current);
        
        if (distance > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
            e.preventDefault();
            setPullDistance(Math.min(distance, MAX_PULL));
        }
    };

    const handleTouchEnd = () => {
        if (!isPulling || isRefreshing) return;

        if (pullDistance >= PULL_THRESHOLD) {
            setIsRefreshing(true);
            onRefresh().finally(() => {
                setIsRefreshing(false);
                setPullDistance(0);
                setIsPulling(false);
            });
        } else {
            setPullDistance(0);
            setIsPulling(false);
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPulling, pullDistance, isRefreshing]);

    const getIndicatorText = () => {
        if (isRefreshing) return 'Refreshing...';
        if (pullDistance >= PULL_THRESHOLD) return 'Release to refresh';
        if (pullDistance > 0) return 'Pull to refresh';
        return '';
    };

    const shouldShowIndicator = pullDistance > 0 || isRefreshing;

    return (
        <div ref={containerRef} className="h-full overflow-auto relative">
            {shouldShowIndicator && (
                <div 
                    className="pull-to-refresh"
                    style={{
                        transform: `translateX(-50%) translateY(${Math.min(pullDistance - 20, 40)}px)`,
                        opacity: Math.min(pullDistance / 40, 1)
                    }}
                >
                    <div className="flex items-center gap-2">
                        <RotateCcw 
                            size={16} 
                            className={isRefreshing ? 'animate-spin' : ''} 
                        />
                        <span>{getIndicatorText()}</span>
                    </div>
                </div>
            )}
            <div 
                style={{
                    transform: `translateY(${Math.min(pullDistance * 0.5, 60)}px)`,
                    transition: isPulling ? 'none' : 'transform 0.3s ease'
                }}
            >
                {children}
            </div>
        </div>
    );
});

PullToRefresh.displayName = 'PullToRefresh';

export default PullToRefresh;
