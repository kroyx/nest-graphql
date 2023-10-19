export const AppConfig = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'dev',
  port: +process.env.PORT ?? 3000,

  // Database
  dbHost: process.env.DB_HOST,
  dbPort: +process.env.DB_PORT ?? 5432,
  dbName: process.env.DB_NAME ?? 'AnyList',
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,

  // App
  jwtSecret: process.env.JWT_SECRET,
});
