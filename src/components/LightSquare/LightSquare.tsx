import { FC } from "react";
import styles from "./styles.module.css";

type LightSquareProps = {
    light: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const LightSquare: FC<LightSquareProps> = ({ light, ...buttonProps }) => {
    return (
        <button
            role="checkbox"
            aria-checked={light}
            className={`${styles.lightSquare} ${styles[light ? "on" : "off"]}`}
            {...buttonProps}
        ></button>
    );
};

export default LightSquare;
