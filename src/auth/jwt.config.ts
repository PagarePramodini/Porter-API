export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
  signOptions: { expiresIn: '7d' },
};
