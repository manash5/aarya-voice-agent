"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getChapter } from "@/lib/scrollStore";

const CHAPTER_CAMERA: [number, number, number][] = [
  [0, 0, 4.6], // hero
  [1.4, 0.3, 3.6], // about — orbit in
  [-1.6, 0.4, 3.8], // skills — orbit the other side
  [0, -0.4, 5.4], // work — pull back
  [0, 0.2, 6.4], // contact — recede
];

export default function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const clamped = Math.max(0, Math.min(CHAPTER_CAMERA.length - 1, getChapter()));
    const i = Math.floor(clamped);
    const t = clamped - i;
    const cur = CHAPTER_CAMERA[i];
    const next = CHAPTER_CAMERA[Math.min(i + 1, CHAPTER_CAMERA.length - 1)];

    const tx = THREE.MathUtils.lerp(cur[0], next[0], t) + state.pointer.x * 0.3;
    const ty = THREE.MathUtils.lerp(cur[1], next[1], t) + state.pointer.y * 0.18;
    const tz = THREE.MathUtils.lerp(cur[2], next[2], t);

    camera.position.x += (tx - camera.position.x) * 0.045;
    camera.position.y += (ty - camera.position.y) * 0.045;
    camera.position.z += (tz - camera.position.z) * 0.045;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
