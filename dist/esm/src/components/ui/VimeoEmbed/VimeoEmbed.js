import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useState, useEffect, useCallback } from 'react';
import Player from '@vimeo/player';
import S from './VimeoEmbed.styl.js';

function parseVimeoUrl(idOrUrl) {
    // vimeo.com/12345678/abcdef12 (unlisted)
    const unlistedMatch = idOrUrl.match(/vimeo\.com\/(\d+)\/([a-f0-9]+)/i);
    if (unlistedMatch) {
        return { id: unlistedMatch[1], hash: unlistedMatch[2] };
    }
    // vimeo.com/12345678 or player.vimeo.com/video/12345678
    const idMatch = idOrUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return { id: idMatch ? idMatch[1] : idOrUrl };
}
function VimeoEmbed({ videoId, videoHash, gifMode = false, playButtonColor, className, ...props }) {
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const playerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const parsed = parseVimeoUrl(videoId);
    const id = parsed.id;
    const hash = videoHash ?? parsed.hash;
    const hashParam = hash ? `&h=${hash}` : '';
    const baseParams = 'title=0&byline=0&portrait=0&badge=0&dnt=1&playsinline=1';
    const gifParams = gifMode
        ? 'loop=1&muted=1&controls=0&transparent=1'
        : 'controls=1&transparent=1&autoplay=0&muted=0';
    const embedUrl = `https://player.vimeo.com/video/${id}?${baseParams}&${gifParams}${hashParam}`;
    // Cleanup player when id/hash changes
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current
                .destroy()
                .catch(() => {
                // Ignore destroy errors
            })
                .finally(() => {
                playerRef.current = null;
                setIsPlayerReady(false);
                setIsPlaying(false);
            });
        }
    }, [id, hash]);
    // Initialize Player SDK when iframe loads
    const handleIframeLoad = useCallback(() => {
        if (!iframeRef.current)
            return;
        // Clean up existing player if any
        if (playerRef.current) {
            playerRef.current
                .destroy()
                .catch(() => {
                // Ignore destroy errors
            })
                .finally(() => {
                playerRef.current = null;
            });
        }
        try {
            const player = new Player(iframeRef.current);
            playerRef.current = player;
            // Wait for player to be ready before setting up events
            player
                .ready()
                .then(() => {
                setIsPlayerReady(true);
                // Listen to SDK events
                player.on('play', () => setIsPlaying(true));
                player.on('pause', () => setIsPlaying(false));
                player.on('ended', () => setIsPlaying(false));
            })
                .catch(() => {
                // Ignore ready errors
            });
        }
        catch (error) {
            // Ignore initialization errors
        }
    }, []);
    const play = useCallback(async () => {
        if (!isPlayerReady || !playerRef.current)
            return;
        try {
            await playerRef.current.play();
        }
        catch {
            // Ignore play errors (e.g., if player not ready)
        }
    }, [isPlayerReady]);
    const pause = useCallback(async () => {
        if (!isPlayerReady || !playerRef.current)
            return;
        try {
            await playerRef.current.pause();
        }
        catch {
            // Ignore pause errors
        }
    }, [isPlayerReady]);
    // Viewport-triggered playback: play when visible, pause when not
    useEffect(() => {
        if (!containerRef.current)
            return;
        const container = containerRef.current;
        let playTimeout = null;
        const observer = new IntersectionObserver(entries => {
            const [entry] = entries;
            if (!entry)
                return;
            if (entry.isIntersecting) {
                playTimeout = setTimeout(play, 150);
            }
            else {
                if (playTimeout) {
                    clearTimeout(playTimeout);
                    playTimeout = null;
                }
                pause();
            }
        }, {
            rootMargin: '10% 0px 10% 0px',
            threshold: 0.25,
        });
        observer.observe(container);
        return () => {
            if (playTimeout)
                clearTimeout(playTimeout);
            observer.disconnect();
        };
    }, [play, pause]);
    return (jsxs("div", { ref: containerRef, className: cn(S.root, className, isPlaying && S.isPlaying), ...props, children: [jsx("iframe", { ref: iframeRef, src: embedUrl, className: S.iframe, allow: "autoplay; fullscreen; picture-in-picture; encrypted-media", allowFullScreen: true, title: "Vimeo video player", onLoad: handleIframeLoad }), !gifMode && (jsx("button", { type: "button", className: S.playButton, onClick: play, "aria-label": "Play video", children: jsx("svg", { className: S.playIcon, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: jsx("path", { d: "M8 5v14l11-7z", fill: "currentColor" }) }) }))] }));
}

export { VimeoEmbed };
