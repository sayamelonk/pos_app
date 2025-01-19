import JsonWebToken from "jsonwebtoken";
import "dotenv/config";
import { logger } from "./winston.js";

const generateAccessToken = (user) => {
  return JsonWebToken.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1800s",
  });
};

const generateRefreshToken = (user) => {
  return JsonWebToken.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "86400s",
  });
};

function verifyRefreshToken(token) {
  try {
    return JsonWebToken.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    logger.info("controllers/user.controller.js:verifyRefreshToken - " + error);
    return error;
  }
}

const parseJWT = (token) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const verifyAccessToken = (token) => {
  try {
    return JsonWebToken.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.info("controllers/user.controller.js:verifyAccessToken - " + error);
    return error;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseJWT,
  verifyAccessToken,
};
