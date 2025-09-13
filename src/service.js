import { WebSocketServer } from 'ws';
import Logger from './logger.js';

class Service
{
    constructor(port, manager) {
        this.port = port;
        this.manager = manager;
        this._handling = false;
        this.clients = new Set();
        this.wss = null;
    }

    init() {
        this.manager.addEventListener('message', this.handleEvent.bind(this));
    }

    start() {
        this.wss = new WebSocketServer({ port: this.port });
        
        this.wss.on('connection', (ws, req) => {
            const clientIP = req.socket.remoteAddress;
            Logger.info(`WebSocket client connected from ${clientIP}`);
            this.clients.add(ws);

            ws.on('message', (message) => {
                let data;
                try {
                    data = JSON.parse(message);
                } catch (e) {
                    Logger.warn('Invalid JSON received from WebSocket client');
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
                    return;
                }
                if (!data.type) {
                    Logger.warn('Message without type field received');
                    ws.send(JSON.stringify({ type: 'error', message: 'Missing type field' }));
                    return;
                }
                this.handleMessage(ws, data);
            });

            ws.on('close', () => {
                Logger.info(`WebSocket client disconnected from ${clientIP}`);
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                Logger.error('WebSocket client error:', error);
                this.clients.delete(ws);
            });
        });

        this.wss.on('listening', () => {
            Logger.info(`WebSocket server listening on port ${this.port}`);
        });

        this.wss.on('error', (error) => {
            Logger.error('WebSocket server error:', error);
        });
    }

    async handleEvent() {
        if (this._handling) return;
        this._handling = true;
        while (this.manager.eventqueue.length > 0) {
            const [event, data] = this.manager.eventqueue.shift();
            // 广播事件到所有连接的客户端
            this.broadcast({
                type: 'event',
                event: event,
                data: data,
                timestamp: new Date().toISOString()
            });
        }
        this._handling = false;
    }

    broadcast(message) {
        const messageStr = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN = 1
                client.send(messageStr);
            }
        });
    }

    handleMessage(ws, data) {
        switch (data.type) {
            case 'handshake':
                this.handleHandshake(ws, data);
                break;
            // 可以添加更多类型处理
            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown type' }));
        }
    }

    handleHandshake(ws, data) {
        // 这里可以做认证、分配ID等
        Logger.info('WebSocket handshake received');
        ws.send(JSON.stringify({ 
            type: 'handshake', 
            status: 'ok',
            timestamp: new Date().toISOString(),
            serverVersion: '1.0.2'
        }));
    }
}

export default Service;