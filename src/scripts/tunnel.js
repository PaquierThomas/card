import Lenis from "lenis";
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import { slides } from "./data.js";

  console.log("patate")
  const lenis = new Lenis();
  console.log(lenis);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const container = document.getElementById('tunnel-container');

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    scrollOffset: { value: 0 }
  };

  const vertexShader = document.getElementById('vertexShader').textContent;
  const fragmentShader = document.getElementById('fragmentShader').textContent;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let lastTime = 0;
  function animateTunnel(time) {
    const deltaTime = time - lastTime;
    lastTime = time;
    uniforms.iTime.value += deltaTime * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animateTunnel);
  }

  animateTunnel(0);

  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    uniforms.iResolution.value.set(width, height);
  });
  