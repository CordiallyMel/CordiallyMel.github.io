"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const IRIDESCENCE = {
  metalness: 0.4,
  roughness: 0.2,
  iridescence: 1,
  iridescenceIOR: 1.58,
  iridescenceThicknessRange: [100, 760] as [number, number],
  clearcoat: 0.8,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.75,
};

const TIME_STEPS = 52;
const PRICE_BINS = 17;
const TIME_SPAN = 6.4;
const PRICE_SPAN = 4.4;
const BASE_Y = 0.035;
const MAX_BAR_HEIGHT = 1.82;
const BAR_WIDTH = (TIME_SPAN / TIME_STEPS) * 0.62;
const BAR_DEPTH = (PRICE_SPAN / PRICE_BINS) * 0.58;
const PRICE_PROFILE_X = TIME_SPAN / 2 + 0.5;
const TIME_PROFILE_Z = PRICE_SPAN / 2 + 0.45;

const PALETTE = [
  new THREE.Color("#67e8ff"),
  new THREE.Color("#9d8cff"),
  new THREE.Color("#ffa7e2"),
  new THREE.Color("#ffe1a4"),
];

const FALLBACK_HEIGHTS = [
  18, 31, 22, 47, 38, 63, 44, 80, 56, 42, 68, 35, 52, 88, 64, 47, 73, 56,
  91, 68, 45, 58, 34, 49, 27, 41,
];

type MarketField = {
  path: number[];
  volumes: number[][];
  priceProfile: number[];
  timeProfile: number[];
};

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}

function buildMarketField(): MarketField {
  const random = mulberry32(0x51a7c0de);
  const path: number[] = [];
  let level = 8.2;

  for (let t = 0; t < TIME_STEPS; t += 1) {
    const wave = Math.sin(t * 0.2) * 0.24 + Math.sin(t * 0.073 + 1.4) * 0.16;
    const impulse = (random() - 0.5) * 0.72;
    level = clamp(level + wave * 0.2 + impulse * 0.32, 1.1, PRICE_BINS - 2.1);
    path.push(level);
  }

  const volumes: number[][] = Array.from({ length: TIME_STEPS }, () =>
    Array.from({ length: PRICE_BINS }, () => 0),
  );
  const priceProfile = Array.from({ length: PRICE_BINS }, () => 0);
  const timeProfile = Array.from({ length: TIME_STEPS }, () => 0);
  const shelves = [
    { level: 4.1, strength: 1.15, offset: 0.7 },
    { level: 9.3, strength: 0.8, offset: 2.1 },
    { level: 12.9, strength: 0.65, offset: 3.4 },
  ];

  let maxVolume = 0;

  for (let t = 0; t < TIME_STEPS; t += 1) {
    const session =
      0.46 +
      0.62 * Math.exp(-((t - 17) ** 2) / (2 * 6.5 ** 2)) +
      1.02 * Math.exp(-((t - 36) ** 2) / (2 * 2.7 ** 2)) +
      0.2 * Math.sin(t * 0.74) ** 2;

    for (let p = 0; p < PRICE_BINS; p += 1) {
      const pathMass = Math.exp(-((p - path[t]) ** 2) / (2 * 1.15 ** 2));
      let shelfMass = 0;

      for (const shelf of shelves) {
        const shelfPulse = 0.44 + 0.4 * Math.sin(t * 0.13 + shelf.offset) ** 2;
        shelfMass += shelf.strength * shelfPulse * Math.exp(-((p - shelf.level) ** 2) / (2 * 0.64 ** 2));
      }

      const texture = 0.4 + random() * 0.8;
      const volume = (pathMass * 1.85 + shelfMass * 1.2) * session * texture;
      volumes[t][p] = volume;
      priceProfile[p] += volume;
      timeProfile[t] += volume;
      maxVolume = Math.max(maxVolume, volume);
    }
  }

  const normalize = (value: number, max: number) => (max > 0 ? value / max : 0);
  const priceMax = Math.max(...priceProfile);
  const timeMax = Math.max(...timeProfile);

  for (let t = 0; t < TIME_STEPS; t += 1) {
    for (let p = 0; p < PRICE_BINS; p += 1) {
      volumes[t][p] = normalize(volumes[t][p], maxVolume);
    }
    timeProfile[t] = normalize(timeProfile[t], timeMax);
  }

  for (let p = 0; p < PRICE_BINS; p += 1) {
    priceProfile[p] = normalize(priceProfile[p], priceMax);
  }

  return { path, volumes, priceProfile, timeProfile };
}

function timeToX(t: number) {
  return (t / (TIME_STEPS - 1) - 0.5) * TIME_SPAN;
}

function priceToZ(p: number) {
  return (p / (PRICE_BINS - 1) - 0.5) * PRICE_SPAN;
}

function sampleVolume(volumes: number[], price: number) {
  const low = Math.max(0, Math.min(PRICE_BINS - 1, Math.floor(price)));
  const high = Math.max(0, Math.min(PRICE_BINS - 1, low + 1));
  const blend = clamp(price - low, 0, 1);
  return volumes[low] * (1 - blend) + volumes[high] * blend;
}

function paletteColor(amount: number, shift = 0) {
  const position = clamp(amount + shift * 0.06, 0, 0.999);
  const scaled = position * (PALETTE.length - 1);
  const index = Math.floor(scaled);
  const color = new THREE.Color().copy(PALETTE[index]);
  return color.lerp(PALETTE[Math.min(index + 1, PALETTE.length - 1)], scaled - index);
}

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

function makeFloorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const glow = context.createRadialGradient(256, 256, 8, 256, 256, 280);
  glow.addColorStop(0, "rgba(119, 223, 255, 0.5)");
  glow.addColorStop(0.36, "rgba(148, 111, 255, 0.22)");
  glow.addColorStop(0.7, "rgba(255, 132, 222, 0.06)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.022);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    const cameraHome = new THREE.Vector3(6.1, 4.6, 9.1);
    const cameraTarget = new THREE.Vector3(0.35, 0.82, 0);
    camera.position.copy(cameraHome);
    camera.lookAt(cameraTarget);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.className = "iridescent-canvas";
    host.appendChild(renderer.domElement);

    const environment = makeEnvironment(renderer);
    if (environment) scene.environment = environment;

    scene.add(new THREE.AmbientLight(0x8589d9, 1.08));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4.5, 5.5, 6);
    scene.add(keyLight);

    const cyanLight = new THREE.PointLight(0x7ee8ff, 34, 16, 2);
    cyanLight.position.set(-4.4, 2.8, 2);
    scene.add(cyanLight);

    const roseLight = new THREE.PointLight(0xff9ee0, 28, 15, 2);
    roseLight.position.set(4.2, -1.8, 2.6);
    scene.add(roseLight);

    const goldLight = new THREE.PointLight(0xffd9a1, 16, 12, 2);
    goldLight.position.set(0.5, 3.8, -2.4);
    scene.add(goldLight);

    const chart = new THREE.Group();
    chart.rotation.y = -0.06;
    scene.add(chart);

    const field = buildMarketField();
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const barMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      ...IRIDESCENCE,
    });
    const dummy = new THREE.Object3D();

    type BarSpec = {
      position: [number, number, number];
      scale: [number, number, number];
      color: THREE.Color;
    };

    const addBars = (count: number, build: (index: number) => BarSpec) => {
      const mesh = new THREE.InstancedMesh(boxGeometry, barMaterial, count);
      mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);

      for (let index = 0; index < count; index += 1) {
        const bar = build(index);
        dummy.position.set(...bar.position);
        dummy.scale.set(...bar.scale);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, bar.color);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      chart.add(mesh);
      return mesh;
    };

    addBars(TIME_STEPS * PRICE_BINS, (index) => {
      const t = Math.floor(index / PRICE_BINS);
      const p = index % PRICE_BINS;
      const height = 0.026 + field.volumes[t][p] * MAX_BAR_HEIGHT;
      return {
        position: [timeToX(t), BASE_Y + height / 2, priceToZ(p)],
        scale: [BAR_WIDTH, height, BAR_DEPTH],
        color: paletteColor(height / MAX_BAR_HEIGHT, t / TIME_STEPS),
      };
    });

    addBars(PRICE_BINS, (p) => {
      const height = 0.035 + field.priceProfile[p] * 1.55;
      return {
        position: [PRICE_PROFILE_X, BASE_Y + height / 2, priceToZ(p)],
        scale: [0.19, height, 0.17],
        color: paletteColor(field.priceProfile[p], 0.42),
      };
    });

    addBars(TIME_STEPS, (t) => {
      const height = 0.035 + field.timeProfile[t] * 1.48;
      return {
        position: [timeToX(t), BASE_Y + height / 2, TIME_PROFILE_Z],
        scale: [BAR_WIDTH, height, 0.17],
        color: paletteColor(field.timeProfile[t], 0.1 + t / TIME_STEPS),
      };
    });

    const gridPositions: number[] = [];
    for (let t = 0; t < TIME_STEPS; t += 4) {
      const x = timeToX(t);
      gridPositions.push(x, BASE_Y + 0.004, -PRICE_SPAN / 2, x, BASE_Y + 0.004, PRICE_SPAN / 2);
    }
    for (let p = 0; p < PRICE_BINS; p += 2) {
      const z = priceToZ(p);
      gridPositions.push(-TIME_SPAN / 2, BASE_Y + 0.004, z, TIME_SPAN / 2, BASE_Y + 0.004, z);
    }
    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
    const grid = new THREE.LineSegments(
      gridGeometry,
      new THREE.LineBasicMaterial({
        color: 0x9db5ff,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      }),
    );
    chart.add(grid);

    const borderGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-TIME_SPAN / 2, BASE_Y + 0.006, -PRICE_SPAN / 2),
      new THREE.Vector3(TIME_SPAN / 2, BASE_Y + 0.006, -PRICE_SPAN / 2),
      new THREE.Vector3(TIME_SPAN / 2, BASE_Y + 0.006, PRICE_SPAN / 2),
      new THREE.Vector3(-TIME_SPAN / 2, BASE_Y + 0.006, PRICE_SPAN / 2),
    ]);
    const border = new THREE.LineLoop(
      borderGeometry,
      new THREE.LineBasicMaterial({
        color: 0x9cecff,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    );
    chart.add(border);

    const floorTexture = makeFloorTexture();
    if (floorTexture) {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(TIME_SPAN + 1.2, PRICE_SPAN + 1.15),
        new THREE.MeshBasicMaterial({
          map: floorTexture,
          transparent: true,
          opacity: 0.72,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = BASE_Y - 0.012;
      chart.add(floor);
    }

    const pathPoints = field.path.map((price, t) => {
      const height = sampleVolume(field.volumes[t], price);
      return new THREE.Vector3(
        timeToX(t),
        BASE_Y + height * MAX_BAR_HEIGHT + 0.17,
        priceToZ(price),
      );
    });
    const priceCurve = new THREE.CatmullRomCurve3(pathPoints, false, "catmullrom", 0.32);

    const priceTube = new THREE.Mesh(
      new THREE.TubeGeometry(priceCurve, 180, 0.018, 8, false),
      new THREE.MeshPhysicalMaterial({
        color: 0xf3fbff,
        emissive: 0x57dfff,
        emissiveIntensity: 1.6,
        metalness: 0.5,
        roughness: 0.1,
        iridescence: 1,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [80, 720],
        clearcoat: 1,
        envMapIntensity: 1.8,
      }),
    );
    chart.add(priceTube);

    const pathGlow = new THREE.Mesh(
      new THREE.TubeGeometry(priceCurve, 180, 0.058, 8, false),
      new THREE.MeshBasicMaterial({
        color: 0x6fe8ff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    chart.add(pathGlow);

    const marker = new THREE.Group();
    const markerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    const markerHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0x74edff,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    marker.add(markerCore, markerHalo);
    chart.add(marker);

    const dropGeometry = new THREE.BufferGeometry();
    const dropPositions = new Float32Array(6);
    const dropAttribute = new THREE.Float32BufferAttribute(dropPositions, 3);
    dropGeometry.setAttribute("position", dropAttribute);
    const dropLine = new THREE.Line(
      dropGeometry,
      new THREE.LineBasicMaterial({
        color: 0x83e9ff,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    );
    chart.add(dropLine);

    const scanLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.018, PRICE_SPAN + 0.35),
      new THREE.MeshBasicMaterial({
        color: 0xa8f4ff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    scanLine.position.set(-TIME_SPAN / 2, BASE_Y + 0.02, 0);
    chart.add(scanLine);

    const setMarker = (position: THREE.Vector3) => {
      marker.position.copy(position);
      dropPositions[0] = position.x;
      dropPositions[1] = BASE_Y;
      dropPositions[2] = position.z;
      dropPositions[3] = position.x;
      dropPositions[4] = position.y;
      dropPositions[5] = position.z;
      dropAttribute.needsUpdate = true;
    };

    const initialMarker = priceCurve.getPointAt(0.52);
    setMarker(initialMarker);

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    let inView = true;

    const clock = new THREE.Clock();

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = host.getBoundingClientRect();
      pointerTargetX = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2),
      );
      pointerTargetY = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2),
      );
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

      chart.rotation.y = -0.06 + pointerX * 0.1 + Math.sin(time * 0.16) * 0.018;
      chart.rotation.x = pointerY * 0.012;

      camera.position.x = cameraHome.x + pointerX * 0.28;
      camera.position.y = cameraHome.y - pointerY * 0.2;
      camera.lookAt(cameraTarget);

      const scanProgress = (time * 0.052) % 1;
      const scanX = -TIME_SPAN / 2 + scanProgress * TIME_SPAN;
      scanLine.position.x = scanX;

      const travel = (time * 0.043) % 1;
      const markerPoint = priceCurve.getPointAt(travel);
      setMarker(markerPoint);
      const pulse = 1 + Math.sin(time * 3.1) * 0.12;
      markerHalo.scale.setScalar(pulse);

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
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      });
      floorTexture?.dispose();
      environment?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      delete host.dataset.live;
    };
  }, []);

  return (
    <div className="iridescent-stage" ref={hostRef} aria-hidden="true">
      <div className="iridescent-fallback">
        <div className="profile-fallback">
          {FALLBACK_HEIGHTS.map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
      <div className="chart-hud">
        <span>
          <i className="hud-time" /> time
        </span>
        <span>
          <i className="hud-price" /> price
        </span>
        <span>
          <i className="hud-volume" /> volume
        </span>
        <small>illustrative 1-minute tape</small>
      </div>
    </div>
  );
}
