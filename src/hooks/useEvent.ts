import { RefObject, useEffect, useRef, useState } from 'react';

type ElementType = RefObject<HTMLElement | null> | null;

export type UseEventParams = {
  elem?: ElementType[] | ElementType;
  event: string | string[];
  callback: (e: Event) => void;
  isActive?: boolean;
  isCapture?: boolean;
};

export default function useEvent({
  elem,
  event,
  callback,
  isActive = true,
  isCapture = false,
}: UseEventParams) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const [elemKey, setElemKey] = useState(0);
  const prevElemRef = useRef<HTMLElement | null>(null);

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
    if (!isActive) return;

    const handler = (e: Event) => callbackRef.current(e);
    const events = Array.isArray(event) ? event : [event];

    const targets: (Document | HTMLElement)[] = elem
      ? Array.isArray(elem)
        ? elem
            .map(ref => ref?.current)
            .filter((x): x is HTMLElement => Boolean(x))
        : elem.current
          ? [elem.current]
          : []
      : [document];

    targets.forEach(target => {
      events.forEach(eventName => {
        target.addEventListener(eventName, handler as EventListener, {
          capture: isCapture,
        });
      });
    });

    return () => {
      targets.forEach(target => {
        events.forEach(eventName => {
          target.removeEventListener(eventName, handler as EventListener);
        });
      });
    };
  }, [elem, event, isActive, elemKey]);
}
