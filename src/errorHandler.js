import Logger from './logger.js';

class ErrorHandler {
    static handleDatabaseError(error, res) {
        Logger.error('Database error:', error);
        
        if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                error: 'Duplicate entry', 
                message: 'A record with this identifier already exists' 
            });
        }
        
        if (error.code === 'ENOENT') {
            return res.status(404).json({ 
                error: 'Not found', 
                message: 'The requested resource was not found' 
            });
        }
        
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'An unexpected database error occurred' 
        });
    }

    static handleValidationError(message, res) {
        Logger.warn('Validation error:', message);
        return res.status(400).json({ 
            error: 'Validation Error', 
            message: message 
        });
    }

    static handleNotFoundError(resource, res) {
        Logger.warn(`Resource not found: ${resource}`);
        return res.status(404).json({ 
            error: 'Not Found', 
            message: `${resource} not found` 
        });
    }

    static handleUnauthorizedError(res) {
        Logger.warn('Unauthorized access attempt');
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Authentication required' 
        });
    }

    static handleGenericError(error, res) {
        Logger.error('Generic error:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'An unexpected error occurred' 
        });
    }

    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

export default ErrorHandler;