<script>
    import { onMount } from "svelte";

    let currentFace = 0;
    const faces = ["front", "back", "left", "right", "top", "bottom"];

    function handleScroll(event) {
        if (event.deltaY > 0) {
            // Scrolling down
            currentFace = (currentFace + 1) % faces.length;
        } else {
            // Scrolling up
            currentFace = (currentFace - 1 + faces.length) % faces.length;
        }
        updateCubeRotation();
    }

    function updateCubeRotation() {
        const cube = document.querySelector(".cube");
        cube.style.transform = `translateZ(-50vmin) rotateX(${currentFace * 90}deg)`;
    }

    onMount(() => {
        window.addEventListener("wheel", handleScroll);
        return () => {
            window.removeEventListener("wheel", handleScroll);
        };
    });
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
        transition: transform 1s;
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
    }

    .front  { transform: rotateY(  0deg) translateZ( 50vmin); }
    .back   { transform: rotateY(180deg) translateZ( 50vmin); }
    .left   { transform: rotateY(-90deg) translateZ( 50vmin); }
    .right  { transform: rotateY( 90deg) translateZ( 50vmin); }
    .top    { transform: rotateX( 90deg) translateZ( 50vmin); }
    .bottom { transform: rotateX(-90deg) translateZ( 50vmin); }
</style>

<div class="scene">
    <div class="cube">
        <div class="face front">Front</div>
        <div class="face back">Back</div>
        <div class="face left">Left</div>
        <div class="face right">Right</div>
        <div class="face top">Top</div>
        <div class="face bottom">Bottom</div>
    </div>
</div>
