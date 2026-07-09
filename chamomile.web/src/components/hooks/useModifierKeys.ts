import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ModifierKeysState = {
    shiftHeld: boolean;
    ctrlHeld: boolean;
    altHeld: boolean;
};

const ModifierKeysContext = createContext<ModifierKeysState>({
    shiftHeld: false,
    ctrlHeld: false,
    altHeld: false,
});

export function ModifierKeysProvider(props: { children: ReactNode }) {
    const [modifiers, setModifiers] = useState<ModifierKeysState>({
        shiftHeld: false,
        ctrlHeld: false,
        altHeld: false,
    });

    useEffect(() => {
        const updateModifiers = (event: KeyboardEvent) => {
            setModifiers({
                shiftHeld: event.shiftKey,
                ctrlHeld: event.ctrlKey,
                altHeld: event.altKey
            });
        };

        const resetModifiers = () => {
            setModifiers({ shiftHeld: false, ctrlHeld: false, altHeld: false });
        };

        window.addEventListener("keydown", updateModifiers);
        window.addEventListener("keyup", updateModifiers);
        window.addEventListener("blur", resetModifiers);

        return () => {
            window.removeEventListener("keydown", updateModifiers);
            window.removeEventListener("keyup", updateModifiers);
            window.removeEventListener("blur", resetModifiers);
        };
    }, []);

    const value = useMemo(() => modifiers, [modifiers.shiftHeld, modifiers.ctrlHeld]);

    return createElement(ModifierKeysContext.Provider, { value }, props.children);
}

export default function useModifierKeys() {
    return useContext(ModifierKeysContext);
}
