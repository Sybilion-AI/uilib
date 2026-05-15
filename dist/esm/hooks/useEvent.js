import { useRef, useState, useEffect } from 'react';

function useEvent({ elem, event, callback, isActive = true, isCapture = false, }) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    const [elemKey, setElemKey] = useState(0);
    const prevElemRef = useRef(null);
    useEffect(() => {
        const currentElem = Array.isArray(elem)
            ? elem.find(ref => ref?.current)?.current || null
            : elem?.current || null;
        if (currentElem !== prevElemRef.current) {
            prevElemRef.current = currentElem;
            if (currentElem) {
                setElemKey(prev => prev + 1);
            }
        }
    });
    useEffect(() => {
        if (!isActive)
            return;
        const handler = (e) => callbackRef.current(e);
        const events = Array.isArray(event) ? event : [event];
        const targets = elem
            ? Array.isArray(elem)
                ? elem
                    .map(ref => ref?.current)
                    .filter((x) => Boolean(x))
                : elem.current
                    ? [elem.current]
                    : []
            : [document];
        targets.forEach(target => {
            events.forEach(eventName => {
                target.addEventListener(eventName, handler, {
                    capture: isCapture,
                });
            });
        });
        return () => {
            targets.forEach(target => {
                events.forEach(eventName => {
                    target.removeEventListener(eventName, handler);
                });
            });
        };
    }, [elem, event, isActive, elemKey]);
}

export { useEvent as default };
