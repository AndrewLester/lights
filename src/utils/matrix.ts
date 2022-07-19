/*
 * Gauss-Jordan elimination over any field (Java)
 *
 * Copyright (c) 2018 Project Nayuki
 * All rights reserved. Contact Nayuki for licensing.
 * https://www.nayuki.io/page/gauss-jordan-elimination-over-any-field
 */

/**
 * Translated to TS
 */

abstract class Field<T> {
    /*-- Constant values --*/

    /**
     * Returns the additive identity constant of this field.
     * @return the additive identity constant of this field
     */
    public abstract zero(): T;

    /**
     * Returns the multiplicative identity constant of this field.
     * @return the multiplicative identity constant of this field
     */
    public abstract one(): T;

    /*-- Comparison --*/

    /**
     * Tests whether the two specified elements are equal.
     * Note that the elements are not required to implement their own {@code equals()} correctly.
     * This means {@code x.equals(y)} is allowed to mismatch {@code f.equals(x, y)}.
     * @param x an element to test for equality
     * @param y an element to test for equality
     * @return {@code true} if the two specified elements are equal, {@code false} otherwise
     */
    public abstract equals(x: T, y: T): boolean;

    /*-- Addition/subtraction --*/

    /**
     * Returns the additive inverse of the specified element.
     * @param x the element whose additive inverse to compute
     * @return the additive inverse of the specified element
     * @throws NullPointerException if the argument is {@code null}
     */
    public abstract negate(x: T): T;

    /**
     * Returns the sum of the two specified elements.
     * @param x an addend
     * @param y an addend
     * @return the result of {@code x} plus {@code y}
     * @throws NullPointerException if any argument is {@code null}
     */
    public abstract add(x: T, y: T): T;

    public subtract(x: T, y: T): T {
        return this.add(x, this.negate(y));
    }

    /*-- Multiplication/division --*/

    /**
     * Returns the multiplicative inverse of the specified non-zero element.
     * @param x the element whose multiplicative inverse to compute
     * @return the multiplicative inverse of the specified element
     * @throws ArithmeticException if {@code x} equals {@code zero()}
     * @throws NullPointerException if the argument is {@code null}
     */
    public abstract reciprocal(x: T): T;

    /**
     * Returns the product of the two specified elements.
     * @param x a multiplicand
     * @param y a multiplicand
     * @return the result of {@code x} times {@code y}
     * @throws NullPointerException if any argument is {@code null}
     */
    public abstract multiply(x: T, y: T): T;

    /**
     * Returns the quotient of the specified elements.
     * A correct default implementation is provided.
     * @param x the dividend
     * @param y the divisor (non-zero)
     * @return the result of {@code x} divided by {@code y}
     * @throws ArithmeticException if {@code y} equals {@code zero()}
     */
    public divide(x: T, y: T): T {
        return this.multiply(x, this.reciprocal(y));
    }
}

export class BinaryField extends Field<number> {
    /*---- Fields ----*/

    /**
     * The modulus of this field represented as a string of bits in natural order.
     * For example, the modulus <var>x</var>^5 + <var>x</var>^1 + <var>x</var>^0
     * is represented by the integer value 0b100011 (binary) or 35 (decimal).
     */
    public modulus: number;

    /*---- Constructor ----*/

    /**
     * Constructs a binary field with the specified modulus. The modulus must have
     * degree at least 1. Also the modulus must be irreducible (not factorable)
     * in Z<sub>2</sub>, but this critical property is not checked by the constructor.
     * @param mod the modulus polynomial
     * @throws NullPointerException if the modulus is {@code null}
     * @throws IllegalArgumentException if the modulus has degree less than 1
     */
    constructor(mod: number) {
        super();
        this.modulus = mod;
    }

    /*---- Methods ----*/

    public zero(): number {
        return 0;
    }

    public one(): number {
        return 1;
    }

    public equals(x: number, y: number): boolean {
        return this.check(x) === this.check(y);
    }

    public negate(x: number): number {
        return this.check(x);
    }

    public add(x: number, y: number): number {
        return this.check(x) ^ this.check(y);
    }

    public subtract(x: number, y: number): number {
        return this.add(x, y);
    }

    public multiply(x: number, y: number): number {
        this.check(x);
        this.check(y);
        let result = 0;
        for (let i = 0; i < y.toString(2).length; i++) {
            if (y & (1 << i)) result = result ^ x;
            x <<= 1;
            if (x & (1 << (this.modulus.toString(2).length - 1)))
                x = x ^ this.modulus;
        }
        return result;
    }

    public reciprocal(w: number): number {
        // Extended Euclidean GCD algorithm
        let x = this.modulus;
        let y = this.check(w);
        if (y === 0) throw new Error("Division by zero");
        let a = 0;
        let b = 1;
        while (Math.sign(y) !== 0) {
            let quotrem = this.divideAndRemainder(x, y);
            if (quotrem[0] === this.modulus) quotrem[0] = 0;
            const c = a ^ this.multiply(quotrem[0], b);
            x = y;
            y = quotrem[1];
            a = b;
            b = c;
        }
        if (x === 1) return a;
        // All non-zero values must have a reciprocal
        else throw new Error("Field modulus is not irreducible");
    }

    // Returns a new array containing the pair of values (x div y, x mod y).
    private divideAndRemainder(x: number, y: number): [number, number] {
        let quotient = 0;
        let topY = y.toString(2).length - 1;
        for (let i = x.toString(2).length - y.toString(2).length; i >= 0; i--) {
            if (x & (1 << (topY + i))) {
                x = x ^ (y << i);
                quotient = quotient | (1 << i);
            }
        }
        return [quotient, x];
    }

    // Checks if the given object is non-null and within the
    // range of valid values, and returns the value itself.
    private check(x: number): number {
        if (
            Math.sign(x) == -1 ||
            x.toString(2).length >= this.modulus.toString(2).length
        )
            throw new Error("Not an element of this field");
        return x;
    }
}

export default class Matrix<E> {
    values: E[][];
    private readonly f: Field<E>;

    constructor(rows: number, cols: number, f: Field<E>) {
        this.f = f;
        if (rows <= 0 || cols <= 0) throw new Error("Rows or columns invalid");
        this.values = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(this.f.zero());
            }

            this.values.push(row);
        }
    }

    public rowCount(): number {
        return this.values.length;
    }

    public columnCount(): number {
        return this.values[0].length;
    }

    public get(row: number, col: number): E {
        if (
            row < 0 ||
            row >= this.values.length ||
            col < 0 ||
            col >= this.values[row].length
        )
            throw new Error("Row or column index out of bounds");
        return this.values[row][col];
    }

    public set(row: number, col: number, val: E): void {
        if (
            row < 0 ||
            row >= this.values.length ||
            col < 0 ||
            col >= this.values[row].length
        )
            throw new Error("Row or column index out of bounds");
        this.values[row][col] = val;
    }

    public transpose(): Matrix<E> {
        const rows = this.rowCount();
        const cols = this.columnCount();
        const result = new Matrix(cols, rows, this.f);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result.values[j][i] = this.values[i][j];
            }
        }
        return result;
    }

    public swapRows(row0: number, row1: number): void {
        if (
            row0 < 0 ||
            row0 >= this.values.length ||
            row1 < 0 ||
            row1 >= this.values.length
        )
            throw new Error("Row index out of bounds");
        const temp = this.values[row0];
        this.values[row0] = this.values[row1];
        this.values[row1] = temp;
    }

    public multiplyRow(row: number, factor: E): void {
        if (row < 0 || row >= this.values.length)
            throw new Error("Row index out of bounds");
        for (let j = 0, cols = this.columnCount(); j < cols; j++)
            this.set(row, j, this.f.multiply(this.get(row, j), factor));
    }

    public addRows(srcRow: number, destRow: number, factor: E): void {
        if (
            srcRow < 0 ||
            srcRow >= this.values.length ||
            destRow < 0 ||
            destRow >= this.values.length
        )
            throw new Error("Row index out of bounds");
        for (let j = 0, cols = this.columnCount(); j < cols; j++)
            this.set(
                destRow,
                j,
                this.f.add(
                    this.get(destRow, j),
                    this.f.multiply(this.get(srcRow, j), factor)
                )
            );
    }

    public multiply(other: Matrix<E>): Matrix<E> {
        if (this.columnCount() !== other.rowCount())
            throw new Error("Incompatible matrix sizes for multiplication");

        const rows = this.rowCount();
        const cols = other.columnCount();
        const cells = this.columnCount();
        const result = new Matrix(rows, cols, this.f);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let sum = this.f.zero();
                for (let k = 0; k < cells; k++)
                    sum = this.f.add(
                        this.f.multiply(this.get(i, k), other.get(k, j)),
                        sum
                    );
                result.set(i, j, sum);
            }
        }
        return result;
    }
    public invert(): void {
        const rows = this.rowCount();
        const cols = this.columnCount();
        if (rows != cols) throw new Error("Matrix dimensions are not square");

        // Build augmented matrix: [this | identity]
        const temp = new Matrix<E>(rows, cols * 2, this.f);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                temp.set(i, j, this.get(i, j));
                temp.set(i, j + cols, i == j ? this.f.one() : this.f.zero());
            }
        }

        // Do the main calculation
        temp.reducedRowEchelonForm();

        // Check that the left half is the identity matrix
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (
                    !this.f.equals(
                        temp.get(i, j),
                        i == j ? this.f.one() : this.f.zero()
                    )
                )
                    throw new Error("Matrix is not invertible");
            }
        }

        // Extract inverse matrix from: [identity | inverse]
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++)
                this.set(i, j, temp.get(i, j + cols));
        }
    }

    public static identity<E>(size: number, field: Field<E>): Matrix<E> {
        const matrix = new Matrix<E>(size, size, field);
        for (let i = 0; i < size; i++) {
            matrix.set(i, i, field.one());
        }
        return matrix;
    }

    public reducedRowEchelonForm(): void {
        const rows = this.rowCount();
        const cols = this.columnCount();

        let operations = Matrix.identity(rows, this.f);

        // Compute row echelon form (REF)
        let numPivots = 0;
        for (let j = 0; j < cols && numPivots < rows; j++) {
            // For each column
            // Find a pivot row for this column
            let pivotRow = numPivots;
            while (
                pivotRow < rows &&
                this.f.equals(this.get(pivotRow, j), this.f.zero())
            )
                pivotRow++;
            if (pivotRow == rows) continue; // Cannot eliminate on this column
            this.swapRows(numPivots, pivotRow);
            // const elem = Matrix.identity(rows, this.f);
            // elem.swapRows(numPivots, pivotRow);
            // operations = elem.multiply(operations);

            pivotRow = numPivots;
            numPivots++;

            // Simplify the pivot row
            this.multiplyRow(
                pivotRow,
                this.f.reciprocal(this.get(pivotRow, j))
            );
            // const elem2 = Matrix.identity(rows, this.f);
            // elem2.multiplyRow(
            //     pivotRow,
            //     this.f.reciprocal(this.get(pivotRow, j))
            // );
            // operations = elem.multiply(operations);

            // Eliminate rows below
            for (let i = pivotRow + 1; i < rows; i++) {
                this.addRows(pivotRow, i, this.f.negate(this.get(i, j)));
                // const elem3 = Matrix.identity(rows, this.f);
                // elem3.set(i, pivotRow, this.get(i, j));
                // operations = elem.multiply(operations);
            }
        }

        // Compute reduced row echelon form (RREF)
        for (let i = numPivots - 1; i >= 0; i--) {
            // Find pivot
            let pivotCol = 0;
            while (
                pivotCol < cols &&
                this.f.equals(this.get(i, pivotCol), this.f.zero())
            )
                pivotCol++;
            if (pivotCol == cols) continue; // Skip this all-zero row

            // Eliminate rows above
            for (let j = i - 1; j >= 0; j--) {
                this.addRows(i, j, this.f.negate(this.get(j, pivotCol)));
                // const elem = Matrix.identity(rows, this.f);
                // elem.set(j, i, this.get(j, pivotCol));
                // operations = elem.multiply(operations);
            }
        }

        // console.log("before pps", JSON.parse(JSON.stringify(operations)));

        // return operations;
    }
}
