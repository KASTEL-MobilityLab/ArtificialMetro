<script setup lang="ts">
import DeparturesView from './DeparturesView.vue'
import type { SwitchBusReceiver } from './switch_bus';
defineProps<{
    bus: SwitchBusReceiver,
}>()
</script>

<template>
    <div class="side-by-side">
        <DeparturesView
            :bus="bus"
            station="7001001"
            title="Durlacher Tor / KIT-Campus Süd"
        ></DeparturesView>
        <DeparturesView
            :bus="bus"
            station="7001002"
            title="Kronenplatz"
        ></DeparturesView>
    </div>
</template>

<style scoped>
.side-by-side > :first-child {
    position: absolute;
    right: 50%;
}
.side-by-side > :last-child {
    position: absolute;
    left: 50%;
}
</style>