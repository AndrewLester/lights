import React, { useEffect, useState } from "react";
import LightSquare from "./components/LightSquare/LightSquare";
import { createGame, GenerationType, toggleLight } from "./model/game";
import styles from "./styles.module.css";

function App() {
    const [size, setSize] = useState(5);
    const [generationType, setGenerationType] =
        useState<GenerationType>("solveable");
    const [game, setGame] = useState(createGame(size, generationType));

    useEffect(() => {
        setGame(createGame(size, generationType));
    }, [size, generationType]);

    const lightClicked = (index: number) => {
        setGame(toggleLight(game, index));
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
            <div
                className={styles.grid}
                style={{ "--size": game.lights.length } as React.CSSProperties}
            >
                {game.lights.flat().map((light, i) => (
                    <LightSquare
                        light={light}
                        key={i}
                        onClick={() => lightClicked(i)}
                    />
                ))}
            </div>
        </main>
    );
}

export default App;
