<script setup lang="ts">
import type { LucideProps } from 'lucide-vue-next';
import { RepeatIcon } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';

type View = {
    title: string,
    icon: FunctionalComponent<LucideProps, {}, any, {}>,
}
const props = defineProps<{
    views: View[],
    active: number,
    automatic: boolean,
}>()
const emit = defineEmits<{
    switch: [view: number],
}>()
</script>

<template>
    <ul class="view-switcher">
        <li 
            v-for="view, id in props.views" 
            :key="id" 
            :active="id == props.active"
            @click="emit('switch', id)"
            >
            <component :is="view.icon" :height="20" :width="20"></component>
            {{ view.title }}
        </li>
    </ul>
    <span class="automatic" v-if="automatic"><RepeatIcon></RepeatIcon></span>
</template>

<style scoped>
.view-switcher {
    width: 50%;
}
ul {
    display: flex;

    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    gap: 10px;

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
.automatic {
    display: flex;
    position: absolute;

    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    left: 5px;
    top: 5px;
    background: var(--accent-bg-color);

    border-radius: 5px;
    padding: 2px 5px;
}
</style>