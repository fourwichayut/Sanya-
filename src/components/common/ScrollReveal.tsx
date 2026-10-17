import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay in ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number; // duration in ms
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 900
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // Re-triggers cleanly on both scroll up and scroll down
          setIsVisible(entry.isIntersecting);
        });
      },
      { 
        threshold: 0.08, 
        rootMargin: '0px 0px -20px 0px' 
      }
    );

    const current = domRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) opacity-100 scale-100';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 26px, 0) opacity-0 scale-[0.99]';
      case 'down':
        return 'translate3d(0, -26px, 0) opacity-0 scale-[0.99]';
      case 'left':
        return 'translate3d(26px, 0, 0) opacity-0';
      case 'right':
        return 'translate3d(-26px, 0, 0) opacity-0';
      default:
        return 'opacity-0 scale-[0.99]';
    }
  };

  return (
    <div
      ref={domRef}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
      className={`transition-all will-change-[transform,opacity] ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
};
