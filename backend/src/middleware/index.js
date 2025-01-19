import express from "express";
import cors from "cors";
import router from "../routes/index.js";
import "../utils/winston.js";
import fileUpload from "express-fileupload";

const appMidleware = express();

appMidleware.use(
  cors({
    origin: true,
    credentials: true,
    preflightContinue: false,
    methods: ["GET", "POST", "PUT", "DELETE"],
    // methods: "GET POST PUT DELETE",
  })
);

appMidleware.options("*", cors());
appMidleware.use(express.json());
appMidleware.use(fileUpload());
appMidleware.use(express.static("public"));
appMidleware.use(router);

export default appMidleware;
