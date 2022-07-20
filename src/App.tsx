import React, { useEffect, useState } from "react";
import LightSquare from "./components/LightSquare/LightSquare";
import { createGame, GenerationType, toggleLight } from "./model/game";
import styles from "./styles.module.css";
import { useMediaQuery } from "./utils/mediaQuery";

function App() {
    const [size, setSize] = useState(5);
    const [generationType, setGenerationType] =
        useState<GenerationType>("solveable");
    const [creating, setCreating] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [game, setGame] = useState(createGame(size, generationType));

    const asideHide = useMediaQuery("(max-width: 800px)");

    useEffect(() => {
        const game = createGame(size, generationType);
        setGame(game);
    }, [size, generationType]);

    const lightClicked = (index: number) => {
        const newState = toggleLight(game, index, !creating);
        setGame(newState);

        if (newState.off && !creating && generationType !== "off") {
            setTimeout(() => alert("You did it!"), 500);
        }
    };

    const generate = () => {
        const game = createGame(size, generationType);
        setGame(game);
    };

    const handleShowSolution = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!game.bestSolution && e.target.checked) {
            alert("Can't be solved!");
        }
        setShowSolution(e.target.checked);
    };

    return (
        <main className={styles.main}>
            <h1>Lights Out</h1>
            <aside className={styles.settings}>
                <details open={!asideHide}>
                    <summary className={styles.summary}>
                        Settings{" "}
                        {game.off && generationType !== "off" && (
                            <button onClick={generate}>Restart</button>
                        )}
                    </summary>
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
                    <label htmlFor="size">Size</label>
                    <select
                        id="generation-type"
                        value={generationType}
                        onChange={(e) =>
                            setGenerationType(e.target.value as GenerationType)
                        }
                    >
                        <option value="solveable">Solveable</option>
                        <option value="random">Random</option>
                        <option value="off">Off</option>
                    </select>
                    <label htmlFor="generation-type">Generation</label>
                    <input
                        type="checkbox"
                        checked={creating}
                        id="creating"
                        onChange={(e) => setCreating(e.target.checked)}
                    />
                    <label htmlFor="creating">Setup</label>
                    <input
                        type="checkbox"
                        checked={showSolution}
                        id="show-solution"
                        onChange={handleShowSolution}
                    />
                    <label htmlFor="show-solution">Show Solution</label>
                </details>
            </aside>
            <div
                className={styles.grid}
                style={{ "--size": game.lights.length } as React.CSSProperties}
            >
                {game.lights.flat().map((light, i) => (
                    <LightSquare
                        light={light}
                        solution={
                            showSolution && game.bestSolution
                                ? !!game.bestSolution[i]
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
