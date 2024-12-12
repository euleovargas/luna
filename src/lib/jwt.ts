import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  verified?: boolean;
}

export function signJwtAccessToken(payload: TokenPayload) {
  const secret_key = process.env.NEXTAUTH_SECRET;
  const token = jwt.sign(payload, secret_key!, {
    expiresIn: '15m'
  });
  return token;
}

export function verifyJwt(token: string) {
  try {
    const secret_key = process.env.NEXTAUTH_SECRET;
    const decoded = jwt.verify(token, secret_key!);
    return decoded as TokenPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
