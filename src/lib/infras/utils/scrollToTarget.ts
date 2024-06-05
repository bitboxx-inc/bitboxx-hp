export function scrollToTarget(targetId: string) {
    const target = document.getElementById(targetId);
    if (target) {
        const startPosition = window.pageYOffset;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        let startTime: number | null = null;
        const duration = 1000;

        function easeInOutQuad(t: number): number {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        function animation(currentTime: number) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const run = easeInOutQuad(progress);
            window.scrollTo(0, startPosition + (targetPosition - startPosition) * run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                window.scrollTo(0, targetPosition);
            }
        }

        requestAnimationFrame(animation);
    }
}
