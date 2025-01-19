import express from "express";
import "dotenv/config";
import appMidleware from "./middleware/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(appMidleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});