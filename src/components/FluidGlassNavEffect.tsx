/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, useFBO } from '@react-three/drei';
import { easing } from 'maath';
import type { Group, Mesh } from 'three';

const RefractedBackdrop: React.FC = () => {
  return (
    <group>
      {[
        [-1.12, 0.62, '#ffffff', 0.035],
        [0.92, 0.45, '#ffffff', 0.025],
        [-0.55, -0.58, '#ffffff', 0.018],
        [0.64, -0.62, '#ffffff', 0.018],
      ].map(([x, y, color, opacity], index) => (
        <mesh key={index} position={[x as number, y as number, 0]}>
          <circleGeometry args={[0.58, 48]} />
          <meshBasicMaterial color={color as string} transparent opacity={opacity as number} />
        </mesh>
      ))}
      {[-1.1, -0.45, 0.18, 0.78].map((x, index) => (
        <mesh key={`line-${index}`} position={[x, 0, 0.02]} rotation={[0, 0, 0.32]}>
          <planeGeometry args={[0.08, 3.4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.012} />
        </mesh>
      ))}
    </group>
  );
};

const TransmissionLens: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const lensRef = useRef<Mesh>(null);
  const buffer = useFBO(160, 160);
  const [scene] = useState(() => new THREE.Scene());

  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, 0.2, 96, 1, false);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !lensRef.current) return;

    const time = state.clock.elapsedTime;
    easing.dampE(
      groupRef.current.rotation,
      [Math.sin(time * 0.8) * 0.1, Math.cos(time * 0.55) * 0.14, Math.sin(time * 0.44) * 0.08],
      0.24,
      delta
    );
    easing.damp3(groupRef.current.scale, [1.02, 1.02, 1], 0.22, delta);

    const previousTarget = state.gl.getRenderTarget();
    const previousClearColor = state.gl.getClearColor(new THREE.Color());
    const previousClearAlpha = state.gl.getClearAlpha();
    state.gl.setRenderTarget(buffer);
    state.gl.setClearColor(0x000000, 0);
    state.gl.clear();
    state.gl.render(scene, state.camera);
    state.gl.setRenderTarget(previousTarget);
    state.gl.setClearColor(previousClearColor, previousClearAlpha);
  });

  return (
    <>
      {createPortal(<RefractedBackdrop />, scene)}
      <ambientLight intensity={1.5} />
      <pointLight position={[1.5, 1.2, 2.2]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-1.4, -1.2, 1.2]} intensity={0.8} color="#ffffff" />
      <group ref={groupRef}>
        <mesh ref={lensRef} geometry={geometry}>
          <MeshTransmissionMaterial
            buffer={buffer.texture}
            samples={8}
            resolution={160}
            transmission={1}
            roughness={0.02}
            thickness={1.2}
            ior={1.12}
            chromaticAberration={0.004}
            anisotropicBlur={0.006}
            color="#ffffff"
            attenuationColor="#ffffff"
            attenuationDistance={1.6}
            transparent
            opacity={0.28}
          />
        </mesh>
      </group>
    </>
  );
};

export const FluidGlassNavEffect: React.FC = () => {
  return (
    <Canvas
      orthographic
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], zoom: 30 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <TransmissionLens />
    </Canvas>
  );
};
