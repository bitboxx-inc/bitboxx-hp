<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let container;
    let scene, camera, renderer, stars;

    onMount(() => {
        init();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.5;

        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        createStars();

        animate();
    }

    function createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0x888888 });

        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
    }

    function animate() {
        requestAnimationFrame(animate);

        stars.rotation.x += 0.002;
        stars.rotation.y += 0.001;

        renderer.render(scene, camera);
    }

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        // camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
</script>

<style>
    :global(body) {
        margin: 0;
    }
    #container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -3;
    }
</style>

<div id="container" bind:this={container}></div>
