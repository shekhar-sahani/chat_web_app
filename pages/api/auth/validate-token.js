import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function handler(req, res) {
  const { token } = req.body;

  try {
    const { payload: decodedToken } = await jwtVerify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
