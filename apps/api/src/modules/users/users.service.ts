import { usersRepository } from './users.repository';
import { resolveClerkUser } from '../../common/guards/auth.guard';
import { ApiError } from '../../common/middleware/error-handler.middleware';
import { logger } from '../../config/logger';
import { User } from '../../database/schema/users';

export class UsersService {
  async syncFromClerk(clerkUserId: string): Promise<User> {
    const clerkData = await resolveClerkUser(clerkUserId);

    if (!clerkData.email) {
      throw ApiError.badRequest('Clerk user has no email address', 'NO_EMAIL');
    }

    const user = await usersRepository.upsert({
      id: clerkData.id,
      email: clerkData.email,
      name: clerkData.name,
      avatarUrl: clerkData.avatarUrl,
    });

    logger.info({ userId: user.id }, 'User synced from Clerk');
    return user;
  }

  async getById(id: string): Promise<User> {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async getOrSync(clerkUserId: string): Promise<User> {
    const existing = await usersRepository.findById(clerkUserId);
    if (existing) return existing;
    return this.syncFromClerk(clerkUserId);
  }
}

export const usersService = new UsersService();
