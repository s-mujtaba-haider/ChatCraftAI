import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'defaultsecret',
};