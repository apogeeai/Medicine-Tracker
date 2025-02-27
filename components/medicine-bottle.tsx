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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400); // Increased size
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Add a point light to create highlights on the bottle
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(-3, 2, 3);
    scene.add(pointLight);

    // Ground plane for shadow
    const planeGeometry = new THREE.PlaneGeometry(15, 15);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    plane.receiveShadow = true;
    scene.add(plane);

    // Create bottle
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // Bottle body - more realistic shape with slight taper
    const bottleHeight = 3.5;
    const bottomRadius = 1.2;
    const topRadius = 1.1;
    const bottleGeometry = new THREE.CylinderGeometry(
      topRadius, bottomRadius, bottleHeight, 32, 1, false
    );
    
    // Create a more realistic bottle material with subsurface scattering effect
    const bottleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff8c00, // Orange
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.2, // Slight transparency
      thickness: 0.5,   // Thickness for subsurface scattering
      envMapIntensity: 1.5
    });
    
    const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
    bottle.castShadow = true;
    bottleGroup.add(bottle);

    // Bottle neck - narrower section at the top
    const neckGeometry = new THREE.CylinderGeometry(0.8, topRadius, 0.5, 32);
    const neck = new THREE.Mesh(neckGeometry, bottleMaterial);
    neck.position.y = bottleHeight / 2 + 0.25;
    neck.castShadow = true;
    bottleGroup.add(neck);

    // Bottle cap - more detailed with ridges
    const capGroup = new THREE.Group();
    
    // Main cap
    const capGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.7, 32);
    const capMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.castShadow = true;
    capGroup.add(cap);
    
    // Cap ridges
    const ridgeGeometry = new THREE.CylinderGeometry(0.92, 0.92, 0.1, 32, 1, false);
    const ridgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.5
    });
    
    // Add multiple ridges to the cap
    for (let i = -0.25; i <= 0.25; i += 0.15) {
      const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
      ridge.position.y = i;
      ridge.castShadow = true;
      capGroup.add(ridge);
    }
    
    // Position the cap group
    capGroup.position.y = bottleHeight / 2 + 0.75;
    bottleGroup.add(capGroup);

    // Create a curved label that wraps around the bottle
    const createLabel = () => {
      // Remove existing label if any
      bottleGroup.children.forEach(child => {
        if (child.name === 'label') {
          bottleGroup.remove(child);
        }
      });
      
      // Create a canvas for the label
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 1024;
      labelCanvas.height = 512;
      const labelContext = labelCanvas.getContext('2d');
      
      if (labelContext) {
        // Background gradient
        const gradient = labelContext.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f0f0f0');
        
        labelContext.fillStyle = gradient;
        labelContext.fillRect(0, 0, 1024, 512);
        
        // Add a border
        labelContext.strokeStyle = '#cccccc';
        labelContext.lineWidth = 8;
        labelContext.strokeRect(10, 10, 1004, 492);
        
        // Add medication name
        labelContext.fillStyle = '#333333';
        labelContext.font = 'bold 60px Arial';
        labelContext.textAlign = 'center';
        labelContext.fillText(name.toUpperCase(), 512, 100);
        
        // Add a divider line
        labelContext.beginPath();
        labelContext.moveTo(100, 130);
        labelContext.lineTo(924, 130);
        labelContext.strokeStyle = '#999999';
        labelContext.lineWidth = 3;
        labelContext.stroke();
        
        // Add pill count
        labelContext.font = 'bold 80px Arial';
        labelContext.fillText(`${pillsRemaining}/${totalPills}`, 512, 250);
        labelContext.font = '40px Arial';
        labelContext.fillText('PILLS REMAINING', 512, 310);
        
        // Add warning text
        labelContext.fillStyle = '#cc0000';
        labelContext.font = 'bold 30px Arial';
        labelContext.fillText('KEEP OUT OF REACH OF CHILDREN', 512, 400);
        
        // Add expiration date
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const expiryDate = futureDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        labelContext.fillStyle = '#333333';
        labelContext.font = '30px Arial';
        labelContext.fillText(`EXP: ${expiryDate}`, 512, 450);
      }
      
      // Create texture from canvas
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      
      // Create a cylinder geometry for the label (slightly larger than the bottle)
      const labelRadius = bottomRadius + 0.01;
      const labelHeight = bottleHeight * 0.7;
      const labelGeometry = new THREE.CylinderGeometry(
        labelRadius, labelRadius, labelHeight, 64, 1, true
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
      label.position.y = -0.2; // Position it slightly below center
      
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

      // Calculate fill level based on remaining pills
      const fillLevel = pillsRemaining / totalPills;
      const maxPills = 50; // Increased number of visible pills
      const pillsToShow = Math.ceil(maxPills * fillLevel);

      // Create pills with varied shapes and colors
      for (let i = 0; i < pillsToShow; i++) {
        let pillGeometry;
        
        // Randomly choose between oval and round pills
        const pillType = Math.random() > 0.5 ? 'round' : 'oval';
        
        if (pillType === 'round') {
          pillGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        } else {
          // Create an oval pill using a scaled sphere
          pillGeometry = new THREE.SphereGeometry(0.15, 16, 16);
          pillGeometry.scale(1, 0.5, 1);
        }
        
        // Slightly vary the pill colors
        const hue = Math.random() * 0.1 + 0.9; // Slight variation around white
        const pillMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(hue, hue, hue),
          roughness: 0.5
        });
        
        const pill = new THREE.Mesh(pillGeometry, pillMaterial);
        
        // Random position within the bottle
        const radius = 0.8 * bottomRadius;
        const theta = Math.random() * Math.PI * 2;
        const y = Math.random() * fillLevel * bottleHeight - bottleHeight/2;
        
        pill.position.x = radius * Math.cos(theta);
        pill.position.z = radius * Math.sin(theta);
        pill.position.y = y;
        
        // Random rotation
        pill.rotation.x = Math.random() * Math.PI;
        pill.rotation.y = Math.random() * Math.PI;
        pill.rotation.z = Math.random() * Math.PI;
        
        pillsGroup.add(pill);
      }
    };

    // Initial pill update
    updatePills();

    // Animation loop
    let autoRotate = true;
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (autoRotate) {
        bottleGroup.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
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
    <div className="relative">
      <div 
        ref={containerRef} 
        className="w-[400px] h-[400px] mx-auto cursor-grab active:cursor-grabbing"
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