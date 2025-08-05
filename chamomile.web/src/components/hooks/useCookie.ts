import { useState, useEffect } from "react";

/**Thank you gepeto */
export function useCookie<T>(key: string, defaultValue: T) {
    const getCookie = () => {
        const match = document.cookie.match(
            new RegExp("(^| )" + key + "=([^;]+)")
        );
        if (match) {
            try {
                return JSON.parse(decodeURIComponent(match[2])) as T;
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    };

    const [value, setValue] = useState<T>(getCookie);

    useEffect(() => {
        try {
            const encoded = encodeURIComponent(JSON.stringify(value));
            document.cookie = `${key}=${encoded}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
        } catch {
            // Ignore write errors
        }
    }, [key, value]);

    return [value, setValue] as const;
}
