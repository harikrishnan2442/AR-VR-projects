import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class GardenEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.treeModelsLoaded = 0;
        this.createEnvironment();
    }

    createEnvironment() {
        // Ground - lush grass
        this.createGround();
        
        // Flowers scattered around
        this.createFlowers();
        
        // Trees for depth - now using GLB models
        this.createTrees();
        
        // Atmospheric fog
        this.scene.fog = new THREE.Fog(0x9dc99d, 10, 60);
        
        // Ambient particles (pollen/dust motes)
        this.createAtmosphericParticles();
    }

    createGround() {
        // Main grass ground
        const groundGeometry = new THREE.CircleGeometry(50, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a8a5a,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add texture variation with slightly darker patches
        const patches = 15;
        for (let i = 0; i < patches; i++) {
            const patchGeometry = new THREE.CircleGeometry(
                1 + Math.random() * 2,
                32
            );
            const patchMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a7a4a,
                roughness: 0.95,
                metalness: 0.0
            });
            
            const patch = new THREE.Mesh(patchGeometry, patchMaterial);
            patch.rotation.x = -Math.PI / 2;
            patch.position.y = 0.01;
            patch.position.x = (Math.random() - 0.5) * 40;
            patch.position.z = (Math.random() - 0.5) * 40;
            this.scene.add(patch);
        }
        
        // Small grass tufts
        this.createGrassTufts();
    }

    createGrassTufts() {
        const tuftGeometry = new THREE.ConeGeometry(0.05, 0.3, 4);
        const tuftMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a9a6a,
            roughness: 0.8,
            flatShading: true
        });
        
        for (let i = 0; i < 200; i++) {
            const tuft = new THREE.Mesh(tuftGeometry, tuftMaterial);
            tuft.position.x = (Math.random() - 0.5) * 45;
            tuft.position.y = 0.15;
            tuft.position.z = (Math.random() - 0.5) * 45;
            tuft.rotation.y = Math.random() * Math.PI * 2;
            tuft.rotation.z = (Math.random() - 0.5) * 0.2;
            tuft.scale.y = 0.8 + Math.random() * 0.4;
            this.scene.add(tuft);
        }
    }

    createFlowers() {
        // Scattered wildflowers (keeping procedural flowers)
        const colors = [
            0xffb3d9, // Pink
            0xffd9b3, // Peach
            0xd9b3ff, // Lavender
            0xffffb3, // Pale yellow
            0xb3d9ff  // Light blue
        ];
        
        for (let i = 0; i < 100; i++) {
            const flowerGroup = new THREE.Group();
            
            // Stem
            const stemGeometry = new THREE.CylinderGeometry(0.01, 0.015, 0.5, 4);
            const stemMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a7a4a,
                roughness: 0.7
            });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.25;
            flowerGroup.add(stem);
            
            // Flower petals
            const petalGeometry = new THREE.CircleGeometry(0.08, 5);
            const petalMaterial = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.4,
                side: THREE.DoubleSide
            });
            
            // Create 5-6 petals in a circle
            const petalCount = 5 + Math.floor(Math.random() * 2);
            for (let j = 0; j < petalCount; j++) {
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (j / petalCount) * Math.PI * 2;
                petal.position.x = Math.cos(angle) * 0.06;
                petal.position.y = 0.5 + Math.sin(angle) * 0.06;
                petal.position.z = Math.sin(angle) * 0.06;
                petal.lookAt(0, 0.5, 0);
                flowerGroup.add(petal);
            }
            
            // Center of flower
            const centerGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const centerMaterial = new THREE.MeshStandardMaterial({
                color: 0xffeb3b,
                roughness: 0.3
            });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.5;
            flowerGroup.add(center);
            
            // Position in garden
            flowerGroup.position.x = (Math.random() - 0.5) * 45;
            flowerGroup.position.z = (Math.random() - 0.5) * 45;
            flowerGroup.rotation.y = Math.random() * Math.PI * 2;
            flowerGroup.scale.setScalar(0.8 + Math.random() * 0.5);
            
            this.scene.add(flowerGroup);
        }
    }

    createTrees() {
        // Load GLB tree models around the perimeter
        const loader = new GLTFLoader();
        
        for (let i = 0; i < 10; i++) {
            loader.load(
                './models/stylized_tree.glb',
                (gltf) => {
                    const tree = gltf.scene.clone();
                    
                    // Scale the tree
                    tree.scale.setScalar(0.01 + Math.random() * 0.009);
                    
                    // Position trees in a circle around the scene
                    const angle = (i / 10) * Math.PI * 2;
                    const radius = 30 + Math.random() * 10;
                    tree.position.x = Math.cos(angle) * radius;
                    tree.position.z = Math.sin(angle) * radius;
                    tree.position.y = 0;
                    
                    // Random rotation
                    tree.rotation.y = Math.random() * Math.PI * 2;
                    
                    // Enable shadows
                    tree.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    this.scene.add(tree);
                    this.treeModelsLoaded++;
                },
                undefined,
                (error) => {
                    console.error('Error loading tree model:', error);
                    // Fallback: create simple tree
                    this.createFallbackTree(i);
                }
            );
        }
    }

    createFallbackTree(index) {
        // Fallback tree if GLB fails to load
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x5d4037,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        treeGroup.add(trunk);
        
        // Foliage
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7a4a,
            roughness: 0.8
        });
        
        const foliagePositions = [
            { x: 0, y: 4.5, z: 0, scale: 2.2 },
            { x: 0.5, y: 5.2, z: 0.3, scale: 1.8 },
            { x: -0.4, y: 5.0, z: -0.2, scale: 1.6 }
        ];
        
        foliagePositions.forEach(pos => {
            const foliageGeometry = new THREE.SphereGeometry(pos.scale, 8, 8);
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.set(pos.x, pos.y, pos.z);
            treeGroup.add(foliage);
        });
        
        // Position
        const angle = (index / 12) * Math.PI * 2;
        const radius = 30 + Math.random() * 10;
        treeGroup.position.x = Math.cos(angle) * radius;
        treeGroup.position.z = Math.sin(angle) * radius;
        treeGroup.scale.setScalar(0.8 + Math.random() * 0.4);
        
        this.scene.add(treeGroup);
    }

    createAtmosphericParticles() {
        // Gentle floating particles for atmosphere
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 50;
            positions[i + 1] = Math.random() * 10;
            positions[i + 2] = (Math.random() - 0.5) * 50;
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    update(time) {
        // Gentle particle drift
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + positions[i]) * 0.001;
                
                // Reset if too high
                if (positions[i + 1] > 10) {
                    positions[i + 1] = 0;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
}