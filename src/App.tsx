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
