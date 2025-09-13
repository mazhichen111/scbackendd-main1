// 测试项目运行功能
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3030';

async function testProjectRun() {
    console.log('🚀 测试项目运行功能...\n');
    
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
        console.log('✅ 登录成功');
        
        // 2. 获取项目列表
        console.log('\n2️⃣ 获取项目列表...');
        const projectsResponse = await fetch(`${BASE_URL}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!projectsResponse.ok) {
            throw new Error(`获取项目失败: ${projectsResponse.status}`);
        }
        
        const projects = await projectsResponse.json();
        console.log(`✅ 获取到 ${projects.length} 个项目`);
        
        if (projects.length === 0) {
            console.log('⚠️  没有项目可以测试运行');
            return;
        }
        
        // 3. 测试运行第一个项目
        const testProject = projects[0];
        console.log(`\n3️⃣ 测试运行项目: ${testProject.name || testProject.id}`);
        
        const runResponse = await fetch(`${BASE_URL}/api/projects/${testProject.name || testProject.id}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const runResult = await runResponse.json();
        
        if (runResponse.ok) {
            console.log('✅ 项目运行成功:', runResult.message);
            console.log('   项目ID:', runResult.projectId);
            console.log('   状态:', runResult.status);
        } else {
            console.log('❌ 项目运行失败:', runResult.error);
        }
        
        // 4. 测试停止项目
        console.log(`\n4️⃣ 测试停止项目: ${testProject.name || testProject.id}`);
        
        const stopResponse = await fetch(`${BASE_URL}/api/projects/${testProject.name || testProject.id}/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const stopResult = await stopResponse.json();
        
        if (stopResponse.ok) {
            console.log('✅ 项目停止成功:', stopResult.message);
            console.log('   项目ID:', stopResult.projectId);
            console.log('   状态:', stopResult.status);
        } else {
            console.log('❌ 项目停止失败:', stopResult.error);
        }
        
        // 5. 测试运行不存在的项目
        console.log('\n5️⃣ 测试运行不存在的项目...');
        
        const invalidRunResponse = await fetch(`${BASE_URL}/api/projects/nonexistent-project/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (invalidRunResponse.ok) {
            console.log('❌ 不存在的项目运行应该失败但却成功了');
        } else {
            const errorResult = await invalidRunResponse.json();
            console.log('✅ 不存在的项目运行正确被拒绝:', errorResult.error);
        }
        
        console.log('\n🎉 项目运行功能测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testProjectRun();