import * as THREE from 'three';

export class Flashcard {
    constructor(quote, author, position) {
        this.quote = quote;
        this.author = author;
        this.position = position;
        this.isFlipped = false;
        this.isAnimating = false;
        
        this.createCard();
    }

    createCard() {
        // Card group
        this.group = new THREE.Group();
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Card dimensions
        const width = 3;
        const height = 4;
        const depth = 0.05;
        const radius = 0.15;
        
        // Create rounded rectangle shape
        const shape = this.createRoundedRectShape(width, height, radius);
        
        // Geometry settings for thin, elegant card
        const extrudeSettings = {
            depth: depth,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 3
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        
        // Frosted glass material - front (quote hidden)
        this.frontMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xf8f8ff,
            transparent: false,
            opacity: 0.15,
            roughness: 0.1,
            metalness: 0.0,
            transmission: 0.9,
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide,
            envMapIntensity: 1.5
        });
        
        // Front card
        this.frontCard = new THREE.Mesh(geometry, this.frontMaterial);
        this.group.add(this.frontCard);
        
        // Back card (quote visible)
        this.backMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xfffff0,
            transparent: true,
            opacity: 0.2,
            roughness: 0.4,
            metalness: 0.0,
            transmission: 0.0,
            thickness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            side: THREE.DoubleSide,
            envMapIntensity: 1.5
        });
        
        this.backCard = new THREE.Mesh(geometry, this.backMaterial);
        this.backCard.rotation.y = Math.PI;
        this.backCard.visible = false;
        this.group.add(this.backCard);
        
        // Add text to back card
        this.createText();
        
        // Add subtle glow effect
        this.addGlowEffect(width, height);
        
        // Gentle floating animation
        this.floatOffset = Math.random() * Math.PI * 2;
        
        // Random slight rotation for natural look
        this.group.rotation.y = (Math.random() - 0.5) * 0.3;
        this.group.rotation.x = (Math.random() - 0.5) * 0.1;
    }

    createRoundedRectShape(width, height, radius) {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        
        shape.moveTo(x + radius, y);
        shape.lineTo(x + width - radius, y);
        shape.quadraticCurveTo(x + width, y, x + width, y + radius);
        shape.lineTo(x + width, y + height - radius);
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        shape.lineTo(x + radius, y + height);
        shape.quadraticCurveTo(x, y + height, x, y + height - radius);
        shape.lineTo(x, y + radius);
        shape.quadraticCurveTo(x, y, x + radius, y);
        
        return shape;
    }

    createText() {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1366;
        const context = canvas.getContext('2d');
        
        // 1. CLEAR BACKGROUND
        // We leave the canvas transparent because the "Cream" back material
        // we created above will serve as the background color.
        context.clearRect(0, 0, canvas.width, canvas.height);

        // 2. TEXT STYLING (The "Ink")
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Add a soft drop shadow to the text (improves readability)
        context.shadowColor = "rgba(0, 0, 0, 0.3)";
        context.shadowBlur = 15;
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;

        // Main Quote Text
        // Using a dark charcoal/green instead of pure black looks more elegant
        context.fillStyle = '#1a2e1a';
        context.font = '500 80px "Cormorant Garamond", serif'; // Slightly larger

        const words = this.quote.split(' ');
        let line = '';
        let y = 450; // Start higher up
        const lineHeight = 100;
        const maxWidth = 800; // Give it some padding from edges

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = context.measureText(testLine);

            if (metrics.width > maxWidth && line !== '') {
                context.fillText(line, canvas.width / 2, y);
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, canvas.width / 2, y);

        // Author Text
        context.fillStyle = '#3a5a3a'; // Slightly lighter green
        context.font = 'italic 300 52px "Cormorant Garamond", serif';
        context.fillText('— ' + this.author, canvas.width / 2, y + 180);

        // 3. THE TEXTURE
        const texture = new THREE.CanvasTexture(canvas);
        // Anisotropy makes text look sharp when viewed from angles
        texture.anisotropy = 16;
        texture.needsUpdate = true;

        // 4. THE MATERIAL (Matte Ink)
        // We use MeshStandardMaterial for the text so it interacts with light
        // but isn't "glassy". It looks like printed ink.
        const textMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,         // Fully visible ink
            roughness: 0.8,       // Matte ink texture
            metalness: 0.0,
            side: THREE.DoubleSide,
            alphaTest: 0.05       // Helps cut out the transparent parts cleanly
        });

        // 5. THE MESH
        const textGeometry = new THREE.PlaneGeometry(2.9, 3.9);
        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Lift it slightly off the card surface to avoid "z-fighting" (glitching)
        this.textMesh.position.z = 0.06; // Just above the card surface
        this.textMesh.rotation.y = Math.PI; // Face backwards initially
        this.textMesh.visible = false;      // Hidden until flipped

        this.group.add(this.textMesh);
    }

    addGlowEffect(width, height) {
        // Subtle rim light effect
        const glowGeometry = new THREE.PlaneGeometry(width + 0.1, height + 0.1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4e8d4,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.03;
        this.group.add(glow);
    }

   flip() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.isFlipped = !this.isFlipped;

        // 1. DETERMINE AXIS
        // If opening (Front -> Back), pick a random axis.
        // If closing (Back -> Front), use the axis we are already flipped on.
        let axis;
        if (this.isFlipped) {
            // Opening: Randomly choose X (vertical) or Y (horizontal)
            axis = Math.random() > 0.5 ? 'y' : 'x';
            this.activeAxis = axis; // Remember which way we went

            // 2. TEXT ORIENTATION FIX
            // If we flip vertically (X), the text on the back will be upside down
            // unless we pre-rotate it to compensate.
            if (axis === 'x') {
                this.textMesh.rotation.z = Math.PI;
                this.backCard.rotation.z = Math.PI; // Keep back material aligned too
            } else {
                this.textMesh.rotation.z = 0;
                this.backCard.rotation.z = 0;
            }
        } else {
            // Closing: Must use the same axis we opened with
            axis = this.activeAxis || 'y';
        }

        const targetRotation = this.isFlipped ? Math.PI : 0;

        // Calculate the difference needed to reach target
        // We use the current rotation as start point
        const startRotation = this.group.rotation[axis];
        const changeInRotation = targetRotation - startRotation;

        const duration = 800;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease in-out cubic function for smooth movement
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // 3. ANIMATE
            // Apply rotation only to the active axis
            this.group.rotation[axis] = startRotation + (changeInRotation * eased);

            // 4. VISIBILITY TOGGLE (At 50% of animation)
            if (progress > 0.5) {
                if (this.isFlipped && !this.textMesh.visible) {
                    this.frontCard.visible = false;
                    this.backCard.visible = true;
                    this.textMesh.visible = true;
                } else if (!this.isFlipped && this.textMesh.visible) {
                    this.frontCard.visible = true;
                    this.backCard.visible = false;
                    this.textMesh.visible = false;
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;

                // Optional: Ensure exact final value to prevent floating point drift
                this.group.rotation[axis] = targetRotation;
            }
        };

        animate();
    }

    update(time) {
        // Gentle floating animation
        const floatSpeed = 0.5;
        const floatAmount = 0.08;
        this.group.position.y = this.position.y + Math.sin(time * floatSpeed + this.floatOffset) * floatAmount;
        
        // Very subtle rotation
        const rotateSpeed = 0.2;
        const rotateAmount = 0.02;
        this.group.rotation.z = Math.sin(time * rotateSpeed + this.floatOffset) * rotateAmount;
    }

    getMesh() {
        return this.group;
    }
}
