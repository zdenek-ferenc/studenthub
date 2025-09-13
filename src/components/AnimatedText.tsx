"use client";

import React from 'react';

type AnimatedTextProps = {
  text: string;
  className?: string;
};

const AnimatedText = ({ text, className }: AnimatedTextProps) => {
  return (
    <span className={`animate-character-reveal ${className || ''}`}>
      {text.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          style={{ '--char-index': index } as React.CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default AnimatedText;