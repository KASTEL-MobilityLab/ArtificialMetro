<script setup lang="ts">
import ViewSwitcher from './ViewSwitcher.vue'

const views = [
    { title: "Map" },
    { title: "Other" },
]

</script>

<template>
    <footer>
        <ViewSwitcher :views="views" :active="0"></ViewSwitcher>
    </footer>
</template>

<style scoped>
footer {
    display: block;
    position: fixed;

    left: 0;
    right: 0;
    bottom: 0;
    height: 100px;

    padding: 0 20px;

    background-color: var(--view-bg-color);
    color: var(--view-fg-color);
}
</style>