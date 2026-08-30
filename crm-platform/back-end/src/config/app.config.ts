export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'CRM Platform',
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
  },
});
