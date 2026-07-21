"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

/**
 * Temporary pipeline-proof scene for DEV-88.
 * Confirms the R3F + Drei + Three.js setup renders inside a lazy-loaded,
 * client-only Canvas with no SSR/hydration issues. Will be replaced by the
 * real hero scene (flask + neural core) in Phase 1 (DEV-93).
 */
function RotatingBox() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta * 0.4;
    meshRef.current.rotation.y += delta * 0.6;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#79E59B" />
    </mesh>
  );
}

export default function TestScene() {
  return (
    <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1} />
      <RotatingBox />
    </Canvas>
  );
}
