import { useRef, useState } from 'react';
import './specularbutton.css';

interface SpecularButtonProps {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const SpecularButton = ({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = 'rgba(255, 255, 255, 0.15)',
  intensity = 1,
  followMouse = true,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}: SpecularButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50, active: false });

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!followMouse || disabled) return;
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y, active: true });
  };

  const handlePointerLeave = () => {
    setPos((prev) => ({ ...prev, active: false }));
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`specular-button specular-button--${size}${autoAnimate ? ' specular-button--auto' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--sb-radius': `${radius}px`,
        '--sb-tint': tint,
        '--sb-tint-opacity': tintOpacity,
        '--sb-blur': `${blur}px`,
        '--sb-text-color': textColor,
        '--sb-line-color': lineColor,
        '--sb-base-color': baseColor,
        '--sb-intensity': intensity,
        '--sb-mx': `${pos.x}%`,
        '--sb-my': `${pos.y}%`,
        '--sb-active': pos.active ? 1 : 0,
      } as React.CSSProperties}
    >
      <span className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </button>
  );
};

export default SpecularButton;
