// src/filters/forbidden.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, ForbiddenException } from '@nestjs/common';
import { Response, Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: { role?: string };
  }
}

@Catch(ForbiddenException)
export class ForbiddenFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Récupérer le rôle requis (si disponible)
    const requiredRole =  'ADMIN'; // Exemple

    response.status(403).json({
      message: `Accès refusé : vous devez être un ${requiredRole} pour accéder à cette ressource.`,
      error: 'Forbidden',
      statusCode: 403,
    });
  }
}