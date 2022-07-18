import React, { useEffect, useState } from "react";
import LightSquare from "./components/LightSquare/LightSquare";
import { createGame, toggleLight } from "./model/game";
import styles from "./styles.module.css";

function App() {
    const [size, setSize] = useState(5);
    const [game, setGame] = useState(createGame(size, "random"));

    useEffect(() => {
        setGame(createGame(size, "random"));
    }, [size]);

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
