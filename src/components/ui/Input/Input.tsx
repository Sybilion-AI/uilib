import cn from 'classnames';
import * as React from 'react';

import S from './Input.styl';
import type { InputProps } from './Input.types';

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      className,
      type,
      size = 'md',
      variant = 'default',
      round = false,
      ...props
    },
    ref,
  ) => {
    if (type === 'textarea') {
      return (
        <textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          className={cn(
            S.root,
            S[`size-${size}`],
            S[`variant-${variant}`],
            round && S.round,
            className,
          )}
          {...(props as React.ComponentProps<'textarea'>)}
        />
      );
    }
    return (
      <input
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        className={cn(
          S.root,
          S[`size-${size}`],
          S[`variant-${variant}`],
          round && S.round,
          className,
        )}
        type={type}
        {...(props as React.ComponentProps<'input'>)}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
