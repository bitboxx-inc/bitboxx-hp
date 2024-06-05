<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let container;
    let scene, camera, renderer, cube, stars, raycaster, mouse;

    const links = [
        { title: 'ABOUT US', link: '/#about-us', rotation: { x: 0, y: 0, z: 0 } },
        { title: 'SERVICE', link: '/#service', rotation: { x: Math.PI / 2, y: 0, z: 0 } },
        { title: 'WORKS', link: '/#works', rotation: { x: 0, y: Math.PI / 2, z: 0 } },
        { title: 'COMPANY', link: '/#company', rotation: { x: 0, y: 0, z: Math.PI / 2 } },
        { title: 'CONTACT', link: '/#contact', rotation: { x: Math.PI / 2, y: Math.PI / 2, z: 0 } },
    ];

    onMount(() => {
        init();
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('resize', handleResize);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleClick);
        };
    });

    function init() {
        // シーンの作成
        scene = new THREE.Scene();

        // カメラの作成
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2.5; // カメラの初期位置

        // レンダラーの作成
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setClearColor(0xffffff, 0); // 背景色を白に設定
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // レイキャスターとマウスの作成
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        // 正六面体の作成
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            createTextMaterial("!?"),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),
            new THREE.MeshBasicMaterial({ color: 0xCCCCCC }),

        ];
        const geometry = new THREE.BoxGeometry();
        cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        // エッジの追加
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const lineSegments = new THREE.LineSegments(edges, lineMaterial);
        cube.add(lineSegments);

        // 星の作成
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

        // 初期配置
        updateCameraAndCubePosition();
        animate();
    }

    function createTextMaterial(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        context.fillStyle = '#AAAAAA';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'white' // '#D62649';
        context.font = '48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);

        return new THREE.MeshBasicMaterial({ map: texture });
    }

    function updateCameraAndCubePosition() {
        // 画面サイズに基づいてカメラとCubeの位置を更新
        const aspect = window.innerWidth / window.innerHeight;
        const frustumHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const frustumWidth = frustumHeight * aspect;

        cube.position.x = frustumWidth / 2 - 1; // 右端にCubeを配置
        cube.position.y = -frustumHeight / 2 + 1; // 下端にCubeを配置

        camera.lookAt(cube.position); // カメラをCubeに向ける
    }

    function animate() {
        requestAnimationFrame(animate);

        // キューブの回転
        cube.rotation.x += 0.001;
        cube.rotation.y += 0.001;

        // 星の回転
        stars.rotation.x += 0.002;
        stars.rotation.y += 0.001;

        renderer.render(scene, camera);
    }

    function setRotation(rotation) {
        cube.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    function handleHashChange() {
        const hash = window.location.hash;
        const link = links.find(link => link.link === hash);
        if (link) {
            setRotation(link.rotation);
        }
    }

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateCameraAndCubePosition(); // 画面リサイズ時に位置を更新
    }

    function handleClick(event: Event) {

        // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //
        // raycaster.setFromCamera(mouse, camera);
        //
        // const intersects = raycaster.intersectObject(cube);
        // if (intersects.length > 0) {
        //     const faceIndex = intersects[0].face.materialIndex;
        //     const link = links[faceIndex];
        //     if (link) {
        //         window.location.hash = link.link;
        //     }
        // }
    }
</script>

<style>
    :global(body) {
        margin: 0;
        background-color: white; /* 背景色を白に設定 */
    }
    #container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -2; /* 背面に配置 */
    }
</style>

<div id="container" bind:this={container}></div>
