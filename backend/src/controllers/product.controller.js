import "dotenv/config";
import { productValidation } from "../validations/product.validation.js";
import path from "path";
import prisma from "../utils/client.js";
import { setCode } from "../utils/documentPattern.js";
import { logger } from "../utils/winston.js";
import fs from "fs";
import pdf from "pdf-creator-node";
import excelJS from "exceljs";

export const createProduct = async (req, res) => {
  const fileMaxSize = process.env.FILE_MAX_SIZE;
  const allowFileExt = process.env.FILE_EXTENSION;
  const msgFileSize = process.env.FILE_MAX_MESSAGE;
  const { error, value } = productValidation(req.body);

  if (error != null) {
    return res.status(400).json({
      message: error.details[0].message,
      result: null,
    });
  }
  if (req.files === null || req.files.file === undefined) {
    return res.status(400).json({
      message: "Product image is required",
      result: null,
    });
  }
  // jika semuanya lolos
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = allowFileExt;

  if (!allowedType.includes(ext.toLowerCase())) {
    return res.status[422].json({
      message: "invalid file type",
      result: null,
    });
  }

  if (fileSize > fileMaxSize) {
    return res.status(422).json({
      message: msgFileSize,
      result: null,
    });
  }

  try {
    file.mv(`./public/images/${fileName}`, async (error) => {
      if (error) {
        return res.status(500).json({
          message: error.message,
          result: null,
        });
      }
      const result = await prisma.product.create({
        data: {
          code: setCode("PRD-"),
          barcode: value.barcode ? value.barcode : null,
          productName: value.productName,
          image: fileName,
          url: url,
          qty: value.qty,
          price: value.price,
          categoryId: value.categoryId,
          supplierId: value.supplierId,
        },
      });
      return res.status(200).json({
        message: "Product created successfully",
        result,
      });
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : createProduct : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const getAllProduct = async (req, res) => {
  const last_id = parseInt(req.query.lastId) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  let result = [];
  try {
    if (last_id < 1) {
      result = await prisma.$queryRaw`
        SELECT * FROM Product
        WHERE (
          productName LIKE ${`%${search}%`}
          OR
          code LIKE ${`%${search}%`}
          OR
          barcode LIKE ${`%${search}%`}
          OR
          qty LIKE ${`%${search}%`}
          OR
          price LIKE ${`%${search}%`}
        )
        ORDER BY id DESC LIMIT ${limit}`;
    } else {
      result = await prisma.$queryRaw`
        SELECT * FROM Product
        WHERE (
          productName LIKE ${`%${search}%`}
          OR
          code LIKE ${`%${search}%`}
          OR
          barcode LIKE ${`%${search}%`}
          OR
          CAST(qty AS CHAR) LIKE ${`%${search}%`}
          OR
          CAST(price AS CHAR) LIKE ${`%${search}%`}
        )
        AND id < ${last_id}
        ORDER BY id DESC LIMIT ${limit}`;
    }
    return res.status(200).json({
      message: "get all product successfully",
      result,
      lastId: result.length > 0 ? 0 : result[result.length - 1].id,
      hasMore: result.length >= limit ? true : false,
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : getAllProduct : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
      lastId: result.length > 0 ? 0 : result[result.length - 1].id,
      hasMore: result.length >= limit ? true : false,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const result = await prisma.product.findUnique({
      include: {
        category: true,
        supplier: true,
      },
      where: {
        id: Number(req.params.id),
      },
    });
    return res.status(200).json({
      message: "Product found by id successfully",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : getProductById : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const getProductByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.product.findMany({
      where: {
        categoryId: Number(id),
      },
    });
    return res.status(200).json({
      message: "Product found by category successfully",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : getProductByCategory : " +
        error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const updateProduct = async (req, res) => {
  // validasi id product ada atau tidak
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      result: null,
    });
  }
  const { error, value } = productValidation(req.body);
  if (error != null) {
    return res.status(400).json({
      message: error.details[0].message,
      result: null,
    });
  }
  // jika semuanya lolos
  let fileName = "";
  let url = "";
  if (
    !req.files ||
    req.files === null ||
    req.files.file === undefined ||
    !req.files.file
  ) {
    fileName = product.image;
    url = product.url;
  } else {
    const fileMaxSize = process.env.FILE_MAX_SIZE;
    const allowFileExt = process.env.FILE_EXTENSION;
    const msgFileSize = process.env.FILE_MAX_MESSAGE;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = allowFileExt;

    if (!allowedType.includes(ext.toLowerCase())) {
      return res
        .status(422)
        .json({ message: "Invalid image type", result: null });
    }
    if (fileSize > fileMaxSize) {
      return res.status(422).json({
        message: msgFileSize,
        result: null,
      });
    }

    file.mv(`./public/images/${fileName}`, async (error) => {
      if (error) {
        return res.status(500).json({ message: error.message, result: null });
      }
    });

    // delete old image
    const filePath = `./public/images/${product.image}`;
    fs.unlinkSync(filePath);
  }
  try {
    const result = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        code: product.code,
        barcode: value.barcode ? value.barcode : null,
        productName: value.productName,
        qty: value.qty,
        price: value.price,
        categoryId: value.categoryId,
        supplierId: value.supplierId,
        url: url,
        image: fileName,
      },
    });
    return res.status(200).json({
      message: "Product updated successfully",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : updateProduct : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const deleteProduct = async (req, res) => {
  // cek id product ada atau tidak
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      result: null,
    });
  }
  try {
    const result = await prisma.product.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    if (result) {
      const filePath = `./public/images/${product.image}`;
      fs.unlinkSync(filePath);
    }
    return res.status(200).json({
      message: "Product deleted successfully",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : deleteProduct : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const generatePdf = async (req, res) => {
  let pathFile = "./public/pdf";
  let fileName = "product.pdf";
  let fullPath = pathFile + "/" + fileName;
  let html = fs.readFileSync("./src/templates/ProductTamplate.html", "utf8");
  let options = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "0.1mm",
      contents: "",
    },
    footer: {
      height: "28mm",
      contents: {
        default:
          '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      },
    },
  };
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    const data = await prisma.product.findMany({});
    let products = [];
    data.forEach((product, no) => {
      products.push({
        no: no + 1,
        id: product.id,
        nama_barang: product.productName,
        jumlah: Number(product.qty).toLocaleString("id-ID"),
        harga_satuan: Number(product.price).toLocaleString("id-ID"),
      });
    });
    const document = {
      html: html,
      data: {
        products: products,
      },
      path: fullPath,
      type: "",
    };
    const process = await pdf.create(document, options);
    if (process) {
      return res.status(200).json({
        message: "PDF created successfully",
        result: "/pdf/" + fileName,
      });
    }
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : generatePdf : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const generateExcel = async (req, res) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet("Product");
  const path = "./public/excel";
  try {
    if (fs.existsSync(`${path}/Product.xlsx`)) {
      fs.unlinkSync(`${path}/Product.xlsx`);
    }
    const data = await prisma.product.findMany({});
    worksheet.columns = [
      { header: "No", key: "s_no", width: 5 },
      { header: "Nama Product", key: "productName", width: 20 },
      { header: "Jumlah", key: "qty", width: 10 },
      { header: "Harga Satuan", key: "price", width: 20 },
    ];
    let counter = 1;
    data.map((product) => {
      product.s_no = counter;
      product.price = Number(product.price).toLocaleString("id-ID");
      product.qty = Number(product.qty).toLocaleString("id-ID");
      worksheet.addRow(product);
      counter++;
    });
    let list = ["A", "B", "C", "D"];
    for (let i = 0; i <= counter; i++) {
      list.forEach((item) => {
        worksheet.getCell(item + i).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile(`${path}/Product.xlsx`);
    return res.status(200).json({
      message: "Excel file created successfully",
      result: "/excel/Product.xlsx",
    });
  } catch (error) {
    logger.error(
      "controllers/product.controller.js : generateExcel : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};
