import { ref, watch, type Ref } from 'vue'

export class TimeSimulator {
    private time: Ref<Date> = ref(new Date())
    private start: Ref<Date> = ref(new Date())
    private end: Ref<Date> = ref(new Date())
    private delay: number /*s*/

    private resetHandler: () => void = () => {}
    private startHandler: () => void = () => {}
    private stopHandler: () => void = () => {}
    private tickHandler: (time: Date) => void = () => {}

    constructor(delay: number) {
        this.delay = delay
        this.resetTimeBounds()

        watch(this.time, time => {
            this.tickHandler(time)
        })
    }

    onReset(handler: () => void) {
        this.resetHandler = handler
    }

    onStart(handler: () => void) {
        this.startHandler = handler
    }

    onStop(handler: () => void) {
        this.stopHandler = handler
    }

    onTick(handler: ((time: Date) => void)) {
        this.tickHandler = handler
    }

    resetTimeBounds() {
        const currentTime = new Date()
        const start = new Date(currentTime.getTime() - 1 * 60 * 60 * 1000 /*1h*/)
        normalizeTimestamp(start)
        
        this.start.value = start
        this.end.value = currentTime
    }

    startSimulation() {
        this.resetHandler()
        this.time.value = this.start.value
        this.startHandler()

        let timer = 0 // reference to interval timer; set later
        const tick = () => {
            const overflow = this.advanceTime(5)
            if (overflow) {
                clearInterval(timer)
                this.stopHandler()
            }
        }
        timer = setInterval(tick, this.delay * 1000)
    }

    advanceTime(mins: number): boolean {
        const current = this.time.value
        const newTime = new Date(current.getTime() + mins * 60 * 1000)
        this.time.value = newTime
        const overflow = newTime >= this.end.value
        return overflow
    }
}

function normalizeTimestamp(start: Date) {
    start.setMinutes(Math.floor(start.getMinutes() / 5) * 5)
    start.setSeconds(0)
    start.setMilliseconds(0)
}