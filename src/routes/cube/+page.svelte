<script>
import Cube from "../Cube.svelte";
import Top from "$lib/domains/contents/Top.svelte";

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

<Cube>
    <div slot="front">
        <Top contents="{contents}"></Top>
    </div>
    <div slot="back">Back Content</div>
    <div slot="left">Left Content</div>
    <div slot="right">Right Content</div>
    <div slot="top">Top Content</div>
    <div slot="bottom">Bottom Content</div>
</Cube>