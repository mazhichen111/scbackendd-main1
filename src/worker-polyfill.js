/**
 * Node.js Worker polyfill for Scratch VM
 * 解决在Node.js环境中Worker不可用的问题
 */

// 检查是否在Node.js环境中
const isNodeEnvironment = typeof window === 'undefined' && typeof global !== 'undefined';

if (isNodeEnvironment) {
    // 在Node.js环境中，创建一个Worker的mock实现
    global.Worker = class MockWorker {
        constructor(scriptPath, options = {}) {
            this.scriptPath = scriptPath;
            this.options = options;
            this.onmessage = null;
            this.onerror = null;
            this.onmessageerror = null;
            this._listeners = new Map();
            
            // 模拟异步初始化
            setTimeout(() => {
                this._triggerEvent('message', { data: { type: 'worker-ready' } });
            }, 10);
        }
        
        postMessage(data, transfer) {
            // 在Node.js环境中，我们简单地回显消息
            setTimeout(() => {
                this._triggerEvent('message', { 
                    data: { 
                        type: 'response', 
                        original: data,
                        result: 'mock-processed'
                    } 
                });
            }, 5);
        }
        
        terminate() {
            // 清理资源
            this._listeners.clear();
        }
        
        addEventListener(type, listener, options) {
            if (!this._listeners.has(type)) {
                this._listeners.set(type, []);
            }
            this._listeners.get(type).push(listener);
        }
        
        removeEventListener(type, listener) {
            if (this._listeners.has(type)) {
                const listeners = this._listeners.get(type);
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }
        
        dispatchEvent(event) {
            this._triggerEvent(event.type, event);
        }
        
        _triggerEvent(type, event) {
            // 触发onXXX处理器
            const handlerName = `on${type}`;
            if (this[handlerName] && typeof this[handlerName] === 'function') {
                this[handlerName](event);
            }
            
            // 触发addEventListener注册的监听器
            if (this._listeners.has(type)) {
                this._listeners.get(type).forEach(listener => {
                    try {
                        listener(event);
                    } catch (error) {
                        console.error(`Worker event listener error:`, error);
                    }
                });
            }
        }
    };
    
    console.log('[Worker Polyfill] Node.js Worker polyfill loaded');
} else {
    console.log('[Worker Polyfill] Browser environment detected, using native Worker');
}

export const isNode = isNodeEnvironment;
export const MockWorker = isNodeEnvironment ? global.Worker : null;