const jwt = require("jsonwebtoken");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation error') {
        super(message, 400);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}

const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            message: err.message,
            error: err.isOperational ? undefined : err.stack
        });
    } else {
        res.status(500).json({
            message: 'An internal server error occurred.',
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

const staffAccountVerification = async (req, res, next) => {
    try {
        const token = req.header("token");
        if (!token)  return res.status(403).json("Not Authorized!");
        const payload = jwt.verify(token, process.env.staffSecret);
        if (!payload)  return res.status(403).json("Not Authorized!");

        req.user = payload.user;
        next();
    }
    catch (err) {
        console.error("Error: ", err.message);
        return res.status(403).json("Not Authorized");
    }
}

const studentAccountVerification = async (req, res, next) => {
    try {
        const token = req.header("token");
        if (!token)  return res.status(403).json("Not Authorized!");
        const payload = jwt.verify(token, process.env.studentSecret);
        if (!payload)  return res.status(403).json("Not Authorized!");
        
        req.user = payload.user;
        next();
    }
    catch (err) {
        console.error("Error: ", err.message);
        return res.status(403).json("Not Authorized");
    }
}

function paginate(data,request){
    const page_number = Number(request.params.page)
    const page_size = Number(request.params.itemsPerPage)
    const starting = page_size * page_number;
    if(isNaN(page_number) || isNaN(page_size))
        return data.slice(0,5); //default pagination(first 10 items) if none given
    return data.slice(starting,starting+page_size);
}

module.exports = {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    errorHandler,
    paginate,
    staffAccountVerification,
    studentAccountVerification
};