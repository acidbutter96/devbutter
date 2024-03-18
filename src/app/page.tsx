import Image from "next/image";
import styles from "./page.module.scss";
import { Header } from "@/components/Header"
import { RollerContainer } from "@/components/RollerContainer";
import { DevButter } from "@/components/DevButter";

export default function Home() {
  return (
    <div className={styles.noOverflow}>
      <Header></Header>
      <RollerContainer>
        <DevButter/>
      </RollerContainer>
    </div>
  );
}
