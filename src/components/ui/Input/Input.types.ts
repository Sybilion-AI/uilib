export type InputProps =
  | (Omit<React.ComponentProps<'input'>, 'size'> & {
      type?: React.ComponentProps<'input'>['type'];
      size?: 'sm' | 'md' | 'lg';
      variant?: 'default' | 'clean';
      /** Fully rounded (pill) corners: `border-radius: 100px`. */
      round?: boolean;
    })
  | (Omit<React.ComponentProps<'textarea'>, 'type' | 'size'> & {
      type: 'textarea';
      size?: 'sm' | 'md' | 'lg';
      variant?: 'default' | 'clean';
      /** Fully rounded (pill) corners: `border-radius: 100px`. */
      round?: boolean;
    });
