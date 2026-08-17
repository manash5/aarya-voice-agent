"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getChapter } from "@/lib/scrollStore";

const COUNT = 900;

export default function Particles() {
  const points = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      speeds[i] = 0.02 + Math.random() * 0.06;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const mesh = points.current;
    if (!mesh) return;

    const attr = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const drift = Math.min(delta, 0.05);

    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * drift * 6;
      if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7;
    }
    attr.needsUpdate = true;

    mesh.rotation.y += delta * 0.012;
    mesh.position.x = state.pointer.x * 0.4;
    mesh.position.y = state.pointer.y * 0.25 - getChapter() * 0.15;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#c7d2fe"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
