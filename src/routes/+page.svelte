<script lang="ts">
    import Service from "$lib/domains/contents/Service.svelte";
    import AboutUs from "$lib/domains/contents/AboutUs.svelte";
    import Top from "$lib/domains/contents/Top.svelte";
    import Company from "$lib/domains/contents/Company.svelte";
    import Works from "$lib/domains/contents/Works.svelte";
    import Contact from "$lib/domains/contents/Contact.svelte";
    import Display from "$lib/infras/Display.svelte";
    import BitboxxContents from "$lib/infras/contents/BitboxxContents.svelte";
    import SplitContent from "$lib/infras/contents/SplitContent.svelte";
    import BitboxxLogo from "$lib/domains/BitboxxLogo.svelte";

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

<div>

    <!-- TOP -->
    <Top contents="{contents}"></Top>

    <!-- ABOUT US -->
    <section id="about-us">
        <AboutUs/>
    </section>

    <!-- SERVICE -->
    <section id="service">
        <Service/>
    </section>

    <!-- WORKS -->
    <section id="works">
        <Works/>
    </section>

    <!-- COMPANY -->
    <section id="company">
        <Company/>
    </section>

    <!-- CONTACT -->
    <section id="contact">
        <Contact/>
    </section>

<!--    <Display>-->
<!--    </Display>-->
</div>

<style>
    div {
        backdrop-filter: blur(0.01em);
    }
</style>
