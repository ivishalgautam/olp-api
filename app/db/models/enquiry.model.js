"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { where } from "sequelize";

const { DataTypes, QueryTypes, Deferrable } = sequelizeFwk;

let EnquiryModel = null;

const init = async (sequelize) => {
  EnquiryModel = sequelize.define(
    constants.models.ENQUIRY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
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
      status: {
        type: DataTypes.ENUM(
          "available",
          "not_available",
          "partially_available",
          "pending"
        ),
        defaultValue: "pending",
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await EnquiryModel.sync({ alter: true });
};

const create = async ({ enquiry_id, user_id }) => {
  return await EnquiryModel.create(
    {
      id: enquiry_id,
      user_id: user_id,
    },
    {
      returning: true,
      plain: true,
      raw: true,
    }
  );
};

const get = async (req) => {
  let whereQuery = `WHERE enq.user_id = '${req.user_data.id}'`;

  if (req.user_data.role === "admin") {
    whereQuery = "";
  }

  const query = `
    SELECT
      enq.*,
      CONCAT(usr.first_name, ' ', usr.last_name) as customer_name,
      usr.email,
      usr.mobile_number
    FROM enquiries enq
    LEFT JOIN users usr ON usr.id = enq.user_id
    ${whereQuery}
    ORDER BY enq.created_at DESC
  `;

  return await EnquiryModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await EnquiryModel.update(
    {
      status: req.body.status,
    },
    {
      where: {
        id: req.params.id || id,
      },
      returning: true,
      raw: true,
      plain: true,
    }
  );

  return rows;
};

const getById = async (id) => {
  const query = `
    SELECT
        enq.id,
        enq.user_id,
        enq.status,
        json_agg(json_build_object(
          'id', ei.id,
          'enquiry_id', ei.enquiry_id,
          'product_id', ei.product_id,
          'quantity', ei.quantity,
          'comment', ei.comment,
          'status', ei.status,
          'available_quantity', ei.available_quantity,
          'title', prd.title,
          'pictures', prd.pictures,
          'slug', prd.slug
        )) as items
      FROM enquiries enq
      LEFT JOIN enquiry_items ei ON ei.enquiry_id = enq.id
      LEFT JOIN products prd ON prd.id = ei.product_id
      WHERE enq.id = '${id}'
      GROUP BY
          enq.id,
          enq.user_id,
          enq.status
    `;

  return await EnquiryModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await EnquiryModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  deleteById: deleteById,
};
