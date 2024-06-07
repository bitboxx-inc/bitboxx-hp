<script>
    export let direction = 'left'; // 'left', 'right', 'up', 'down' のいずれか
    export let duration = 1000; // トランジションの継続時間（ミリ秒）

    let rotateClass = '';

    $: {
        switch(direction) {
            case 'left':
                rotateClass = 'rotate-left';
                break;
            case 'right':
                rotateClass = 'rotate-right';
                break;
            case 'up':
                rotateClass = 'rotate-up';
                break;
            case 'down':
                rotateClass = 'rotate-down';
                break;
            default:
                rotateClass = '';
        }
    }

    function startTransition() {
        const box = document.querySelector('.transition-box');
        box.classList.add(rotateClass);
        setTimeout(() => {
            // トランジション終了後に遷移する画面の変更を行う
            // ここに画面遷移のロジックを追加
        }, duration);
    }
</script>

<style>
    .transition-box {
        width: 100px;
        height: 100px;
        background-color: red;
        transition: transform var(--duration) ease-in-out;
    }

    .rotate-left {
        transform: rotateY(-90deg);
    }

    .rotate-right {
        transform: rotateY(90deg);
    }

    .rotate-up {
        transform: rotateX(90deg);
    }

    .rotate-down {
        transform: rotateX(-90deg);
    }
</style>

<div class="transition-box" style="--duration: {duration}ms" on:click={startTransition}>
    <slot />
</div>
