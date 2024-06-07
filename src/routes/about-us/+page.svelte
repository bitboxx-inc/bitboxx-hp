<script>
    import AboutUs from "$lib/domains/contents/AboutUs.svelte";
    import TransitionBoxRotate from "$lib/infras/fade/TransitionBoxRotate.svelte";
    import SplitContent from "$lib/infras/contents/SplitContent.svelte";
    import BitboxxContents from "$lib/infras/contents/BitboxxContents.svelte";
    import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
    import BitboxxContent from "$lib/infras/BitboxxContent.svelte";

    let contents = [
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
            link: '/contact'
        }
    ];
</script>

<AboutUs></AboutUs>