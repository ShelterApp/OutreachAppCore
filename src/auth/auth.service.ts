import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserVerify } from 'src/enum';
import { User, UserDocument } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private configService: ConfigService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.findByEmail(email);
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return user;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { name: user.name, email: user.email, id: user.id, userType: user.userType }

        return {
            access_token: this.jwtService.sign(payload),
        }
    }

    async register(createUserDto: CreateUserDto): Promise<User> {
        createUserDto.password = await this.hashPassword(createUserDto.password);
        //Force type is user
        createUserDto.userType = UserRole.Volunteer;
        createUserDto.isVerify = UserVerify.Unverified;
        const user = await this.userModel.create(createUserDto);

        return user;

    }

    async findByEmail(email: string): Promise<User | undefined> {
        const user = await this.userModel.findOne({ email: email });
        if (user) {
            return user;
        }
        return null;
    }

    async findById(id: string): Promise<User | undefined> {
        const user = await this.userModel.findOne({ _id: id });
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

    private checkValidToken(timestamp: Date) {
        return (new Date().getTime() - timestamp.getTime()) / 60000 < 15;
    }

    private generateToken() {
        return (Math.floor(Math.random() * (900000)) + 100000).toString();
    }
}
