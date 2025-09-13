// 调试密码修改功能
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3030';

async function debugPasswordChange() {
    console.log('🔍 调试密码修改功能...\n');
    
    try {
        // 1. 先登录获取token
        console.log('1️⃣ 登录获取token...');
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
        
        const loginText = await loginResponse.text();
        console.log('登录响应状态:', loginResponse.status);
        console.log('登录响应内容:', loginText);
        
        if (!loginResponse.ok) {
            throw new Error(`登录失败: ${loginResponse.status}`);
        }
        
        const loginData = JSON.parse(loginText);
        const token = loginData.token;
        console.log('✅ 登录成功，获取到token');
        
        // 2. 测试密码修改API
        console.log('\n2️⃣ 测试密码修改API...');
        console.log('请求URL:', `${BASE_URL}/api/change-password`);
        console.log('请求头:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.substring(0, 20)}...`
        });
        console.log('请求体:', {
            currentPassword: 'admin123',
            newPassword: 'newpassword123'
        });
        
        const changePasswordResponse = await fetch(`${BASE_URL}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: 'admin123',
                newPassword: 'newpassword123'
            })
        });
        
        const responseText = await changePasswordResponse.text();
        console.log('\n响应状态:', changePasswordResponse.status);
        console.log('响应头:', Object.fromEntries(changePasswordResponse.headers.entries()));
        console.log('响应内容:', responseText);
        
        if (!changePasswordResponse.ok) {
            console.log('❌ 密码修改失败');
            try {
                const errorData = JSON.parse(responseText);
                console.log('错误详情:', errorData);
            } catch (e) {
                console.log('无法解析错误响应为JSON');
            }
        } else {
            console.log('✅ 密码修改成功');
        }
        
    } catch (error) {
        console.error('❌ 调试失败:', error.message);
        console.error('错误堆栈:', error.stack);
    }
}

debugPasswordChange();