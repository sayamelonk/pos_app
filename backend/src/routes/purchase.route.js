import { Router } from "express";
import { autenticate } from "../controllers/error.controller.js";
import {
  createPurchase,
  generateExcel,
  generatePdf,
  getAllPurchase,
  getPurchaseById,
  purchaseYearly,
} from "../controllers/purchase.controller.js";

const purchaseRoute = Router();

purchaseRoute.post("/purchase", autenticate, createPurchase);
purchaseRoute.get("/purchase", autenticate, getAllPurchase);
purchaseRoute.get("/purchase/:id", autenticate, getPurchaseById);
purchaseRoute.post("/purchase-pdf", autenticate, generatePdf);
purchaseRoute.post("/purchase-excel", autenticate, generateExcel);
purchaseRoute.get("/purchase-yearly", autenticate, purchaseYearly);

export default purchaseRoute;
