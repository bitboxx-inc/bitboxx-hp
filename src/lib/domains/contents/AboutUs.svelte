<script>
import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
import Display from "$lib/infras/Display.svelte";
</script>

<Display>
    <BitboxxContent slot="lg">
        <BitboxxContentTitle slot="header" num={1}>ABOUT US</BitboxxContentTitle>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={160}>NOW LOADING</BitboxxTypography>
        </div>
    </BitboxxContent>
    <BitboxxContent slot="md">
        <BitboxxContentTitle slot="header" num={1}>ABOUT US</BitboxxContentTitle>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={160}>NOW LOADING</BitboxxTypography>
        </div>
    </BitboxxContent>
    <BitboxxContent slot="sm">
        <BitboxxContentTitle slot="header" num={1} fontSizePx={48} widthPx={40}>ABOUT US</BitboxxContentTitle>
        <div class="flex-1 flex justify-center items-center">
            <BitboxxTypography fontSizePx={40}>NOW LOADING</BitboxxTypography>
        </div>
    </BitboxxContent>
</Display>