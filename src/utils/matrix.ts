import rref from "rref";

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
    const reduced = rref(matrix) as number[][];
    const cols: number[][] = [];
    for (let col = 0; col < reduced[0].length; col++) {
        const nums = [];
        let nonzero = 0;
        for (let row = 0; row < reduced.length; row++) {
            nums.push(matrix[row][col]);
            if (reduced[row][col] !== 0) nonzero++;
            if (nonzero > 1) break;
        }
        if (nonzero === 1) {
            cols.push(nums);
        }
    }
    return cols;
};

export const vecAdd = (vec1: number[], vec2: number[]) => {
    return vec1.map((val, i) => val + (vec2[i] ?? 0));
};

export const vecMul = (vec: number[], factor: number) => {
    return vec.map((val) => val * factor);
};
