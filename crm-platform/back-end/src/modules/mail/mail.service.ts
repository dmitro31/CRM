import { Injectable, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend"
import { readFile } from 'node:fs/promises'
import { join } from "node:path"

@Injectable()
export class MailService {
    private readonly resend: Resend

    constructor(
        private readonly config: ConfigService
    ) {
        this.resend = new Resend(
            this.config.getOrThrow<string>('mail.resendApiKey')
        )
    }

    async sendVerificationEmail(
        email: string,
        firstName: string,
        token: string
    ) {
        const appUrl =
            this.config.getOrThrow<string>('mail.appUrl')

        const templatePath = join(
            process.cwd(),
            'src',
            'modules',
            'mail',
            'templates',
            'verify-email.html',
        )   

        let html = await readFile(templatePath, 'utf8')

        html = html
            .replaceAll('{{name}}', firstName)
            .replaceAll(
                '{{url}}',
                `${appUrl}/auth/verify-email?token=${token}`
            )

        await this.resend.emails.send({
            from: 'CRM Platform <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email',
            html
        })

    }
}