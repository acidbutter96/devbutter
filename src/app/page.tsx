import styles from "./page.module.scss";
import { Header } from "@/components/Header"
import { RollerContainer } from "@/components/RollerContainer";
import { DevButter } from "@/containers/home/DevButter";
import { redirect } from "next/navigation";
import { GetInTouch } from "@/containers/home/GetInTouch";
import { Projects } from "@/containers/home/Projects";
import { Experience } from "@/containers/home/Experience";
import ApiContextProvider from "@/contexts/api";

export default function Home() {
  // redirect('coming-soon');
  return (
    <>
      <ApiContextProvider>
        <Header />
        <main className={styles.mainContainer}>
          <RollerContainer isComingSoon={false}>
            <DevButter />
            <Projects />
            <Experience />
            <GetInTouch />
          </RollerContainer>
        </main>
      </ApiContextProvider>
    </>
  );
}
