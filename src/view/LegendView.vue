<script setup lang="ts">
export type LegendItem = {
    icon: string,
    title: string,
}
const props = defineProps<{
    entries: LegendItem[]
}>()
</script>

<template>
    <div class="legend">
        <div v-for="item, key in entries" :key="key" class="entry">
            <img :src="item.icon" />
            {{ item.title }}
        </div>
    </div>
</template>

<style scoped>
.legend {
    position: absolute;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;

    bottom: 5px;
    right: 5px;
    padding: 10px 10px;
    border-radius: 5px;
    max-width: 50%;

    background: var(--card-bg-color);
    color: var(--card-fg-color);
    box-shadow: 0 0 5px var(--card-shade-color);
}
.entry {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 5px;
}
.entry img {
    width: 20px;
}
</style>