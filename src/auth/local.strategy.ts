import { Logger } from "@nestjs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { Strategy } from 'passport-local'
import { UserStatus, UserVerify } from "src/enum";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super(); //config if other strategy
    }

    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('unauthorized');
        }
        
        if (user.isVerify !== UserVerify.Verified) {
            throw new UnauthorizedException('account_unverified');
        }

        if (user.status !== UserStatus.Enabled) {
            throw new UnauthorizedException('account_is_disabled');
        }

        if (user.isDeleted == true) {
          throw new UnauthorizedException('account_is_deleted');
        }

        return user;
    }
}