"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useMedicineStore } from '@/lib/medicine-store';

export function MedicineBottle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pillsRemaining, totalPills, name } = useMedicineStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(533, 533);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Less expensive shadow mapping
    containerRef.current.appendChild(renderer.domElement);

    // Controls - reduce update frequency
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1; // Increased for less frequent updates
    controls.rotateSpeed = 0.8;
    controls.enableZoom = false;

    // Simplified lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512; // Reduced shadow map size
    directionalLight.shadow.mapSize.height = 512;
    scene.add(directionalLight);

    // Simplified ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    plane.receiveShadow = true;
    scene.add(plane);

    // Create bottle
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // Bottle body - optimized geometry
    const bottleHeight = 4.7;
    const bottomRadius = 1.6;
    const topRadius = 1.55; // Slightly tapered for realism
    const bottleGeometry = new THREE.CylinderGeometry(
      topRadius, bottomRadius, bottleHeight, 32, 1, false // Increased segments for smoother look
    );
    
    // Optimized bottle material
    const bottleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe67300, // Darker orange color
      transparent: true,
      opacity: 0.92,
      roughness: 0.25, // Slightly smoother
      metalness: 0.1,
      clearcoat: 1.0, // Increased clearcoat
      clearcoatRoughness: 0.1,
      transmission: 0.2,
      thickness: 0.5,
      envMapIntensity: 1.2
    });
    
    const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottle.castShadow = true;
    bottleGroup.add(bottle);

    // Simplified cap
    const capHeight = 0.7; // Reduced height
    const capGeometry = new THREE.CylinderGeometry(topRadius, topRadius, capHeight, 24); // Reduced segments
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = bottleHeight / 2 + capHeight / 2;
    cap.castShadow = true;
    bottleGroup.add(cap);

    // Create a curved label that wraps around the bottle
    const createLabel = () => {
      // Remove existing label if any
      bottleGroup.children.forEach(child => {
        if (child.name === 'label') {
          bottleGroup.remove(child);
        }
      });
      
      // Create a canvas for the label - reduced size for better performance
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512; // Reduced from 1024
      labelCanvas.height = 256; // Reduced from 512
      const labelContext = labelCanvas.getContext('2d');
      
      if (labelContext) {
        // Background gradient
        const gradient = labelContext.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#fafafa');
        gradient.addColorStop(1, '#f5f5f5');
        
        labelContext.fillStyle = gradient;
        labelContext.fillRect(0, 0, 512, 256);
        
        // Add pharmacy-style border with double lines
        labelContext.strokeStyle = '#dddddd';
        labelContext.lineWidth = 2;
        labelContext.strokeRect(8, 8, 496, 240);
        labelContext.strokeRect(12, 12, 488, 232); // Double border
        
        // Add medication name
        labelContext.fillStyle = '#222222';
        labelContext.font = 'bold 32px Arial'; // Reduced from 40px
        labelContext.textAlign = 'center';
        labelContext.fillText(name.toUpperCase(), 256, 45);
        
        // Add divider lines
        labelContext.beginPath();
        labelContext.moveTo(40, 65);
        labelContext.lineTo(472, 65);
        labelContext.strokeStyle = '#cccccc';
        labelContext.lineWidth = 1;
        labelContext.stroke();
        
        // Add pill count
        labelContext.font = 'bold 40px Arial'; // Reduced from 50px
        labelContext.fillText(`${pillsRemaining}/${totalPills}`, 256, 110);
        labelContext.font = '20px Arial'; // Reduced from 24px
        labelContext.fillText('PILLS REMAINING', 256, 135);
        
        // Add warning text
        labelContext.fillStyle = '#cc0000';
        labelContext.font = 'bold 14px Arial'; // Reduced from 18px
        labelContext.fillText('KEEP OUT OF REACH OF CHILDREN', 256, 170);
        
        // Add RX number and expiration
        const startDate = new Date();
        const refillDate = new Date(startDate);
        refillDate.setDate(refillDate.getDate() + 28); // Changed from 30 to 28 days
        
        const expiryDate = refillDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        labelContext.fillStyle = '#444444';
        labelContext.font = '14px Arial'; // Reduced from 16px
        labelContext.textAlign = 'left';
        labelContext.fillText(`RX #: ${Math.random().toString().slice(2, 8)}`, 40, 200);
        labelContext.textAlign = 'right';
        labelContext.fillText(`REFILL AFTER: ${expiryDate}`, 472, 200);
        
        // Add pharmacy details
        labelContext.font = '12px Arial'; // New smaller text
        labelContext.textAlign = 'center';
        labelContext.fillStyle = '#666666';
        labelContext.fillText('PHARMACY NAME • (555) 555-5555', 256, 225);
        labelContext.fillText('123 PHARMACY ST, CITY, ST 12345', 256, 240);
      }
      
      // Create texture from canvas with optimized settings
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      labelTexture.minFilter = THREE.LinearFilter;
      labelTexture.generateMipmaps = false;
      
      // Optimized label geometry
      const labelRadius = bottomRadius + 0.01;
      const labelHeight = bottleHeight * 0.7;
      const labelGeometry = new THREE.CylinderGeometry(
        labelRadius, labelRadius, labelHeight, 32, 1, true // Reduced segments
      );
      
      // Create material with the texture
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      // Create the label mesh
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.name = 'label';
      label.position.y = -0.2;
      
      bottleGroup.add(label);
    };

    createLabel();

    // Pills inside (represented as small spheres)
    const pillsGroup = new THREE.Group();
    bottleGroup.add(pillsGroup);

    const updatePills = () => {
      // Clear existing pills
      while (pillsGroup.children.length > 0) {
        pillsGroup.remove(pillsGroup.children[0]);
      }

      // Show actual number of pills, but limit to 100 for performance
      const maxVisiblePills = Math.min(pillsRemaining, 100);
      const fillLevel = pillsRemaining / totalPills;

      // Create pills with varied shapes and colors
      for (let i = 0; i < maxVisiblePills; i++) {
        let pillGeometry;
        
        // Randomly choose between oval and round pills with more variation
        const pillType = Math.random() > 0.7 ? 'round' : 'oval';
        const pillSize = 0.15 + (Math.random() * 0.05); // Vary pill size slightly
        
        if (pillType === 'round') {
          pillGeometry = new THREE.SphereGeometry(pillSize, 16, 16);
        } else {
          // Create an oval pill using a scaled sphere with random elongation
          pillGeometry = new THREE.SphereGeometry(pillSize, 16, 16);
          const elongation = 0.4 + (Math.random() * 0.2); // Random elongation
          pillGeometry.scale(1, elongation, 1);
        }
        
        // Vary the pill colors more
        const hue = 0.85 + (Math.random() * 0.3); // More color variation
        const saturation = 0.95 + (Math.random() * 0.1);
        const pillMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(hue, saturation, hue),
          roughness: 0.4 + (Math.random() * 0.2),
          metalness: 0.1
        });
        
        const pill = new THREE.Mesh(pillGeometry, pillMaterial);
        
        // Position pills more randomly within the bottle
        const layer = Math.floor(i / 12); // Fewer pills per layer for more randomness
        const layerHeight = fillLevel * bottleHeight;
        const maxRadius = 0.85 * bottomRadius * (1 - layer * 0.1);
        
        // Random position within the layer's radius
        const radius = maxRadius * Math.sqrt(Math.random()); // Use sqrt for more uniform distribution
        const theta = Math.random() * Math.PI * 2;
        const heightVariation = Math.random() * 0.2; // Add random height variation
        
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        const y = (layer * 0.25) - (bottleHeight/2) + 0.3 + heightVariation;
        
        pill.position.set(
          x + (Math.random() * 0.1 - 0.05), // Add small random offset
          Math.min(y, layerHeight - bottleHeight/2),
          z + (Math.random() * 0.1 - 0.05)
        );
        
        // Random rotation on all axes
        pill.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        
        pillsGroup.add(pill);
      }
    };

    // Initial pill update
    updatePills();

    // Animation loop
    let autoRotate = true;
    let lastTime = 0;
    const animate = (time) => {
      requestAnimationFrame(animate);
      
      // Limit updates to ~60fps
      if (time - lastTime < 16) return;
      
      if (autoRotate) {
        bottleGroup.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
      
      lastTime = time;
    };
    
    animate();
    setIsLoaded(true);

    // Update pills when the count changes
    const updateBottleDisplay = () => {
      updatePills();
      createLabel(); // Update the label
    };

    // Event listeners
    const handleMouseEnter = () => {
      autoRotate = false;
    };

    const handleMouseLeave = () => {
      autoRotate = true;
    };

    containerRef.current.addEventListener('mouseenter', handleMouseEnter);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    // Watch for pill count changes
    const unsubscribe = useMedicineStore.subscribe(
      (state) => [state.pillsRemaining, state.totalPills, state.name],
      () => {
        updateBottleDisplay();
      }
    );

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        containerRef.current.removeChild(renderer.domElement);
      }
      unsubscribe();
    };
  }, [pillsRemaining, totalPills, name]);

  return (
    <div className="relative w-full flex justify-center items-center min-h-[400px]">
      <div 
        ref={containerRef} 
        className="w-[533px] h-[533px] cursor-grab active:cursor-grabbing max-w-[100vw] mx-auto"
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}