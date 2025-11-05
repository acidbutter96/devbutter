import { ChangeEvent, InputHTMLAttributes } from "react";
import styles from "./styles.module.scss"

interface InputInterface {
    about?: string | "" | undefined;
    alt?: string | "" | undefined;
    name?: string | "" | undefined;
    placeholder?: string | "";
    type: "text" | "textarea" | "email" | "password" | "number";
    onChange?: (event: ChangeEvent) => void;
    onClick?: (event: any) => void;
}

const Input = (
    {
        about="",
        alt="",
        name="",
        type="text",
        placeholder="",
        onChange,
        onClick,
    }:InputInterface): React.JSX.Element => {
    // textarea will have a fixed height defined in CSS; we no longer auto-resize via JS

    return <div className={styles.container}>
        {type === "textarea" ? (
            <textarea
                name={name}
                placeholder={placeholder}
                about={about}
                onChange={(event) => {
                    if (onChange) {
                        onChange(event);
                    }
                }}
                onClick={(event) => {
                    if (onClick) {
                        onClick(event);
                    }
                }}
            />
        ) : (
            <input
                type={type}
                name={name}
                about={about}
                alt={alt}
                placeholder={placeholder}
                onChange={(event) => {
                    if (onChange) {
                        onChange(event);
                    }
                }}
                onClick={(event) => {
                    if (onClick) {
                        onClick(event);
                    }
                }}
            />
        )}
    </div>
}

export default Input;