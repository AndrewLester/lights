import { immerable, produce } from "immer";
import { col, rref, vecAdd, vecMul } from "../utils/alg";

const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    right: { x: 1, y: 0 },
    left: { x: -1, y: 0 },
    none: { x: 0, y: 0 },
};

type Light = boolean;
type ModeledLight = 0 | 1;

export type GenerationType = "random" | "solveable";

/**
 * Class storing game state and helper methods
 */
export class GameState {
    [immerable] = true;

    constructor(public size: number, public lights: Light[][]) {}

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
        return this.bestSolution !== undefined;
    }

    /**
     * Returns the best solution
     * form of number[]
     */
    get bestSolution(): number[] | null {
        return this.solutions[0];
    }

    /**
     * Solutions for the game
     */
    get solutions(): number[][] | [null] {
        const aMatrix = computeAMatrix(this.size);

        const eMatrix: number[][] = JSON.parse(JSON.stringify(aMatrix));
        const lightArray = this.lights.flat().map((val) => (val ? 1 : 0));

        for (let i = 0; i < aMatrix.length; i++) {
            eMatrix[i].push(lightArray[i]);
        }
        rref(eMatrix, 2);

        // Is this solveable?
        for (let row = 0; row < eMatrix.length; row++) {
            let sum = 0;
            for (let col = 0; col < eMatrix[0].length - 1; col++) {
                sum += eMatrix[row][col];
            }
            if (sum === 0 && eMatrix[row][eMatrix[0].length - 1]) {
                return [null];
            }
        }

        const solution: number[] = [];
        for (let i = 0; i < this.size * this.size; i++) {
            solution.push(eMatrix[i][this.size * this.size]);
        }

        return [solution];
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
        it("checks solutions", () => {
            const state = new GameState(5, []);
            state.solutions;
        });
    });
}

/**
 * Create a GameState object with a given light array size
 * @param size number light array size
 * @returns GameState the game state
 */
export const createGame = (size: number, generation: GenerationType) => {
    const random = generation === "random";
    const lights: boolean[][] = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (lights[i] === undefined) lights[i] = [];
            lights[i][j] = random && Math.random() > 0.5;
        }
    }

    if (generation === "solveable") {
        const colSpace = col(computeAMatrix(size));
        let solveable: number[] = [];
        for (const col of colSpace) {
            solveable = vecAdd(
                vecMul(col, Math.random() > 0.5 ? 1 : 0),
                solveable
            );
        }

        for (let i = 0; i < solveable.length; i++) {
            const row = Math.trunc(i / size);
            const col = i % size;
            lights[row][col] = !!(solveable[i] % 2);
        }
    }

    return new GameState(size, lights);
};

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;
    describe("createGame", () => {
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
        it("creates solveable array", () => {
            // https://web.archive.org/web/20100704161251/http://www.haar.clara.co.uk/Lights/solving.html
            const validBottomRows = [
                [true, false, false, false, true],
                [false, true, false, true, false],
                [true, true, true, false, false],
                [false, false, true, true, true],
                [true, false, true, true, false],
                [false, true, true, false, true],
                [true, true, false, true, true],
                [false, false, false, false, false],
            ];
            for (let i = 0; i < 100; i++) {
                const size = 5;
                let game = createGame(size, "solveable");
                for (let row = 1; row < size; row++) {
                    for (let i = 0; i < size; i++) {
                        if (game.lights[row - 1][i]) {
                            game = toggleLight(game, size * row + i);
                        }
                    }
                }
                expect(validBottomRows).toContainEqual(game.lights[4]);
            }
        });
    });
}

/**
 * Toggles a light at a given index
 * @param state GameState the game state
 * @param index number the light index to toggle
 * @param adjacent boolean whether to update adjacent lights
 * @returns GameState the new game state
 */
export const toggleLight = (
    state: GameState,
    index: number,
    adjacent: boolean = true
): GameState => {
    return produce(state, (draft) => {
        const row = Math.trunc(index / draft.size);
        const col = index % draft.size;

        const usedDirections = adjacent ? directions : { none: { x: 0, y: 0 } };

        for (const direction of Object.values(usedDirections)) {
            const newRow = row + direction.y;
            const newCol = col + direction.x;

            if (!draft.inBounds(newRow, newCol)) continue;

            draft.lights[newRow][newCol] = !draft.lights[newRow][newCol];
        }
    });
};

const computeActionMatrix = (
    size: number,
    row: number,
    col: number
): ModeledLight[][] => {
    const modeledLights: ModeledLight[][] = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (modeledLights[i] === undefined) modeledLights[i] = [];
            modeledLights[i][j] =
                Math.abs(i - row) + Math.abs(j - col) <= 1 ? 1 : 0;
        }
    }

    return modeledLights;
};

const computeAMatrix = (size: number): ModeledLight[][] => {
    const modeledLights: ModeledLight[][] = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            modeledLights[i * size + j] = computeActionMatrix(
                size,
                i,
                j
            ).flat();
        }
    }
    return modeledLights;
};

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;
    describe("computeAMatrix", () => {
        it("outputs size 3 a matrix", () => {
            expect(computeAMatrix(3)).toEqual([
                [1, 1, 0, 1, 0, 0, 0, 0, 0],
                [1, 1, 1, 0, 1, 0, 0, 0, 0],
                [0, 1, 1, 0, 0, 1, 0, 0, 0],
                [1, 0, 0, 1, 1, 0, 1, 0, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 0, 1, 0, 1, 1, 0, 0, 1],
                [0, 0, 0, 1, 0, 0, 1, 1, 0],
                [0, 0, 0, 0, 1, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 1, 0, 1, 1],
            ]);
        });
    });
}
