// 测试WebSocket连接功能
import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3031';

function testWebSocket() {
    console.log('🔌 测试WebSocket连接...\n');
    
    const ws = new WebSocket(WS_URL);
    let connectionTimeout;
    let testTimeout;
    
    // 设置连接超时
    connectionTimeout = setTimeout(() => {
        console.log('❌ WebSocket连接超时');
        ws.close();
        process.exit(1);
    }, 5000);
    
    ws.on('open', function open() {
        console.log('✅ WebSocket连接成功建立');
        clearTimeout(connectionTimeout);
        
        // 测试发送消息
        console.log('📤 发送测试消息...');
        ws.send(JSON.stringify({
            type: 'test',
            message: 'Hello WebSocket Server',
            timestamp: new Date().toISOString()
        }));
        
        // 设置测试完成超时
        testTimeout = setTimeout(() => {
            console.log('✅ WebSocket基本功能测试完成');
            ws.close();
        }, 2000);
    });
    
    ws.on('message', function message(data) {
        console.log('📥 收到服务器消息:', data.toString());
        
        try {
            const parsed = JSON.parse(data.toString());
            console.log('   解析后的消息:', parsed);
        } catch (e) {
            console.log('   (无法解析为JSON)');
        }
    });
    
    ws.on('error', function error(err) {
        console.log('❌ WebSocket连接错误:', err.message);
        clearTimeout(connectionTimeout);
        clearTimeout(testTimeout);
    });
    
    ws.on('close', function close(code, reason) {
        console.log(`🔌 WebSocket连接关闭 - 代码: ${code}, 原因: ${reason || '正常关闭'}`);
        clearTimeout(connectionTimeout);
        clearTimeout(testTimeout);
        
        if (code === 1000) {
            console.log('🎉 WebSocket测试完成！');
        } else {
            console.log('⚠️  WebSocket异常关闭');
        }
        
        process.exit(0);
    });
}

testWebSocket();