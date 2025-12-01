import { useRef } from "react";

export function useThrottle(callback: (() => void) | undefined, delay: number) {
    const lastCall = useRef(0);

    return () => {
        const now = Date.now();
        if (now - lastCall.current >= delay) {
            lastCall.current = now;
            callback?.();
        }
    };
}