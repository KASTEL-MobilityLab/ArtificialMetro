import { ref, watch, type Ref } from 'vue'

export class TimeSimulator {
    private simulatedTime: Ref<Date> = ref(new Date())
    private startTime: Ref<Date> = ref(new Date())
    private endTime: Ref<Date> = ref(new Date())

    private resetHandler: () => void = () => {}
    private startHandler: () => void = () => {}
    private tickHandler: (time: Date) => void = () => {}

    constructor() {
        this.resetTimeBounds()

        watch(this.simulatedTime, time => {
            this.tickHandler(time)
        })
    }

    onReset(handler: () => void) {
        this.resetHandler = handler
    }

    onStart(handler: () => void) {
        this.startHandler = handler
    }

    onTick(handler: ((time: Date) => void)) {
        this.tickHandler = handler
    }

    resetTimeBounds() {
        const currentTime = new Date()
        const start = new Date(currentTime.getTime() - 1 * 60 * 60 * 1000 /*1h*/)
        normalizeTimestamp(start)
        this.startTime.value = start
        this.endTime.value = currentTime
    }

    startSimulation() {
        this.resetHandler()
        this.simulatedTime.value = this.startTime.value
        this.startHandler()
        const ticker = setInterval(() => {
            const current = this.simulatedTime.value
            if (current == null) {
                clearInterval(ticker)
                this.reinitSimulation()
            }
            const newTime = new Date(current!.getTime() + 5 * 60 * 1000 /*5m*/)
            this.simulatedTime.value = newTime

            if (this.endTime.value == null || newTime >= this.endTime.value) {
                clearInterval(ticker)
                this.reinitSimulation()
            }
        },
            5 * 1000 /*5s*/)
    }

    reinitSimulation() {
        this.resetTimeBounds()
        this.startSimulation()
    }
}

function normalizeTimestamp(start: Date) {
    start.setMinutes(Math.floor(start.getMinutes() / 5) * 5)
    start.setSeconds(0)
    start.setMilliseconds(0)
}
