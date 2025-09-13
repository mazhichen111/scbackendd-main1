#!/usr/bin/env node

// Scbackend 启动脚本
// 检查依赖并启动服务

import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

console.log('🎯 Scbackend 启动检查...\n');

// 检查 Node.js 版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error('❌ 需要 Node.js 16.0.0 或更高版本');
    console.error(`   当前版本: ${nodeVersion}`);
    process.exit(1);
}
console.log(`✅ Node.js 版本检查通过: ${nodeVersion}`);

// 检查必要文件
const requiredFiles = [
    'src/index.js',
    'src/server.js',
    'src/manager.js',
    'src/projects.js',
    'src/runner.js',
    'src/service.js',
    'src/logger.js',
    'package.json'
];

let missingFiles = [];
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        missingFiles.push(file);
    }
}

if (missingFiles.length > 0) {
    console.error('❌ 缺少必要文件:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
}
console.log('✅ 必要文件检查通过');

// 检查依赖包
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});

console.log('📦 检查依赖包...');
let missingDeps = [];

for (const dep of dependencies) {
    try {
        const depPath = path.join('node_modules', dep);
        if (!fs.existsSync(depPath)) {
            missingDeps.push(dep);
        }
    } catch (error) {
        missingDeps.push(dep);
    }
}

if (missingDeps.length > 0) {
    console.log('⚠️  发现缺少的依赖包，正在安装...');
    console.log('   缺少的包:', missingDeps.join(', '));
    
    const npmInstall = spawn('npm', ['install'], { 
        stdio: 'inherit',
        shell: true 
    });
    
    npmInstall.on('close', (code) => {
        if (code === 0) {
            console.log('✅ 依赖包安装完成');
            startServer();
        } else {
            console.error('❌ 依赖包安装失败');
            process.exit(1);
        }
    });
} else {
    console.log('✅ 依赖包检查通过');
    startServer();
}

function startServer() {
    console.log('\n🚀 启动 Scbackend 服务器...\n');
    
    // 设置环境变量
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    
    // 启动主服务
    import('./src/index.js')
        .then((module) => {
            const main = module.default;
            main(process.cwd());
        })
        .catch((error) => {
            console.error('❌ 启动失败:', error.message);
            console.error('\n🔧 可能的解决方案:');
            console.error('   1. 检查端口 3030 和 3031 是否被占用');
            console.error('   2. 确保数据库配置正确');
            console.error('   3. 检查文件权限');
            console.error('   4. 运行 npm install 重新安装依赖');
            process.exit(1);
        });
}