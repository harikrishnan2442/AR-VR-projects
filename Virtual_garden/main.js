import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Flashcard } from './Flashcard.js';
import { Butterfly } from './Butterfly.js';
import { GardenEnvironment } from './GardenEnvironment.js';

class GardenOfWisdom {
    constructor() {
        this.init();
        this.createScene();
        this.createLights();
        this.createFlashcards();
        this.createButterflies();
        this.createEnvironment();
        this.setupInteraction();
        this.animate();
        
        // Hide loading screen after everything is set up
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1500);
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x9dc99d);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 8);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 2.1;
        this.controls.target.set(0, 2, 0);
        
        // WASD Movement controls
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };
        this.moveSpeed = 0.15; // Movement speed
        
        // Raycaster for interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.pointerCursor = document.getElementById('pointerCursor');
        
        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Keyboard event listeners for WASD
        window.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        window.addEventListener('keyup', (e) => this.onKeyUp(e), false);
        
        // Clock for animations
        this.clock = new THREE.Clock();
    }

    createScene() {
        // Add subtle ambient cube map for reflections
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        
        // Create simple gradient environment
        const gradientCanvas = document.createElement('canvas');
        gradientCanvas.width = 512;
        gradientCanvas.height = 512;
        const ctx = gradientCanvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#b3d9b3');
        gradient.addColorStop(0.5, '#9dc99d');
        gradient.addColorStop(1, '#7ab37a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        const texture = new THREE.CanvasTexture(gradientCanvas);
        this.scene.environment = texture;
    }

    createLights() {
        // Soft ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xfff5e6, 0.8);
        directionalLight.position.set(10, 15, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0xb3d9ff, 0.3);
        fillLight.position.set(-10, 10, -5);
        this.scene.add(fillLight);
        
        // Soft hemisphere light for natural outdoor lighting
        const hemisphereLight = new THREE.HemisphereLight(
            0xb3d9ff,  // Sky color
            0x5a8a5a,  // Ground color
            0.4
        );
        this.scene.add(hemisphereLight);
        
        // Accent point lights for magical atmosphere
        const accentLight1 = new THREE.PointLight(0xffb3d9, 0.5, 10);
        accentLight1.position.set(-5, 2, -5);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0xd9b3ff, 0.5, 10);
        accentLight2.position.set(5, 2, 5);
        this.scene.add(accentLight2);
    }

    createFlashcards() {
        // Collection of inspiring quotes
        const quotes = [
            { quote: "Clearing space for better things to enter.", author: "Me" },
            { quote: "Trusting the timing of my bloom.", author: "Me" },
            { quote: "Inhaling hope. Exhaling the rest.", author: "Me" },
            { quote: "Walking gently into my lighter days.", author: "Me" },
            { quote: "Beautifully unfolding.", author: "Me" },
            { quote: "Quiet ghost, soft haunting.", author: "Me" },
            { quote: "Love is the only echo that defies the void.", author: "Me" },
            { quote: "The universe dances in the silence of your soul.", author: "Me" },
            { quote: "Listen to the static; the stars are speaking.", author: "Me" },
            { quote: "Let the wind carry what your heart can no longer hold.", author: "Me" }
        ];
        
        this.flashcards = [];
        
       
 const arrangements = [
    { x: -18, y: 2.5, z: -8 },
    { x: -14, y: 2.5, z: -8 },
    { x: -10, y: 2.5, z: -8 },
    { x: -6,  y: 2.5, z: -8 },
    { x: -2,  y: 2.5, z: -8 },
    { x: 2,   y: 2.5, z: -8 },
    { x: 6,   y: 2.5, z: -8 },
    { x: 10,  y: 2.5, z: -8 },
    { x: 14,  y: 2.5, z: -8 },
    { x: 18,  y: 2.5, z: -8 }
];


        
        quotes.forEach((quoteData, index) => {
            const flashcard = new Flashcard(
                quoteData.quote,
                quoteData.author,
                arrangements[index]
            );
            this.flashcards.push(flashcard);
            this.scene.add(flashcard.getMesh());
        });
    }

    createButterflies() {
        this.butterflies = [];
        
        // Position butterflies artfully around the scene
        const butterflyPositions = [
            { x: -4, y: 3.5, z: -2 },
            { x: 4, y: 3.2, z: -3 },
            { x: -2, y: 4, z: 1 },
            { x: 3, y: 3.8, z: 2 },
            { x: 0, y: 4.5, z: -1 },
            { x: -5, y: 2.5, z: 3 },
            { x: 6, y: 3, z: 1 }
        ];
        
        butterflyPositions.forEach(pos => {
            const butterfly = new Butterfly(pos);
            this.butterflies.push(butterfly);
            this.scene.add(butterfly.getMesh());
        });
    }

    createEnvironment() {
        this.environment = new GardenEnvironment(this.scene);
    }

    setupInteraction() {
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
    }

    // WASD Keyboard Controls
    onKeyDown(event) {
        const key = event.key.toLowerCase();
        if (key === 'w') this.keys.w = true;
        if (key === 'a') this.keys.a = true;
        if (key === 's') this.keys.s = true;
        if (key === 'd') this.keys.d = true;
    }

    onKeyUp(event) {
        const key = event.key.toLowerCase();
        if (key === 'w') this.keys.w = false;
        if (key === 'a') this.keys.a = false;
        if (key === 's') this.keys.s = false;
        if (key === 'd') this.keys.d = false;
    }

    updateCameraPosition() {
        // Get camera's forward and right vectors
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // Forward direction (where camera is looking, projected on XZ plane)
        this.camera.getWorldDirection(forward);
        forward.y = 0; // Keep movement on ground plane
        forward.normalize();
        
        // Right direction (perpendicular to forward)
        right.crossVectors(forward, this.camera.up).normalize();
        
        // Calculate movement
        const movement = new THREE.Vector3();
        
        if (this.keys.w) movement.add(forward.multiplyScalar(this.moveSpeed));
        if (this.keys.s) movement.add(forward.multiplyScalar(-this.moveSpeed));
        if (this.keys.a) movement.add(right.multiplyScalar(-this.moveSpeed));
        if (this.keys.d) movement.add(right.multiplyScalar(this.moveSpeed));
        
        // Apply movement to camera and controls target
        this.camera.position.add(movement);
        this.controls.target.add(movement);
    }

    onMouseMove(event) {
        // Update mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update custom cursor position
        this.pointerCursor.style.left = event.clientX - 10 + 'px';
        this.pointerCursor.style.top = event.clientY - 10 + 'px';
        this.pointerCursor.style.display = 'block';
        
        // Check for flashcard hover
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        let hovering = false;
        this.flashcards.forEach(flashcard => {
            const intersects = this.raycaster.intersectObject(flashcard.getMesh(), true);
            if (intersects.length > 0) {
                hovering = true;
            }
        });
        
        if (hovering) {
            this.pointerCursor.classList.add('active');
            this.renderer.domElement.style.cursor = 'pointer';
        } else {
            this.pointerCursor.classList.remove('active');
            this.renderer.domElement.style.cursor = 'grab';
        }
    }

    onMouseClick(event) {
        // Update mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to detect flashcard clicks
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        this.flashcards.forEach(flashcard => {
            const intersects = this.raycaster.intersectObject(flashcard.getMesh(), true);
            if (intersects.length > 0) {
                flashcard.flip();
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const elapsedTime = this.clock.getElapsedTime();
        const deltaTime = this.clock.getDelta();
        
        // Update WASD camera movement
        this.updateCameraPosition();
        
        // Update controls
        this.controls.update();
        
        // Update flashcards
        this.flashcards.forEach(flashcard => {
            flashcard.update(elapsedTime);
        });
        
        // Update butterflies (pass delta time for animation mixer)
        this.butterflies.forEach(butterfly => {
            butterfly.update(elapsedTime, deltaTime);
        });
        
        // Update environment
        this.environment.update(elapsedTime);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the experience
new GardenOfWisdom();