import Image from "next/image";
import styles from "./styles.module.scss";

const Footer = (): React.JSX.Element => {
    const year = new Date().getFullYear();
    return <footer className={styles.container}>
        <div className={styles.textRow}>
            Copyright &copy; {year}. DevButter All Rights Reserved. | Developed By <span>
                <Image src={"/static/images/icons/devbutter.svg"} height={0} width={0} alt={"devbutter"}/>
            </span>
        </div>
    </footer>
}

export default Footer;