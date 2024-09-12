const createUserValidationSchema = {
    username: {
        isLength: {
            options: {
                min: 5,
                max: 32
            },
            errorMessage: 'Username must be between 5 and 32 characters'
        },
        notEmpty: {
            errorMessage: 'Username is required'
        },
        isString: {
            errorMessage: 'Username must be a string'
        },
    },
    name: {
        isLength: {
            options: {
                min: 5,
                max: 32
            },
            errorMessage: 'Name must be between 5 and 32 characters'
        },
        notEmpty: {
            errorMessage: 'Name is required'
        },
        isString: {
            errorMessage: 'Name must be a string'
        },
    },
    email: {
        isEmail: {
            errorMessage: 'Invalid email'
        },
        notEmpty: {
            errorMessage: 'Email is required'
        },
        isString: {
            errorMessage: 'Email must be a string'
        },
    },
    password: {
        isLength: {
            options: {
                min: 8,
                max: 32
            },
            errorMessage: 'Password must be between 8 and 32 characters'
        },
        notEmpty: {
            errorMessage: 'Password is required'
        },
        isString: {
            errorMessage: 'Password must be a string'
        },
    },
    age: {
        isInt: {
            options: {
                min: 18,
                max: 99
            },
            errorMessage: 'Age must be between 18 and 99'
        },
        notEmpty: {
            errorMessage: 'Age is required'
        },
        isNumeric: {
            errorMessage: 'Age must be a number'
        },
    },
    gender: {
        notEmpty: {
            errorMessage: 'Gender is required'
        },
    },
    ip_address: {
        isIP: {
            errorMessage: 'Invalid IP address'
        },
    }
};




module.exports = {
    createUserValidationSchema
}