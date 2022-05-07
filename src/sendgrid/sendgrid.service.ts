import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(
      this.configService.get<string>(
        this.configService.get('mailer.sendgrid_api_key'),
      ),
    );
  }

  public async send(mail: SendGrid.MailDataRequired) {
    await SendGrid.setApiKey(this.configService.get('mailer.sendgrid_api_key'));
    const transport = await SendGrid.send(mail);

    console.log(`Email successfully dispatched to ${mail.to}`, mail.subject);
    return transport;
  }
}
