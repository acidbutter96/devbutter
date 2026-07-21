"use client";

import dynamic from "next/dynamic";
import styles from "./SceneCanvas.module.scss";

// ssr: false requires a Client Component boundary in the App Router —
// this wrapper is that boundary so the R3F Canvas never runs on the server.
const TestScene = dynamic(() => import("@/three/TestScene"), { ssr: false });

export default function SceneCanvas() {
  return (
    <div className={styles.frame}>
      <TestScene />
    </div>
  );
}
