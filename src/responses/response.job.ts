import { Role } from "@prisma/client";

export class JobResponseDto {
    id: number;
    title: string;
    description: string;
    experience: number;
    skills?: string[] | null;
    location?: string | null;
    deadline: Date;
    status: string;
    message: string;
    recruiter: {
      id: number;
      name: string;
      email: string;
      role: Role;
    };
    createdAt: Date;
    updatedAt: Date;
  }