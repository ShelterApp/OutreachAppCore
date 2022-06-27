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
import * as lodash from 'lodash';

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
    registerUserDto.password = this.hashPassword(registerUserDto.password);
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
      createUserDto.password = this.hashPassword(createUserDto.password);
    }
    createUserDto.isVerify = UserVerify.Verified;
    createUserDto.status = UserStatus.Enabled;
    const user = await this.userModel.create(createUserDto);
    if (user && sendMail) {
      await this.sendResetPasswordEmail(user);
    }
    return user;
  }

  async findAll(searchParams: SearchParams, skip = 0, limit = 50, req) {
    const sort = this._buildSort({});
    const conditions = this._buildConditions(searchParams, req.user);
    const [result, total] = await Promise.all([
      this.userModel
        .find(conditions)
        .populate('regionId')
        .populate({
          path: 'createdBy',
          select: 'name phone',
        })
        .sort(sort)
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
      .populate('regionId')
      .setOptions({ new: true });

    if (!user) {
      throw new UnprocessableEntityException('error_when_update_user');
    }

    return user;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('cannot_found_user');
    }
    const isMatch = bcrypt.compareSync(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (isMatch) {
      try {
        user.password = this.hashPassword(changePasswordDto.newPassword);
        return user.save();
      } catch (error) {
        throw new UnprocessableEntityException('cannot_change_password');
      }
    } else {
      throw new BadRequestException('invalid_old_pasword');
    }
  }

  async resetPassword(
    user: UserDocument,
    password: string,
  ): Promise<UserDocument> {
    try {
      user.password = this.hashPassword(password);
      return user.save();
    } catch (error) {
      throw new BadRequestException('cannot_reset_pass');
    }
  }

  async remove(id: string) {
    const filter = { _id: id };

    const deleted = this.userModel.softDelete(filter);
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

  hashPassword(password: string): string {
    const saltOrRounds = parseInt(
      this.configService.get<string>('saltOrRounds'),
    );
    return bcrypt.hashSync(password, saltOrRounds);
  }

  markEmailAsConfirmed(email: string) {
    return this.userModel.updateOne(
      { email },
      { $set: { isVerify: UserVerify.Verified, status: UserStatus.Enabled } },
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
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt').secret + 'forgot_password',
      expiresIn: `1d`,
    });

    return this.mailService.sendMail({
      to: user.email,
      from: {
        name: 'OutreachApp',
        address: this.configService.get('gmail').address,
      },
      subject: 'Create your password for OutreachApp',
      template: './createpassword.hbs',
      context: {
        url: this.configService.get('email_forgotpassword_url'),
        email: user.email,
        token: token,
      },
    });
  }

  _buildConditions(query, user) {
    const userType = user.userType;
    type Conditions = {
      email: string;
      phone: string;
      status: number;
      userType: object;
      organizationId: string;
      $and: object[];
    };
    let conditions = {} as Conditions,
      userTypes = this._filterRoles(userType);
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

    if (query.organizationId && userType == UserRole.Admin) {
      conditions.organizationId = query.organizationId;
    }

    if (userType == UserRole.OrgLead) {
      conditions.organizationId = user.organizationId;
    }

    if (query.status) {
      conditions.status = query.status;
    }

    if (query.userType) {
      userTypes = lodash.intersectionWith(userTypes, [query.userType]);
    }
    conditions.userType = { $in: lodash.compact(userTypes) };

    return conditions ? conditions : {};
  }

  _buildSort(query) {
    let sort = {};
    let sortBy = undefined !== query.sortBy ? query.sortBy : 'createdAt';
    let sortType = undefined !== query.sortType ? query.sortType : '-1';
    sort[sortBy] = sortType;
    return sort;
  }

  _filterRoles(userType: string) {
    let roles: string[] = [];
    switch (userType) {
      case UserRole.Admin:
        roles = [UserRole.Admin, UserRole.OrgLead, UserRole.Volunteer];
        break;
      case UserRole.OrgLead:
        roles = [UserRole.Volunteer];
        break;
      default:
        break;
    }
    return roles;
  }
}
