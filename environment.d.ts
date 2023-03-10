declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: number;
      MONGO_USER: string;
      MONGO_PASSWORD: string;
      MONGO_PATH: string;
      SESSION_SECRET: string;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      SMTP_HOST: string;
      SMTP_PORT: number;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      API_URL: string;
      CLIENT_URL: string;
    }
  }
}

export {};
