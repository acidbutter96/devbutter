import styles from "./page.module.scss";
import { Header } from "@/components/Header"
import { RollerContainer } from "@/components/RollerContainer";
import { DevButter } from "@/containers/home/DevButter";
import { redirect } from "next/navigation";
import { ContactUS } from "@/containers/home/ContactUs";
import { Projects } from "@/containers/home/Projects";

export default function Home() {
  // redirect('coming-soon');
  return (
    <>
      <Header />
      <main className={styles.mainContainer}>
        <RollerContainer isComingSoon={false}>
          <DevButter />
          <Projects />
          <ContactUS />
        </RollerContainer>
      </main>
    </>
  );
}
