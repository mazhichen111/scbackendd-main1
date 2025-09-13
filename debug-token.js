// 调试JWT token问题
import jwt from 'jsonwebtoken';

const JWT_SECRET_AUTH = process.env.JWT_SECRET || 'default-secret-key';
const JWT_SECRET_MIDDLEWARE = process.env.JWT_SECRET || 'default-secret-key';

console.log('🔍 调试JWT Token问题...\n');

// 模拟生成token（AuthService方式）
const payload = {
    username: 'admin',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000)
};

const token = jwt.sign(payload, JWT_SECRET_AUTH, { 
    expiresIn: '24h',
    issuer: 'scbackend'
});

console.log('1️⃣ 生成的Token:');
console.log(`   Secret: ${JWT_SECRET_AUTH}`);
console.log(`   Token: ${token.substring(0, 50)}...`);

// 解码token查看内容
const decoded = jwt.decode(token, { complete: true });
console.log('\n2️⃣ Token内容:');
console.log('   Header:', decoded.header);
console.log('   Payload:', decoded.payload);

// 验证token（Middleware方式）
console.log('\n3️⃣ 验证Token:');
try {
    const verified = jwt.verify(token, JWT_SECRET_MIDDLEWARE);
    console.log('✅ Token验证成功');
    console.log('   验证结果:', verified);
} catch (error) {
    console.log('❌ Token验证失败');
    console.log('   错误:', error.message);
    console.log('   错误类型:', error.name);
}

// 检查密钥是否一致
console.log('\n4️⃣ 密钥检查:');
console.log(`   AuthService密钥: ${JWT_SECRET_AUTH}`);
console.log(`   Middleware密钥: ${JWT_SECRET_MIDDLEWARE}`);
console.log(`   密钥是否一致: ${JWT_SECRET_AUTH === JWT_SECRET_MIDDLEWARE ? '✅' : '❌'}`);