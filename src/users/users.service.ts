import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserStatus, UserVerify } from '../enum';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ChangePasswordDto } from '../profile/dto/change-password.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService
  ) { }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    registerUserDto.password = await this.hashPassword(registerUserDto.password);
    registerUserDto.userType = UserRole.Volunteer;
    registerUserDto.isVerify = UserVerify.Unverified;
    const user = this.userModel.create(registerUserDto);

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    createUserDto.userType = UserRole.Volunteer;
    createUserDto.isVerify = UserVerify.Unverified;
    const user = this.userModel.create(createUserDto);

    return user;
  }

  async findAll(filter: any, skip = 0, limit = 50) {
    const sort = this._buildSort(filter);
    const conditions = this._buildConditions(filter);
    const [result, total] = await Promise.all([
      this.userModel
        .find(conditions)
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.userModel.count(conditions)
    ]);
    return [result, total];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto).setOptions({ new: true });

    if (!user) {
      throw new NotFoundException('error when update user');
    }

    return user;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('cannot found user');
    }
    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (isMatch) {
        // Change password
        try {
          user.password = await this.hashPassword(changePasswordDto.newPassword);
          user.save()
        } catch(error) {
          throw new UnprocessableEntityException('cannot change password');
        }
    } else {
      throw new BadRequestException('invalid old pasword');
    }
  }

  async resetPassword(user, password): Promise<boolean> {
    try {
      user.password = await this.hashPassword(password);
      user.save();

      return true;
    } catch(error) {
      console.log(error);
      return false;
    }
  }

  async remove(id: string) {
    const filter = { _id: id };

    const deleted = await this.userModel.softDelete(filter);
    return deleted;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      return user;
    }
    return null;
  }

  findById(id) {
    return this.userModel.findById(id);
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = parseInt(this.configService.get<string>('saltOrRounds'))
    const hash = bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  markEmailAsConfirmed(email: string) {
    return this.userModel.updateOne({ email }, { '$set': { "isVerify": UserVerify.Verified, "status": 1 } })
  }

  markLastedLogin(id: string) {
    return this.userModel.updateOne({ _id: id }, { '$set': { "lastedLoginAt": Date.now() } })
  }

  isActiveUser(user: User): boolean {
    if (user.isVerify == UserVerify.Verified && user.status == UserStatus.Enabled) {
      return true;
    }

    return false;
  }

  _buildConditions(query) {
    let conditions = {};
    // if (undefined !== query.search_text) {
    //   const searchTextRegex = new RegExp(query.search_text, 'i')
    //   conditions.name = searchTextRegex;
    // }

    return conditions;
  }

  _buildSort(query) {
    let sort = {};
    let sort_by = undefined !== query.sort_by ? query.sort_by : 'createdAt';
    let sort_type = undefined !== query.sort_type ? query.sort_type : '-1';
    sort = [sort_by, sort_type];
    return sort;
  }

  public async testMail(email) {
    try {
      const sendMail = this.mailerService
        .sendMail({
          to: email || 'nnluong.dev@gmail.com', // list of receivers
          from: this.configService.get('mailer').from, // sender address
          subject: 'Outreach Test Mailer ✔', // Subject line
          template: './welcome', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
          context: {
            code: 'cf1a3f828287'
          },
        });
      return sendMail;
    } catch (error) {
      console.log(error);
    }
  }
}
