#!/usr/bin/env node

// Scbackend 测试脚本
// 测试服务器的各项功能

import http from 'http';
import { WebSocket } from 'ws';

console.log('🧪 Scbackend 功能测试\n');

const BASE_URL = 'http://localhost:3030';
const WS_URL = 'ws://localhost:3031';

let testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

function logTest(name, success, message = '') {
    testResults.total++;
    if (success) {
        testResults.passed++;
        console.log(`✅ ${name}`);
    } else {
        testResults.failed++;
        console.log(`❌ ${name}: ${message}`);
    }
}

function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${path}`;
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testServerConnection() {
    try {
        const response = await makeRequest('/');
        logTest('服务器连接', response.statusCode === 200, `状态码: ${response.statusCode}`);
    } catch (error) {
        logTest('服务器连接', false, error.message);
    }
}

async function testProjectAPI() {
    try {
        // 测试获取项目列表
        const listResponse = await makeRequest('/api/projects');
        logTest('获取项目列表 API', listResponse.statusCode === 200, `状态码: ${listResponse.statusCode}`);
        
        // 测试创建项目
        const createData = JSON.stringify({
            name: 'test_project_' + Date.now(),
            body: '{"targets": [], "monitors": [], "extensions": [], "meta": {"semver": "3.0.0"}}'
        });
        
        const createResponse = await makeRequest('/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(createData)
            },
            body: createData
        });
        
        logTest('创建项目 API', createResponse.statusCode === 200 || createResponse.statusCode === 409, 
               `状态码: ${createResponse.statusCode}`);
        
        // 测试获取单个项目
        const getResponse = await makeRequest('/project/test_project');
        logTest('获取单个项目 API', getResponse.statusCode === 200 || getResponse.statusCode === 404, 
               `状态码: ${getResponse.statusCode}`);
        
    } catch (error) {
        logTest('项目 API 测试', false, error.message);
    }
}

async function testRunnerAPI() {
    try {
        // 测试获取 Runners
        const listResponse = await makeRequest('/api/runners');
        logTest('获取 Runners API', listResponse.statusCode === 200, `状态码: ${listResponse.statusCode}`);
        
        // 测试添加 Runner (可能失败，因为需要项目存在)
        const addResponse = await makeRequest('/runner/add/test_runner');
        logTest('添加 Runner API', addResponse.statusCode === 200 || addResponse.statusCode === 404, 
               `状态码: ${addResponse.statusCode}`);
        
    } catch (error) {
        logTest('Runner API 测试', false, error.message);
    }
}

async function testWebSocket() {
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket(WS_URL);
            let connected = false;
            
            const timeout = setTimeout(() => {
                if (!connected) {
                    logTest('WebSocket 连接', false, '连接超时');
                    ws.close();
                    resolve();
                }
            }, 5000);
            
            ws.on('open', () => {
                connected = true;
                clearTimeout(timeout);
                logTest('WebSocket 连接', true);
                
                // 测试握手
                ws.send(JSON.stringify({ type: 'handshake' }));
            });
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    if (message.type === 'handshake') {
                        logTest('WebSocket 握手', message.status === 'ok');
                    }
                } catch (error) {
                    logTest('WebSocket 消息解析', false, error.message);
                }
                
                ws.close();
                resolve();
            });
            
            ws.on('error', (error) => {
                logTest('WebSocket 连接', false, error.message);
                resolve();
            });
            
        } catch (error) {
            logTest('WebSocket 测试', false, error.message);
            resolve();
        }
    });
}

async function runTests() {
    console.log('开始测试...\n');
    
    await testServerConnection();
    await testProjectAPI();
    await testRunnerAPI();
    await testWebSocket();
    
    console.log('\n📊 测试结果:');
    console.log(`   总计: ${testResults.total}`);
    console.log(`   通过: ${testResults.passed}`);
    console.log(`   失败: ${testResults.failed}`);
    console.log(`   成功率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 所有测试通过！');
        process.exit(0);
    } else {
        console.log('\n⚠️  部分测试失败，请检查服务器状态');
        process.exit(1);
    }
}

// 等待服务器启动
setTimeout(runTests, 3000);