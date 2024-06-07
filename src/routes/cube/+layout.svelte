<script lang="ts">
    import Cube from "../Cube.svelte";
    import Top from "$lib/domains/contents/Top.svelte";
    import AboutUs from "$lib/domains/contents/AboutUs.svelte";
    import Contact from "$lib/domains/contents/Contact.svelte";
    import {onMount} from "svelte";
    import FadeIn from "$lib/infras/fade/FadeIn.svelte";

    let cube;

    let contents = [
        {
            title: 'ABOUT US',
            link: '/cube/about-us'
        },
        {
            title: 'SERVICE',
            link: '/cube/service'
        },
        {
            title: 'WORKS',
            link: '/cube/works'
        },
        {
            title: 'COMPANY',
            link: '/cube/company'
        },
        {
            title: 'CONTACT',
            link: '/cube/contact'
        }
    ];

    function handleRotationComplete(event) {
        const { face } = event.detail;
        console.log(`Rotation complete. Front face is: ${face}`);
    }

    function handleFaceClick(event) {
        const {slotName} = event.detail;
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

    function clickLink(link: string) {
        window.location.href = '/cube/' + link
    }

    onMount(() => {
        if (window.location.pathname === '/cube/about-us') {
            triggerLeftRotation();
        } else if (window.location.pathname === '/cube/contact') {
            triggerRightRotation();
        }
    })
</script>

<Cube bind:this={cube} operatable="{false}" on:faceClick={handleFaceClick} on:rotationComplete={handleRotationComplete}>
    <div slot="front">
        <Top contents="{contents}"></Top>
        <a on:click={() => clickLink('about-us')}>about us</a>
        <a on:click={() => clickLink('contact')}>contact</a>
    </div>
    <div slot="back">Back Content</div>
    <div slot="left">
        <Contact></Contact>
    </div>
    <div slot="right">
        <FadeIn>
            <slot/>
        </FadeIn>
    </div>
    <div slot="top">Top Content</div>
    <div slot="bottom">Bottom Content</div>
</Cube>

