"use strict";
import constants from "../../lib/constants/index.js";
import hash from "../../lib/encryption/index.js";
import sequelizeFwk from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let UserModel = null;

const init = async (sequelize) => {
  UserModel = sequelize.define(
    constants.models.USER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      username: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      mobile_number: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      country_code: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: sequelizeFwk.DataTypes.STRING,
      },
      last_name: {
        type: sequelizeFwk.DataTypes.STRING,
      },
      password: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: sequelizeFwk.DataTypes.ENUM({
          values: ["admin", "user"],
        }),
        defaultValue: "user",
      },
      is_verified: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reset_password_token: {
        type: sequelizeFwk.DataTypes.STRING,
      },
      confirmation_token: {
        type: sequelizeFwk.DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await UserModel.sync({ alter: true });
};

const create = async (req) => {
  const hash_password = hash.encrypt(req.body.password);
  return await UserModel.create({
    username: req.body.username,
    password: hash_password,
    first_name: req.body?.first_name,
    last_name: req.body?.last_name,
    email: req.body?.email,
    mobile_number: req.body?.mobile_number,
    country_code: req.body?.country_code.replace(/\s/g, ""),
    role: req.body?.role,
  });
};

const get = async () => {
  return await UserModel.findAll({
    where: { role: "user" },
    order: [["created_at", "DESC"]],
    attributes: {
      exclude: ["password", "reset_password_token", "confirmation_token"],
    },
  });
};

const getById = async (req, user_id) => {
  return await UserModel.findOne({
    where: {
      id: req?.params?.id || user_id,
    },
    raw: true,
    attributes: [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "password",
      "is_active",
      "role",
      "mobile_number",
      "country_code",
      "is_verified",
    ],
  });
};

const getByUsername = async (req, record = undefined) => {
  console.log(req.body);
  return await UserModel.findOne({
    where: {
      username: req?.body?.username || record?.user?.username,
    },
    attributes: [
      "id",
      "username",
      "email",
      "first_name",
      "last_name",
      "password",
      "is_active",
      "role",
      "mobile_number",
      "country_code",
      "is_verified",
    ],
  });
};

const update = async (req) => {
  return await UserModel.update(
    {
      username: req.body?.username,
      first_name: req.body?.first_name,
      last_name: req.body?.last_name,
      email: req.body?.email,
      mobile_number: req.body?.mobile_number,
      country_code: req.body?.country_code.replace(/\s/g, ""),

      role: req.body?.role,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "role",
        "mobile_number",
        "country_code",
        "is_verified",
      ],
      plain: true,
    }
  );
};

const updatePassword = async (req, user_id) => {
  const hash_password = hash.encrypt(req.body.new_password);
  return await UserModel.update(
    {
      password: hash_password,
    },
    {
      where: {
        id: req.params?.id || user_id,
      },
    }
  );
};

const deleteById = async (req, user_id) => {
  return await UserModel.destroy({
    where: {
      id: req?.params?.id || user_id,
    },
    returning: true,
    raw: true,
  });
};

const countUser = async (last_30_days = false) => {
  let where_query;
  if (last_30_days) {
    where_query = {
      createdAt: {
        [Op.gte]: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      },
    };
  }
  return await UserModel.findAll({
    where: where_query,
    attributes: [
      "role",
      [
        UserModel.sequelize.fn("COUNT", UserModel.sequelize.col("role")),
        "total",
      ],
    ],
    group: "role",
    raw: true,
  });
};

const getByEmailId = async (req) => {
  return await UserModel.findOne({
    where: {
      email: req.body.email,
    },
  });
};

const getByResetToken = async (req) => {
  return await UserModel.findOne({
    where: {
      reset_password_token: req.params.token,
    },
  });
};

const getByUserIds = async (user_ids) => {
  return await UserModel.findAll({
    where: {
      id: {
        [Op.in]: user_ids,
      },
    },
  });
};

const updateStatus = async (id, status) => {
  const [rowCount, rows] = await UserModel.update(
    {
      is_active: status,
    },
    {
      where: {
        id: id,
      },
      returning: [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "role",
        "mobile_number",
        "country_code",
        "is_verified",
      ],
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const verify = async ({ user_id, status }) => {
  const [rowCount, rows] = await UserModel.update(
    {
      is_verified: status,
    },
    {
      where: {
        id: user_id,
      },
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const findUsersWithBirthdayToday = async () => {
  const startIST = moment().startOf("day").toDate();
  const endIST = moment().endOf("day").toDate();

  try {
    const usersWithBirthdayToday = await UserModel.findAll({
      where: {
        birth_date: {
          [Op.between]: [startIST, endIST],
        },
        role: {
          [Op.in]: ["teacher", "student"],
        },
      },
    });

    return usersWithBirthdayToday;
  } catch (error) {
    console.error("Error finding users with birthday today:", error);
    throw error;
  }
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  getByUsername: getByUsername,
  update: update,
  updatePassword: updatePassword,
  deleteById: deleteById,
  countUser: countUser,
  getByEmailId: getByEmailId,
  getByResetToken: getByResetToken,
  getByUserIds: getByUserIds,
  findUsersWithBirthdayToday: findUsersWithBirthdayToday,
  updateStatus: updateStatus,
  verify: verify,
};
