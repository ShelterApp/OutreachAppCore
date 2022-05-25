import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, OAuth2ClientOptions } from 'google-auth-library';

@Injectable()
export class GoogoleaApisService {
  private readonly _oauth2Client: OAuth2Client;

  constructor(public configService: ConfigService) {
    const options: OAuth2ClientOptions = {
      clientId: this.configService.get('gmail').oauth_client_id,
      clientSecret: this.configService.get('gmail').oauth_client_secret,
      redirectUri: this.configService.get('gmail').oauth_redirect_url,
    };
    this._oauth2Client = new OAuth2Client(options);
  }

  async accessToken() {
    this._oauth2Client.setCredentials({
      refresh_token: this.configService.get('gmail').oauth_refresh_token,
    });
    const tokens = await this._oauth2Client.getAccessToken();
    if (!tokens) {
      throw new HttpException(
        'Can not get access token',
        HttpStatus.BAD_REQUEST,
      );
    }
    return tokens.token;
  }
}
