import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserStatus, UserVerify } from '../enum';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ChangePasswordDto } from '../profile/dto/change-password.dto';
import { SearchParams } from './dto/search-params.dto';
import { UpdateProfileDto } from '../profile/dto/update-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

interface VerificationTokenPayload {
  email: string;
}

export default VerificationTokenPayload;
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private mailService: MailerService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    registerUserDto.password = await this.hashPassword(
      registerUserDto.password,
    );
    if (!registerUserDto.userType) {
      registerUserDto.userType = UserRole.Volunteer;
    }
    registerUserDto.isVerify = UserVerify.Unverified;
    const user = this.userModel.create(registerUserDto);

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let sendMail = true;
    if (createUserDto.password) {
      sendMail = false;
      createUserDto.password = await this.hashPassword(createUserDto.password);
    }
    createUserDto.isVerify = UserVerify.Verified;
    createUserDto.status = UserStatus.Enabled;
    const user = await this.userModel.create(createUserDto);
    if (user && sendMail) {
      await this.sendResetPasswordEmail(user);
    }
    return user;
  }

  async findAll(searchParams: SearchParams, skip = 0, limit = 50) {
    const sort = this._buildSort({});
    const conditions = this._buildConditions(searchParams);
    const [result, total] = await Promise.all([
      this.userModel
        .find(conditions)
        .populate('regionId')
        .populate({
          path: 'createdBy',
          select: 'name phone',
        })
        .sort([sort])
        .skip(skip)
        .limit(limit),
      this.userModel.count(conditions),
    ]);
    return [result, total];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto)
      .setOptions({ new: true });

    if (!user) {
      throw new UnprocessableEntityException('error_when_update_user');
    }

    return user;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateProfileDto)
      .setOptions({ new: true });

    if (!user) {
      throw new UnprocessableEntityException('error_when_update_user');
    }

    return user;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('cannot_found_user');
    }
    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (isMatch) {
      // Change password
      try {
        user.password = await this.hashPassword(changePasswordDto.newPassword);
        user.save();
      } catch (error) {
        throw new UnprocessableEntityException('cannot_change_password');
      }
    } else {
      throw new BadRequestException('invalid_old_pasword');
    }
  }

  async resetPassword(user, password): Promise<boolean> {
    try {
      user.password = await this.hashPassword(password);
      user.save();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async remove(id: string) {
    const filter = { _id: id };

    const deleted = await this.userModel.deleteOne(filter);
    return deleted;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (user) {
      return user;
    }
    return null;
  }

  async findById(id) {
    return await (await this.userModel.findById(id)).populate('regionId');
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = parseInt(
      this.configService.get<string>('saltOrRounds'),
    );
    const hash = bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  markEmailAsConfirmed(email: string) {
    return this.userModel.updateOne(
      { email },
      { $set: { isVerify: UserVerify.Verified, status: 1 } },
    );
  }

  markLastedLogin(id: string) {
    return this.userModel.updateOne(
      { _id: id },
      { $set: { lastedLoginAt: Date.now() } },
    );
  }

  isActiveUser(user: User): boolean {
    if (
      user.isVerify == UserVerify.Verified &&
      user.status == UserStatus.Enabled
    ) {
      return true;
    }

    return false;
  }

  async sendResetPasswordEmail(user): Promise<any> {
    const payload: VerificationTokenPayload = { email: user.email.toString() };
    console.log(this.configService.get('jwt').secret, payload);
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt').secret + 'forgot_password',
      expiresIn: `1d`,
    });

    return this.mailService.sendMail({
      to: user.email,
      from: this.configService.get('mailer').from,
      subject: 'Create your password for OutreachApp',
      template: './createpassword.hbs', // The `.pug`, `.ejs` or `.hbs` extension is appended automatically.
      context: {
        url: this.configService.get('email_forgotpassword_url'),
        email: user.email,
        token: token,
      },
    });
  }

  _buildConditions(query) {
    type Conditions = {
      email: string;
      phone: string;
      status: number;
      userType: string;
      organizationId: string;
      $and: object[];
    };
    let conditions = {} as Conditions;
    if (query.keyword) {
      conditions.$and = [];
      conditions.$and.push({
        $or: [
          { name: { $regex: query.keyword, $options: 'i' } },
          { email: { $regex: query.keyword, $options: 'i' } },
          { phone: { $regex: query.keyword, $options: 'i' } },
        ],
      });
    }

    if (query.email) {
      conditions.email = query.email;
    }

    if (query.phone) {
      conditions.phone = query.phone;
    }

    if (query.organizationId) {
      conditions.organizationId = query.organizationId;
    }

    if (query.status) {
      conditions.status = query.status;
    }

    if (query.userType) {
      conditions.userType = query.userType;
    }

    return conditions ? conditions : {};
  }

  _buildSort(query) {
    let sort = {};
    let sortBy = undefined !== query.sortBy ? query.sortBy : 'createdAt';
    let sortType = undefined !== query.sortType ? query.sortType : '-1';
    sort = [sortBy, sortType];
    return sort;
  }
}
