import { Role } from "@prisma/client";

export class ApplicationResponseDto {
  id: number;
  status: string;
  cvUrl: string;
  coverLetterUrl?: string | null;
  portfolioUrl?: string | null;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
  candidate: {
    id: number;
    name: string;
    email: string;
    role: Role;
  };

  constructor(partial: Partial<ApplicationResponseDto>) {
    Object.assign(this, partial);
  }
}
