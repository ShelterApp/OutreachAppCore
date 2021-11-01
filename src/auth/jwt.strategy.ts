import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserStatus, UserVerify } from "src/enum";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService, private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        });
    }

    async validate(payload: any) {
        // Can get user from here
        const user = await this.authService.findById(payload.id);
        if (!user || user.isVerify == UserVerify.Unverified || user.status == UserStatus.Disabled) {
            throw new UnauthorizedException('unauthorized');
        }
        return {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            userType: payload.userType
        }
    }
}