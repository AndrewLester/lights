import React, { useEffect, useState } from "react";
import LightSquare from "./components/LightSquare/LightSquare";
import {
    createGame,
    GameState,
    GenerationType,
    toggleLight,
} from "./model/game";
import styles from "./styles.module.css";
import { useMediaQuery } from "./utils/mediaQuery";

function App() {
    const [size, setSize] = useState(5);
    const [generationType, setGenerationType] =
        useState<GenerationType>("solveable");
    const [creating, setCreating] = useState(false);
    const [showSolution, setShowSolution] = useState<number>();
    const [sound, setSound] = useState(true);
    const [game, setGame] = useState<GameState>();

    const asideHide = useMediaQuery("(max-width: 800px)");

    useEffect(() => {
        const { searchParams } = new URL(location.href);
        if (searchParams.has("board")) {
            const boardString = searchParams.get("board")!;
            const game = GameState.fromString(boardString);
            if (game) {
                setGame(game);
                setSize(game.size);
                return;
            }
        }

        generate();
    }, [size, generationType]);

    const lightClicked = (index: number) => {
        const newState = toggleLight(game!, index, !creating);
        setGame(newState);

        const url = new URL(location.href);
        url.searchParams.delete("board");
        history.pushState({}, "", url);

        if (sound) {
            new Audio(
                `${import.meta.env.VITE_BASE_URL ?? ""}/switch.mp3`
            ).play();
        }

        if (newState.off && !creating) {
            setTimeout(() => alert("You did it!"), 500);
        }
    };

    const generate = () => {
        const game = createGame(size, generationType);
        setGame(game);
    };

    const handleShowSolution = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!game!.bestSolution && e.target.checked) {
            alert("Can't be solved!");
        }
        setShowSolution(e.target.checked ? 0 : undefined);
    };

    const share = async () => {
        const url = new URL(location.href);
        url.searchParams.set("board", game!.toString());
        await navigator.clipboard.writeText(url.toString());
        history.pushState({}, "", url);
        alert("URL copied to clipboard.");
    };

    return (
        <main className={styles.main}>
            <h1
                className={game?.off ? styles.solved : ""}
                onClick={() => game?.off && generate()}
            >
                Lights Out
            </h1>
            <aside className={styles.settings}>
                <details open={!asideHide} className={styles.details}>
                    <summary className={styles.summary}>Settings</summary>
                    {game?.off && <button onClick={generate}>Restart</button>}
                    <label htmlFor="sound">Sound</label>
                    <input
                        type="checkbox"
                        id="sound"
                        checked={sound}
                        onChange={(e) => setSound(e.target.checked)}
                    />
                    <label htmlFor="size">Size</label>
                    <select
                        id="size"
                        value={size.toString()}
                        onChange={(e) => setSize(+e.target.value)}
                    >
                        <option value="3">3x3</option>
                        <option value="4">4x4</option>
                        <option value="5">5x5</option>
                        <option value="6">6x6</option>
                        <option value="7">7x7</option>
                    </select>
                    <label htmlFor="generation-type">Generation</label>
                    <select
                        id="generation-type"
                        value={generationType}
                        onChange={(e) =>
                            setGenerationType(e.target.value as GenerationType)
                        }
                    >
                        <option value="solveable">Solveable</option>
                        <option value="random">Random</option>
                    </select>
                    <label htmlFor="creating">Setup</label>
                    <input
                        type="checkbox"
                        checked={creating}
                        id="creating"
                        onChange={(e) => setCreating(e.target.checked)}
                    />
                    <label htmlFor="show-solution">Show Solution</label>
                    <input
                        type="checkbox"
                        checked={showSolution !== undefined}
                        id="show-solution"
                        onChange={handleShowSolution}
                    />
                    {showSolution !== undefined &&
                        game?.bestSolution &&
                        (game?.solutions as number[][]).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setShowSolution(i)}
                                disabled={i === showSolution}
                            >
                                Solution {i}
                            </button>
                        ))}
                    <button onClick={share}>Share</button>
                    <a
                        href="https://github.com/AndrewLester/lights"
                        className={styles.github}
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                        >
                            <path
                                xmlns="http://www.w3.org/2000/svg"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M16 0C7.16 0 0 7.16 0 16C0 23.08 4.58 29.06 10.94 31.18C11.74 31.32 12.04 30.84 12.04 30.42C12.04 30.04 12.02 28.78 12.02 27.44C8 28.18 6.96 26.46 6.64 25.56C6.46 25.1 5.68 23.68 5 23.3C4.44 23 3.64 22.26 4.98 22.24C6.24 22.22 7.14 23.4 7.44 23.88C8.88 26.3 11.18 25.62 12.1 25.2C12.24 24.16 12.66 23.46 13.12 23.06C9.56 22.66 5.84 21.28 5.84 15.16C5.84 13.42 6.46 11.98 7.48 10.86C7.32 10.46 6.76 8.82 7.64 6.62C7.64 6.62 8.98 6.2 12.04 8.26C13.32 7.9 14.68 7.72 16.04 7.72C17.4 7.72 18.76 7.9 20.04 8.26C23.1 6.18 24.44 6.62 24.44 6.62C25.32 8.82 24.76 10.46 24.6 10.86C25.62 11.98 26.24 13.4 26.24 15.16C26.24 21.3 22.5 22.66 18.94 23.06C19.52 23.56 20.02 24.52 20.02 26.02C20.02 28.16 20 29.88 20 30.42C20 30.84 20.3 31.34 21.1 31.18C27.42 29.06 32 23.06 32 16C32 7.16 24.84 0 16 0V0Z"
                                fill="white"
                            />
                        </svg>
                    </a>
                </details>
            </aside>
            <div
                className={styles.grid}
                style={{ "--size": game?.lights.length } as React.CSSProperties}
            >
                {game?.lights.flat().map((light, i) => (
                    <LightSquare
                        light={light}
                        solution={
                            showSolution !== undefined && game.bestSolution
                                ? !!game.solutions[showSolution]![i]
                                : false
                        }
                        key={i}
                        onClick={() => lightClicked(i)}
                    />
                ))}
            </div>
        </main>
    );
}

export default App;
