<script setup lang="ts">
</script>

<template>
    <footer>
        <slot name="left"></slot>
        <div id="view-controls"></div>
    </footer>
</template>

<style scoped>
footer {
    display: flex;
    position: fixed;
    z-index: 1000;

    flex-direction: row;
    justify-content: stretch;
    align-items: stretch;

    left: 5px;
    bottom: 5px;
    border-radius: 10px;
    max-width: 50%;

    padding: 5px 5px;

    background-color: var(--view-bg-color);
    color: var(--view-fg-color);
    box-shadow: 0 0 5px var(--card-shade-color);
}
</style>