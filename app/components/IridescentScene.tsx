"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const IRIDESCENCE = {
  metalness: 0.48,
  roughness: 0.14,
  iridescence: 1,
  iridescenceIOR: 1.58,
  iridescenceThicknessRange: [110, 760] as [number, number],
  clearcoat: 1,
  clearcoatRoughness: 0.07,
  envMapIntensity: 1.9,
};

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const base = context.createLinearGradient(0, 0, 1024, 512);
  base.addColorStop(0, "#090714");
  base.addColorStop(0.28, "#181034");
  base.addColorStop(0.56, "#061b2b");
  base.addColorStop(0.8, "#1d1126");
  base.addColorStop(1, "#080912");
  context.fillStyle = base;
  context.fillRect(0, 0, 1024, 512);

  const blobs: Array<[number, number, number, string]> = [
    [150, 120, 280, "rgba(91, 210, 255, 0.9)"],
    [410, 90, 240, "rgba(174, 119, 255, 0.8)"],
    [690, 180, 310, "rgba(255, 137, 224, 0.72)"],
    [920, 330, 260, "rgba(255, 215, 143, 0.7)"],
    [210, 430, 260, "rgba(126, 255, 214, 0.62)"],
  ];

  context.save();
  context.filter = "blur(54px)";
  for (const [x, y, radius, color] of blobs) {
    const glow = context.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  context.restore();

  context.save();
  context.filter = "blur(8px)";
  context.fillStyle = "rgba(255, 255, 255, 0.65)";
  context.fillRect(120, 0, 48, 512);
  context.fillStyle = "rgba(255, 255, 255, 0.4)";
  context.fillRect(760, 0, 22, 512);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(texture).texture;
  texture.dispose();
  pmrem.dispose();

  return environment;
}

function makeMaterial(color = 0xffffff, overrides: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    ...IRIDESCENCE,
    ...overrides,
  });
}

export function IridescentScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0.18, 8.6);
    camera.lookAt(0, 0.1, 0);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.className = "iridescent-canvas";
    host.appendChild(renderer.domElement);

    const environment = makeEnvironment(renderer);
    if (environment) scene.environment = environment;

    scene.add(new THREE.AmbientLight(0x8589d9, 1.15));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(4.5, 5.5, 6);
    scene.add(keyLight);

    const cyanLight = new THREE.PointLight(0x7ee8ff, 38, 16, 2);
    cyanLight.position.set(-4.4, 2.8, 2);
    scene.add(cyanLight);

    const roseLight = new THREE.PointLight(0xff9ee0, 30, 15, 2);
    roseLight.position.set(4.2, -1.8, 2.6);
    scene.add(roseLight);

    const goldLight = new THREE.PointLight(0xffd9a1, 18, 12, 2);
    goldLight.position.set(0.5, 3.8, -2.4);
    scene.add(goldLight);

    const sculpture = new THREE.Group();
    sculpture.rotation.set(0.12, -0.18, 0);
    scene.add(sculpture);

    const knotGeometry = new THREE.TorusKnotGeometry(1.02, 0.34, 220, 40, 2, 3);
    const knotMaterial = makeMaterial(0xf7f2ff, {
      roughness: 0.12,
      iridescenceThicknessRange: [90, 820],
    });
    const knot = new THREE.Mesh(knotGeometry, knotMaterial);
    knot.rotation.set(0.44, -0.3, 0.18);
    sculpture.add(knot);

    const ringMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9ff4ff,
      emissive: 0x0a3440,
      emissiveIntensity: 0.65,
      metalness: 0.75,
      roughness: 0.16,
      iridescence: 1,
      iridescenceIOR: 1.5,
      iridescenceThicknessRange: [140, 520],
      clearcoat: 1,
      envMapIntensity: 1.5,
    });
    const ringGeometry = new THREE.TorusGeometry(2.08, 0.012, 10, 220);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.set(1.18, 0.18, -0.24);
    sculpture.add(ring);

    const outerRingGeometry = new THREE.TorusGeometry(2.34, 0.007, 8, 220);
    const outerRing = new THREE.Mesh(
      outerRingGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xc6c8ff,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    );
    outerRing.rotation.set(1.38, -0.26, 0.34);
    sculpture.add(outerRing);

    const satelliteGroup = new THREE.Group();
    sculpture.add(satelliteGroup);

    const satelliteMaterial = makeMaterial(0xffffff, {
      roughness: 0.1,
      metalness: 0.62,
      iridescenceThicknessRange: [70, 680],
    });

    const satelliteConfigs = [
      {
        geometry: new THREE.IcosahedronGeometry(0.36, 2),
        radius: 2.04,
        speed: 0.28,
        offset: 0.2,
        height: 0.42,
      },
      {
        geometry: new THREE.OctahedronGeometry(0.4, 0),
        radius: 1.78,
        speed: -0.22,
        offset: 2.35,
        height: -0.46,
      },
      {
        geometry: new THREE.TorusGeometry(0.28, 0.09, 16, 64),
        radius: 2.36,
        speed: 0.18,
        offset: 4.3,
        height: 0.08,
      },
    ];

    const satellites = satelliteConfigs.map((config) => {
      const mesh = new THREE.Mesh(config.geometry, satelliteMaterial);
      satelliteGroup.add(mesh);
      return { ...config, mesh };
    });

    const shardMaterial = makeMaterial(0xd9f7ff, {
      roughness: 0.16,
      metalness: 0.55,
      iridescenceThicknessRange: [100, 700],
    });
    const shards = [
      { radius: 2.65, speed: 0.14, offset: 0.9, height: 1.16, size: 0.12 },
      { radius: 2.46, speed: -0.17, offset: 2.8, height: -1.1, size: 0.09 },
      { radius: 2.76, speed: 0.11, offset: 4.7, height: 0.84, size: 0.07 },
      { radius: 2.3, speed: -0.13, offset: 5.6, height: -0.82, size: 0.1 },
    ].map((config) => {
      const geometry = new THREE.TetrahedronGeometry(config.size, 0);
      const mesh = new THREE.Mesh(geometry, shardMaterial);
      sculpture.add(mesh);
      return { ...config, mesh };
    });

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let inView = true;

    const clock = new THREE.Clock();

    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion || event.pointerType === "touch") return;
      const bounds = host.getBoundingClientRect();
      pointerTargetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2));
      pointerTargetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2));
    };

    const resetPointer = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", resetPointer);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    visibilityObserver.observe(host);

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (!inView || document.hidden) return;

      const time = clock.getElapsedTime();
      pointerX += (pointerTargetX - pointerX) * 0.045;
      pointerY += (pointerTargetY - pointerY) * 0.045;

      if (!reduceMotion) {
        knot.rotation.y = time * 0.16;
        knot.rotation.x = 0.44 + Math.sin(time * 0.26) * 0.16;
        knot.rotation.z = 0.18 + Math.sin(time * 0.2) * 0.1;

        ring.rotation.z = -0.24 - time * 0.045;
        ring.rotation.x = 1.18 + Math.sin(time * 0.17) * 0.08;
        outerRing.rotation.z = 0.34 + time * 0.03;
        outerRing.rotation.y = -0.26 + Math.sin(time * 0.13) * 0.12;

        for (const satellite of satellites) {
          const angle = time * satellite.speed + satellite.offset;
          satellite.mesh.position.set(
            Math.cos(angle) * satellite.radius,
            satellite.height + Math.sin(time * 0.72 + satellite.offset) * 0.12,
            Math.sin(angle) * satellite.radius,
          );
          satellite.mesh.rotation.x = time * 0.24 + satellite.offset;
          satellite.mesh.rotation.y = time * 0.3;
        }

        for (const shard of shards) {
          const angle = time * shard.speed + shard.offset;
          shard.mesh.position.set(
            Math.cos(angle) * shard.radius,
            shard.height + Math.sin(time * 0.48 + shard.offset) * 0.16,
            Math.sin(angle) * shard.radius,
          );
          shard.mesh.rotation.x = time * 0.32 + shard.offset;
          shard.mesh.rotation.z = time * 0.22;
        }

        sculpture.position.y = Math.sin(time * 0.52) * 0.07;
        sculpture.rotation.x = 0.12 + pointerY * 0.12 + Math.sin(time * 0.16) * 0.03;
        sculpture.rotation.y = -0.18 + pointerX * 0.18;
        camera.position.x = pointerX * 0.35;
        camera.position.y = 0.18 - pointerY * 0.24;
        camera.lookAt(0, 0.1, 0);
      }

      renderer.render(scene, camera);
    };

    resize();
    animate();
    host.dataset.live = "true";

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", resetPointer);

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      });
      environment?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      delete host.dataset.live;
    };
  }, []);

  return (
    <div className="iridescent-stage" ref={hostRef} aria-hidden="true">
      <div className="iridescent-fallback">
        <div className="orb">
          <span className="orb-sheen" />
          <span className="orb-core" />
        </div>
      </div>
    </div>
  );
}
