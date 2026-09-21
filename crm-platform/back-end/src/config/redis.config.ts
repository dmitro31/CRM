import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const rawHost = process.env.REDIS_HOST || 'localhost';
  let host = rawHost;
  let port = Number(process.env.REDIS_PORT) || 6379;

  if (rawHost.startsWith('redis://') || rawHost.startsWith('rediss://')) {
    try {
      const parsedUrl = new URL(rawHost);
      host = parsedUrl.hostname; // Отримуємо чистий хост: red-d8luvigg4nts73fs3qn0
      if (parsedUrl.port) {
        port = Number(parsedUrl.port);
      }
    } catch {
      host = rawHost.replace(/^rediss?:\/\//, '').split(':')[0];
    }
  }

  return {
    host,
    port,
    password: process.env.REDIS_PASSWORD || undefined,
  };
});