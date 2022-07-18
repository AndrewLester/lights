import { immerable, produce } from "immer";
import { describe } from "vitest";

const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    right: { x: 1, y: 0 },
    left: { x: -1, y: 0 },
    none: { x: 0, y: 0 },
};

/**
 * Class storing game state and helper methods
 */
export class GameState {
    [immerable] = true;

    constructor(public size: number, public lights: boolean[][]) {}

    /**
     * Checks if a positon on the light array is in bounds
     * @param row number
     * @param col number
     * @returns boolean whether or not the positon is in bounds
     */
    inBounds(row: number, col: number): boolean {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    /**
     * Whether or not the game is solveable
     */
    get solveable(): boolean {
        return true;
    }

    /**
     * Whether or not all lights are off
     */
    get off(): boolean {
        return !this.lights.flat().some((val) => val);
    }
}

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;
    describe("GameState", () => {
        it("checks inBounds", () => {
            const state = new GameState(5, []);
            expect(state.inBounds(-1, 0)).toBe(false);
            expect(state.inBounds(0, -1)).toBe(false);
            expect(state.inBounds(5, 4)).toBe(false);
            expect(state.inBounds(4, 5)).toBe(false);
            expect(state.inBounds(2, 3)).toBe(true);
        });
        it("checks for off", () => {
            const state = new GameState(5, [[true, false]]);
            expect(state.off).toBe(false);

            state.lights[0][0] = false;
            expect(state.off).toBe(true);

            state.lights[0] = [true, true];
            expect(state.off).toBe(false);
        });
    });
}

/**
 * Create a GameState object with a given light array size
 * @param size number light array size
 * @returns GameState the game state
 */
export const createGame = (
    size: number,
    generation: "random" | "solveable" | "off" = "off"
) => {
    const random = generation === "random";
    const lights: boolean[][] = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (lights[i] === undefined) lights[i] = [];
            lights[i][j] = random && Math.random() > 0.5;
        }
    }

    if (generation === "solveable") {
        // Compute col(A) and pick out random vector. Turn vector into matrix representation
    }

    return new GameState(size, lights);
};

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;
    describe("createGame", () => {
        it("creates all off array", () => {
            const game = createGame(5);
            expect(game.lights.flat().every((val) => val)).toBe(false);
        });
        it("creates random array", () => {
            // Checks to see if a 5x5 game has some squares on. If it doesn't 20 times fail
            for (let i = 0; i < 20; i++) {
                const game = createGame(5, "random");
                if (game.lights.flat().some((val) => val)) {
                    expect(true).toBe(true);
                    return true;
                }
            }
            expect(true).toBe(false);
        });
    });
}

/**
 * Toggles a light at a given index
 * @param state GameState the game state
 * @param index number the light index to toggle
 * @returns GameState the new game state
 */
export const toggleLight = (state: GameState, index: number): GameState => {
    return produce(state, (draft) => {
        const row = Math.trunc(index / draft.size);
        const col = index % draft.size;

        for (const direction of Object.values(directions)) {
            const newRow = row + direction.y;
            const newCol = col + direction.x;

            if (!draft.inBounds(newRow, newCol)) continue;

            draft.lights[newRow][newCol] = !draft.lights[newRow][newCol];
        }
    });
};
