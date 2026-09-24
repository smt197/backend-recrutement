import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '15852be328df1e',
        pass: 'ecb3b42e847d72',
      },
    });
  }

  private resolveTemplatePath(relativePath: string): string | null {
    const fileName = path.basename(relativePath);
    const candidatePaths = [
      path.join(__dirname, fileName),
      path.join(__dirname, relativePath),
      path.join(process.cwd(), relativePath),
      path.join(process.cwd(), 'src/services/email', fileName),
      path.join(process.cwd(), 'dist/src/services/email', fileName),
      path.join(process.cwd(), 'dist/services/email', fileName),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  }

  async sendMail(
    to: string,
    subject: string,
    templateParams: any,
    templatePath: string,
    fallbackHtml?: string,
  ) {
    try {
      let html = '';
      const fullPath = this.resolveTemplatePath(templatePath);

      if (fullPath && fs.existsSync(fullPath)) {
        const source = fs.readFileSync(fullPath, 'utf8');
        const template = handlebars.compile(source);
        html = template(templateParams);
      } else if (fallbackHtml) {
        const template = handlebars.compile(fallbackHtml);
        html = template(templateParams);
      } else {
        html = `<p>Bonjour ${templateParams.name || ''},</p><p>${subject}</p>`;
      }

      const mailOptions = {
        from: 'contact-cabi@rh.com',
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`[MailService] Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.warn(`[MailService] Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendConfirmationEmail(to: string, name: string, jobTitle: string) {
    const subject = 'Confirmation de soumission de candidature';
    const fallbackHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Confirmation de soumission de candidature</h2>
        <p>Bonjour {{name}},</p>
        <p>Nous avons bien reçu votre candidature pour le poste de <strong>{{jobTitle}}</strong>. Nous vous remercions de votre intérêt.</p>
        <p>Votre candidature est actuellement en cours de révision.</p>
        <p>Cordialement,<br>L'équipe de recrutement</p>
      </div>
    `;
    await this.sendMail(
      to,
      subject,
      { name, jobTitle },
      'src/services/email/confirmation-email-template.hbs',
      fallbackHtml,
    );
  }

  async sendNewJobEmail(
    to: string,
    name: string,
    jobTitle: string,
    jobDescription: string,
    jobDeadline: string,
    jobSkills: string,
    jobExperience: number,
  ) {
    const subject = 'Nouveau poste disponible';
    await this.sendMail(
      to,
      subject,
      { name, jobTitle, jobDescription, jobDeadline, jobSkills, jobExperience },
      'src/services/email/new-job-email-template.hbs',
    );
  }

  async sendRegistrationEmail(to: string, name: string) {
    const subject = 'Bienvenue sur notre plateforme RH';
    await this.sendMail(
      to,
      subject,
      { name, currentDate: new Date().toLocaleDateString('fr-FR') },
      'src/services/email/registration-email-template.hbs',
    );
  }
}
