"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

const { DataTypes, QueryTypes, Deferrable } = sequelizeFwk;

let TempCartModel = null;

const init = async (sequelize) => {
  TempCartModel = sequelize.define(
    constants.models.TEMP_CART_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.PRODUCT_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await TempCartModel.sync({ alter: true });
};

const create = async ({ user_id, product_id }) => {
  return await TempCartModel.create({
    user_id: user_id,
    product_id: product_id,
  });
};

const get = async (req) => {
  const query = `
    SELECT 
      tc.*,
      prd.title,
      prd.description,
      prd.pictures,
      prd.id as product_id,
      brnd.name as brand_name,
      cat.name as category_name
    FROM temp_carts tc
    LEFT JOIN products prd on prd.id = tc.product_id
    LEFT JOIN brands brnd on brnd.id = prd.brand_id
    LEFT JOIN categories cat on cat.id = prd.category_id
    WHERE tc.user_id = '${req.user_data.id}';
  `;

  return await TempCartModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const getById = async (req, id) => {
  return await TempCartModel.findOne({
    where: {
      id: req.params.id || id,
    },
    raw: true,
    plain: true,
  });
};

const getByUserAndProductId = async ({ user_id, product_id }) => {
  return await TempCartModel.findOne({
    where: {
      user_id: user_id,
      product_id: product_id,
    },
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await TempCartModel.destroy({
    where: { id: req?.params?.id || id },
    returning: true,
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
  getByUserAndProductId: getByUserAndProductId,
};
