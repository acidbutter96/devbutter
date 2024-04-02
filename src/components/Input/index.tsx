import { ChangeEvent, InputHTMLAttributes } from "react";
import styles from "./styles.module.scss"

interface InputInterface {
    about?: string | "" | undefined;
    alt?: string | "" | undefined;
    name?: string | "" | undefined;
    type: "text" | "textarea";
    onChange?: (event: ChangeEvent) => void;
    onClick?: (event: any) => void;
}

const Input = (
    {
        about="",
        alt="",
        name="",
        type="text",
        onChange,
        onClick,
    }:InputInterface): React.JSX.Element => {
    return <div className={styles.container}>
        <input type={type} name={name} about={""} alt={""}
            onChange={(event)=>{
                if(onChange){
                    onChange(event);
                }
            }}
            onClick={(event)=>{
                if(onClick){
                    onClick(event);
                }
            }}
        />
    </div>
}

export default Input;