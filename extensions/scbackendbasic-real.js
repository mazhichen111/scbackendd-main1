// Scbackend Basic Extension for Real Scratch VM
// 为真正的 Scratch VM 提供基础的后端功能

const ArgumentType = require('../scratch-vm-develop/src/extension-support/argument-type');
const BlockType = require('../scratch-vm-develop/src/extension-support/block-type');
const formatMessage = require('format-message');

/**
 * Scbackend Basic Extension
 * 提供基础的后端开发功能
 */
class ScbackendBasic {
    constructor(runtime) {
        this.runtime = runtime;
        
        // 初始化后端环境
        if (!this.runtime.scbackend) {
            this.runtime.scbackend = {
                eventqueue: [],
                variables: new Map(),
                send: (event, data) => {
                    console.log(`[ScbackendBasic] Event: ${event}`, data);
                }
            };
        }
    }

    /**
     * 获取扩展信息
     */
    getInfo() {
        return {
            id: 'scbackendbasic',
            name: formatMessage({
                id: 'scbackendbasic.categoryName',
                default: 'Scbackend Basic',
                description: 'Name of the Scbackend Basic extension'
            }),
            color1: '#FF6B35',
            color2: '#E55A2B',
            color3: '#CC4E21',
            blocks: [
                {
                    opcode: 'sendEvent',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'scbackendbasic.sendEvent',
                        default: 'send event [EVENT] with data [DATA]',
                        description: 'Send an event with data'
                    }),
                    arguments: {
                        EVENT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'message'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        }
                    }
                },
                {
                    opcode: 'setVariable',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'scbackendbasic.setVariable',
                        default: 'set backend variable [NAME] to [VALUE]',
                        description: 'Set a backend variable'
                    }),
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'value'
                        }
                    }
                },
                {
                    opcode: 'getVariable',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'scbackendbasic.getVariable',
                        default: 'backend variable [NAME]',
                        description: 'Get a backend variable'
                    }),
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        }
                    }
                },
                {
                    opcode: 'logMessage',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'scbackendbasic.logMessage',
                        default: 'log [MESSAGE]',
                        description: 'Log a message to console'
                    }),
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello from backend!'
                        }
                    }
                },
                {
                    opcode: 'getCurrentTime',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'scbackendbasic.getCurrentTime',
                        default: 'current timestamp',
                        description: 'Get current timestamp'
                    })
                },
                {
                    opcode: 'httpRequest',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'scbackendbasic.httpRequest',
                        default: 'HTTP [METHOD] request to [URL]',
                        description: 'Make HTTP request'
                    }),
                    arguments: {
                        METHOD: {
                            type: ArgumentType.STRING,
                            menu: 'httpMethods',
                            defaultValue: 'GET'
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://api.example.com'
                        }
                    }
                }
            ],
            menus: {
                httpMethods: {
                    acceptReporters: true,
                    items: ['GET', 'POST', 'PUT', 'DELETE']
                }
            }
        };
    }

    /**
     * 发送事件
     */
    sendEvent(args) {
        const event = args.EVENT;
        const data = args.DATA;
        
        if (this.runtime.scbackend && this.runtime.scbackend.send) {
            this.runtime.scbackend.send(event, data);
        }
        
        console.log(`[ScbackendBasic] Sent event: ${event} with data: ${data}`);
    }

    /**
     * 设置后端变量
     */
    setVariable(args) {
        const name = args.NAME;
        const value = args.VALUE;
        
        if (this.runtime.scbackend) {
            this.runtime.scbackend.variables.set(name, value);
        }
        
        console.log(`[ScbackendBasic] Set variable ${name} = ${value}`);
    }

    /**
     * 获取后端变量
     */
    getVariable(args) {
        const name = args.NAME;
        
        if (this.runtime.scbackend && this.runtime.scbackend.variables.has(name)) {
            return this.runtime.scbackend.variables.get(name);
        }
        
        return '';
    }

    /**
     * 记录日志
     */
    logMessage(args) {
        const message = args.MESSAGE;
        console.log(`[ScbackendBasic] Log: ${message}`);
    }

    /**
     * 获取当前时间戳
     */
    getCurrentTime() {
        return Date.now();
    }

    /**
     * HTTP 请求
     */
    httpRequest(args) {
        const method = args.METHOD;
        const url = args.URL;
        
        // 这里应该实现真正的 HTTP 请求
        // 为了简化，返回模拟响应
        console.log(`[ScbackendBasic] HTTP ${method} request to ${url}`);
        return `Response from ${url}`;
    }
}

module.exports = ScbackendBasic;