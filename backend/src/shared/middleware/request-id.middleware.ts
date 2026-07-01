import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function RequestIdMiddleware(
  req: Request & { requestId?: string },
  _res: Response,
  next: NextFunction,
) {
  req.requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  next();
}
