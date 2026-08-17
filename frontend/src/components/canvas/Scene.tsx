"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Preload } from "@react-three/drei";
import { Suspense } from "react";
import AISculpture from "./AISculpture";
import CameraRig from "./CameraRig";
import Particles from "./Particles";
import SceneLights from "./SceneLights";

// One canvas for the whole page — it never unmounts, so the 3D world is
// continuous across every section and only the chapter value changes.
export default function Scene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.6], fov: 45 }}
      >
        <Suspense fallback={null}>
          <SceneLights />
          <AISculpture />
          <Particles />
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>
        <CameraRig />
        <AdaptiveDpr pixelated />
        <Preload all />
      </Canvas>
    </div>
  );
}
