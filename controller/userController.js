import Users from "../model/userModel.js";
import argon2 from "argon2";

export const getUsers = async (req, res) => {
  try {
    const response = await Users.findAll({
      attributes: ["uuid", "name", "email", "role", "no"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUsersById = async (req, res) => {
  try {
    const response = await Users.findOne({
      attributes: ["uuid", "name", "email", "role", "no"],
      where: {
        uuid: req.params.id,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUsers = async (req, res) => {
  const { name, email, password, no, confPassword, role } = req.body;

  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password And Confirm Password Doesn't Mact" });

  const users = await Users.findOne({
    where: {
      email: email,
    },
  });
  if (users) return res.status(404).json({ msg: "Email Alredy To Use" });
  const hasPassword = await argon2.hash(password);

  try {
    await Users.create({
      name: name,
      email: email,
      password: hasPassword,
      role: role,
      no: no,
    }),
      res.status(201).json({ msg: "Register Successfuly" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateUsers = async (req, res) => {
  const users = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!users) return res.status(404).json({ msg: "User Not Found" });

  const { name, email, password, confPassword, role, no } = req.body;
  let hashPassword;
  if (password === "" || password === null) {
    hashPassword = users.password;
  } else {
    hashPassword = await argon2.hash(password);
  }

  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password And Confirm Password Doesn't Mact" });

  try {
    await Users.update(
      {
        name: name,
        email: email,
        password: hashPassword,
        role: role,
        no: no,
      },
      {
        where: {
          id: users.id,
        },
      }
    ),
      res.status(200).json({ msg: "User Update Successfuly" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  const users = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!users) return res.status(404).json({ msg: "User Not Found" });

  try {
    await Users.destroy({
      where: {
        id: users.id,
      },
    }),
      res.status(200).json({ msg: "User Delete Successfuly" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
