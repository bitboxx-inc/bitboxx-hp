<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";

    export let operatable = true;

    let currentY = 0;
    let currentX = 0;
    let startX: number, startY: number;
    let cube: HTMLElement;
    let isRotating = false;
    const dispatch = createEventDispatcher();

    function handleScroll(event: WheelEvent) {
        if (!operatable) return;
        event.preventDefault();
        if (!isRotating) {
            isRotating = true;
            if (event.deltaY > 0) {
                rotate('down');
            } else {
                rotate('up');
            }
            setTimeout(() => {
                isRotating = false;
                dispatchCurrentFace();
            }, 800);
        }
    }

    function handleMouseDown(event: MouseEvent) {
        if (!operatable) return;
        event.preventDefault();
        startX = event.clientX;
        startY = event.clientY;
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(event: MouseEvent) {
        if (!operatable) return;
        event.preventDefault();
        if (!isRotating) {
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 30) {
                    isRotating = true;
                    if (deltaX > 0) {
                        rotate('right');
                    } else {
                        rotate('left');
                    }
                    startX = event.clientX;
                    setTimeout(() => {
                        isRotating = false;
                        dispatchCurrentFace();
                    }, 800);
                }
            } else {
                if (Math.abs(deltaY) > 30) {
                    isRotating = true;
                    if (deltaY > 0) {
                        rotate('down');
                    } else {
                        rotate('up');
                    }
                    startY = event.clientY;
                    setTimeout(() => {
                        isRotating = false;
                        dispatchCurrentFace();
                    }, 800);
                }
            }
        }
    }

    function handleMouseUp(event: MouseEvent) {
        event.preventDefault();
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }

    function handleTouchStart(event: TouchEvent) {
        if (!operatable) return;
        event.preventDefault();
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    }

    function handleTouchMove(event: TouchEvent) {
        if (!operatable) return;
        event.preventDefault();
        if (!isRotating) {
            const deltaX = event.touches[0].clientX - startX;
            const deltaY = event.touches[0].clientY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 30) {
                    isRotating = true;
                    if (deltaX > 0) {
                        rotate('right');
                    } else {
                        rotate('left');
                    }
                    startX = event.touches[0].clientX;
                    setTimeout(() => {
                        isRotating = false;
                        dispatchCurrentFace();
                    }, 800);
                }
            } else {
                if (Math.abs(deltaY) > 30) {
                    isRotating = true;
                    if (deltaY > 0) {
                        rotate('down');
                    } else {
                        rotate('up');
                    }
                    startY = event.touches[0].clientY;
                    setTimeout(() => {
                        isRotating = false;
                        dispatchCurrentFace();
                    }, 800);
                }
            }
        }
    }

    function rotate(direction: string) {
        switch (direction) {
            case 'left':
                currentX -= 90;
                break;
            case 'right':
                currentX += 90;
                break;
            case 'up':
                currentY -= 90;
                break;
            case 'down':
                currentY += 90;
                break;
        }
        updateCubeRotation();
    }

    function updateCubeRotation() {
        cube.style.transition = 'transform 0.8s';
        cube.style.transform = `translateZ(-50vmin) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
    }

    function dispatchCurrentFace() {
        const faceIndex = getFrontFaceIndex(currentX, currentY);
        dispatch('faceChange', { face: faceIndex });
    }

    function getFrontFaceIndex(x: number, y: number) {
        const xIndex = (x / 90) % 4;
        const yIndex = (y / 90) % 4;
        if (yIndex === 1) return 4; // top
        if (yIndex === -1 || yIndex === 3) return 5; // bottom
        if (yIndex === 0) {
            switch (xIndex) {
                case 0:
                    return 0; // front
                case 1:
                case -3:
                    return 3; // right
                case 2:
                case -2:
                    return 1; // back
                case 3:
                case -1:
                    return 2; // left
            }
        }
        return 0; // default to front
    }

    onMount(() => {
        cube = document.querySelector(".cube");

        window.addEventListener("wheel", handleScroll, { passive: false });
        window.addEventListener("mousedown", handleMouseDown, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: false });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleScroll);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    });

    export function rotateLeft() {
        if (!isRotating) {
            isRotating = true;
            rotate('left');
            setTimeout(() => {
                isRotating = false;
                dispatchCurrentFace();
            }, 800);
        }
    }

    export function rotateRight() {
        if (!isRotating) {
            isRotating = true;
            rotate('right');
            setTimeout(() => {
                isRotating = false;
                dispatchCurrentFace();
            }, 800);
        }
    }

    export function rotateUp() {
        if (!isRotating) {
            isRotating = true;
            rotate('up');
            setTimeout(() => {
                isRotating = false;
                dispatchCurrentFace();
            }, 800);
        }
    }

    export function rotateDown() {
        if (!isRotating) {
            isRotating = true;
            rotate('down');
            setTimeout(() => {
                isRotating = false;
                dispatchCurrentFace();
            }, 800);
        }
    }
</script>

<style>
    .scene {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        perspective: 100vmin;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cube {
        width: 100vmin;
        height: 100vmin;
        transform-style: preserve-3d;
        transform: translateZ(-50vmin);
        transition: transform 0.8s;
    }

    .face {
        position: absolute;
        width: 100vmin;
        height: 100vmin;
        background-color: rgba(255, 255, 255, 0.9);
        border: 1px solid #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        overflow: auto; /* 追加: オーバーフローを処理 */
    }

    .front  { transform: rotateY(  0deg) translateZ( 50vmin); }
    .back   { transform: rotateY(180deg) translateZ( 50vmin); }
    .left   { transform: rotateY(-90deg) translateZ( 50vmin); }
    .right  { transform: rotateY( 90deg) translateZ( 50vmin); }
    .top    { transform: rotateX( 90deg) translateZ( 50vmin); }
    .bottom { transform: rotateX(-90deg) translateZ( 50vmin); }
</style>

<div class="scene">
    <div class="cube" bind:this={cube}>
        <div class="face front" data-slot="front"><slot name="front"></slot></div>
        <div class="face back" data-slot="back"><slot name="back"></slot></div>
        <div class="face left" data-slot="left"><slot name="left"></slot></div>
        <div class="face right" data-slot="right"><slot name="right"></slot></div>
        <div class="face top" data-slot="top"><slot name="top"></slot></div>
        <div class="face bottom" data-slot="bottom"><slot name="bottom"></slot></div>
    </div>
</div>
