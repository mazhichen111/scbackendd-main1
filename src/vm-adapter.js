// VM Adapter - 适配器模式，处理不同版本的 Scratch VM
import Logger from './logger.js';

class VMAdapter {
    constructor() {
        this.vm = null;
        this.isRealVM = false;
    }

    async createVM() {
        try {
            // 尝试加载真正的 Scratch VM
            const VirtualMachine = await import('../scratch-vm-develop/src/index.js');
            this.vm = new VirtualMachine.default();
            this.isRealVM = true;
            Logger.info('Using real Scratch VM');
        } catch (error) {
            Logger.warn('Failed to load real Scratch VM, falling back to Mock VM:', error.message);
            // 回退到 Mock VM
            const MockVirtualMachine = await import('./mock-vm.js');
            this.vm = new MockVirtualMachine.default();
            this.isRealVM = false;
            Logger.info('Using Mock VM');
        }
        
        return this.vm;
    }

    setupExtensions() {
        if (!this.vm) return;

        const builtinExts = ['event', 'control', 'operators', 'variables', 'myBlocks'];
        
        for (const ext of builtinExts) {
            try {
                if (this.isRealVM && this.vm.extensionManager) {
                    this.vm.extensionManager.loadExtensionIdSync(ext);
                    Logger.info(`Loaded builtin extension: ${ext}`);
                }
            } catch (error) {
                Logger.warn(`Failed to load builtin extension ${ext}:`, error.message);
            }
        }

        // 加载自定义扩展
        try {
            if (this.isRealVM && this.vm.extensionManager) {
                // 对于真正的 VM，需要注册扩展
                this.registerScbackendExtension();
            } else {
                // 对于 Mock VM，直接添加方法
                this.addMockExtensionMethods();
            }
        } catch (error) {
            Logger.warn('Failed to setup custom extensions:', error.message);
        }
    }

    registerScbackendExtension() {
        // 为真正的 Scratch VM 注册扩展
        const extensionInfo = {
            id: 'scbackendbasic',
            name: 'Scbackend Basic',
            blocks: [
                {
                    opcode: 'sendEvent',
                    blockType: 'command',
                    text: 'send event [EVENT] with data [DATA]',
                    arguments: {
                        EVENT: { type: 'string', defaultValue: 'message' },
                        DATA: { type: 'string', defaultValue: 'hello' }
                    }
                },
                {
                    opcode: 'logMessage',
                    blockType: 'command',
                    text: 'log [MESSAGE]',
                    arguments: {
                        MESSAGE: { type: 'string', defaultValue: 'Hello from backend!' }
                    }
                },
                {
                    opcode: 'getCurrentTime',
                    blockType: 'reporter',
                    text: 'current timestamp'
                }
            ]
        };

        // 注册扩展方法
        const extensionInstance = {
            sendEvent: (args) => {
                if (this.vm.runtime.scbackend && this.vm.runtime.scbackend.send) {
                    this.vm.runtime.scbackend.send(args.EVENT, args.DATA);
                }
                Logger.info(`Event sent: ${args.EVENT} with data: ${args.DATA}`);
            },
            logMessage: (args) => {
                Logger.info(`Backend log: ${args.MESSAGE}`);
            },
            getCurrentTime: () => {
                return Date.now();
            }
        };

        // 尝试注册扩展
        if (this.vm.extensionManager && this.vm.extensionManager.loadExtensionURL) {
            this.vm.extensionManager.loadExtensionURL('scbackendbasic', extensionInstance);
        }
    }

    addMockExtensionMethods() {
        // 为 Mock VM 添加扩展方法
        if (this.vm && this.vm.addExtensionMethod) {
            this.vm.addExtensionMethod('sendEvent', (event, data) => {
                Logger.info(`Mock VM - Event sent: ${event} with data: ${data}`);
            });
            
            this.vm.addExtensionMethod('logMessage', (message) => {
                Logger.info(`Mock VM - Backend log: ${message}`);
            });
            
            this.vm.addExtensionMethod('getCurrentTime', () => {
                return Date.now();
            });
        }
    }

    async loadProject(projectData) {
        if (!this.vm) return false;

        try {
            if (this.isRealVM && this.vm.loadProject) {
                await this.vm.loadProject(projectData);
            } else if (this.vm.loadProject) {
                this.vm.loadProject(projectData);
            }
            return true;
        } catch (error) {
            Logger.error('Failed to load project:', error);
            return false;
        }
    }

    start() {
        if (this.vm && this.vm.start) {
            this.vm.start();
        }
    }

    stop() {
        if (this.vm && this.vm.stop) {
            this.vm.stop();
        }
    }

    setTurboMode(enabled) {
        if (this.vm && this.vm.setTurboMode) {
            this.vm.setTurboMode(enabled);
        }
    }
}

export default VMAdapter;