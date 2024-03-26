import styles from "./page.module.scss";
import { Header } from "@/components/Header"
import { RollerContainer } from "@/components/RollerContainer";
import { DevButter } from "@/components/DevButter";
import { redirect } from "next/navigation";
import { ContactUS } from "@/components/ContactUs";
import { Projects } from "@/components/Projects";

export default function Home() {
  // redirect('coming-soon');
  return (
    <>
      <Header />
      <main className={styles.mainContainer}>
        <RollerContainer haveMargin={true}>
          <DevButter />
          <Projects />
          <ContactUS />
        </RollerContainer>
      </main>
    </>
  );
}
