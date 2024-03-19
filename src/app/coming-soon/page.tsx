import Image from "next/image";
import styles from "./page.module.scss";
import { Header } from "@/components/Header"
import { RollerContainer } from "@/components/RollerContainer";
import { ComingSoonComponent } from "@/components/ComingSoonComponent";

export default function ComingSoon() {
  return (
    <div className={styles.noOverflow}>
      <RollerContainer haveMargin={false}>
        <ComingSoonComponent/>
      </RollerContainer>
    </div>
  );
}
