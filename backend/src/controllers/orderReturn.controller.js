import prisma from "../utils/client.js";
import { setOrderCode } from "../utils/documentPattern.js";
import { logger } from "../utils/winston.js";
import { orderReturnValidation } from "../validations/orderReturn.validation.js";

export const createOrderReturn = async (req, res) => {
  const { error, value } = orderReturnValidation(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
      result: null,
    });
  }
  try {
    const data = await prisma.$transaction(async (prisma) => {
      // create order return
      const createReturn = await prisma.orderreturn.create({
        data: {
          code: setOrderCode("ORDR-"),
          date: value.date,
          note: value.note,
          userId: Number(value.userId),
          orderId: Number(value.orderId),
        },
      });
      // loop order detail
      for (let i = 0; 1 < value.detail.length; i++) {
        // validasi product dan qty
        if (
          Number(value.detail[i].qty) == 0 ||
          value.detail[i].qty == "" ||
          value.detail[i].product == null
        ) {
          throw new Error("qty and product cannot be empty");
        }
        // insert order detail
        await prisma.orderreturnDetail.create({
          data: {
            productId: Number(value.detail[i].product.productId),
            productName: value.detail[i].product.productName,
            price: Number(value.detail[i].product.price),
            qty: Number(value.detail[i].qty),
            total: Number(value.detail[i].totalPrice),
            returnId: Number(createReturn.id),
          },
        });
        // update stock
        await prisma.product.update({
          where: {
            id: Number(value.detail[i].product.productId),
          },
          data: {
            qty: {
              increment: Number(value.detail[i].qty),
            },
          },
        });
      }
      return createReturn;
    });
    return res.status(200).json({
      message: "Order return created successfully",
      result: data,
    });
  } catch (error) {
    logger.error(
      "controllers/orderReturn.controller.js : createOrderReturn : " +
        error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};
