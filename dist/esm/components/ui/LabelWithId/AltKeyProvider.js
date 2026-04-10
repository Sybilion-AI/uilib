import { useEffect } from 'react';
import useEvent from '../../../hooks/useEvent.js';

function AltKeyProvider({ isDebug }) {
    useEvent({
        isActive: isDebug,
        event: ['keydown'],
        callback: (e) => {
            if (!(e instanceof KeyboardEvent) || e.key !== 'Alt')
                return;
            document.body.classList.toggle('alt');
        },
    });
    useEffect(() => {
        if (!isDebug) {
            document.body.classList.remove('alt');
        }
    }, [isDebug]);
    return null;
}

export { AltKeyProvider };
