import express from 'express';
import fs from 'fs';
import path from 'path';
import Logger from './logger.js';
import AuthService from './auth.js';
import { authenticateToken, requireAuth } from './middleware.js';

class Server {
  constructor(port, rundir, projects, manager) {
    this.port = port;
    this.projects = projects;
    this.manager = manager;
    this.rundir = rundir;
    this.app = express();
    this.authService = new AuthService();
    this.app.use(express.json());
    
    // 登录页面路由（不需要认证）
    this.app.get('/login', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'login.html'));
    });
    
    // 主页面路由（前端进行认证检查）
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });
    
    // 静态文件服务
    this.app.use(express.static(path.join(process.cwd(), 'public')));
    
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'false');
      if (req.method === 'OPTIONS') {
        res.status(204).send('GET, POST, OPTIONS\n');
      } else {
        next();
      }
    });

    // 认证相关路由（不需要认证）
    this.app.post('/api/login', async (req, res) => {
      try {
        const { username, password } = req.body;
        
        if (!username || !password) {
          return res.status(400).json({
            success: false,
            message: '用户名和密码不能为空'
          });
        }

        const result = await this.authService.login(username, password);
        
        if (result.success) {
          Logger.info(`用户 ${username} 登录成功`);
          res.json(result);
        } else {
          Logger.warn(`用户 ${username} 登录失败: ${result.message}`);
          res.status(401).json(result);
        }
      } catch (error) {
        Logger.error('登录错误:', error);
        res.status(500).json({
          success: false,
          message: '服务器内部错误'
        });
      }
    });

    this.app.post('/api/logout', authenticateToken, async (req, res) => {
      try {
        const result = await this.authService.logout(req.user.id);
        Logger.info(`用户 ${req.user.username} 退出登录`);
        res.json(result);
      } catch (error) {
        Logger.error('退出登录错误:', error);
        res.status(500).json({
          success: false,
          message: '服务器内部错误'
        });
      }
    });

    this.app.get('/api/verify-token', authenticateToken, (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });

    this.app.post('/api/change-password', authenticateToken, async (req, res) => {
      try {
        const { currentPassword, oldPassword, newPassword } = req.body;
        const actualOldPassword = currentPassword || oldPassword; // 支持两种参数名
        
        if (!actualOldPassword || !newPassword) {
          return res.status(400).json({
            success: false,
            message: '旧密码和新密码不能为空'
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: '新密码长度至少为6位'
          });
        }

        const result = await this.authService.changePassword(req.user.username, actualOldPassword, newPassword);
        
        if (result.success) {
          Logger.info(`用户 ${req.user.username} 修改密码成功`);
          res.json(result);
        } else {
          Logger.warn(`用户 ${req.user.username} 修改密码失败: ${result.message}`);
          res.status(400).json(result);
        }
      } catch (error) {
        Logger.error('修改密码错误:', error);
        res.status(500).json({
          success: false,
          message: '服务器内部错误'
        });
      }
    });

    this.app.get('/api/user-info', authenticateToken, (req, res) => {
      try {
        const userInfo = this.authService.getUser(req.user.username);
        if (userInfo) {
          res.json({
            success: true,
            user: userInfo
          });
        } else {
          res.status(404).json({
            success: false,
            message: '用户信息未找到'
          });
        }
      } catch (error) {
        Logger.error('获取用户信息错误:', error);
        res.status(500).json({
          success: false,
          message: '服务器内部错误'
        });
      }
    });

    // API 路由前缀 - 现在需要认证
    this.app.get('/api/projects', requireAuth, async (req, res) => {
      try {
        const projects = await this.projects.getAllProjects();
        res.status(200).json(projects);
      } catch (error) {
        Logger.error('Error fetching all projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 获取所有项目 (兼容旧路径)
    this.app.get('/projects', async (req, res) => {
      try {
        const projects = await this.projects.getAllProjects();
        res.status(200).json(projects);
      } catch (error) {
        Logger.error('Error fetching all projects:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // API 路由 - 获取单个项目
    this.app.get('/api/project/:id', async (req, res) => {
      const projectId = req.params.id;
      try {
        const project = await this.projects.getProjectById(projectId);
        if (project) {
          res.status(200).json(project);
        } else {
          res.status(404).json({ error: 'Project not found' });
        }
      } catch (error) {
        Logger.error(`Error fetching project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 获取单个项目 (兼容旧路径)
    this.app.get('/project/:id', async (req, res) => {
      const projectId = req.params.id;
      try {
        const project = await this.projects.getProjectById(projectId);
        if (project) {
          res.status(200).json(project);
        } else {
          res.status(404).json({ error: 'Project not found' });
        }
      } catch (error) {
        Logger.error(`Error fetching project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 创建项目 - 需要认证
    this.app.post('/create', requireAuth, async (req, res) => {
      Logger.info('Responding to create request: /create');
      const projectData = req.body;
      try {
        if (!projectData.name || !projectData.body) {
          res.status(400).json({ error: 'Project name and body are required' });
          return;
        }
        
        // 验证项目体是否为有效JSON
        try {
          JSON.parse(projectData.body);
        } catch (jsonError) {
          res.status(400).json({ error: 'Project body must be valid JSON' });
          return;
        }

        await this.projects.createProject(projectData);
        Logger.info(`Project created: ${projectData.name}`);
        res.status(200).json({ message: 'Project created successfully', name: projectData.name });
      } catch (error) {
        Logger.error('Error creating project:', error);
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
          res.status(409).json({ error: 'Project with this name already exists' });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });

    // 更新项目 - 需要认证
    this.app.put('/project/:id', requireAuth, async (req, res) => {
      const projectId = req.params.id;
      const projectData = req.body;
      try {
        if (!projectData.body) {
          res.status(400).json({ error: 'Project body is required' });
          return;
        }

        // 验证项目体是否为有效JSON
        try {
          JSON.parse(projectData.body);
        } catch (jsonError) {
          res.status(400).json({ error: 'Project body must be valid JSON' });
          return;
        }

        await this.projects.updateProject({ name: projectId, body: projectData.body });
        Logger.info(`Project updated: ${projectId}`);
        res.status(200).json({ message: 'Project updated successfully' });
      } catch (error) {
        Logger.error(`Error updating project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 删除项目 - 需要认证
    this.app.delete('/project/:id', requireAuth, async (req, res) => {
      const projectId = req.params.id;
      try {
        await this.projects.deleteProject(projectId);
        Logger.info(`Project deleted: ${projectId}`);
        res.status(200).json({ message: 'Project deleted successfully' });
      } catch (error) {
        Logger.error(`Error deleting project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 获取扩展
    this.app.get('/extensions/:id', (req, res) => {
      const extensionId = req.params.id;
      Logger.info(`Responding to extension request: /extensions/${extensionId}`);
      if (!/^[\w]+$/.test(extensionId)) {
        res.status(400).json({ error: 'Invalid extension id' });
        return;
      }
      const extensionPath = `./extensions/${extensionId}.js`;
      try {
        const extensionContent = fs.readFileSync(extensionPath, 'utf8');
        res.status(200).send(extensionContent);
      } catch (error) {
        if (error.code === 'ENOENT') {
          Logger.error(`Extension not found: ${extensionId}`);
          res.status(404).json({ error: 'Extension not found' });
          return;
        }
        Logger.error('Error loading extension:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    // 添加Runner - 需要认证
    this.app.get('/runner/add/:runnerId', requireAuth, async (req, res) => {
      const runnerId = req.params.runnerId;
      Logger.info(`Adding runner: ${runnerId}`);
      if (!/^[\w-]+$/.test(runnerId)) {
        res.status(400).json({ error: 'Invalid runner id' });
        return;
      }
      try {
        // 检查项目是否存在
        const project = await this.projects.getProjectById(runnerId);
        if (!project) {
          res.status(404).json({ error: 'Project not found for this runner ID' });
          return;
        }
        
        this.manager.addRunner(runnerId);
        Logger.info(`Runner ${runnerId} added successfully`);
        res.status(200).json({ message: `Runner ${runnerId} added successfully` });
      } catch (error) {
        Logger.error('Error adding runner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 移除Runner - 需要认证
    this.app.get('/runner/remove/:runnerId', requireAuth, (req, res) => {
      const runnerId = req.params.runnerId;
      Logger.info(`Removing runner: ${runnerId}`);
      if (!/^[\w-]+$/.test(runnerId)) {
        res.status(400).json({ error: 'Invalid runner id' });
        return;
      }
      try {
        this.manager.removeRunner(runnerId);
        Logger.info(`Runner ${runnerId} removed successfully`);
        res.status(200).json({ message: `Runner ${runnerId} removed successfully` });
      } catch (error) {
        Logger.error('Error removing runner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // API 路由 - 获取所有活跃的Runners
    this.app.get('/api/runners', (req, res) => {
      try {
        const runners = Object.keys(this.manager.runners).map(id => ({
          id: id,
          status: 'active',
          initialized: !!this.manager.runners[id].vm
        }));
        res.status(200).json(runners);
      } catch (error) {
        Logger.error('Error fetching runners:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 获取所有活跃的Runners (兼容旧路径)
    this.app.get('/runners', (req, res) => {
      try {
        const runners = Object.keys(this.manager.runners).map(id => ({
          id: id,
          status: 'active',
          initialized: !!this.manager.runners[id].vm
        }));
        res.status(200).json(runners);
      } catch (error) {
        Logger.error('Error fetching runners:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 触发Runner事件 - 需要认证
    this.app.post('/runner/:runnerId/trigger', requireAuth, (req, res) => {
      const runnerId = req.params.runnerId;
      const { event, data } = req.body;
      
      if (!event) {
        res.status(400).json({ error: 'Event name is required' });
        return;
      }

      try {
        this.manager.triggerRunnerEvent(runnerId, event, data);
        Logger.info(`Event ${event} triggered for runner ${runnerId}`);
        res.status(200).json({ message: 'Event triggered successfully' });
      } catch (error) {
        Logger.error('Error triggering runner event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 运行项目 - 需要认证
    this.app.post('/api/projects/:id/run', requireAuth, async (req, res) => {
      const projectId = req.params.id;
      try {
        // 检查项目是否存在
        const project = await this.projects.getProjectById(projectId);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }

        // 添加Runner（如果不存在）
        if (!this.manager.runners[projectId]) {
          this.manager.addRunner(projectId);
          Logger.info(`Runner created for project: ${projectId}`);
        }

        // 触发启动事件
        this.manager.triggerRunnerEvent(projectId, 'PROJECT_START', { projectId });
        
        Logger.info(`Project ${projectId} started successfully`);
        res.status(200).json({ 
          message: 'Project started successfully',
          projectId: projectId,
          status: 'running'
        });
      } catch (error) {
        Logger.error(`Error running project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 停止项目 - 需要认证
    this.app.post('/api/projects/:id/stop', requireAuth, async (req, res) => {
      const projectId = req.params.id;
      try {
        // 检查项目是否存在
        const project = await this.projects.getProjectById(projectId);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }

        // 检查Runner是否存在
        if (!this.manager.runners[projectId]) {
          return res.status(404).json({ error: 'Project is not running' });
        }

        // 触发停止事件
        this.manager.triggerRunnerEvent(projectId, 'PROJECT_STOP', { projectId });
        
        // 移除Runner
        this.manager.removeRunner(projectId);
        
        Logger.info(`Project ${projectId} stopped successfully`);
        res.status(200).json({ 
          message: 'Project stopped successfully',
          projectId: projectId,
          status: 'stopped'
        });
      } catch (error) {
        Logger.error(`Error stopping project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 创建项目 - 需要认证 (新的API路径)
    this.app.post('/api/projects', requireAuth, async (req, res) => {
      Logger.info('Responding to create request: /api/projects');
      const projectData = req.body;
      try {
        if (!projectData.name || !projectData.code) {
          res.status(400).json({ error: 'Project name and code are required' });
          return;
        }
        
        // 验证项目代码是否为有效JSON
        try {
          JSON.parse(projectData.code);
        } catch (jsonError) {
          res.status(400).json({ error: 'Project code must be valid JSON' });
          return;
        }

        // 转换为旧格式
        const oldFormatData = {
          name: projectData.name,
          body: projectData.code,
          meta: JSON.stringify({
            description: projectData.description || '',
            created_at: new Date().toISOString()
          })
        };

        await this.projects.createProject(oldFormatData);
        Logger.info(`Project created: ${projectData.name}`);
        res.status(200).json({ 
          message: 'Project created successfully', 
          name: projectData.name,
          id: projectData.name
        });
      } catch (error) {
        Logger.error('Error creating project:', error);
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
          res.status(409).json({ error: 'Project with this name already exists' });
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    });

    // 删除项目 - 需要认证 (新的API路径)
    this.app.delete('/api/projects/:id', requireAuth, async (req, res) => {
      const projectId = req.params.id;
      try {
        // 先停止项目（如果正在运行）
        if (this.manager.runners[projectId]) {
          this.manager.removeRunner(projectId);
          Logger.info(`Stopped running project before deletion: ${projectId}`);
        }

        await this.projects.deleteProject(projectId);
        Logger.info(`Project deleted: ${projectId}`);
        res.status(200).json({ message: 'Project deleted successfully' });
      } catch (error) {
        Logger.error(`Error deleting project ${projectId}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    this.app.use((req, res) => {
      const requestedPath = req.path.replace(/^\/+/, '');
      let localPath = path.resolve(this.rundir, 'public', requestedPath);
      try {
        if (fs.statSync(localPath).isDirectory()) {
          localPath = path.join(localPath, 'index.html');
        }
        
        // 根据文件扩展名设置正确的Content-Type
        const ext = path.extname(localPath).toLowerCase();
        const contentTypes = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml'
        };
        
        const contentType = contentTypes[ext] || 'text/plain';
        res.setHeader('Content-Type', contentType);
        
        const fileContent = fs.readFileSync(localPath, 'utf8');
        res.status(200).send(fileContent);
      } catch (error) {
        if (error.code === 'ENOENT') {
          Logger.error(`File not found: ${requestedPath}`);
          res.status(404).json({ error: 'File not found' });
          return;
        }
        Logger.error('Error reading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }

  init() {
    this.app.on('error', (err) => {
      Logger.error('Server error:', err);
    });
    this.app.on('listening', () => {
      Logger.info(`Server is listening on port ${this.port}`);
    });
  }

  start(port) {
    const serverPort = port || this.port;
    this.server = this.app.listen(serverPort, () => {
      Logger.info(`Server running at http://localhost:${serverPort}/`);
    });
    
    // 优雅关闭处理
    process.on('SIGTERM', () => {
      Logger.info('SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        Logger.info('Server closed');
        process.exit(0);
      });
    });
  }
}

export default Server;