import { useEffect, useState } from "react";

export function useMediaQuery(queryString: string) {
    const [matches, setMatches] = useState(
        window.matchMedia(queryString).matches
    );

    useEffect(() => {
        const query = window.matchMedia(queryString);
        query.addEventListener("change", (ev) => setMatches(ev.matches));
    }, []);

    return matches;
}
