
type Action = { action: "next-preset" }

export class SwitchBusReceiver {
    private port: MessagePort
    private nextPresetHandler = () => { }

    constructor(port: MessagePort) {
        this.port = port
        this.port.onmessage = (evt: MessageEvent<Action>) => this.handleAction(evt.data)
    }

    onNextPreset(handler: () => void) {
        this.nextPresetHandler = handler
    }

    private handleAction(action: Action) {
        if (action.action == 'next-preset') {
            this.nextPresetHandler()
        }
    }
}

class SwitchBusSender {
    private port: MessagePort

    constructor(port: MessagePort) {
        this.port = port
    }

    nextPreset() {
        this.port.postMessage({ action: 'next-preset' } as Action)
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
}