/**
 * Computes a matrix's row reduced echelon form over a prime field or all real numbers
 * Algorithm from: https://jeremykun.com/2011/12/30/row-reduction-over-a-field/
 * @param matrix A matrix
 * @param primeField The primefield (undefined or 2)
 */
export const rref = (matrix: number[][], primeField?: number): void => {
    if (primeField && primeField !== 2)
        throw new Error("Not implemented for prime field !== 2");

    const rows = matrix.length;
    const cols = matrix[0].length;

    let i = 0;
    let j = 0;

    while (true) {
        if (i >= rows || j >= cols) {
            break;
        }

        if (matrix[i][j] === 0) {
            let nonzeroRow = i;
            while (nonzeroRow < rows && matrix[nonzeroRow][j] === 0) {
                nonzeroRow += 1;
            }

            if (nonzeroRow === rows) {
                j++;
                continue;
            }

            [matrix[i], matrix[nonzeroRow]] = [matrix[nonzeroRow], matrix[i]];
        }

        const pivot = matrix[i][j];
        const divideRow = (x: number) => {
            if (primeField) {
                return (x * pivot) % primeField;
            } else {
                return x / pivot;
            }
        };
        matrix[i] = matrix[i].map(divideRow);

        for (let otherRow = 0; otherRow < rows; otherRow++) {
            if (otherRow === i) {
                continue;
            }

            if (matrix[otherRow][j] !== 0) {
                const newRow = [];
                for (let k = 0; k < cols; k++) {
                    if (primeField) {
                        newRow[k] =
                            (matrix[otherRow][k] +
                                matrix[otherRow][j] * matrix[i][k]) %
                            2;
                    } else {
                        newRow[k] =
                            matrix[otherRow][k] -
                            matrix[otherRow][j] * matrix[i][k];
                    }
                }
                matrix[otherRow] = newRow;
            }
        }
        i++;
        j++;
    }
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
    rref(cloned);

    const cols: number[][] = [];
    for (let col = 0; col < cloned[0].length; col++) {
        const nums = [];
        let nonzero = 0;
        for (let row = 0; row < cloned.length; row++) {
            nums.push(matrix[row][col]);
            if (cloned[row][col] !== 0) nonzero++;
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
