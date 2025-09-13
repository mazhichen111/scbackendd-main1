// 详细测试登录和token验证
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3030';

async function detailedTest() {
    console.log('🔍 详细测试登录和token验证...\n');

    try {
        // 1. 登录获取token
        console.log('1️⃣ 执行登录...');
        const loginResponse = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        console.log(`   登录响应状态: ${loginResponse.status}`);
        const loginData = await loginResponse.json();
        console.log(`   登录响应数据:`, loginData);

        if (loginResponse.ok && loginData.success) {
            const token = loginData.token;
            console.log(`   获取到Token: ${token.substring(0, 30)}...`);

            // 2. 测试token验证
            console.log('\n2️⃣ 测试token验证...');
            const verifyResponse = await fetch(`${BASE_URL}/api/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`   验证响应状态: ${verifyResponse.status}`);
            console.log(`   验证响应头:`, Object.fromEntries(verifyResponse.headers.entries()));
            
            const verifyText = await verifyResponse.text();
            console.log(`   验证响应原始内容: ${verifyText}`);
            
            try {
                const verifyData = JSON.parse(verifyText);
                console.log(`   验证响应JSON:`, verifyData);
            } catch (e) {
                console.log(`   响应不是有效JSON: ${e.message}`);
            }

            // 3. 测试其他受保护的API
            console.log('\n3️⃣ 测试受保护的projects API...');
            const projectsResponse = await fetch(`${BASE_URL}/api/projects`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`   Projects响应状态: ${projectsResponse.status}`);
            const projectsText = await projectsResponse.text();
            console.log(`   Projects响应内容: ${projectsText.substring(0, 200)}...`);

        } else {
            console.log('❌ 登录失败，无法继续测试');
        }

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
}

detailedTest();