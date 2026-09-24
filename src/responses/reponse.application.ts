import { Role } from "@prisma/client";

export class ApplicationResponseDto {
  id: number;
  status: string;
  cvUrl: string;
  coverLetterUrl?: string | null;
  portfolioUrl?: string | null;
  matchScore?: number | null;
  aiAnalysis?: any;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
  candidate: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };
  job: {
    id: number;
    title: string;
  };

  constructor(partial: Partial<ApplicationResponseDto>) {
    Object.assign(this, partial);
  }
}
