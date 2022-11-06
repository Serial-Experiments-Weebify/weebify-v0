<template>
    <p
        class="weebify-text"
        :class="{ overflowing }"
        :style="lineCapStyle"
        ref="text"
    >
        {{ text }}
    </p>
</template>

<script>
export default {
    props: ["text", "maxLines"],
    computed: {
        lineCapStyle() {
            return {
                "line-clamp": this.maxLines,
                "-webkit-line-clamp": this.maxLines,
            };
        },
    },
    data() {
        return {
            observer: null,
            overflowing: false,
        };
    },
    methods: {
        onresize() {
            const text = this.$refs.text;
            this.overflowing = text.scrollHeight > text.offsetHeight;
        },
    },
    mounted() {
        this.observer = new ResizeObserver(() => this.onresize());
        this.observer.observe(this.$refs.text);
    },
    beforeUnmount() {
        this.observer?.disconnect();
        this.observer = null;
    },
};
</script>

<style lang="less">
p.weebify-text {
    overflow: hidden;
    text-overflow: ellipsis;

    display: box;
    display: -webkit-box;
    box-orient: vertical;
    -webkit-box-orient: vertical;
    
    margin: 0;
}

p.weebify-text.overflowing {
    //make a gradient
    background: linear-gradient(to bottom, #ffff 50%, #fff8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    cursor: pointer;

    &:hover {
        background: linear-gradient(to bottom, #ffff 50%, #4bbbef88 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}
</style>
