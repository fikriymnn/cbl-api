import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generate_access_token = (payload) => {
  const access_token = jwt.sign(payload, process.env.JWT_ACC_SECRET);
  return access_token;
};
