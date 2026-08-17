"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getChapter } from "@/lib/scrollStore";

const NODE_COUNT = 64;

function useNodePositions() {
  return useMemo(() => {
    const positions = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      // fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const r = 1.9 + Math.sin(i * 12.9898) * 0.15;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);
}

export default function AISculpture() {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const nodes = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);

  const nodePositions = useNodePositions();

  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e8e8f5",
        emissive: "#6f6ff0",
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.6,
        wireframe: false,
      }),
    []
  );

  useFrame((state, delta) => {
    const chapter = getChapter();
    const t = state.clock.elapsedTime;

    if (group.current) {
      // Camera-relative reveal: sculpture opens up and drifts as chapters change.
      const targetY = -chapter * 0.35;
      group.current.rotation.y += delta * (0.12 + chapter * 0.03);
      group.current.rotation.x = Math.sin(t * 0.15) * 0.08 + chapter * 0.05;
      group.current.position.y += (targetY - group.current.position.y) * 0.04;
      const targetScale = 1 - Math.min(chapter, 3) * 0.06;
      group.current.scale.setScalar(
        group.current.scale.x + (targetScale - group.current.scale.x) * 0.05
      );
    }

    if (core.current) {
      const pulse = 1 + Math.sin(t * 1.4) * 0.04;
      core.current.scale.setScalar(pulse);
    }

    if (ringA.current) ringA.current.rotation.x += delta * 0.25;
    if (ringB.current) ringB.current.rotation.y += delta * 0.18;
    if (ringC.current) ringC.current.rotation.z += delta * 0.22;

    if (nodes.current) {
      nodes.current.rotation.y -= delta * 0.05;
      const openAmount = Math.min(chapter / 2, 1);
      const s = 1 + openAmount * 0.6;
      nodes.current.scale.setScalar(nodes.current.scale.x + (s - nodes.current.scale.x) * 0.04);
    }

    if (light.current) {
      const hue = (200 + chapter * 40) % 360;
      light.current.color.setHSL(hue / 360, 0.7, 0.6);
      light.current.intensity = 8 + Math.sin(t * 0.6) * 1.5;
    }
  });

  return (
    <group ref={group}>
      <pointLight ref={light} position={[0, 0, 0]} intensity={8} distance={8} decay={2} />

      <mesh ref={core} material={coreMaterial}>
        <icosahedronGeometry args={[0.75, 2]} />
      </mesh>

      <mesh ref={ringA} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.35, 0.006, 8, 128]} />
        <meshBasicMaterial color="#a5b4fc" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ringB} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[1.6, 0.005, 8, 128]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.35} />
      </mesh>
      <mesh ref={ringC} rotation={[Math.PI / 2, Math.PI / 5, 0]}>
        <torusGeometry args={[1.15, 0.004, 8, 128]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} />
      </mesh>

      <points ref={nodes}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#eef2ff" transparent opacity={0.85} sizeAttenuation />
      </points>
    </group>
  );
}
