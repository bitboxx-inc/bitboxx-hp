<div class="fadein">
    <slot/>
</div>

<style>

    .fadein {
        animation: fadein 6s ease-out forwards;
    }

    @keyframes fadein {
        0% {
            opacity: 0;
            transform: translateX(0);
        }
        100% {
            opacity: 1;
            transform: translateX(20px);
        }
    }
</style>