"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/Addons.js";
import { useControls } from "leva";
import { EffectComposer, Bloom, Pixelation } from "@react-three/postprocessing";
/* import {
  uniform,
  varying,
  vec4,
  add,
  sub,
  max,
  dot,
  sin,
  mat3,
  uint,
  negate,
  cameraProjectionMatrix,
  cameraViewMatrix,
  positionLocal,
  modelWorldMatrix,
  sqrt,
  attribute,
  property,
  float,
  storage,
  storageObject,
  Fn,
  If,
  cos,
  Loop,
  Continue,
  normalize,
  instanceIndex,
  length,
} from "three/tsl"; */

const Points = () => {
  const { gl, scene, camera } = useThree();
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const gpuCompute = useRef<GPUComputationRenderer>(null);
  const positionVariable = useRef<Variable>(null);
  const velocityVariable = useRef<Variable>(null);
  const debugPlaneRef = useRef<THREE.Mesh>(null);
  const predatorRef = useRef<THREE.Mesh>(null);
  const mousePos = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

  const {
    speed,
    size,
    amount,
    bounds,
    showBounds,
    showDebug,
    velocityPosition,
    cohesion,
    alignment,
    separation,
    predatorStrength,
    predatorRadius,
    minSpeed,
    pixelSize,
    bloomIntensity,
    bloomThreshold,
    bloomRadius
  } = useControls({
    speed: { value: 1, min: 0, max: 5 },
    size: { value: 2, min: 0.1, max: 10 },
    amount: { value: 16, min: 4, max: 4096, step: 1 },
    bounds: { value: 800, min: 100, max: 2000 },
    showBounds: false,
    showDebug: false,
    velocityPosition: false,
    cohesion: { value: 1.0, min: 0, max: 2 },
    alignment: { value: 1.0, min: 0, max: 2 },
    separation: { value: 1.0, min: 0, max: 2 },
    predatorStrength: { value: 2.0, min: 0, max: 5 },
    predatorRadius: { value: 100, min: 10, max: 300 },
    minSpeed: { value: 5.0, min: 0, max: 10 },
    pixelSize: { value: 1, min: 1, max: 16, step: 1 },
    bloomIntensity: { value: 0, min: 0, max: 3 },
    bloomThreshold: { value: 0.8, min: 0, max: 1 },
    bloomRadius: { value: 0.5, min: 0, max: 1 },
    sunPosition: { value: [1, 2, 3] },
    turbidity: { value: 10, min: 0, max: 20 },
    rayleigh: { value: 3, min: 0, max: 10 },
    mieCoefficient: { value: 0.005, min: 0, max: 0.1 },
    mieDirectionalG: { value: 0.7, min: 0, max: 1 },
  });
  const POINTS = amount;
  const WIDTH = Math.sqrt(amount) as number;
  const BOUNDS_HALF = bounds / 2;

  useEffect(() => {
    const computeRenderer = new GPUComputationRenderer(WIDTH, WIDTH, gl);

    // Create position and velocity textures
    const positionTexture = computeRenderer.createTexture();
    const velocityTexture = computeRenderer.createTexture();

    // Initialize positions
    const posArray = positionTexture.image.data as Float32Array;
    const velArray = velocityTexture.image.data as Float32Array;
    for (let i = 0; i < posArray.length; i += 4) {
      // Random positions within bounds
      posArray[i] = Math.random() * bounds - BOUNDS_HALF;
      posArray[i + 1] = Math.random() * bounds - BOUNDS_HALF;
      posArray[i + 2] = Math.random() * bounds - BOUNDS_HALF;
      posArray[i + 3] = 1;

      // Random initial velocities
      velArray[i] = (Math.random() - 0.5) * 10;
      velArray[i + 1] = (Math.random() - 0.5) * 10;
      velArray[i + 2] = (Math.random() - 0.5) * 10;
      velArray[i + 3] = 1;
    }

    // Add velocity variable with boids behavior
    velocityVariable.current = computeRenderer.addVariable(
      "textureVelocity",
      `
      uniform float speed;
      uniform float cohesion;
      uniform float alignment;
      uniform float separation;
      uniform float bounds;
      uniform float boundsHalf;
      uniform vec3 predatorPosition;
      uniform float predatorStrength;
      uniform float predatorRadius;
      uniform float minSpeed;

      const float NEIGHBOR_RADIUS = 50.0;
      const float SEPARATION_RADIUS = 25.0;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        
        vec3 cohesionSum = vec3(0.0);
        vec3 alignmentSum = vec3(0.0);
        vec3 separationSum = vec3(0.0);
        float neighbors = 0.0;

        // Check all other boids
        for(float y = 0.0; y < resolution.y; y++) {
          for(float x = 0.0; x < resolution.x; x++) {
            vec2 ref = vec2(x, y) / resolution.xy;
            vec4 otherPos = texture2D(texturePosition, ref);
            vec4 otherVel = texture2D(textureVelocity, ref);
            
            vec3 diff = otherPos.xyz - pos.xyz;
            float dist = length(diff);

            if(dist > 0.0 && dist < NEIGHBOR_RADIUS) {
              // Cohesion
              cohesionSum += otherPos.xyz;
              
              // Alignment
              alignmentSum += otherVel.xyz;
              
              // Separation
              if(dist < SEPARATION_RADIUS) {
                separationSum -= normalize(diff) / dist;
              }
              
              neighbors++;
            }
          }
        }

        if(neighbors > 0.0) {
          // Cohesion - move toward center of neighbors
          vec3 cohesionVec = (cohesionSum / neighbors - pos.xyz) * 0.0001 * cohesion;
          vel.xyz += cohesionVec;

          // Alignment - match velocity of neighbors
          vec3 alignmentVec = (alignmentSum / neighbors - vel.xyz) * 0.01 * alignment;
          vel.xyz += alignmentVec;

          // Separation - avoid crowding neighbors
          vec3 separationVec = separationSum * 0.01 * separation;
          vel.xyz += separationVec;
        }

        // Avoid predator
        vec3 toPredator = predatorPosition - pos.xyz;
        float predatorDist = length(toPredator);
        if(predatorDist < predatorRadius) {
          vec3 fleeVec = -normalize(toPredator) * (1.0 - predatorDist/predatorRadius) * predatorStrength;
          vel.xyz += fleeVec;
        }

        // Contain within bounds
        vec3 center = vec3(0.0);
        float margin = 50.0;
        if(abs(pos.x) > boundsHalf - margin) vel.x -= sign(pos.x) * 0.5;
        if(abs(pos.y) > boundsHalf - margin) vel.y -= sign(pos.y) * 0.5;
        if(abs(pos.z) > boundsHalf - margin) vel.z -= sign(pos.z) * 0.5;

        // Limit velocity
        float maxSpeed = 20.0;
        float speed = length(vel.xyz);
        
        // Enforce minimum speed
        if (speed < minSpeed) {
          vel.xyz = normalize(vel.xyz) * minSpeed;
        }
        // Enforce maximum speed
        else if (speed > maxSpeed) {
          vel.xyz = normalize(vel.xyz) * maxSpeed;
        }
        
        gl_FragColor = vel;
      }
      `,
      velocityTexture
    );

    // Add position variable
    positionVariable.current = computeRenderer.addVariable(
      "texturePosition",
      `
      uniform float speed;
      uniform float bounds;
      uniform float boundsHalf;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        
        pos.xyz += vel.xyz * speed * 0.1;

        // Wrap around bounds
        pos.xyz = mod(pos.xyz + boundsHalf, bounds) - boundsHalf;
        
        gl_FragColor = pos;
      }
      `,
      positionTexture
    );

    // Set dependencies
    computeRenderer.setVariableDependencies(velocityVariable.current, [
      velocityVariable.current,
      positionVariable.current,
    ]);
    computeRenderer.setVariableDependencies(positionVariable.current, [
      positionVariable.current,
      velocityVariable.current,
    ]);

    // Add uniforms
    velocityVariable.current.material.uniforms.speed = { value: speed };
    velocityVariable.current.material.uniforms.cohesion = { value: cohesion };
    velocityVariable.current.material.uniforms.alignment = { value: alignment };
    velocityVariable.current.material.uniforms.separation = {
      value: separation,
    };
    velocityVariable.current.material.uniforms.bounds = { value: bounds };
    velocityVariable.current.material.uniforms.boundsHalf = {
      value: BOUNDS_HALF,
    };
    velocityVariable.current.material.uniforms.predatorPosition = {
      value: new THREE.Vector3(),
    };
    velocityVariable.current.material.uniforms.predatorStrength = {
      value: predatorStrength,
    };
    velocityVariable.current.material.uniforms.predatorRadius = {
      value: predatorRadius,
    };
    velocityVariable.current.material.uniforms.minSpeed = {
      value: minSpeed,
    };

    positionVariable.current.material.uniforms.speed = { value: speed };
    positionVariable.current.material.uniforms.bounds = { value: bounds };
    positionVariable.current.material.uniforms.boundsHalf = {
      value: BOUNDS_HALF,
    };

    computeRenderer.init();
    gpuCompute.current = computeRenderer;

    // Create triangle geometry
    const triangleGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1.0,
      -1.0,
      0.0, // bottom left
      2.0,
      0.0,
      0.0, // right
      -1.0,
      1.0,
      0.0, // top left
    ]);
    triangleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        size: { value: size },
        amount: { value: amount },
      },
      vertexShader: `
        uniform sampler2D texturePosition;
        uniform sampler2D textureVelocity;
        uniform float size;
        uniform float amount;

        varying vec3 vColor;

        void main() {
          if (instanceMatrix[3][3] >= amount) {
            gl_Position = vec4(0.0);
            return;
          }

          // Calculate UV for this instance
          float x = mod(float(gl_InstanceID), ${WIDTH}.0) / ${WIDTH}.0;
          float y = floor(float(gl_InstanceID) / ${WIDTH}.0) / ${WIDTH}.0;
          vec2 reference = vec2(x, y);

          // Get position and velocity
          vec4 pos = texture2D(texturePosition, reference);
          vec4 vel = texture2D(textureVelocity, reference);

          // Calculate rotation matrix to face velocity direction
          vec3 dir = normalize(vel.xyz);
          vec3 up = vec3(0.0, 1.0, 0.0);
          vec3 right = normalize(cross(dir, up));
          up = normalize(cross(right, dir));
          
          mat3 rotation = mat3(
            right,
            up,
            dir
          );

          // Transform vertex
          vec3 transformed = rotation * (position * size);
          vec4 worldPosition = modelMatrix * vec4(pos.xyz + transformed, 1.0);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;

          // Generate color based on velocity
          vColor = normalize(vel.xyz);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    const instancedMesh = new THREE.InstancedMesh(
      triangleGeometry,
      material,
      POINTS
    );
    instancedMeshRef.current = instancedMesh;
    scene.add(instancedMesh);

    // Create predator
    const predatorGeometry = new THREE.SphereGeometry(10);
    const predatorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 0,
      metalness: 0,
      transmission: 1,
      thickness: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0,
    });
    const predator = new THREE.Mesh(predatorGeometry, predatorMaterial);
    predatorRef.current = predator;
    scene.add(predator);

    // Create debug plane
    const debugGeometry = new THREE.PlaneGeometry(200, 200);
    const debugMaterial = new THREE.MeshBasicMaterial({
      map: null,
      side: THREE.DoubleSide,
    });
    const debugPlane = new THREE.Mesh(debugGeometry, debugMaterial);
    debugPlane.position.set(-400, 0, 0);
    debugPlaneRef.current = debugPlane;
    scene.add(debugPlane);

    // Add mouse move listener
    const onMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);
      raycaster.current.ray.intersectPlane(plane.current, mousePos.current);
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      scene.remove(instancedMesh);
      scene.remove(debugPlane);
      scene.remove(predator);
      triangleGeometry.dispose();
      material.dispose();
      debugGeometry.dispose();
      debugMaterial.dispose();
      predatorGeometry.dispose();
      predatorMaterial.dispose();
    };
  }, [
    gl,
    scene,
    camera,
    speed,
    size,
    amount,
    bounds,
    cohesion,
    alignment,
    separation,
    predatorStrength,
    predatorRadius,
    minSpeed,
  ]);

  useFrame(() => {
    if (
      !gpuCompute.current ||
      !instancedMeshRef.current ||
      !debugPlaneRef.current ||
      !predatorRef.current
    )
      return;

    // Update predator position to mouse position
    predatorRef.current.position.copy(mousePos.current);

    // Update predator position in shader
    velocityVariable.current!.material.uniforms.predatorPosition.value.copy(
      predatorRef.current.position
    );

    gpuCompute.current.compute();

    const material = instancedMeshRef.current.material as THREE.ShaderMaterial;
    const positionTexture = gpuCompute.current.getCurrentRenderTarget(
      positionVariable.current!
    ).texture;
    const velocityTexture = gpuCompute.current.getCurrentRenderTarget(
      velocityVariable.current!
    ).texture;

    material.uniforms.texturePosition.value = positionTexture;
    material.uniforms.textureVelocity.value = velocityTexture;
    material.uniforms.size.value = size;
    material.uniforms.amount.value = amount;

    // Update debug plane texture
    if (showDebug) {
      (debugPlaneRef.current.material as THREE.MeshBasicMaterial).map =
        velocityPosition ? velocityTexture : positionTexture;
      debugPlaneRef.current.visible = true;
    } else {
      debugPlaneRef.current.visible = false;
    }
  });

  return (
    <>
      {showBounds && (
        <mesh>
          <boxGeometry args={[bounds, bounds, bounds]} />
          <meshBasicMaterial color="white" wireframe />
        </mesh>
      )}
      {/* <Sky
        distance={450000}
        sunPosition={sunPosition}
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={mieDirectionalG}
      /> */}
      <EffectComposer>
        <Pixelation granularity={pixelSize} />
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
          radius={bloomRadius}
        />
      </EffectComposer>
    </>
  );
};

const BoidsScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 1000], far: 10000 }}>
      <Points />
      <OrbitControls />
    </Canvas>
  );
};

export default BoidsScene;
