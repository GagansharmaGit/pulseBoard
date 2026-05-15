import { db } from '../../config/database';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { User, NewUser } from '../../database/schema/users';

export class UsersRepository {
  async findById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async upsert(data: NewUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  }

  async deleteById(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const usersRepository = new UsersRepository();
