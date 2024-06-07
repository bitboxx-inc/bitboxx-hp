<div class="relative h-screen flex flex-col">
    <!-- This header is hidden on small screens and visible on medium and larger screens -->
    <div class="hidden md:block">
        <slot name="header"/>
    </div>

    <div class="flex-grow flex items-center justify-center">
        <slot/>
    </div>

    <!-- This header is visible on small screens and hidden on medium and larger screens -->
    <div class="block md:hidden ml-4">
        <slot name="header"/>
    </div>
</div>
