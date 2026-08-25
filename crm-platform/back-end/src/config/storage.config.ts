import { registerAs } from '@nestjs/config'

export default registerAs('storage', () => ({
  endpoint: process.env.STORAGE_ENDPOINT,
  port: Number(process.env.STORAGE_PORT),
  useSSL: process.env.STORAGE_USE_SSL === 'true',
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
  bucket: process.env.STORAGE_BUCKET,
}))