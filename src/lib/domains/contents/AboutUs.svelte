<script>
import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
import Display from "$lib/infras/Display.svelte";
</script>

<Display>
    <BitboxxContent slot="lg">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={1}>ABOUT US</BitboxxContentTitle>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={160}>NOW LOADING</BitboxxTypography>
        </div>
    </BitboxxContent>
    <BitboxxContent slot="md">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={1}>ABOUT US</BitboxxContentTitle>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={160}>NOW LOADING</BitboxxTypography>
        </div>
    </BitboxxContent>
    <BitboxxContent slot="sm">
        <div class="absolute top-0 left-4">
            <BitboxxContentTitle num={1} fontSizePx={48} widthPx={40}>ABOUT US</BitboxxContentTitle>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={40}>NOW LOADING</BitboxxTypography>
        </div>
    </BitboxxContent>
</Display>