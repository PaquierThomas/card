import Lenis from "lenis";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { slides } from "./data.js";

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);

const uniforms = {
  iTime: { value: 0 },
  iResolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
  scrollOffset: { value: 0 },
};
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: document.getElementById("vertexShader").textContent,
  fragmentShader: document.getElementById("fragmentShader").textContent,
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

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  uniforms.iResolution.value.set(width, height);
});

gsap.registerPlugin(ScrollTrigger);

const totalSlides = 4;
const zStep = 2500;
const initialZ = -22500;

function generateSlides() {
  console.log("🧱 generateSlides() appelée");
  const slider = document.querySelector(".slider");
  console.log("🔍 slider trouvé ?", slider);

  if (!slider) {
    console.error("❌ ERREUR: élément .slider introuvable !");
    return;
  }

  slider.innerHTML = "";
  console.log("🧹 slider vidé");

  for (let i = 1; i <= totalSlides; i++) {
    console.log(`📸 Création du slide ${i}`);
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.id = `slide-${i}`;

    // Position initiale Z
    const zPosition = initialZ + (i - 1) * zStep;
    slide.style.transform = `translateX(-50%) translateY(-50%) translateZ(${zPosition}px)`;

    // Si c’est la première slide → centrée
    let xOffset;

    if (i === 1) {
      xOffset = "0vw"; // première slide centrée
    } else {
      xOffset = i % 2 === 0 ? 400 : -400; // ensuite alternance droite/gauche
    }

    slide.dataset.xOffset = xOffset;
    slide.style.transform = `translate(-50%, -50%) translateZ(${zPosition}px) translateX(${xOffset})`;

    const slideImg = document.createElement("div");
    slideImg.className = "slide-img";

    const img = document.createElement("img");
    img.src = `./assets/img${i}.webp`; // corrigé pour debug

    const slideCopy = document.createElement("div");
    slideCopy.className = "slide-copy";
    slideCopy.innerHTML = `<p>${slides[i - 1]?.title || "no title"}</p><p>${slides[i - 1]?.id || "no id"}</p>`;

    slideImg.appendChild(img);
    slide.appendChild(slideImg);
    slide.appendChild(slideCopy);
    slider.appendChild(slide);

    // ⚠️ volontairement laissé tel quel pour détecter la faute
    try {
      const zPosition = initialZ + (i - 1) * zStep;
      console.log(`🧮 zPosition slide ${i}:`, zPosition);
    } catch (err) {
      console.error(`💥 Erreur calcul zPosition slide ${i}:`, err);
    }
  }
}

window.addEventListener("load", function () {
  console.log("🌍 window.load déclenché → génération des slides...");
  generateSlides();

  const slidesArray = gsap.utils.toArray(".slide");
  console.log("🎞️ Slides récupérés via GSAP:", slidesArray.length);

  function getInitialTranslateZ(slide) {
    return gsap.getProperty(slide, "z");
  }

  function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  ScrollTrigger.create({
    trigger: ".container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      uniforms.scrollOffset.value = self.progress;
    },
  });

  slidesArray.forEach((slide, index) => {
    const initialZVal = getInitialTranslateZ(slide);
    console.log(`🎚️ Slide ${index + 1} → initialZ:`, initialZVal);

    ScrollTrigger.create({
      trigger: ".container",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const zIncrement = progress * 22500;
        const currentZ = initialZVal + zIncrement;

        let opacity;
        if (currentZ >= -2500) {
          opacity = mapRange(currentZ, -2500, 0, 0, 1);
        } else {
          opacity = mapRange(currentZ, -5000, -2500, 0, 0);
        }

        slide.style.opacity = opacity;
        const xOffset = parseFloat(slide.dataset.xOffset);
        slide.style.transform = `translateX(calc(-50% + ${xOffset}px)) translateY(-50%) translateZ(${currentZ}px)`;
      },
    });
  });
});
