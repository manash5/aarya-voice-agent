"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getChapter } from "@/lib/scrollStore";
import { hueAt } from "@/lib/theme";

export default function SceneLights() {
  const key = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    const chapter = getChapter();
    const h = hueAt(chapter) / 360;
    const t = state.clock.elapsedTime;

    if (key.current) {
      key.current.color.setHSL(h, 0.55, 0.68);
      key.current.position.x = Math.sin(t * 0.2) * 3;
      key.current.position.y = 3 + Math.cos(t * 0.15) * 0.8;
    }
    if (fill.current) {
      fill.current.color.setHSL((h + 0.5) % 1, 0.6, 0.6);
      fill.current.intensity = 12 + Math.sin(t * 0.4) * 3;
    }
    if (rim.current) {
      rim.current.color.setHSL((h + 0.08) % 1, 0.8, 0.7);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight ref={key} position={[2, 3, 4]} angle={0.7} penumbra={1} intensity={40} />
      <pointLight ref={fill} position={[-4, -2, 2]} intensity={12} />
      <directionalLight ref={rim} position={[-2, 1, -4]} intensity={2.5} />
    </>
  );
}
