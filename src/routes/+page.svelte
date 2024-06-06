<script lang="ts">
    import Service from "$lib/domains/contents/Service.svelte";
    import AboutUs from "$lib/domains/contents/AboutUs.svelte";
    import Top from "$lib/domains/contents/Top.svelte";
    import Company from "$lib/domains/contents/Company.svelte";
    import Works from "$lib/domains/contents/Works.svelte";
    import Contact from "$lib/domains/contents/Contact.svelte";
    import Display from "$lib/infras/Display.svelte";

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
    <Top contents={contents}/>

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
</div>

<span class="vertical-copyright">
        <div class="mt-48">&nbsp;</div>
        2024 &copy; bitboxx inc.
    </span>

<style>
    div {
        backdrop-filter: blur(0.01em);
    }

    .vertical-copyright {
        font-family: 'Noto Sans JP';
        position: fixed;
        left: 45px;
        bottom: 15%;
        transform: translateY(-50%) rotate(-270deg);
        transform-origin: left top;
        z-index: -1; /* 高いz-indexを設定して常に前面に表示 */
        background-color: rgba(255, 255, 255, 0.0); /* 背景色を設定して見やすくする（オプション） */
        padding: 0.5em; /* パディングを設定してテキストが切れないようにする（オプション） */
    }
</style>
