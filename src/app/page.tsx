import SceneCanvas from "@/components/three/SceneCanvas";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>DevButter — R3F pipeline check</h1>
      <p className={styles.copy}>
        Trivial rotating-primitive scene (DEV-88) confirming React Three
        Fiber + Drei + Three.js render correctly in a lazy-loaded,
        client-only Canvas with no SSR hydration warnings.
      </p>
      <SceneCanvas />
    </main>
  );
}
