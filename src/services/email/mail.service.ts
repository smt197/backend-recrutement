import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter;

constructor() {
   
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '15852be328df1e',
        pass: 'ecb3b42e847d72'
      }
    });
  }

  private resolveTemplatePath(relativePath: string): string {
    const fileName = path.basename(relativePath);
    // 1. Tenter la résolution par rapport au dossier courant du fichier compilé (__dirname)
    const dirPath = path.join(__dirname, fileName);
    if (fs.existsSync(dirPath)) {
      return dirPath;
    }
    // 2. Tenter depuis le dossier de travail courant (process.cwd())
    const cwdPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(cwdPath)) {
      return cwdPath;
    }
    // 3. Fallback sur dist/src/services/email/
    const distPath = path.join(process.cwd(), 'dist', relativePath);
    if (fs.existsSync(distPath)) {
      return distPath;
    }
    return dirPath;
  }

  async sendMail(
    to: string,
    subject: string,
    templateParams: any,
    templatePath: string,
  ) {
    const fullPath = this.resolveTemplatePath(templatePath);
    const source = fs.readFileSync(fullPath, 'utf8');
    const template = handlebars.compile(source);
    const html = template(templateParams);

    const mailOptions = {
      from: 'contact-cabi@rh.com', // Remplacez par votre adresse e-mail
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn(`[MailService] Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendConfirmationEmail(to: string, name: string, jobTitle: string) {
    const subject = 'Confirmation de soumission de candidature';
    await this.sendMail(
      to,
      subject,
      { name, jobTitle },
      'src/services/email/confirmation-email-template.hbs',
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
