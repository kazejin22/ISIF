"use client";

import { useState, useRef, useEffect } from "react";

export default function DeepfakeAnatomy() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseDown = () => {
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = () => {
    window.addEventListener("touchmove", handleDrag, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  const handleTouchEnd = () => {
    window.removeEventListener("touchmove", handleDrag);
    window.removeEventListener("touchend", handleTouchEnd);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold mb-2">The Deepfake Anatomy</h3>
        <p className="text-foreground/70">Slide to reveal how an AI mask maps onto a real face.</p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden cursor-ew-resize bg-foreground/10 select-none group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background Image (Fake/AI) */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
          <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full font-bold text-sm text-primary border border-primary/20">
            Deepfake Output
          </div>
        </div>

        {/* Foreground Image (Real/Original) */}
        <div 
          className="absolute inset-0 bg-cover bg-center border-r-2 border-foreground shadow-[10px_0_20px_rgba(0,0,0,0.5)]" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop&grayscale=1')",
            width: `${sliderPosition}%` 
          }}
        >
          <div className="absolute inset-0 border-4 border-dashed border-primary/50" style={{ 
            clipPath: 'polygon(30% 20%, 70% 20%, 80% 50%, 70% 80%, 30% 80%, 20% 50%)',
            background: 'rgba(0, 243, 255, 0.1)'
          }}></div>
          
          <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full font-bold text-sm border border-foreground/20 whitespace-nowrap">
            Original Source (Wireframe Mapped)
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-foreground cursor-ew-resize flex items-center justify-center transition-transform hover:scale-x-150"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="w-8 h-8 bg-background border-2 border-foreground rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-foreground rounded-full" />
              <div className="w-1 h-3 bg-foreground rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-center text-foreground/50 max-w-2xl mx-auto italic">
        *Placeholder assets used. In production, this will demonstrate the facial landmark mapping process used by Generative Adversarial Networks (GANs).
      </div>
    </div>
  );
}
