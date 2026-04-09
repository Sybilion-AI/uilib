import cn from 'classnames';
import React, { type JSX, useMemo } from 'react';

import { motion } from 'motion/react';

import S from './TextShimmer.styl';
import { TextShimmerProps } from './TextShimmer.types';

function TextShimmerComponent({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
  inverted = false,
}: TextShimmerProps) {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements,
  );

  const { shimmerGradient, baseGradient } = useMemo(() => {
    const dynamicSpread = children.length * spread;
    const baseColor = inverted
      ? 'var(--base-gradient-color)'
      : 'var(--base-color)';
    const baseGradientColor = inverted
      ? 'var(--base-color)'
      : 'var(--base-gradient-color)';

    const shimmer = `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), ${baseGradientColor} calc(50% - ${dynamicSpread / 2}px), ${baseGradientColor} calc(50% + ${dynamicSpread / 2}px), transparent calc(50% + ${dynamicSpread}px))`;
    const base = `linear-gradient(to right, ${baseColor}, ${baseColor})`;
    return { shimmerGradient: shimmer, baseGradient: base };
  }, [children.length, spread, inverted]);

  return (
    <MotionComponent
      className={cn(S.root, className)}
      initial={{ backgroundPosition: '200% center, 0% center' }}
      animate={{ backgroundPosition: '-100% center, 0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          backgroundImage: `${shimmerGradient}, ${baseGradient}`,
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
