import Users from "../model/userModel.js";
import argon2 from "argon2";
import { generate_access_token } from "../utils/jwt.js";

export const Login = async (req, res) => {
  const users = await Users.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!users) return res.status(404).json({ msg: "User Not Found" });

  const mach = await argon2.verify(users.password, req.body.password);
  if (!mach) return res.status(400).json({ msg: "Wrong Password" });

  const uuid = users.uuid;
  const name = users.name;
  const email = users.email;
  const role = users.role;
  const no = users.no;

  const access_token = generate_access_token({
    uuid: uuid,
    name: name,
    email: email,
    no: no,
    role: role,
  });

  res.cookie("access_token", access_token, {
    sameSite: "None",
    // secure: true,
    httpOnly: true,
    path: "/",
  });

  res.status(200).json({ uuid, name, email, role, no });
};

export const Me = async (req, res, next) => {
  if (!req.cookies.access_token)
    return res.status(401).json({ msg: "Pliss Login" });

  const uuid = req.user.uuid;

  const users = await Users.findOne({
    attributes: ["uuid", "name", "email", "role", "no"],
    where: {
      uuid: uuid,
    },
  });
  if (!users) return res.status(404).json({ msg: "User Not Found" });
  res.status(200).json(users);
};

export const Logout = async (req, res) => {
  if (!req.cookies.access_token)
    return res.status(403).json({ msg: "Pliss Login" });

  const clear = res.clearCookie("access_token");
  if (!clear) return res.status(400).json({ msg: "Cannot Logout" });
  res.status(200).json({ msg: "Logout Succsess" });
};
