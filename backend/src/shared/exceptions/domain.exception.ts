import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class DomainException {
  static notFound(entity: string, id?: number | string): NotFoundException {
    return new NotFoundException({
      message: `${entity} not found${id !== undefined ? ` (id: ${id})` : ''}`,
      errorCode: `${entity.toUpperCase().replace(/\s/g, '_')}_NOT_FOUND`,
    });
  }

  static conflict(message: string, errorCode: string): ConflictException {
    return new ConflictException({ message, errorCode });
  }

  static forbidden(message: string, errorCode = 'FORBIDDEN'): ForbiddenException {
    return new ForbiddenException({ message, errorCode });
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED'): UnauthorizedException {
    return new UnauthorizedException({ message, errorCode });
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST'): BadRequestException {
    return new BadRequestException({ message, errorCode });
  }

  static businessRule(message: string, errorCode: string): UnprocessableEntityException {
    return new UnprocessableEntityException({ message, errorCode });
  }
}
