import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UserRole } from 'src/enum';
import { User, UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService
  ) { }

  /**
   * Finds one
   * @param id 
   * @returns one 
   */
  async getProfile(id: number): Promise<any> {
    const user = await this.userModel.findById(id);

    return {
      name: user.name,
      email: user.email,
    }
  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    const user = await this.userModel.create(createUserDto);

    return user;

  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = parseInt(this.configService.get<string>('saltOrRounds'))
    const hash = bcrypt.hash(password, saltOrRounds);

    return hash;
  }
}
