import { Router } from "express";
import { autenticate } from "../controllers/error.controller.js";
import { createOrderReturn } from "../controllers/orderReturn.controller.js";

const orderReturnRoute = Router();

orderReturnRoute.post("/order-returns", autenticate, createOrderReturn);

export default orderReturnRoute;
