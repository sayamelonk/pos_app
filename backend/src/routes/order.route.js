import { Router } from "express";
import { autenticate } from "../controllers/error.controller.js";
import {
  createOrder,
  generateExcel,
  generatePdf,
  getAllOrder,
  getOrderById,
  orderYearly,
} from "../controllers/order.controller.js";

const orderRoute = Router();

orderRoute.post("/orders/:userId", autenticate, createOrder);
orderRoute.get("/orders", autenticate, getAllOrder);
orderRoute.get("/orders/:id", autenticate, getOrderById);
orderRoute.post("/orders-pdf", autenticate, generatePdf);
orderRoute.post("/orders-excel", autenticate, generateExcel);
orderRoute.get("/orders-year", autenticate, orderYearly);

export default orderRoute;
