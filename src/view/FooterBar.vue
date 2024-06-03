<script setup lang="ts">
import ViewSwitcher from './ViewSwitcher.vue'
import { GlobeIcon, MapIcon, TimerIcon } from 'lucide-vue-next'

const views = [
    { title: "Map", icon: MapIcon },
    { title: "Timelapse", icon: TimerIcon },
    { title: "Other", icon: GlobeIcon },
]

</script>

<template>
    <footer>
        <ViewSwitcher :views="views" :active="1"></ViewSwitcher>
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
.view-switcher {
    width: 50%;
}
</style>