<script setup lang="ts">
type View = {
    title: string,
}
const props = defineProps<{
    views: View[],
    active: number,
}>()
</script>

<template>
    <ul>
        <li v-for="view, id in props.views" :key="id" :active="id == props.active">
            {{ view.title }}
            <span class="active-indicator" v-if="id == props.active"></span>
        </li>
    </ul>
</template>

<style scoped>
ul {
    display: flex;

    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;

    gap: 10px;

    height: 100%;
    padding: 0;
    margin: 0;

    list-style: none;
}

ul li {
    display: flex;
    position: relative;

    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;

    padding: 10px 0;
}

ul li[active="true"] {
    color: var(--accent-color);
}

ul li .active-indicator {
    display: block;

    width: 10px;
    height: 10px;
    border-radius: 100%;

    background-color: var(--accent-bg-color);
}
</style>