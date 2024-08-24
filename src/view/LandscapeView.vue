<script setup lang="ts">
import type { SwitchBusReceiver } from './switch_bus';

defineProps<{
    bus: SwitchBusReceiver,
}>()
</script>

<template>
    <div class="window-frame">
        <div class="window-view"></div>
    </div>
</template>

<style scoped>
.window-frame {
    display: block;
    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background: var(--view-bg-color);
}
.window-view {
    display: block;
    position: absolute;

    top: 30px;
    left: 50px;
    right: 50px;
    bottom: 30px;
    border-radius: 20px;
    box-shadow: 0 0 5px rgba(0,0,0,0.5) inset;

    background: cornflowerblue;
}
</style>