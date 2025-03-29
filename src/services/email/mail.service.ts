import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: '127.0.0.1', // Remplacez par votre hôte SMTP
      port: 1025, // Remplacez par votre port SMTP
      secure: false, // Utilisez true si vous utilisez un port sécurisé
    });
  }

  async sendMail(to: string, subject: string, templateParams: any, templatePath: string) {
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    const html = template(templateParams);

    const mailOptions = {
      from: 'no-reply@rh.com', // Remplacez par votre adresse e-mail
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendConfirmationEmail(to: string, name: string, jobTitle: string) {
    const subject = 'Confirmation de soumission de candidature';
    await this.sendMail(to, subject, { name, jobTitle }, 'src/services/email/confirmation-email-template.hbs');
  }

  async sendNewJobEmail(to: string, name: string, jobTitle: string, jobDescription: string, jobDeadline: string, jobSkills: string, jobExperience: number) {
    const subject = 'Nouveau poste disponible';
    await this.sendMail(to, subject, { name, jobTitle, jobDescription, jobDeadline, jobSkills, jobExperience }, 'src/services/email/new-job-email-template.hbs');
  }
}
