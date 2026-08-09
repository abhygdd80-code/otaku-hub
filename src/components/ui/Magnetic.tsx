import React, { useRef, useState } from 'react';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number; // 0 to 1, default 0.3
  className?: string;
}

const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.3,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapperRef.current || !innerRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
    const wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;

    const deltaX = e.clientX - wrapperCenterX;
    const deltaY = e.clientY - wrapperCenterY;

    // Normalize the distance to a value between -1 and 1 based on the wrapper size
    const normalizeX = (deltaX / (wrapperRect.width / 2)) * strength;
    const normalizeY = (deltaY / (wrapperRect.height / 2)) * strength;

    // Limit the offset to a maximum of 50px
    const maxOffset = 50;
    const offsetX = Math.max(-maxOffset, Math.min(maxOffset, normalizeX * 50));
    const offsetY = Math.max(-maxOffset, Math.min(maxOffset, normalizeY * 50));

    setOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} relative inline-block`}
    >
      <div
        ref={innerRef}
        className="transition-transform duration-200 ease-out"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        {children}
      </div>
    </div>
  );
};

export default Magnetic;
export { Magnetic };
