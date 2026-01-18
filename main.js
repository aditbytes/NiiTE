/**
 * NITE Landing Page - Main JavaScript
 * Three.js visualizations + GSAP animations
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initHeroScene();
  initProblemScene();
  initVisionScene();
  initGameplayVisual();
  initScrollAnimations();
  initDashboardAnimations();
  initParallax();
});

// ============================================
// HERO SECTION - Three.js City Grid
// ============================================

function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0f, 1);

  // City grid
  const gridSize = 20;
  const spacing = 3;
  const nodes = [];
  const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  
  // Create venue nodes
  for (let x = -gridSize / 2; x < gridSize / 2; x++) {
    for (let z = -gridSize / 2; z < gridSize / 2; z++) {
      if (Math.random() > 0.7) {
        const intensity = Math.random();
        const color = new THREE.Color().setHSL(0.75 + Math.random() * 0.15, 0.8, 0.5 + intensity * 0.3);
        const nodeMaterial = new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: 0.8
        });
        
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.set(
          x * spacing + (Math.random() - 0.5) * spacing * 0.5,
          Math.random() * 0.5,
          z * spacing + (Math.random() - 0.5) * spacing * 0.5
        );
        node.userData = {
          baseY: node.position.y,
          pulseSpeed: 0.5 + Math.random() * 2,
          pulseOffset: Math.random() * Math.PI * 2,
          intensity: intensity
        };
        
        scene.add(node);
        nodes.push(node);
      }
    }
  }

  // Create connection lines between nearby nodes
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xa855f7, 
    transparent: true, 
    opacity: 0.15 
  });
  
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].position.distanceTo(nodes[j].position);
      if (dist < spacing * 2 && Math.random() > 0.5) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position,
          nodes[j].position
        ]);
        const line = new THREE.Line(geometry, lineMaterial.clone());
        line.userData = { nodeA: nodes[i], nodeB: nodes[j] };
        scene.add(line);
        connections.push(line);
      }
    }
  }

  // Ground grid
  const groundGrid = new THREE.GridHelper(100, 50, 0x1a1a25, 0x1a1a25);
  groundGrid.position.y = -0.5;
  groundGrid.material.opacity = 0.3;
  groundGrid.material.transparent = true;
  scene.add(groundGrid);

  // Camera position
  camera.position.set(0, 25, 35);
  camera.lookAt(0, 0, 0);

  // Mouse parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Pulse nodes
    nodes.forEach(node => {
      const pulse = Math.sin(time * node.userData.pulseSpeed + node.userData.pulseOffset);
      node.position.y = node.userData.baseY + pulse * 0.3;
      node.scale.setScalar(1 + pulse * 0.2 * node.userData.intensity);
      node.material.opacity = 0.6 + pulse * 0.4 * node.userData.intensity;
    });

    // Update connection lines
    connections.forEach(line => {
      const points = [
        line.userData.nodeA.position.clone(),
        line.userData.nodeB.position.clone()
      ];
      line.geometry.setFromPoints(points);
    });

    // Smooth camera movement
    targetX += (mouseX * 5 - targetX) * 0.02;
    targetY += (mouseY * 3 - targetY) * 0.02;
    camera.position.x = targetX;
    camera.position.y = 25 + targetY;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // GSAP intro animation
  gsap.to('.hero-headline', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.5,
    ease: 'power3.out'
  });

  gsap.to('.hero-subtext', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.9,
    ease: 'power3.out'
  });

  gsap.to('.hero-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 1.3,
    ease: 'power3.out'
  });

  // Camera zoom intro
  gsap.from(camera.position, {
    z: 60,
    y: 40,
    duration: 2.5,
    delay: 0.2,
    ease: 'power2.out'
  });

  animate();

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ============================================
// PROBLEM SECTION - Glitch/Noise Canvas
// ============================================

function initProblemScene() {
  const canvas = document.getElementById('problem-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  let time = 0;
  const stars = [];
  
  // Create fake stars
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random()
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Clear with fade
    ctx.fillStyle = 'rgba(18, 18, 26, 0.1)';
    ctx.fillRect(0, 0, w, h);

    // Draw glitchy stars (representing fake/unreliable data)
    stars.forEach(star => {
      const glitch = Math.random() > 0.95;
      
      if (glitch) {
        star.opacity = Math.random();
        star.x += (Math.random() - 0.5) * 0.1;
      }

      ctx.beginPath();
      ctx.arc(
        star.x * w, 
        star.y * h, 
        star.size * (1 + Math.sin(time * star.speed) * 0.3),
        0, 
        Math.PI * 2
      );
      
      const hue = 35 + Math.sin(time + star.x * 10) * 20; // Amber range
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${star.opacity * 0.5})`;
      ctx.fill();

      // Move star
      star.y += star.speed * 0.001;
      if (star.y > 1) star.y = 0;
    });

    // Add noise lines
    if (Math.random() > 0.9) {
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const y = Math.random() * h;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (Math.random() - 0.5) * 20);
      ctx.stroke();
    }
  }

  animate();
}

// ============================================
// VISION SECTION - Global Cities Map
// ============================================

function initVisionScene() {
  const canvas = document.getElementById('vision-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // City positions (normalized)
  const cities = [
    { x: 0.15, y: 0.35, name: 'NYC', active: false },
    { x: 0.42, y: 0.38, name: 'London', active: false },
    { x: 0.48, y: 0.42, name: 'Paris', active: false },
    { x: 0.55, y: 0.35, name: 'Berlin', active: false },
    { x: 0.75, y: 0.48, name: 'Tokyo', active: false },
    { x: 0.72, y: 0.58, name: 'Singapore', active: false },
    { x: 0.58, y: 0.55, name: 'Dubai', active: false },
    { x: 0.22, y: 0.55, name: 'Miami', active: false },
    { x: 0.20, y: 0.42, name: 'LA', active: false }
  ];

  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    // Draw connection lines between cities
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        if ((cities[i].active || cities[j].active) && Math.random() > 0.8) {
          ctx.beginPath();
          ctx.moveTo(cities[i].x * w, cities[i].y * h);
          ctx.lineTo(cities[j].x * w, cities[j].y * h);
          ctx.stroke();
        }
      }
    }

    // Draw cities
    cities.forEach((city, index) => {
      const x = city.x * w;
      const y = city.y * h;
      
      // Activate cities over time based on scroll
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      city.active = scrollProgress > 0.6 + index * 0.03;

      if (city.active) {
        // Glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 40 + Math.sin(time * 2 + index) * 10, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(x, y, 4 + Math.sin(time * 3 + index) * 1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dim inactive city
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  animate();
}

// ============================================
// GAMEPLAY VISUAL - Map Preview
// ============================================

function initGameplayVisual() {
  const container = document.querySelector('.gameplay-visual');
  if (!container) return;

  // Create a simple canvas for gameplay preview
  const canvas = document.createElement('canvas');
  canvas.id = 'gameplay-canvas';
  canvas.style.width = '100%';
  canvas.style.height = '400px';
  canvas.style.borderRadius = '12px';
  canvas.style.background = 'var(--bg-tertiary)';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Mini venues
  const venues = [];
  for (let i = 0; i < 15; i++) {
    venues.push({
      x: Math.random() * 0.8 + 0.1,
      y: Math.random() * 0.8 + 0.1,
      size: Math.random() * 15 + 10,
      energy: Math.random(),
      hue: Math.random() > 0.5 ? 280 : 180 // Purple or cyan
    });
  }

  // Avatar
  let avatarX = 0.5;
  let avatarY = 0.5;
  let targetX = 0.5;
  let targetY = 0.5;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width;
    targetY = (e.clientY - rect.top) / rect.height;
  });

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.02;

    const w = canvas.width / dpr;
    const h = 400;

    ctx.fillStyle = '#1a1a25';
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw venues
    venues.forEach((venue, i) => {
      const x = venue.x * w;
      const y = venue.y * h;
      const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;

      // Venue glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, venue.size * 2);
      gradient.addColorStop(0, `hsla(${venue.hue}, 80%, 50%, ${0.4 * venue.energy * pulse})`);
      gradient.addColorStop(1, `hsla(${venue.hue}, 80%, 50%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, venue.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Venue core
      ctx.fillStyle = `hsla(${venue.hue}, 80%, 60%, ${0.8 * pulse})`;
      ctx.fillRect(x - venue.size / 2, y - venue.size / 2, venue.size, venue.size);
    });

    // Move avatar toward target
    avatarX += (targetX - avatarX) * 0.05;
    avatarY += (targetY - avatarY) * 0.05;

    // Draw avatar
    const ax = avatarX * w;
    const ay = avatarY * h;
    
    // Avatar glow
    const avatarGradient = ctx.createRadialGradient(ax, ay, 0, ax, ay, 30);
    avatarGradient.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
    avatarGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = avatarGradient;
    ctx.beginPath();
    ctx.arc(ax, ay, 30, 0, Math.PI * 2);
    ctx.fill();

    // Avatar core
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(ax, ay, 8, 0, Math.PI * 2);
    ctx.fill();

    // Avatar direction indicator
    const angle = Math.atan2(targetY - avatarY, targetX - avatarX);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax + Math.cos(angle) * 20, ay + Math.sin(angle) * 20);
    ctx.stroke();
  }

  animate();
}

// ============================================
// SCROLL ANIMATIONS - GSAP ScrollTrigger
// ============================================

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Problem section - list items
  gsap.utils.toArray('.problem-list li').forEach((li, i) => {
    gsap.to(li, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#problem',
        start: 'top 60%'
      }
    });
  });

  // Solution section - data layers
  gsap.utils.toArray('.data-layer').forEach((layer, i) => {
    gsap.to(layer, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#solution',
        start: 'top 60%'
      }
    });
  });

  // Monetization cards
  gsap.utils.toArray('.monetization-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#monetization',
        start: 'top 60%'
      }
    });
  });

  // Section headers
  gsap.utils.toArray('section h2').forEach(h2 => {
    gsap.from(h2, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: h2,
        start: 'top 80%'
      }
    });
  });

  // Gameplay features
  gsap.utils.toArray('.gameplay-feature').forEach((feature, i) => {
    gsap.from(feature, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#gameplay',
        start: 'top 60%'
      }
    });
  });

  // Steps in How It Works
  gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.from(step, {
      opacity: 0,
      x: 50,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#how-it-works',
        start: 'top 60%'
      }
    });
  });

  // Vision text
  gsap.from('.vision-text', {
    opacity: 0,
    y: 30,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#vision',
      start: 'top 50%'
    }
  });
}

// ============================================
// DASHBOARD ANIMATIONS
// ============================================

function initDashboardAnimations() {
  const stats = [
    { id: 'stat-visitors', min: 180, max: 320, suffix: '' },
    { id: 'stat-energy', min: 6.5, max: 9.5, suffix: '', decimals: 1 },
    { id: 'stat-wait', min: 5, max: 25, suffix: 'm' },
    { id: 'stat-rating', min: 4.2, max: 4.9, suffix: '', decimals: 1 }
  ];

  stats.forEach(stat => {
    const el = document.getElementById(stat.id);
    if (!el) return;

    setInterval(() => {
      const value = stat.min + Math.random() * (stat.max - stat.min);
      const displayValue = stat.decimals ? value.toFixed(stat.decimals) : Math.round(value);
      el.textContent = displayValue + stat.suffix;
    }, 2000 + Math.random() * 1000);
  });
}

// ============================================
// PARALLAX EFFECTS
// ============================================

function initParallax() {
  let scrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Add any additional scroll-based parallax here
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ============================================
// STEP VISUALS - Particle animations
// ============================================

function initStepVisuals() {
  const stepIds = ['step-1-visual', 'step-2-visual', 'step-3-visual', 'step-4-visual'];
  
  stepIds.forEach((id, index) => {
    const container = document.getElementById(id);
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();

    const particles = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        size: Math.random() * 3 + 1
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.fillStyle = 'rgba(26, 26, 37, 0.2)';
      ctx.fillRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        const hue = [280, 35, 180, 280][index]; // Purple, amber, cyan, purple
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.6)`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      ctx.strokeStyle = `hsla(${[280, 35, 180, 280][index]}, 80%, 60%, 0.1)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.2) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x * w, particles[i].y * h);
            ctx.lineTo(particles[j].x * w, particles[j].y * h);
            ctx.stroke();
          }
        }
      }
    }

    animate();
  });
}

// Initialize step visuals after DOM load
document.addEventListener('DOMContentLoaded', initStepVisuals);
