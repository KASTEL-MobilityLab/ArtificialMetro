<script setup lang="ts">
import { Repeat2Icon, type LucideProps } from 'lucide-vue-next';
import { type FunctionalComponent } from 'vue';

type View = {
    title: string,
    icon: FunctionalComponent<LucideProps, {}, any, {}>,
    available: boolean,
}
const props = defineProps<{
    views: View[],
    active: number,
    automatic: boolean,
}>()
const emit = defineEmits<{
    switch: [view: number],
    toggleAutomatic: [],
}>()
</script>

<template>
    <ul class="view-switcher">
        <li class="automatic" :active="automatic" @click.stop.prevent="emit('toggleAutomatic')">
            <Repeat2Icon></Repeat2Icon>
        </li>
        <li v-for="view, id in props.views" 
            :key="id" 
            :active="id == props.active" 
            :aria-enabled="view.available"
            @click="emit('switch', id)"
        >
            <component :is="view.icon" :height="20" :width="20"></component>
            {{ view.title }}
        </li>
    </ul>
</template>

<style scoped>
ul {
    display: flex;

    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;

    gap: 5px;

    padding: 0;
    margin: 0;

    list-style: none;
}

ul li {
    display: flex;
    position: relative;

    flex-direction: row;
    justify-content: center;
    align-items: center;

    gap: 7px;

    padding: 5px 10px;
    border-radius: 5px;

    cursor: pointer;
    transition: 0.5s ease-in-out;
}

ul li[active="true"] {
    background: var(--accent-bg-color);
}

ul li[aria-enabled="false"] {
    opacity: 0.5;
}

.automatic {
    display: flex;

    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0 5px;
}

.automatic[active="true"] {
    color: var(--accent-color);
    background: none;
}
</style>