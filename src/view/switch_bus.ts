const CHANNEL_NAME = "switch-bus"

type Action = { action: "next-preset", view: number }

export class SwitchBus {
    private channel: BroadcastChannel
    private viewId: number
    private nextPresetHandler: () => void = () => { }

    constructor(viewId: number) {
        this.channel = new BroadcastChannel(CHANNEL_NAME)
        this.viewId = viewId

        this.channel.onmessage = (evt: MessageEvent<Action>) => this.handleAction(evt.data)

        console.log('new switch bus for', viewId)
    }

    nextPreset() {
        this.channel.postMessage({ action: 'next-preset', view: this.viewId } as Action)
    }

    onNextPreset(handler: () => void) {
        this.nextPresetHandler = handler
    }

    handleAction(action: Action) {
        if (action.view != this.viewId) return 

        if (action.action == 'next-preset') {
            this.nextPresetHandler()
        }
    }

}