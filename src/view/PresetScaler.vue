<script setup lang="ts">
const props = defineProps<{
    currentPreset: number,
    numPresets: number,
}>()

const emit = defineEmits<{
    click: [preset: number],
}>()

</script>

<template>
    <ul>
        <li 
            v-for="i in props.numPresets" 
            :key="i" 
            :active="i-1 == props.currentPreset"
            @click="emit('click', i)"
            ></li>
    </ul>
</template>

<style scoped>
ul {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;

    gap: 3px;

    position: absolute;
    left: 5px;
    top: 5px;
    border-radius: 15px;

    margin: 0;
    padding: 5px;

    background: var(--card-bg-color);
    color: var(--card-fg-color);
    box-shadow: 0 0 5px var(--card-shade-color);
    
}

li {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    width: 15px;
    height: 15px;
    border-radius: 100%;

    background: transparent;
    transition: 0.2s ease-in-out;

    font-size: 9px;
}
li[active="true"] {
    background: var(--accent-bg-color);
}
</style>