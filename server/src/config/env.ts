import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/connexta",
  JWT_SECRET: process.env.JWT_SECRET || "secret_key_change_me",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};
