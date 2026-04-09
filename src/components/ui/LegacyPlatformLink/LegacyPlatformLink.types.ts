import { type ComponentProps } from 'react';

export interface LegacyPlatformLinkProps extends ComponentProps<'a'> {
  redirectPath: string;
}
