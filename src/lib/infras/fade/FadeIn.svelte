<div class="fadein">
    <slot/>
</div>

<style>

    .fadein {
        animation: fadein 2s ease-out forwards;
    }

    @keyframes fadein {
        0% {
            opacity: 0;
            transform: translateX(-40px);
        }
        100% {
            opacity: 1;
            transform: translateX(0px);
        }
    }
</style>