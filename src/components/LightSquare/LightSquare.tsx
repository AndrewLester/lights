import { FC } from "react";
import styles from "./styles.module.css";

type LightSquareProps = {
    light: boolean;
    solution: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const LightSquare: FC<LightSquareProps> = ({
    light,
    solution,
    ...buttonProps
}) => {
    return (
        <button
            role="checkbox"
            aria-checked={light}
            className={`${styles.lightSquare} ${styles[light ? "on" : "off"]} ${
                solution ? styles["solution"] : ""
            }`}
            {...buttonProps}
        ></button>
    );
};

export default LightSquare;
