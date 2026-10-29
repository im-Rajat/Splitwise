import { prisma } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/auth';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError, conflict, unauthorized } from '../utils/errors';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw conflict('EMAIL_ALREADY_EXISTS', 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { accessToken, refreshToken, expiresIn: 900, user: { id: user.id, email: user.email, name: user.name } };
}

export async function login(input: LoginInput): Promise<AuthTokens & { user: { id: string; email: string; name: string } }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { accessToken, refreshToken, expiresIn: 900, user: { id: user.id, email: user.email, name: user.name } };
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; user: { id: string; email: string; name: string } }> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw unauthorized('Invalid refresh token');
    }
    const accessToken = generateAccessToken({ userId: user.id });
    const newRefreshToken = generateRefreshToken({ userId: user.id });
    return { accessToken, refreshToken: newRefreshToken, expiresIn: 900, user: { id: user.id, email: user.email, name: user.name } };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw unauthorized('Invalid or expired refresh token');
  }
}
