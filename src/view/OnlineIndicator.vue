<script setup lang="ts">
import { TriangleAlertIcon } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const offline = ref(false)

onMounted(() => {
    window.ononline = updateOffline
    window.onoffline = updateOffline
})

function updateOffline() {
    offline.value = !navigator.onLine
}

</script>

<template>
    <span class="online-indicator" v-if="offline">
        <TriangleAlertIcon :height="20" :width="20"></TriangleAlertIcon> Network offline
    </span>
</template>

<style scoped>
.online-indicator {
    position: absolute;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;

    top: 5px;
    left: calc(50% - 100px);
    min-width: 200px;

    padding: 5px 10px;
    border-radius: 5px;

    background: var(--error-bg-color);
    color: var(--error-fg-color);
    box-shadow: 0 0 5px var(--card-shade-color);
}
</style>