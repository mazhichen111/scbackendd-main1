class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        this.currentLevel = this.levels.INFO;
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const baseMessage = `[${timestamp}] [${level}] ${message}`;
        return data ? `${baseMessage} ${JSON.stringify(data)}` : baseMessage;
    }

    error(message, data = null) {
        if (this.currentLevel >= this.levels.ERROR) {
            console.error(this.formatMessage('ERROR', message, data));
        }
    }

    warn(message, data = null) {
        if (this.currentLevel >= this.levels.WARN) {
            console.warn(this.formatMessage('WARN', message, data));
        }
    }

    info(message, data = null) {
        if (this.currentLevel >= this.levels.INFO) {
            console.log(this.formatMessage('INFO', message, data));
        }
    }

    debug(message, data = null) {
        if (this.currentLevel >= this.levels.DEBUG) {
            console.log(this.formatMessage('DEBUG', message, data));
        }
    }
}

export default new Logger();