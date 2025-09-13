import VMAdapter from './vm-adapter.js';
import denque from 'denque';
import getProjectUrl from './getprojecturl.js';
import http from 'http';
import Logger from './logger.js';

class Runner {
    constructor(id) {
        this.vmAdapter = new VMAdapter();
        this.vm = null;
        this.id = id;
        this.eventqueue = new denque();
        this.initialized = false;
    }
    async init(callback, handleEvent) {
        try {
            // 创建 VM 实例
            this.vm = await this.vmAdapter.createVM();
            this.vm.setTurboMode(true);
            
            // 设置扩展
            this.vmAdapter.setupExtensions();
            
            this.initialized = true;
            Logger.info(`VM initialized for runner: ${this.id}`);
        } catch (error) {
            Logger.error('Failed to initialize VM:', error);
        }
        
        // 加载项目
        try {
            const project = await this.fetchProject(this.id);
            const projectBody = project.body || project;
            
            const loadSuccess = await this.vmAdapter.loadProject(projectBody);
            if (loadSuccess) {
                this.setupRuntime(handleEvent);
                this.vmAdapter.start();
                Logger.info(`Project loaded and VM started for runner: ${this.id}`);
            } else {
                Logger.warn('Project loading failed, setting up basic runtime');
                this.setupRuntime(handleEvent);
            }
        } catch (error) {
            Logger.error('Error with project:', error);
            this.setupRuntime(handleEvent);
        }
        
        if (callback && typeof callback === 'function') {
            callback(this.vm);
        }
    }
    close() {
        if (this.vmAdapter && this.vm) {
            this.vmAdapter.stop();
            Logger.info(`VM stopped for runner: ${this.id}`);
        } else {
            Logger.warn(`No VM to stop for runner: ${this.id}`);
        }
    }
    trigger(event, data, callback) {
        if (this.vm && this.vm.runtime && this.vm.runtime.scbackend) {
            this.vm.runtime.scbackend.eventqueue.push([event, data]);
            // Mock VM 不需要 startHats，直接触发事件处理
            if (this.vm.runtime.scbackend.send) {
                this.vm.runtime.scbackend.send(event, data);
            }
            Logger.info(`Triggered event: ${event}`, data);
        } else {
            Logger.error('VM is not initialized or runtime not ready');
        }
    }

    setupRuntime(handleEvent) {
        if (this.vm && this.vm.runtime) {
            this.vm.runtime.scbackend = {};
            this.vm.runtime.scbackend.eventqueue = new denque();
            this.vm.runtime.scbackend.send = (event, data) => {
                this.eventqueue.push([event, data]);
                if (handleEvent) handleEvent(this.id);
            }
        }
    }

    fetchProject(id) {
        return new Promise((resolve, reject) => {
            const url = `http://localhost:3030${getProjectUrl(id)}`;
            http.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const project = JSON.parse(data);
                        resolve(project);
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
};

export default Runner;