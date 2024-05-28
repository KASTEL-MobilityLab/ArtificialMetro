<script setup lang="ts">
import type { LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';

type View = {
    title: string,
    icon: FunctionalComponent<LucideProps, {}, any, {}>,
}
const props = defineProps<{
    views: View[],
    active: number,
}>()
</script>

<template>
    <ul class="view-switcher">
        <li v-for="view, id in props.views" :key="id" :active="id == props.active">
            <component :is="view.icon" :height="30" :width="30"></component>
            {{ view.title }}
            <span class="active-indicator"></span>
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

    gap: 5px;

    padding: 0;
    padding-top: 20px;
    padding-bottom: 5px;

    cursor: pointer;
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
    visibility: hidden;
}
ul li[active="true"] .active-indicator {
    visibility: visible;
}
</style>