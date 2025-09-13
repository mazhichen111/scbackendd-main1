// 测试登录跳转功能
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3030';

async function testLoginFlow() {
    console.log('🧪 测试登录跳转功能...\n');

    try {
        // 1. 测试登录API
        console.log('1️⃣ 测试登录API...');
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

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.success) {
            console.log('✅ 登录API测试成功');
            console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
            console.log(`   用户: ${loginData.user.username}`);
            
            // 2. 测试token验证API
            console.log('\n2️⃣ 测试token验证API...');
            const verifyResponse = await fetch(`${BASE_URL}/api/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
                console.log('✅ Token验证API测试成功');
                console.log(`   验证用户: ${verifyData.user.username}`);
            } else {
                console.log('❌ Token验证API测试失败');
                console.log('   响应:', verifyData);
            }

            // 3. 测试受保护的API
            console.log('\n3️⃣ 测试受保护的API...');
            const projectsResponse = await fetch(`${BASE_URL}/api/projects`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });

            if (projectsResponse.ok) {
                const projects = await projectsResponse.json();
                console.log('✅ 受保护API测试成功');
                console.log(`   项目数量: ${projects.length}`);
            } else {
                console.log('❌ 受保护API测试失败');
                console.log(`   状态码: ${projectsResponse.status}`);
            }

        } else {
            console.log('❌ 登录API测试失败');
            console.log('   响应:', loginData);
        }

        // 4. 测试无效登录
        console.log('\n4️⃣ 测试无效登录...');
        const invalidLoginResponse = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'wrongpassword'
            })
        });

        const invalidLoginData = await invalidLoginResponse.json();
        
        if (!invalidLoginResponse.ok && !invalidLoginData.success) {
            console.log('✅ 无效登录正确被拒绝');
            console.log(`   错误信息: ${invalidLoginData.message}`);
        } else {
            console.log('❌ 无效登录测试失败 - 应该被拒绝');
        }

        // 5. 测试未认证访问
        console.log('\n5️⃣ 测试未认证访问...');
        const unauthorizedResponse = await fetch(`${BASE_URL}/api/projects`);
        
        if (!unauthorizedResponse.ok) {
            console.log('✅ 未认证访问正确被拒绝');
            console.log(`   状态码: ${unauthorizedResponse.status}`);
        } else {
            console.log('❌ 未认证访问测试失败 - 应该被拒绝');
        }

        console.log('\n🎉 登录功能测试完成！');

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
    }
}

// 运行测试
testLoginFlow();