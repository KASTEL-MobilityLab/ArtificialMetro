import { ref, type Ref } from "vue";

export class Kiosk {
    active: Ref<boolean>
    private interval: number
    private timer: NodeJS.Timeout | undefined
    private tickHandler: { (): void } = () => { }

    constructor(interval: number) {
        this.active = ref(false)
        this.interval = interval
    }

    stop() {
        if (!this.active.value) return
        if (this.timer != undefined) {
            clearInterval(this.timer)
        }
        this.active.value = false
    }

    start() {
        if (this.active.value) return
        if (this.timer != undefined) {
            clearInterval(this.timer)
        }
        this.timer = setInterval(() => this.tick(), this.interval)
        this.active.value = true
    }

    toggle() {
        if (this.active.value) {
            this.stop()
        } else {
            this.start()
        }
    }

    tick() {
        this.tickHandler()
    }

    onTick(handler: { (): void }) {
        this.tickHandler = handler
    }
}