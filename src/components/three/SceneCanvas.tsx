"use client";

import dynamic from "next/dynamic";

// ssr: false requires a Client Component boundary in the App Router —
// this wrapper is that boundary so the R3F Canvas never runs on the server.
const TestScene = dynamic(() => import("@/three/TestScene"), { ssr: false });

export default function SceneCanvas() {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg border border-white/10 bg-black/20">
      <TestScene />
    </div>
  );
}
