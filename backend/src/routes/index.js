import { Router } from "express";
import userRouter from "./user.route.js";
import categoryRoute from "./category.route.js";

const router = Router();

router.use("/api", userRouter);
router.use("/api", categoryRoute);
router.use("*", (req, res) => {
  return res.status(404).json({
    message: "Not Found",
    result: null,
  });
});

export default router;
