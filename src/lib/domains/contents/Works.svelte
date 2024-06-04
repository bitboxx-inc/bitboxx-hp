<script>
import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
import Display from "$lib/infras/Display.svelte";
</script>

<Display id={"works"}>

    <BitboxxContent slot="lg">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={3}>WORKS</BitboxxContentTitle>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={160}>COMING SOON</BitboxxTypography>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="md">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={3}>WORKS</BitboxxContentTitle>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={160}>COMING SOON</BitboxxTypography>
        </div>
    </BitboxxContent>


    <BitboxxContent slot="sm">
        <div class="absolute top-0 left-4">
            <BitboxxContentTitle num={3} fontSizePx={48} widthPx={40}>WORKS</BitboxxContentTitle>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={40}>COMING SOON</BitboxxTypography>
        </div>
    </BitboxxContent>
</Display>