import { AppError } from './errors';

export function checkVersion(currentVersion: number, expectedVersion: number, entityName: string): void {
  if (currentVersion !== expectedVersion) {
    throw new AppError(409, 'VERSION_CONFLICT', `${entityName} was modified by another operation. Please refresh and try again.`, {
      currentVersion,
    });
  }
}
