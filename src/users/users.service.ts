import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserRole, UserVerify } from '../enum';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    createUserDto.userType = UserRole.Volunteer;
    createUserDto.isVerify = UserVerify.Unverified;
    const user = this.userModel.create(createUserDto);

    return user;
  }


  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      return user;
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = parseInt(this.configService.get<string>('saltOrRounds'))
    const hash = bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  findById(id) {
    return this.userModel.findById(id);
  }

  markEmailAsConfirmed(email: string) {
    return this.userModel.updateOne({ email }, { '$set': {"isVerify" : UserVerify.Verified, "status": 1} })
  }

  public async testMail(email) {
    try {
      const sendMail = this.mailerService
        .sendMail({
          to: email || 'nnluong.dev@gmail.com', // list of receivers
          from: this.configService.get('mailer').from, // sender address
          subject: 'Outreach Test Mailer ✔', // Subject line
          text: 'welcome', // plaintext body
          html: '<b>welcome</b>', // HTML body content
        });
      return sendMail;
    } catch (error) {
      console.log(error);
    }
  }
}
