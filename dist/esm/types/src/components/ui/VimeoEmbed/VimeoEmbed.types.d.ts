import type { HTMLAttributes } from 'react';
export interface VimeoEmbedProps extends HTMLAttributes<HTMLDivElement> {
    videoId: string;
    /** Required for unlisted Vimeo videos (e.g. vimeo.com/12345678/abcdef12) */
    videoHash?: string;
    /** Autoplay, loop, muted, no controls – like a GIF */
    gifMode?: boolean;
    playButtonColor?: string;
}
