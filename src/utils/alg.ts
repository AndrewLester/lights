import { identity, lusolve, matrix } from "mathjs";
import Matrix, { BinaryField } from "./matrix";

const gcd = (a: number, b: number): number => {
    while (b != 0) {
        [a, b] = [b, a % b];
    }
    return a;
};

/**
 * Returns the column space of a matrix. Form: an array of columns
 * [
 *     ...col...,
 *     ...col...
 * ]
 * @param matrix The matrix
 * @returns number[][] The column space
 */
export const col = (matrix: number[][]): number[][] => {
    const cloned = JSON.parse(JSON.stringify(matrix));
    const clone = new Matrix(
        cloned.length,
        cloned[0].length,
        new BinaryField(2)
    );
    for (let i = 0; i < cloned.length; i++) {
        for (let j = 0; j < cloned[0].length; j++) {
            clone.set(i, j, cloned[i][j]);
        }
    }
    clone.reducedRowEchelonForm();
    const reduced = clone.values;

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

/**
 * Returns the null space of the matrix. Form: an array of basis vectors
 * [
 *     ...vect...
 *     ...vect...
 * ]
 * @param mat The matrix
 * @returns number[][] The null space
 */
export const nul = (mat: number[][]): number[][] => {
    const solutions = lusolve(matrix(mat), new Array(mat.length).fill(0));
    return [];
};

export const dot = (vec1: number[], vec2: number[]) => {
    if (vec1.length !== vec2.length)
        throw new Error("Vectors with different lengths can't be dotted.");

    return vec1.reduce((sum, cur, i) => cur * vec2[i] + sum, 0);
};

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
