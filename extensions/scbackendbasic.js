// Scbackend Basic Extension
// 为 Scratch 提供基础的后端功能

class ScbackendBasic {
    constructor(runtime) {
        this.runtime = runtime;
    }

    getInfo() {
        return {
            id: 'scbackendbasic',
            name: 'Scbackend Basic',
            color1: '#4C97FF',
            color2: '#4280D7',
            blocks: [
                {
                    opcode: 'sendMessage',
                    blockType: 'command',
                    text: 'send message [MESSAGE] with data [DATA]',
                    arguments: {
                        MESSAGE: {
                            type: 'string',
                            defaultValue: 'hello'
                        },
                        DATA: {
                            type: 'string',
                            defaultValue: '{}'
                        }
                    }
                },
                {
                    opcode: 'log',
                    blockType: 'command',
                    text: 'log [MESSAGE]',
                    arguments: {
                        MESSAGE: {
                            type: 'string',
                            defaultValue: 'Hello World'
                        }
                    }
                },
                {
                    opcode: 'getCurrentTime',
                    blockType: 'reporter',
                    text: 'current timestamp'
                },
                {
                    opcode: 'parseJSON',
                    blockType: 'reporter',
                    text: 'parse JSON [JSON] get [KEY]',
                    arguments: {
                        JSON: {
                            type: 'string',
                            defaultValue: '{"key": "value"}'
                        },
                        KEY: {
                            type: 'string',
                            defaultValue: 'key'
                        }
                    }
                },
                {
                    opcode: 'createJSON',
                    blockType: 'reporter',
                    text: 'create JSON with [KEY] : [VALUE]',
                    arguments: {
                        KEY: {
                            type: 'string',
                            defaultValue: 'key'
                        },
                        VALUE: {
                            type: 'string',
                            defaultValue: 'value'
                        }
                    }
                }
            ]
        };
    }

    sendMessage(args) {
        const message = args.MESSAGE;
        let data;
        
        try {
            data = JSON.parse(args.DATA);
        } catch (e) {
            data = args.DATA;
        }

        if (this.runtime.scbackend && this.runtime.scbackend.send) {
            this.runtime.scbackend.send('message', { message, data });
        }
    }

    log(args) {
        console.log(`[SCRATCH] ${args.MESSAGE}`);
    }

    getCurrentTime() {
        return Date.now();
    }

    parseJSON(args) {
        try {
            const obj = JSON.parse(args.JSON);
            return obj[args.KEY] || '';
        } catch (e) {
            return '';
        }
    }

    createJSON(args) {
        const obj = {};
        obj[args.KEY] = args.VALUE;
        return JSON.stringify(obj);
    }
}

module.exports = ScbackendBasic;