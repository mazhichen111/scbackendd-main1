// 测试项目创建功能
import http from 'http';

const testData = {
    name: 'test-project-' + Date.now(),
    body: JSON.stringify({
        targets: [],
        monitors: [],
        extensions: [],
        meta: { semver: '3.0.0' }
    })
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3030,
    path: '/create',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('🧪 测试项目创建...');
console.log('发送数据:', testData);

const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('响应内容:', data);
        if (res.statusCode === 200) {
            console.log('✅ 项目创建成功');
        } else {
            console.log('❌ 项目创建失败');
        }
    });
});

req.on('error', (e) => {
    console.error(`请求错误: ${e.message}`);
});

req.write(postData);
req.end();