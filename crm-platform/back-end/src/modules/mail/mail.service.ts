import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly mailFrom: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(
      this.config.getOrThrow<string>('mail.resendApiKey'),
    );
    this.mailFrom =
      this.config.get<string>('mail.from') ||
      'CRM Platform <noreply@crm-platform.site>';
    this.appUrl = this.config.getOrThrow<string>('mail.appUrl');
  }

  private async loadTemplate(
    filename: string,
    replacements: Record<string, string>,
  ): Promise<string> {
    const templatePath = join(__dirname, 'templates', filename);
    let html = await readFile(templatePath, 'utf8');

    for (const [key, value] of Object.entries(replacements)) {
      html = html.replaceAll(`{{${key}}}`, value);
    }

    return html;
  }

  async sendVerificationEmail(email: string, firstName: string, token: string) {
    const html = await this.loadTemplate('verify-email.html', {
      name: firstName,
      url: `${this.appUrl}/verify-email?token=${token}`,
    });

    await this.resend.emails.send({
      from: this.mailFrom,
      to: email,
      subject: 'Verify your email',
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    token: string,
  ) {
    const html = await this.loadTemplate('reset-password.html', {
      name: firstName,
      url: `${this.appUrl}/reset-password?token=${token}`,
    });

    await this.resend.emails.send({
      from: this.mailFrom,
      to: email,
      subject: 'Reset password',
      html,
    });
  }

  async sendInvitationEmail(
    email: string,
    workspaceName: string,
    roleName: string,
    token: string,
  ) {
    const html = await this.loadTemplate('invite-workspace.html', {
      workspaceName,
      roleName,
      url: `${this.appUrl}/invitations/${token}`,
    });

    await this.resend.emails.send({
      from: this.mailFrom,
      to: email,
      subject: `Запрошення до ${workspaceName}`,
      html,
    });
  }

  async sendWorkflowEmail(email: string, subject: string, body: string) {
    await this.resend.emails.send({
      from: this.mailFrom,
      to: email,
      subject,
      html: `<p>${body}</p>`,
    });
  }
}