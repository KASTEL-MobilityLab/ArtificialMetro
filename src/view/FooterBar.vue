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

    flex-direction: row;
    justify-content: stretch;
    align-items: stretch;

    left: 0;
    right: 0;
    bottom: 0;
    height: 100px;

    padding: 0 20px;

    background-color: var(--view-bg-color);
    color: var(--view-fg-color);
}
</style>