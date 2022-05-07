import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register-user.dto';
import { User, UserDocument } from '../users/schema/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { RegionsService } from '../regions/regions.service';
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
    private readonly regionsService: RegionsService,
    private configService: ConfigService,
    private mailService: MailerService,
  ) {}

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
    const regionId = await this.regionsService.findOne(user.regionId);
    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      id: user.id,
      userType: user.userType,
      organizationId: user.organizationId,
      regionId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async register(createUserDto: RegisterUserDto) {
    // Find org by code
    const org = await this.organizationsService.findByCode(
      createUserDto.orgCode,
    );
    createUserDto.organizationId = org;
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
      expiresIn: `1d`,
    });

    return this.mailService.sendMail({
      to: email,
      from: this.configService.get('mailer').from,
      subject: 'Register account for OutreachApp',
      template: './welcome', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
      context: {
        url: this.configService.get('email_confirmation_url'),
        token: token,
      },
    });
  }

  async sendForgotPasswordEmail(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !this.usersService.isActiveUser(user)) {
      throw new NotFoundException('cannot found user');
    }

    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt').secret + 'forgot_password',
      expiresIn: `1d`,
    });
    console.log(this.configService.get('mailer').user);
    console.log(this.configService.get('mailer').pass);
    console.log('------');
    return this.mailService.sendMail({
      to: email,
      from: this.configService.get('mailer').from,
      subject: 'Reset your password for OutreachApp',
      template: './forgotpassword', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
      context: {
        url: this.configService.get('email_forgotpassword_url'),
        email: email,
        token: token,
      },
    });
  }

  async resetPassword(token: string, password: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('jwt').secret + 'forgot_password',
      });
      console.log(payload);
      if (typeof payload === 'object' && 'email' in payload) {
        const email = payload.email;
        const user = await this.usersService.findByEmail(email);
        console.log(user);
        if (!user || !this.usersService.isActiveUser(user)) {
          throw new NotFoundException('cannot found user');
        }
        return await this.usersService.resetPassword(user, password);
      }
      throw new BadRequestException('bad_reset_password_token');
    } catch (error) {
      console.log(error);
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('email_reset_password_token_expired');
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  public async confirmEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('cannot_found_user');
    }

    if (user.isVerify) {
      throw new BadRequestException('email_already_confirmed');
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
      throw new BadRequestException('bad_confirmation_token');
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('email_confirmation_token_expired');
      }
      throw new BadRequestException('bad_confirmation_token');
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
