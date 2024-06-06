<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import Stardust from './Stardust.svelte';

    let container;
    let scene, camera, renderer, cube, raycaster, mouse;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const links = [
        { title: 'ABOUT US', link: '/#about-us', rotation: { x: 0, y: 0, z: 0 } },
        { title: 'SERVICE', link: '/#service', rotation: { x: Math.PI / 2, y: 0, z: 0 } },
        { title: 'WORKS', link: '/#works', rotation: { x: 0, y: Math.PI / 2, z: 0 } },
        { title: 'COMPANY', link: '/#company', rotation: { x: 0, y: 0, z: Math.PI / 2 } },
        { title: 'CONTACT', link: '/#contact', rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 } },
        { title: 'OTHER', link: '/#other', rotation: { x: 0, y: Math.PI, z: 0 } }
    ];

    onMount(() => {
        init();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousedown', onMouseDown);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseup', onMouseUp);
            container.removeEventListener('mouseout', onMouseOut);
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', onTouchEnd);
            container.removeEventListener('click', handleClick);
        };

    });

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.5;

        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setClearColor(0xffffff, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        const materials = [
            createTextMaterial("!?"),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
        ];
        const geometry = new THREE.BoxGeometry();
        cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        cube.add(lineSegments);

        animate();

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseup', onMouseUp);
        container.addEventListener('mouseout', onMouseOut);
        container.addEventListener('click', handleClick);

        // Adding touch events for mobile devices
        container.addEventListener('touchstart', onTouchStart);
        container.addEventListener('touchmove', onTouchMove);
        container.addEventListener('touchend', onTouchEnd);
    }

    function createTextMaterial(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        context.fillStyle = '#AAAAAA';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);

        return new THREE.MeshBasicMaterial({ map: texture });
    }

    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            cube.rotation.x += 0.001;
            cube.rotation.y += 0.001;
        }

        renderer.render(scene, camera);
    }

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        // camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleClick(event: MouseEvent) {

        // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //
        // raycaster.setFromCamera(mouse, camera);
        //
        // const intersects = raycaster.intersectObject(cube);
        // if (intersects.length > 0) {
        //     const faceIndex = Math.floor(intersects[0].faceIndex / 2);
        //     const link = links[faceIndex];
        //     if (link) {
        //         window.location.hash = link.link;
        //     }
        // }
    }

    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    function onMouseMove(event) {
        if (isDragging) {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            const deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                    toRadians(deltaMove.y * 0.5),
                    toRadians(deltaMove.x * 0.5),
                    0,
                    'XYZ'
                ));

            cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);

            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onMouseOut() {
        isDragging = false;
    }

    function onTouchStart(event) {
        isDragging = true;
        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    function onTouchMove(event) {
        if (isDragging) {
            const deltaMove = {
                x: event.touches[0].clientX - previousMousePosition.x,
                y: event.touches[0].clientY - previousMousePosition.y
            };

            const deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                    toRadians(deltaMove.y * 0.5),
                    toRadians(deltaMove.x * 0.5),
                    0,
                    'XYZ'
                ));

            cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);

            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    function onTouchEnd() {
        isDragging = false;
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }
</script>

<style>
    :global(body) {
        margin: 0;
        background-color: white;
    }
    #container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        cursor: grab;
    }
    #container:active {
        cursor: grabbing;
    }
    footer.fixed {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        background: rgba(255, 255, 255, 0);
        z-index: 4;
        padding: 10px 0;
    }
</style>

<div id="container" style="opacity: 0.3; z-index: -1" bind:this={container}></div>
<footer class="fixed">
    <span>
<!--        <label for="opacity">Opacity:</label>-->
        <input type="range" id="opacity" name="opacity" min="0" max="1" step="0.1" value="0.3" oninput="document.getElementById('container').style.opacity = this.value;">
    </span>
    <span>
<!--        <label for="z-index-toggle">Z-Index:</label>-->
        <input type="checkbox" id="z-index-toggle" name="z-index-toggle" onchange="document.getElementById('container').style.zIndex = this.checked ? 1 : -1;">
        <label for="z-index-toggle" id="z-index-label">!?</label>
    </span>
</footer>
