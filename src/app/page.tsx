import SceneCanvas from "@/components/three/SceneCanvas";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-semibold">DevButter — R3F pipeline check</h1>
      <p className="max-w-md text-center text-sm text-neutral-500">
        Trivial rotating-primitive scene (DEV-88) confirming React Three
        Fiber + Drei + Three.js render correctly in a lazy-loaded,
        client-only Canvas with no SSR hydration warnings.
      </p>
      <SceneCanvas />
    </main>
  );
}
