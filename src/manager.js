import Runner from "./runner.js";
import denque from 'denque';
import Logger from './logger.js';

class Manager {
    constructor() {
        this.runners = {};
        this.eventqueue = new denque();
        this._handling = false;
        this.eventbinding = {};
    }
    addRunner(id) {
        if (!this.runners[id]) {
            this.runners[id] = new Runner(id);
            this.runners[id]._handling = false;
            Logger.info(`Runner added for ID: ${id}`);
            this.runners[id].init((vm) => {
                Logger.info(`Runner initialized for ID: ${id}`);
            }, (runnerId) => this.handleEvent(runnerId));
        } else {
            Logger.warn(`Runner already exists for ID: ${id}`);
        }
    }
    removeRunner(id) {
        if (this.runners[id]) {
            this.runners[id].close();
            delete this.runners[id];
            Logger.info(`Runner removed for ID: ${id}`);
        } else {
            Logger.warn(`No runner found for ID: ${id}`);
        }
    }
    triggerRunnerEvent(id, event, data) {
        if (this.runners[id]) {
            this.runners[id].trigger(event, data);
            Logger.info(`Event triggered for ID: ${id}, Event: ${event}`, data);
        } else {
            Logger.error(`No runner found for ID: ${id}`);
        }
    }
    triggerLocalEvent(event, data) {
        if (this.eventbinding[event]) {
            for (const callback of this.eventbinding[event]) {
                if (typeof callback === 'function') {
                    callback(data);
                }
            }
            Logger.info(`Local event triggered: ${event}`, data);
        } else {
            Logger.warn(`No listeners for local event: ${event}`);
        }
    }
    addEventListener(event, callback) {
        if (!this.eventbinding[event]) {
            this.eventbinding[event] = [];
        }
        this.eventbinding[event].push(callback);
        Logger.info(`Event listener added for event: ${event}`);
    }

    async handleEvent(id) {
        const runner = this.runners[id];
        if (!runner) {
            Logger.error(`No runner found for ID: ${id}`);
            return;
        }
        if (runner._handling) return;
        runner._handling = true;
        while (runner.eventqueue.length > 0) {
            const [event, data] = runner.eventqueue.shift();
            Logger.info(`Handling event for ID: ${id}, Event: ${event}`, data);
            switch (event) {
                case 'message':
                    // 网络IO正常冒泡
                    Logger.info(`Message for ID: ${id}`, data);
                    this.eventqueue.push([event, data]);
                    this.triggerLocalEvent('message');
                    break;
                // 可以添加更多事件处理
                default:
                    Logger.warn(`Unknown event type: ${event} for ID: ${id}`);
            }
        }
        runner._handling = false;
    }
}

export default Manager;