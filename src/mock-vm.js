// Mock Scratch Virtual Machine
// 用于在没有 scbackend-vm 时提供基本功能

import { EventEmitter } from 'events';
import Logger from './logger.js';

class MockVirtualMachine extends EventEmitter {
    constructor() {
        super();
        this.runtime = {
            scbackend: null,
            targets: [],
            isRunning: false
        };
        this.extensionManager = new MockExtensionManager();
        this.turboMode = false;
        Logger.info('Mock Virtual Machine initialized');
    }

    setTurboMode(enabled) {
        this.turboMode = enabled;
        Logger.debug(`Turbo mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    async loadProject(projectData) {
        try {
            const project = typeof projectData === 'string' ? JSON.parse(projectData) : projectData;
            this.runtime.targets = project.targets || [];
            Logger.info(`Mock VM loaded project with ${this.runtime.targets.length} targets`);
            
            // 模拟加载延迟
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.emit('PROJECT_LOADED');
            return Promise.resolve();
        } catch (error) {
            Logger.error('Mock VM failed to load project:', error);
            return Promise.reject(error);
        }
    }

    start() {
        this.runtime.isRunning = true;
        Logger.info('Mock VM started');
        this.emit('PROJECT_START');
        
        // 模拟定期执行
        this.executionInterval = setInterval(() => {
            this.emit('RUNTIME_STEP');
        }, 1000);
    }

    stop() {
        this.runtime.isRunning = false;
        if (this.executionInterval) {
            clearInterval(this.executionInterval);
            this.executionInterval = null;
        }
        Logger.info('Mock VM stopped');
        this.emit('PROJECT_STOP');
    }

    greenFlag() {
        Logger.info('Mock VM green flag clicked');
        this.emit('GREEN_FLAG');
    }

    stopAll() {
        Logger.info('Mock VM stop all');
        this.emit('STOP_ALL');
    }
}

class MockExtensionManager {
    constructor() {
        this.loadedExtensions = new Set();
    }

    loadExtensionIdSync(extensionId) {
        this.loadedExtensions.add(extensionId);
        Logger.debug(`Mock extension loaded: ${extensionId}`);
        return true;
    }

    isExtensionLoaded(extensionId) {
        return this.loadedExtensions.has(extensionId);
    }

    getLoadedExtensions() {
        return Array.from(this.loadedExtensions);
    }
}

export default MockVirtualMachine;