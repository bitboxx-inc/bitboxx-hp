<script lang="ts">
    import Service from "$lib/domains/contents/Service.svelte";
    import AboutUs from "$lib/domains/contents/AboutUs.svelte";
    import Top from "$lib/domains/contents/Top.svelte";
    import Company from "$lib/domains/contents/Company.svelte";
    import Works from "$lib/domains/contents/Works.svelte";
    import ThreeCube from "./ThreeCube.svelte";

    let contents = [
        {
            title: 'ABOUT US',
            link: '/#about-us'
        },
        {
            title: 'SERVICE',
            link: '/#service'
        },
        {
            title: 'WORKS',
            link: '/#works'
        },
        {
            title: 'COMPANY',
            link: '/#company'
        },
        {
            title: 'CONTACT',
            link: '/#contact'
        }
    ];
</script>

<div class="h-dvh">

    <!-- TOP -->
    <Top contents={contents}/>

    <!-- ABOUT US -->
    <AboutUs/>

    <!-- SERVICE -->
    <Service/>

    <!-- WORKS -->
    <Works/>

    <!-- COMPANY -->
    <Company/>

    <ThreeCube/>
</div>
