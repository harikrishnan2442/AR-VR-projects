import * as THREE from 'three';

export class Butterfly {
    constructor(position) {
        this.position = position;
        this.createButterfly();
    }

    createButterfly() {
        this.group = new THREE.Group();
        this.group.position.set(this.position.x, this.position.y, this.position.z);
        
        // Butterfly body
        const bodyGeometry = new THREE.CapsuleGeometry(0.03, 0.15, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a1a2a,
            roughness: 0.4,
            metalness: 0.6
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        this.group.add(body);
        
        // Antennae
        const antennaGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4);
        const antennaMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a0a1a,
            roughness: 0.3
        });
        
        const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        leftAntenna.position.set(-0.08, 0.05, 0.02);
        leftAntenna.rotation.z = -0.5;
        this.group.add(leftAntenna);
        
        const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        rightAntenna.position.set(-0.08, -0.05, 0.02);
        rightAntenna.rotation.z = 0.5;
        this.group.add(rightAntenna);
        
        // Create wings
        this.createWings();
        
        // Random rotation for variety
        this.group.rotation.y = Math.random() * Math.PI * 2;
        this.group.rotation.x = (Math.random() - 0.5) * 0.3;
        
        // Animation properties
        this.wingFlutterSpeed = 8 + Math.random() * 4;
        this.wingFlutterOffset = Math.random() * Math.PI * 2;
    }

    createWings() {
        // Wing shape - elegant curves
        const wingShape = new THREE.Shape();
        
        // Upper wing (larger)
        wingShape.moveTo(0, 0);
        wingShape.bezierCurveTo(0.15, 0.1, 0.25, 0.2, 0.3, 0.35);
        wingShape.bezierCurveTo(0.25, 0.4, 0.15, 0.42, 0.05, 0.4);
        wingShape.bezierCurveTo(0.02, 0.35, 0, 0.25, 0, 0.15);
        wingShape.bezierCurveTo(0, 0.1, 0, 0.05, 0, 0);
        
        const wingGeometry = new THREE.ShapeGeometry(wingShape);
        
        // Beautiful pink gradient material
        const wingMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffb3d9,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            roughness: 0.2,
            metalness: 0.1,
            clearcoat: 0.5,
            clearcoatRoughness: 0.3,
            transmission: 0.1,
            thickness: 0.5
        });
        
        // Left upper wing
        this.leftUpperWing = new THREE.Mesh(wingGeometry, wingMaterial);
        this.leftUpperWing.position.set(0, 0.05, 0);
        this.leftUpperWing.rotation.y = Math.PI;
        this.group.add(this.leftUpperWing);
        
        // Right upper wing
        this.rightUpperWing = new THREE.Mesh(wingGeometry, wingMaterial);
        this.rightUpperWing.position.set(0, -0.05, 0);
        this.group.add(this.rightUpperWing);
        
        // Lower wing (smaller)
        const lowerWingShape = new THREE.Shape();
        lowerWingShape.moveTo(0, 0);
        lowerWingShape.bezierCurveTo(0.12, -0.08, 0.2, -0.15, 0.25, -0.25);
        lowerWingShape.bezierCurveTo(0.2, -0.28, 0.12, -0.3, 0.05, -0.28);
        lowerWingShape.bezierCurveTo(0.02, -0.2, 0, -0.1, 0, 0);
        
        const lowerWingGeometry = new THREE.ShapeGeometry(lowerWingShape);
        
        const lowerWingMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffc9e0,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            roughness: 0.25,
            metalness: 0.05,
            clearcoat: 0.4,
            clearcoatRoughness: 0.4,
            transmission: 0.15,
            thickness: 0.5
        });
        
        // Left lower wing
        this.leftLowerWing = new THREE.Mesh(lowerWingGeometry, lowerWingMaterial);
        this.leftLowerWing.position.set(0, 0.05, 0);
        this.leftLowerWing.rotation.y = Math.PI;
        this.group.add(this.leftLowerWing);
        
        // Right lower wing
        this.rightLowerWing = new THREE.Mesh(lowerWingGeometry, lowerWingMaterial);
        this.rightLowerWing.position.set(0, -0.05, 0);
        this.group.add(this.rightLowerWing);
        
        // Add delicate patterns
        this.addWingPatterns();
    }

    addWingPatterns() {
        // Small decorative dots on wings
        const dotGeometry = new THREE.CircleGeometry(0.02, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0xff80c0,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        // Dots on upper wings
        const positions = [
            { x: 0.1, y: 0.2 },
            { x: 0.15, y: 0.3 },
            { x: 0.08, y: 0.25 }
        ];
        
        positions.forEach(pos => {
            // Left wing dots
            const dotLeft = new THREE.Mesh(dotGeometry, dotMaterial);
            dotLeft.position.set(pos.x, pos.y + 0.05, 0.001);
            dotLeft.rotation.y = Math.PI;
            this.group.add(dotLeft);
            
            // Right wing dots
            const dotRight = new THREE.Mesh(dotGeometry, dotMaterial);
            dotRight.position.set(pos.x, -pos.y - 0.05, 0.001);
            this.group.add(dotRight);
        });
    }

    update(time) {
        // Gentle wing flutter animation
        const flutter = Math.sin(time * this.wingFlutterSpeed + this.wingFlutterOffset);
        const wingAngle = flutter * 0.4; // Subtle flutter
        
        // Animate wings
        this.leftUpperWing.rotation.x = wingAngle;
        this.rightUpperWing.rotation.x = -wingAngle;
        this.leftLowerWing.rotation.x = wingAngle * 0.8;
        this.rightLowerWing.rotation.x = -wingAngle * 0.8;
        
        // Very subtle body movement
        this.group.position.y = this.position.y + Math.sin(time * 2 + this.wingFlutterOffset) * 0.03;
    }

    getMesh() {
        return this.group;
    }
}