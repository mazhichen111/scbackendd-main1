import fs from 'fs';
import path from 'path';
import Logger from './logger.js';

class ProjectsSimple {
  constructor(dbConfig) {
    this.dbConfig = dbConfig;
    this.type = dbConfig.type;
    this.dataFile = 'projects.json';
    this.projects = new Map();
    this.initialized = false;
  }

  async connect() {
    try {
      if (this.type === 'json' || this.type === 'sqlite') {
        // 使用 JSON 文件作为简单的数据存储
        await this.loadFromFile();
        Logger.info('JSON file database connected');
      } else if (this.type === 'mysql') {
        // MySQL 连接保持原有逻辑
        const mysql = await import('mysql2/promise');
        this.connection = await mysql.createConnection(this.dbConfig.mysql);
        Logger.info('MySQL database connected');
      } else {
        throw new Error('Unsupported database type');
      }
      this.initialized = true;
    } catch (error) {
      Logger.error('Database connection failed:', error);
      // 降级到内存存储
      Logger.warn('Falling back to in-memory storage');
      this.type = 'memory';
      this.initialized = true;
    }
  }

  async loadFromFile() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        const projectsArray = JSON.parse(data);
        this.projects = new Map(projectsArray.map(p => [p.name, p]));
        Logger.info(`Loaded ${this.projects.size} projects from file`);
      } else {
        Logger.info('No existing projects file found, starting fresh');
      }
    } catch (error) {
      Logger.error('Error loading projects from file:', error);
      this.projects = new Map();
    }
  }

  async saveToFile() {
    try {
      const projectsArray = Array.from(this.projects.values());
      fs.writeFileSync(this.dataFile, JSON.stringify(projectsArray, null, 2));
      Logger.debug(`Saved ${projectsArray.length} projects to file`);
    } catch (error) {
      Logger.error('Error saving projects to file:', error);
    }
  }

  async ensureTableExists() {
    if (this.type === 'mysql' && this.connection) {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS projects (
          name VARCHAR(64) PRIMARY KEY UNIQUE,
          body LONGTEXT,
          meta TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      await this.connection.execute(createTableSQL);
      Logger.info('MySQL projects table ensured');
    } else {
      // 对于 JSON 和内存存储，不需要创建表
      Logger.info('Using file/memory storage, no table creation needed');
    }
  }

  async getAllProjects() {
    if (this.type === 'mysql' && this.connection) {
      const [rows] = await this.connection.execute('SELECT * FROM projects ORDER BY created_at DESC');
      return rows;
    } else {
      return Array.from(this.projects.values()).sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }
  }

  async getProjectById(id) {
    if (this.type === 'mysql' && this.connection) {
      const [rows] = await this.connection.execute('SELECT * FROM projects WHERE name = ?', [id]);
      return rows[0];
    } else {
      return this.projects.get(id);
    }
  }

  async createProject(projectData) {
    const { name, body } = projectData;
    const now = new Date().toISOString();
    
    if (this.type === 'mysql' && this.connection) {
      const [result] = await this.connection.execute(
        'INSERT INTO projects (name, body, meta, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [name, body, '{}', now, now]
      );
      return result.insertId;
    } else {
      // 检查是否已存在
      if (this.projects.has(name)) {
        const error = new Error('Project already exists');
        error.code = 'DUPLICATE_PROJECT';
        throw error;
      }
      
      const project = {
        name,
        body,
        meta: '{}',
        created_at: now,
        updated_at: now
      };
      
      this.projects.set(name, project);
      
      if (this.type !== 'memory') {
        await this.saveToFile();
      }
      
      return name;
    }
  }

  async updateProject(projectData) {
    const { name, body } = projectData;
    const now = new Date().toISOString();
    
    if (this.type === 'mysql' && this.connection) {
      await this.connection.execute(
        'UPDATE projects SET body = ?, updated_at = ? WHERE name = ?', 
        [body, now, name]
      );
    } else {
      const project = this.projects.get(name);
      if (!project) {
        throw new Error('Project not found');
      }
      
      project.body = body;
      project.updated_at = now;
      this.projects.set(name, project);
      
      if (this.type !== 'memory') {
        await this.saveToFile();
      }
    }
  }

  async updateProjectMeta(projectData) {
    const { name, meta } = projectData;
    const now = new Date().toISOString();
    
    if (this.type === 'mysql' && this.connection) {
      await this.connection.execute(
        'UPDATE projects SET meta = ?, updated_at = ? WHERE name = ?', 
        [JSON.stringify(meta), now, name]
      );
    } else {
      const project = this.projects.get(name);
      if (!project) {
        throw new Error('Project not found');
      }
      
      project.meta = JSON.stringify(meta);
      project.updated_at = now;
      this.projects.set(name, project);
      
      if (this.type !== 'memory') {
        await this.saveToFile();
      }
    }
  }

  async deleteProject(id) {
    if (this.type === 'mysql' && this.connection) {
      await this.connection.execute('DELETE FROM projects WHERE name = ?', [id]);
    } else {
      if (!this.projects.has(id)) {
        throw new Error('Project not found');
      }
      
      this.projects.delete(id);
      
      if (this.type !== 'memory') {
        await this.saveToFile();
      }
    }
  }

  async close() {
    if (this.type === 'mysql' && this.connection) {
      await this.connection.end();
      Logger.info('MySQL connection closed');
    } else if (this.type !== 'memory') {
      await this.saveToFile();
      Logger.info('Projects saved to file');
    }
  }
}

export default ProjectsSimple;