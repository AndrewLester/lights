import rref from "rref";
import { describe, expect, it } from "vitest";

/**
 * Returns the column space of a matrix. Form: an array of columns
 * [
 *     ...col...
 *     ...col...
 * ]
 * @param matrix The matrix
 * @returns number[][] The column space
 */
export const col = (matrix: number[][]): number[][] => {
    const clone = JSON.parse(JSON.stringify(matrix));
    const reduced = rref(clone) as number[][];

    const cols: number[][] = [];
    for (let col = 0; col < reduced[0].length; col++) {
        const nums = [];
        let nonzero = 0;
        for (let row = 0; row < reduced.length; row++) {
            nums.push(matrix[row][col]);
            if (reduced[row][col] !== 0) nonzero++;
        }
        if (nonzero === 1) {
            cols.push(nums);
        }
    }
    return cols;
};

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;
    describe("col", () => {
        it("col space of identity", () => {
            expect(
                col([
                    [1, 0],
                    [0, 1],
                ])
            ).toEqual([
                [1, 0],
                [0, 1],
            ]);
        });
        it("col space of larger matrix", () => {
            expect(
                col([
                    [1, 2, 3],
                    [3, 2, 1],
                    [2, 1, 3],
                ])
            ).toEqual([
                [1, 3, 2],
                [2, 2, 1],
                [3, 1, 3],
            ]);
        });
    });
}

export const vecAdd = (vec1: number[], vec2: number[]) => {
    return vec1.map((val, i) => val + (vec2[i] ?? 0));
};

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;

    describe("vecAdd", () => {
        it("adds two vectors", () => {
            expect(vecAdd([1, 2, 3], [3, 2, 1])).toEqual([4, 4, 4]);
        });
    });
}

export const vecMul = (vec: number[], factor: number) => {
    return vec.map((val) => val * factor);
};

if (import.meta.vitest) {
    const { it, expect, describe } = import.meta.vitest;

    describe("vecMul", () => {
        it("multiplies a vector by a scalar", () => {
            expect(vecMul([1, 2, 3], 3)).toEqual([3, 6, 9]);
        });
    });
}
