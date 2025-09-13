// 首先加载Worker polyfill以解决Node.js环境中Worker不可用的问题
import './worker-polyfill.js';

import Manager from './manager.js';
import Server from './server.js';
import process from 'process';
import ProjectsSimple from './projects-simple.js';
import Service from './service.js';
import Logger from './logger.js';
import fs from 'fs';

const main =(rundir) => {
    process.title = 'scbackendd';
    process.on('uncaughtException', (error) => {
        console.error('[ERROR] Uncaught Exception:', error);
        process.exit(1);
    });
    Logger.info('Starting the backend server...');
    const dbconfigPath = './dbconfig.json';
    if (!fs.existsSync(dbconfigPath)) {
        //console.error('[ERROR] dbconfig.json not found. Please edit it with the required database configuration.');
        //create a default dbconfig.json
        const defaultDbConfig = `{
    "type": "json",
    "comment": "Available types: json (file-based), memory (in-memory), mysql (requires MySQL server)",
    "mysql": {
        "host": "localhost",
        "port": 3306,
        "user": "root",
        "password": "",
        "database": "scbackend"
    }
}`;
        fs.writeFileSync(dbconfigPath, defaultDbConfig, 'utf8');
        Logger.info('A default dbconfig.json has been created. Please edit it with the required database configuration.');
        //console.error('[INFO] Exiting the process.');
        //process.exit(1);
    }
    let dbconfig = fs.existsSync(dbconfigPath) ? JSON.parse(fs.readFileSync(dbconfigPath, 'utf8')) : {};
    if (!dbconfig.type) {
        Logger.error('Database type not specified in dbconfig.json');
        process.exit(1);
    }
    const manager = new Manager();
    const projects = new ProjectsSimple(dbconfig);

    projects.connect()
        .then(async () => {
            Logger.info('Database connection established');
            await projects.ensureTableExists();
            Logger.info('Database tables initialized');
        })
        .catch(error => {
            Logger.error('Failed to connect to the database:', error);
            process.exit(1);
        });

    const DASHPORT = process.env.DASHPORT || 3030;
    const SERVPORT = process.env.SERVPORT || 3031;
    const server = new Server(DASHPORT, rundir, projects, manager);
    const service = new Service(SERVPORT, manager);

    server.init();
    server.start();
    service.init();
    service.start();
};

export default main;

// if (process.argv[1] && process.argv[1].endsWith('index.js')) {
//     main();
// }