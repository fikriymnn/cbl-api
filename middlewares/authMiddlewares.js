import jwt from "jsonwebtoken";

export const Auth = async (req, res, next) => {
  if (!req.cookies.access_token)
    return res.status(401).json({ msg: "Pliss Login" });

  jwt.verify(
    req.cookies.access_token,
    process.env.JWT_ACC_SECRET,
    (err, payload) => {
      if (err) {
        res.status(403).json({
          status_code: 403,
          message: "Access token invalid.",
        });
        res.end();
      }
      req.user = payload;
      next();
    }
  );
};
