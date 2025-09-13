// 认证和权限管理系统
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Logger from './logger.js';

class AuthManager {
    constructor() {
        // JWT 密钥 - 生产环境应该从环境变量读取
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        this.saltRounds = 12;
        
        // 默认管理员账户
        this.users = new Map();
        this.sessions = new Map();
        
        // 初始化默认管理员
        this.initDefaultAdmin();
        
        Logger.info('Authentication system initialized');
    }

    async initDefaultAdmin() {
        const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, this.saltRounds);
        
        this.users.set('admin', {
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            created_at: new Date().toISOString(),
            last_login: null
        });
        
        Logger.warn(`Default admin user created with password: ${defaultPassword}`);
        Logger.warn('Please change the default password immediately!');
    }

    // 生成 JWT Token
    generateToken(user) {
        const payload = {
            username: user.username,
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        };
        
        return jwt.sign(payload, this.jwtSecret, { 
            expiresIn: '24h',
            issuer: 'scbackend'
        });
    }

    // 验证 JWT Token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            Logger.warn('Invalid token:', error.message);
            return null;
        }
    }

    // 用户登录
    async login(username, password) {
        const user = this.users.get(username);
        if (!user) {
            Logger.warn(`Login attempt with invalid username: ${username}`);
            return { success: false, message: 'Invalid credentials' };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            Logger.warn(`Invalid password attempt for user: ${username}`);
            return { success: false, message: 'Invalid credentials' };
        }

        // 更新最后登录时间
        user.last_login = new Date().toISOString();
        
        // 生成 token
        const token = this.generateToken(user);
        
        // 创建会话
        const sessionId = crypto.randomUUID();
        this.sessions.set(sessionId, {
            username: user.username,
            token: token,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

        Logger.info(`User ${username} logged in successfully`);
        
        return {
            success: true,
            token: token,
            sessionId: sessionId,
            user: {
                username: user.username,
                role: user.role,
                last_login: user.last_login
            }
        };
    }

    // 用户登出
    logout(sessionId) {
        if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            this.sessions.delete(sessionId);
            Logger.info(`User ${session.username} logged out`);
            return { success: true, message: 'Logged out successfully' };
        }
        return { success: false, message: 'Invalid session' };
    }

    // 创建新用户
    async createUser(username, password, role = 'user') {
        if (this.users.has(username)) {
            return { success: false, message: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, this.saltRounds);
        
        this.users.set(username, {
            username: username,
            password: hashedPassword,
            role: role,
            created_at: new Date().toISOString(),
            last_login: null
        });

        Logger.info(`New user created: ${username} with role: ${role}`);
        
        return { success: true, message: 'User created successfully' };
    }

    // 修改密码
    async changePassword(username, oldPassword, newPassword) {
        const user = this.users.get(username);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidOldPassword) {
            Logger.warn(`Invalid old password attempt for user: ${username}`);
            return { success: false, message: 'Invalid old password' };
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);
        user.password = hashedNewPassword;

        Logger.info(`Password changed for user: ${username}`);
        
        return { success: true, message: 'Password changed successfully' };
    }

    // 获取用户信息
    getUser(username) {
        const user = this.users.get(username);
        if (user) {
            const { password, ...userInfo } = user;
            return userInfo;
        }
        return null;
    }

    // 检查权限
    hasPermission(user, action, resource) {
        if (user.role === 'admin') {
            return true; // 管理员有所有权限
        }

        // 定义权限规则
        const permissions = {
            'user': {
                'projects': ['read'],
                'runners': ['read'],
                'events': ['trigger']
            },
            'developer': {
                'projects': ['read', 'create', 'update'],
                'runners': ['read', 'create', 'remove'],
                'events': ['trigger']
            }
        };

        const userPermissions = permissions[user.role];
        if (!userPermissions || !userPermissions[resource]) {
            return false;
        }

        return userPermissions[resource].includes(action);
    }

    // 清理过期会话
    cleanupExpiredSessions() {
        const now = new Date();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (new Date(session.expires_at) < now) {
                this.sessions.delete(sessionId);
                Logger.debug(`Expired session cleaned up: ${sessionId}`);
            }
        }
    }
}

export default AuthManager;