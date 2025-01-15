import { JsonWebToken } from "jsonwebtoken";
import "dotenv/config";

const generateAccessToken = (user) => {
  return JsonWebToken.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1800s",
  });
};

const generateARefreshToken = (user) => {
  return JsonWebToken.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "86400s",
  });
};

function verifyRefreshToken(token) {
  try {
    return JsonWebToken.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return error;
  }
}

const verifyJWT = (token) => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const verifyAccessToken = (token) => {
  try {
    return JsonWebToken.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return error;
  }
};

export {
  generateAccessToken,
  generateARefreshToken,
  verifyRefreshToken,
  verifyJWT,
  verifyAccessToken,
};
