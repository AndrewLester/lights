import React, { useEffect, useState } from "react";
import LightSquare from "./components/LightSquare/LightSquare";
import { createGame, GenerationType, toggleLight } from "./model/game";
import styles from "./styles.module.css";

function App() {
    const [size, setSize] = useState(5);
    const [generationType, setGenerationType] =
        useState<GenerationType>("solveable");
    const [creating, setCreating] = useState(false);
    const [solution, setSolution] = useState<number[] | null>();
    const [game, setGame] = useState(createGame(size, generationType));

    useEffect(() => {
        const game = createGame(size, generationType);
        setGame(game);
    }, [size, generationType]);

    const lightClicked = (index: number) => {
        const newState = toggleLight(game, index, !creating);
        setGame(newState);
        setSolution(newState.bestSolution);

        if (newState.off && !creating && generationType !== "off") {
            setTimeout(() => alert("You did it!"), 500);
        }
    };

    const generate = () => {
        setGame(createGame(size, generationType));
        setSolution(undefined);
    };

    const solve = () => {
        const solution = game.bestSolution;
        if (!solution) {
            alert("Can't be solved");
        } else {
            setSolution(game.bestSolution);
        }
    };

    return (
        <main className={styles.main}>
            <input
                type="range"
                min="3"
                max="10"
                value={size}
                onChange={(e) => setSize(+e.target.value)}
            />
            <select
                value={generationType}
                onChange={(e) =>
                    setGenerationType(e.target.value as GenerationType)
                }
            >
                <option value="solveable">Solveable</option>
                <option value="random">Random</option>
                <option value="off">Off</option>
            </select>
            <input
                type="checkbox"
                checked={creating}
                onChange={(e) => setCreating(e.target.checked)}
            />
            <button onClick={generate}>Generate</button>
            <button onClick={solve}>Solve</button>
            <div
                className={styles.grid}
                style={{ "--size": game.lights.length } as React.CSSProperties}
            >
                {game.lights.flat().map((light, i) => (
                    <LightSquare
                        light={light}
                        solution={solution ? !!solution[i] : false}
                        key={i}
                        onClick={() => lightClicked(i)}
                    />
                ))}
            </div>
        </main>
    );
}

export default App;
