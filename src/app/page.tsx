import styles from "./page.module.scss";
import { Header } from "@/components/Header"
import { RollerContainer } from "@/components/RollerContainer";
import { DevButter } from "@/components/DevButter";
import { redirect } from "next/navigation";

export default function Home() {
  redirect('coming-soon');
  return (
    <div className={styles.noOverflow}>
      <Header />
      <RollerContainer haveMargin={true}>
        <DevButter/>
      </RollerContainer>
    </div>
  );
}
