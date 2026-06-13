import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function CoffeeBean({ position, scale = 1, color = "#3a2418" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.4;
    ref.current.rotation.y = state.clock.elapsedTime * 0.6;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} position={position} scale={[scale * 0.6, scale, scale * 0.6]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} flatShading />
      </mesh>
    </Float>
  );
}

function LowPolyCup({ scrollProgress }: { scrollProgress: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.25 + scrollProgress.current * 1.5;
    group.current.position.y = Math.sin(t * 0.8) * 0.08 - scrollProgress.current * 0.3;
  });

  return (
    <group ref={group} position={[0, -0.3, 0]}>
      {/* Saucer */}
      <mesh position={[0, -1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.7, 1.5, 0.12, 8]} />
        <meshStandardMaterial color="#d9b48a" roughness={0.5} flatShading />
      </mesh>
      {/* Cup body */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[1.1, 0.85, 1.5, 8]} />
        <meshStandardMaterial color="#efd9b8" roughness={0.55} flatShading />
      </mesh>
      {/* Coffee liquid */}
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.05, 8]} />
        <meshStandardMaterial color="#2a160a" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[1.25, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.45, 0.13, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#efd9b8" roughness={0.55} flatShading />
      </mesh>
    </group>
  );
}

function Beans() {
  const positions: Array<[number, number, number]> = [
    [-3, 1.6, -1], [3.2, 2.1, -1.5], [-2.5, -1.8, 0.5],
    [3.5, -1.2, 0], [-3.8, 0.4, 1], [2.8, 0.1, -2],
    [0, 2.5, -1.8], [-1.5, -2.5, -1],
  ];
  return (
    <>
      {positions.map((p, i) => (
        <CoffeeBean key={i} position={p} scale={0.25 + (i % 3) * 0.08} color={i % 2 ? "#4a2a18" : "#2e1810"} />
      ))}
    </>
  );
}

export function CoffeeScene({ scrollProgress }: { scrollProgress: { current: number } }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.5, 5.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow color="#fff1d6" />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#c98a4a" />
        <LowPolyCup scrollProgress={scrollProgress} />
        <Beans />
        <ContactShadows position={[0, -1.45, 0]} opacity={0.45} scale={8} blur={2.4} far={3} />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
