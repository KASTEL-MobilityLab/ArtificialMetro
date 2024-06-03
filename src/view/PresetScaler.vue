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
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    gap: 3px;

    position: absolute;
    z-index: 1000;
    left: 0;
    top: calc(50% - 25px);

    margin: 0;
    padding: 0;
}

li {
    display: block;

    width: 20px;
    height: 20px;
    border-radius: 0 100% 100% 0;

    background: var(--card-bg-color);
    box-shadow: 0 0 5px var(--card-shade-color);
}
li:nth-child(1) {
    width: 10px;
    height: 10px;
}
li:nth-child(2) {
    width: 15px;
    height: 15px;
}
li:nth-child(3) {
    width: 20px;
    height: 20px;
}
li:nth-child(4) {
    width: 25px;
    height: 25px;
}
li[active="true"] {
    background: var(--accent-bg-color);
}
</style>