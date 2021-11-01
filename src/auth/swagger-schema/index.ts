export const LoginSchema ={
    ApiBody: {
        schema: {
            type: 'object',
            properties: {
                username: { // the `user` word comes from @Body('user')
                    type: "string",
                    example: 'outstreach@gmail.com'
                },
                password: {
                    type: "string",
                    example: "123456"
                }
            },
        },
    },
}

export const RegisterSchema = {
    ApiCreatedResponse: { description: 'Create user success' },
    ApiBadRequestResponse : {
        description: 'Create error', schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: "number",
                    example: 400
                },
                message: {
                    type: "array",
                    example: [
                        "Bad request"
                    ]
                },
                error: {
                    type: "string"
                }
            },
        }
    }
}

export const ResendEmailVerification = {
    ApiParam: {
        name: 'email',
        type: 'string',
        example: 'outstreach@gmail.com',
    }
}

export const VerifyToken = {
    ApiParam: {
        name: 'token',
        type: 'string',
        example: '1234567',
    },
    ApiBody: {
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: "string",
                    example: 'outstreach@gmail.com'
                },
            },
        },
    },
    ApiForbiddenResponse: {
        description: 'Verification error', schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: "number",
                    example: 400
                },
                message: {
                    type: "array",
                    example: [
                        "cannot_verify_email"
                    ]
                },
                error: {
                    type: "string"
                }
            },
        }
    },
    ApiOkResponse: {
        schema: {
            type: 'object',
            properties: {
                isEmailVerified: {type: "boolean", example: "true"},
            }
        }
    }
}