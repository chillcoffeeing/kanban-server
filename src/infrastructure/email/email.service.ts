import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { TypedConfigService } from '@config/typed-config.service';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly typedConfig: TypedConfigService,
  ) {
    const apiKey = this.typedConfig.get('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will not be sent');
      this.resend = null as any;
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendInvitationEmail(
    to: string,
    boardName: string,
    invitedBy: string,
    acceptUrl: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured, skipping email');
      return;
    }

    await this.resend.emails.send({
      from: 'Kanban <onboarding@resend.dev>',
      to,
      subject: `${invitedBy} te invitó a "${boardName}"`,
html: `
        <h1>You have been invited</h1>
        <p>${invitedBy} invited you to collaborate on the board <strong>"${boardName}"</strong>.</p>
        <a href="${acceptUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">Aceptar invitación</a>
        <p style="margin-top:20px;font-size:12px;color:#6b7280;">O copia y pega este enlace: ${acceptUrl}</p>
      `,
    });
  }
}