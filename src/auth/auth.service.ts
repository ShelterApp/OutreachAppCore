import { BadRequestException, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRole, UserVerify } from '../enum';
import { User, UserDocument } from '../users/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import ForgotPasswordDto from './dto/forgot-password.dto';

interface VerificationTokenPayload {
    email: string;
}

export default VerificationTokenPayload;
@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly organizationsService: OrganizationsService,
        private readonly usersService: UsersService,
        private configService: ConfigService,
        private mailService: MailerService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                await this.usersService.markLastedLogin(user._id);
                return user;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { name: user.name, email: user.email, id: user.id, userType: user.userType }
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        }
    }
    
    async register(createUserDto: RegisterUserDto) {
        // Find org by code
        const org = await this.organizationsService.findByCode(createUserDto.orgCode);
        createUserDto.organization = org;
        const user = await this.usersService.register(createUserDto);
       
        return user;
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.usersService.findById(id);
        if (user) {
            return user;
        }
        return null;
    }

    async sendEmailVerification(email: string): Promise<any> {
        const payload: VerificationTokenPayload = { email };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('jwt').secret,
            expiresIn: `1d`
        });

        const url = `${this.configService.get('email_confirmation_url')}?token=${token}`;

        const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

        return this.mailService.sendMail({
            to: email,
            from: this.configService.get('mailer').from,
            subject: 'Email confirmation',
            html: text,
        })

    }

    async sendForgotPasswordEmail(email: string): Promise<any> {

        const user = await this.usersService.findByEmail(email);
        if (!user || !this.usersService.isActiveUser(user)) {
            throw new NotFoundException('cannot found user');
        }

        const payload: VerificationTokenPayload = { email };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('jwt').secret + 'forgot_password',
            expiresIn: `1d`
        });

        const url = `${this.configService.get('email_forgotpassword_url')}?token=${token}`;

        const text = `Welcome to the application. forgot password, click here: ${url}`;

        return this.mailService.sendMail({
            to: email,
            from: this.configService.get('mailer').from,
            subject: 'Email for got password',
            html: text,
        })
    }

    async resetPassword(token: string, password: string) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get('jwt').secret + 'forgot_password',
            });

            if (typeof payload === 'object' && 'email' in payload) {
                const email = payload.email;
                const user = await this.usersService.findByEmail(email);
                if (!user || !this.usersService.isActiveUser(user)) {
                    throw new NotFoundException('cannot found user');
                }
                return await this.usersService.resetPassword(user, password);
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException('email confirmation token expired');
            }
            throw new BadRequestException('bad confirmation token');
        }
    }

    public async confirmEmail(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !this.usersService.isActiveUser(user)) {
            throw new NotFoundException('cannot found user');
        }

        if (user.isVerify) {
            throw new BadRequestException('Email already confirmed');
        }
        return await this.usersService.markEmailAsConfirmed(email);
    }

    public async decodeConfirmationToken(token: string) {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: this.configService.get('jwt').secret,
            });

            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException('email confirmation token expired');
            }
            throw new BadRequestException('bad confirmation token');
        }
    }

    public async validateUserEmailExsist(email) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            return false;
        }
        return true;
    }

    public async validateOrgValid(code) {
        const user = await this.organizationsService.findByCode(code);
        if (!user) {
            return false;
        }
        return true;
    }
}
