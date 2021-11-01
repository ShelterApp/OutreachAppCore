import { Controller, Post, UseGuards, Request, Body, Get, Param, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserVerify } from 'src/enum';
import { LoginSchema, RegisterSchema, ResendEmailVerification, VerifyToken } from './swagger-schema';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiBody(LoginSchema.ApiBody)
    @ApiOkResponse()
    login(@Request() req): any {
        return this.authService.login(req.user)
    }

    @Post('register')
    @ApiOperation({ summary: 'Register users' })
    @ApiCreatedResponse(RegisterSchema.ApiCreatedResponse)
    @ApiBadRequestResponse(RegisterSchema.ApiBadRequestResponse)
    register(@Body() registerUser: CreateUserDto): any {
        return this.authService.register(registerUser);
    }
}
