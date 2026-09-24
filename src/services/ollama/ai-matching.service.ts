import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private readonly pythonAiUrl =
    process.env.PYTHON_AI_URL || 'http://localhost:8000/match';

  constructor(private prisma: PrismaService) {}

  /**
   * Analyse une candidature via le microservice Python AI (Ollama + PDF).
   */
  async analyzeApplication(applicationId: number) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidate: true,
          job: true,
        },
      });

      if (!application) {
        this.logger.error(`Application #${applicationId} introuvable.`);
        return null;
      }

      // Préparation du payload pour le service Python assistantAI
      const payload = {
        candidate: {
          name: application.candidate.name,
          email: application.candidate.email,
          skills: Array.isArray(application.candidate.skills)
            ? application.candidate.skills
            : typeof application.candidate.skills === 'string'
              ? JSON.parse(application.candidate.skills as string)
              : [],
          experience: application.candidate.experience || 1,
          cv_url: application.cvUrl,
        },
        job: {
          title: application.job.title,
          description: application.job.description,
          skills: Array.isArray(application.job.skills)
            ? application.job.skills
            : typeof application.job.skills === 'string'
              ? JSON.parse(application.job.skills as string)
              : [],
          experience: application.job.experience || 1,
        },
      };

      let response;
      const targetUrls = [
        process.env.PYTHON_AI_URL,
        'http://localhost:8000/match',
        'http://localhost:8001/match',
        'http://127.0.0.1:8000/match',
        'http://127.0.0.1:8001/match'
      ].filter(Boolean) as string[];

      let lastError = null;
      for (const url of targetUrls) {
        try {
          this.logger.log(`Appel du service Python AI à ${url} pour l'application #${applicationId}...`);
          response = await axios.post(url, payload, { timeout: 45000 });
          if (response && response.data) {
            break;
          }
        } catch (err:any) {
          lastError = err;
        }
      }

      if (!response || !response.data) {
        throw lastError || new Error('Impossible de contacter le microservice Python AI.');
      }

      const aiData = response.data;
      const matchScore = parseFloat(aiData.score || aiData.matchScore || 0);

      // Sauvegarde dans la base de données PostgreSQL via Prisma
      const updatedApp = await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          matchScore,
          aiAnalysis: {
            score: matchScore,
            decision: aiData.decision || aiData.recommendation || 'REVIEW',
            recommendation: aiData.recommendation || aiData.decision || 'QUALIFIÉ',
            matchedSkills: aiData.matched_skills || aiData.matchedSkills || [],
            missingSkills: aiData.missing_skills || aiData.missingSkills || [],
            analysis: aiData.analysis || aiData.summary || 'Analyse IA réalisée.',
          },
        },
      });

      this.logger.log(
        `Analyse IA réussie pour l'application #${applicationId} - Score: ${matchScore}%`,
      );

      return updatedApp;
    } catch (error:any) {
      this.logger.error(
        `Échec de l'analyse IA pour l'application #${applicationId}: ${error.message}`,
      );

      // Calcul fallback direct en NestJS si le microservice Python n'est pas démarré
      return this.runFallbackMatching(applicationId);
    }
  }

  private async runFallbackMatching(applicationId: number) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: true },
    });

    if (!application) return null;

    const candSkills: string[] = Array.isArray(application.candidate.skills)
      ? (application.candidate.skills as string[])
      : [];
    const jobSkills: string[] = Array.isArray(application.job.skills)
      ? (application.job.skills as string[])
      : [];

    const candSkillsLower = candSkills.map((s) => s.toLowerCase().trim());
    const matched = jobSkills.filter((s) =>
      candSkillsLower.includes(s.toLowerCase().trim()),
    );
    const missing = jobSkills.filter(
      (s) => !candSkillsLower.includes(s.toLowerCase().trim()),
    );

    const skillRatio = jobSkills.length ? matched.length / jobSkills.length : 1;
    const expRatio = Math.min(
      application.candidate.experience / Math.max(application.job.experience, 1),
      1.5,
    );
    const matchScore = Math.min(
      Math.round((skillRatio * 0.7 + (expRatio / 1.5) * 0.3) * 100),
      100,
    );

    const recommendation =
      matchScore >= 75
        ? 'FORTEMENT RECOMMANDÉ'
        : matchScore >= 50
          ? 'QUALIFIÉ'
          : 'A REVOIR';

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        matchScore,
        aiAnalysis: {
          score: matchScore,
          decision: recommendation,
          recommendation,
          matchedSkills: matched,
          missingSkills: missing,
          analysis: `Évaluation basée sur les compétences declarées : ${matched.length}/${jobSkills.length} compétences correspondantes.`,
        },
      },
    });
  }
}
