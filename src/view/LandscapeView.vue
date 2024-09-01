<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { SwitchBusReceiver } from './switch_bus';

const props = defineProps<{
    bus: SwitchBusReceiver,
}>()

type VideoUrl = string
const availableVideos = ref<VideoUrl[]>([])
const currentVideo = ref<VideoUrl|undefined>(undefined)
const video = ref<HTMLVideoElement>()

async function loadAvailableVideos() {
    const response = await fetch('/v1/videos')
    if (!response.ok) return
    const list = await response.json()
    availableVideos.value = list as VideoUrl[]
}

async function selectNextVideo() {
    if (availableVideos.value.length == 0) {
        await loadAvailableVideos()
    }
    const lastVideo = currentVideo.value
    const num = Math.floor(Math.random() * availableVideos.value.length)
    currentVideo.value = undefined
    currentVideo.value = availableVideos.value[num]
    if (currentVideo.value == lastVideo) {
        playVideo()
    }
}

function playVideo() {
    try {
        const duration = video.value!.duration
        let start = 0
        if (!isNaN(duration)) {
            start = Math.max(0, Math.floor(Math.random() * duration) - 90 /*90s*/)
        }
        video.value!.currentTime = start
        video.value!.play()
    } catch(_) {
        console.log('cannot play video')
    }
}

function stopVideo() {
    video.value?.pause()
}

onMounted(() => {
    props.bus.onResume(selectNextVideo)
    props.bus.onSuspend(stopVideo)
    video.value!.addEventListener('loadedmetadata', playVideo)
})

</script>

<template>
    <div class="window-frame">
        <div class="window-view">
            <video ref="video" :src="currentVideo" muted controls="false"></video>
        </div>
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

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    overflow: hidden;
}
.window-view video {
    height: 100%;
}
</style>