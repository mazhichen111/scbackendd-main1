// 认证和权限中间件
import jwt from 'jsonwebtoken';
import Logger from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

// 验证token中间件
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: '访问令牌无效或已过期'
            });
        }
        req.user = user;
        next();
    });
}

// 要求认证的中间件
export function requireAuth(req, res, next) {
    authenticateToken(req, res, next);
}

class AuthMiddleware {
    constructor(authManager) {
        this.authManager = authManager;
    }

    // 认证中间件
    authenticate() {
        return (req, res, next) => {
            // 跳过登录和静态文件
            if (req.path === '/login' || req.path === '/api/login' || 
                req.path.startsWith('/public/') || req.path === '/') {
                return next();
            }

            const token = this.extractToken(req);
            if (!token) {
                Logger.warn(`Unauthorized access attempt to ${req.path} from ${req.ip}`);
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication token required'
                });
            }

            const decoded = this.authManager.verifyToken(token);
            if (!decoded) {
                Logger.warn(`Invalid token used for ${req.path} from ${req.ip}`);
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                });
            }

            // 将用户信息添加到请求对象
            req.user = decoded;
            next();
        };
    }

    // 权限检查中间件
    authorize(action, resource) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            if (!this.authManager.hasPermission(req.user, action, resource)) {
                Logger.warn(`Access denied: ${req.user.username} tried to ${action} ${resource}`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Insufficient permissions to ${action} ${resource}`
                });
            }

            next();
        };
    }

    // 管理员权限中间件
    requireAdmin() {
        return (req, res, next) => {
            if (!req.user || req.user.role !== 'admin') {
                Logger.warn(`Admin access denied for user: ${req.user?.username || 'anonymous'}`);
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Administrator privileges required'
                });
            }
            next();
        };
    }

    // 提取 Token
    extractToken(req) {
        // 从 Authorization header 提取
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // 从 Cookie 提取
        const cookies = req.headers.cookie;
        if (cookies) {
            const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
            if (tokenCookie) {
                return tokenCookie.split('=')[1];
            }
        }

        // 从查询参数提取 (不推荐，但为了兼容性)
        return req.query.token;
    }

    // 速率限制中间件
    rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
        const requests = new Map();

        return (req, res, next) => {
            const key = req.ip + (req.user?.username || 'anonymous');
            const now = Date.now();
            
            if (!requests.has(key)) {
                requests.set(key, []);
            }

            const userRequests = requests.get(key);
            
            // 清理过期的请求记录
            const validRequests = userRequests.filter(time => now - time < windowMs);
            requests.set(key, validRequests);

            if (validRequests.length >= maxRequests) {
                Logger.warn(`Rate limit exceeded for ${key}`);
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.'
                });
            }

            validRequests.push(now);
            next();
        };
    }

    // 日志记录中间件
    auditLog() {
        return (req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const logData = {
                    method: req.method,
                    path: req.path,
                    user: req.user?.username || 'anonymous',
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    statusCode: res.statusCode,
                    duration: duration,
                    timestamp: new Date().toISOString()
                };

                if (res.statusCode >= 400) {
                    Logger.warn('Request failed:', logData);
                } else {
                    Logger.info('Request completed:', logData);
                }
            });

            next();
        };
    }
}

export default AuthMiddleware;