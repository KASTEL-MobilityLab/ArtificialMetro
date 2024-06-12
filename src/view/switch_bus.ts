
type Action = "next-preset" | "suspend" | "resume"

export class SwitchBusReceiver {
    private port: MessagePort
    private nextPresetHandler = () => { }
    private suspendHandler = () => { }
    private resumeHandler = () => { }

    constructor(port: MessagePort) {
        this.port = port
        this.port.onmessage = (evt: MessageEvent<Action>) => this.handleAction(evt.data)
    }

    onNextPreset(handler: () => void) {
        this.nextPresetHandler = handler
    }

    onSuspend(handler: () => void) {
        this.suspendHandler = handler
    }

    onResume(handler: () => void) {
        this.resumeHandler = handler
    }

    private handleAction(action: Action) {
        switch (action) {
            case "next-preset": this.nextPresetHandler(); break;
            case "suspend": this.suspendHandler(); break;
            case "resume": this.resumeHandler(); break;
        }
    }
}

class SwitchBusSender {
    private port: MessagePort

    constructor(port: MessagePort) {
        this.port = port
    }

    nextPreset() {
        this.send('next-preset')
    }

    suspend() {
        this.send('suspend')
    }

    resume() {
        this.send('resume')
    }

    private send(action: Action) {
        this.port.postMessage(action)
    }
}

export class SwitchBus {
    private sender: SwitchBusSender
    private receiver: SwitchBusReceiver

    constructor() {
        const channel = new MessageChannel()
        this.sender = new SwitchBusSender(channel.port1)
        this.receiver = new SwitchBusReceiver(channel.port2)
    }

    getReceiver(): SwitchBusReceiver {
        return this.receiver
    }

    nextPreset() {
        this.sender.nextPreset()
    }

    suspend() {
        this.sender.suspend()
    }

    resume() {
        this.sender.resume()
    }
}