export default class EventEmitter {
    static instance = new EventEmitter();

    static on = (evt, handler, context) => {
        let handlers = EventEmitter.instance[evt];
        if (handlers === undefined) {
            handlers = [];
            EventEmitter.instance[evt] = handlers;
        }
        let item = {
            handler: handler,
            context: context
        };
        handlers.push(item);
        return item;
    }

    static once = (evt, handler, context) => {
        let handlers = EventEmitter.instance[evt];
        if (handlers === undefined) {
            handlers = [];
            EventEmitter.instance[evt] = handlers;
        }
        let item = {
            handler: handler,
            context: context,
            once: true
        };
        handlers.push(item);
        return item;
    }

    static off = (evt, handler, context) => {
        let handlers = EventEmitter.instance[evt];
        if (handlers !== undefined) {
            let size = handlers.length;
            for (let i = 0; i < size; i++) {
                let item = handlers[i];
                if (item.handler === handler && item.context === context) {
                    handlers.splice(i, 1);
                    return;
                }
            }
        }
    }

    static emit = (type, event) => {
        let hanlders = EventEmitter.instance[type];
        if (hanlders !== undefined) {
            for (let i = 0; i < hanlders.length; i++) {
                let ef = hanlders[i];
                let handler = ef.handler;
                let context = ef.context;
                handler.apply(context, [event]);
                ef.once && hanlders.splice(i--, 1);
            }
        }
    }
}
