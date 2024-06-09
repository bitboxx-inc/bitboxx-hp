<script lang="ts">
    import Cube from "../Cube.svelte";
    import Top from "$lib/domains/contents/Top.svelte";
    import AboutUs from "$lib/domains/contents/AboutUs.svelte";
    import Contact from "$lib/domains/contents/Contact.svelte";
    import { onMount } from "svelte";
    import FadeIn from "$lib/infras/fade/FadeIn.svelte";
    import Service from "$lib/domains/contents/Service.svelte";
    import Works from "$lib/domains/contents/Works.svelte";
    import Company from "$lib/domains/contents/Company.svelte";

    let cube;

    let contents = [
        {
            title: 'ABOUT US',
            link: '#about-us',
        },
        {
            title: 'SERVICE',
            link: '#service',
        },
        {
            title: 'WORKS',
            link: '#works',
        },
        {
            title: 'COMPANY',
            link: '#company',
        },
        {
            title: 'CONTACT',
            link: '#contact',
        }
    ];

    function handleRotationComplete(event) {
        const { face } = event.detail;
        console.log(`Rotation complete. Front face is: ${face}`);
    }

    function handleFaceClick(event) {
        const { slotName } = event.detail;
        console.log(`Clicked face: ${slotName}`);
    }

    function triggerLeftRotation() {
        cube.rotateLeft();
    }

    function triggerRightRotation() {
        cube.rotateRight();
    }

    function triggerUpRotation() {
        cube.rotateUp();
    }

    function triggerDownRotation() {
        cube.rotateDown();
    }

    function handleLinkClick(event, rotation) {
        event.preventDefault();
        switch (rotation) {
            case 'left':
                triggerLeftRotation();
                break;
            case 'right':
                triggerRightRotation();
                break;
            case 'up':
                triggerUpRotation();
                break;
            case 'down':
                triggerDownRotation();
                break;
        }
    }

    let currentHash = '';
    function handleHashChange() {
        currentHash = window.location.hash;
        switch (currentHash) {
            case '#contact':
                triggerRightRotation();
                break;
            case '#about-us':
            case '#service':
            case '#works':
            case '#company':
                triggerLeftRotation();
            default:
                break;
        }
    }

    onMount(() => {
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    });
</script>

<Cube bind:this={cube} operatable="{false}" on:faceClick={handleFaceClick} on:rotationComplete={handleRotationComplete}>
    <div slot="front">
        <Top {contents} on:clickLink={handleLinkClick}></Top>
    </div>
    <div slot="back">Back Content</div>
    <div slot="left">
        {#if currentHash === '#contact'}
            <Contact/>
        {/if}
    </div>
    <div slot="right">
        <FadeIn>
            {#if currentHash === '#about-us'}
                <AboutUs></AboutUs>
            {:else if currentHash === '#service'}
                <Service></Service>
            {:else if currentHash === '#works'}
                <Works></Works>
            {:else if currentHash === '#company'}
                <Company></Company>
            {:else if currentHash === '#contact'}
                !?
            {/if}
        </FadeIn>
    </div>
    <div slot="top">Top Content</div>
    <div slot="bottom">Bottom Content</div>
</Cube>
