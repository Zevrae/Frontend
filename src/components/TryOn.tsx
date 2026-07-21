import React from 'react';
import SpecularButton from './specularbutton';
import './TryOn.css';

interface TryOnProps {
  onClick: () => void;
}

const TryOn: React.FC<TryOnProps> = ({ onClick }) => {
  return (
    <SpecularButton
      size="sm"
      radius={4}
      tint="#000000"
      tintOpacity={0}
      blur={0}
      textColor="#ffffffff"
      lineColor="#C8A96A"
      baseColor="#3a2e1a"
      intensity={1.4}
      shineSize={12}
      shineFade={38}
      thickness={1.2}
      speed={0.4}
      followMouse
      proximity={200}
      autoAnimate={false}
      onClick={onClick}
      className=" tryon-specular"
    >
      TRY IT ON →
    </SpecularButton>
  );
};

export default TryOn;
