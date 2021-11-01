export const CreateOrganizationSchema = {
    ApiCreatedResponse: { description: 'Create organization' },
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
    },
    ApiUnprocessableEntityResponse: {
        description: 'Create error', schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: "number",
                    example: 422
                },
                message: {
                    type: "array",
                    example: [
                        "name is required"
                    ]
                },
                error: {
                    type: "string"
                }
            },
        }
    }
}