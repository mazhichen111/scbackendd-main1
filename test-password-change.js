// 测试密码修改功能
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3030';

async function testPasswordChange() {
    console.log('🔐 测试密码修改功能...\n');
    
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
        
        if (!loginResponse.ok) {
            throw new Error(`登录失败: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ 登录成功，获取到token');
        
        // 2. 测试密码修改
        console.log('\n2️⃣ 测试密码修改...');
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
        
        if (!changePasswordResponse.ok) {
            const errorData = await changePasswordResponse.json();
            throw new Error(`密码修改失败: ${changePasswordResponse.status} - ${errorData.error}`);
        }
        
        const changeData = await changePasswordResponse.json();
        console.log('✅ 密码修改成功:', changeData.message);
        
        // 3. 测试用新密码登录
        console.log('\n3️⃣ 测试新密码登录...');
        const newLoginResponse = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'newpassword123'
            })
        });
        
        if (!newLoginResponse.ok) {
            throw new Error(`新密码登录失败: ${newLoginResponse.status}`);
        }
        
        console.log('✅ 新密码登录成功');
        
        // 4. 恢复原密码
        console.log('\n4️⃣ 恢复原密码...');
        const newLoginData = await newLoginResponse.json();
        const newToken = newLoginData.token;
        
        const restoreResponse = await fetch(`${BASE_URL}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
            },
            body: JSON.stringify({
                currentPassword: 'newpassword123',
                newPassword: 'admin123'
            })
        });
        
        if (!restoreResponse.ok) {
            const errorData = await restoreResponse.json();
            throw new Error(`恢复密码失败: ${restoreResponse.status} - ${errorData.error}`);
        }
        
        console.log('✅ 密码已恢复为原始密码');
        
        // 5. 测试错误情况
        console.log('\n5️⃣ 测试错误密码修改...');
        const errorResponse = await fetch(`${BASE_URL}/api/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123'
            })
        });
        
        if (errorResponse.ok) {
            throw new Error('错误密码修改应该失败但却成功了');
        }
        
        const errorData = await errorResponse.json();
        console.log('✅ 错误密码修改正确被拒绝:', errorData.error);
        
        console.log('\n🎉 密码修改功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testPasswordChange();