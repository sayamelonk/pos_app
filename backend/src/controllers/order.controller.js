import prisma from "../utils/client.js";
import { setOrderCode } from "../utils/documentPattern.js";
import { logger } from "../utils/winston.js";
import fs from "fs";
import pdf from "pdf-creator-node";
import excelJS from "exceljs";

export const createOrder = async (req, res) => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      // insert order
      const post = await prisma.orders.create({
        data: {
          code: setOrderCode("ORD-"),
          date: req.body.date,
          total: req.body.total,
          ppn: req.body.ppn,
          grandTotal: req.body.grandTotal,
          userId: Number(req.params.userId),
        },
      });
      // insert detail
      for (let i = 0; i < req.body.detail.length; i++) {
        await prisma.orderdetail.create({
          data: {
            price: req.body.detail[i].price,
            productName: req.body.detail[i].productName,
            qty: req.body.detail[i].qty,
            totalPrice: req.body.detail[i].totalPrice,
            note: req.body.detail[i].note,
            orderId: post.id,
            productId: req.body.detail[i].productId,
          },
        });
        // update stock
        await prisma.product.update({
          where: {
            id: req.body.detail[i].productId,
          },
          data: {
            qty: {
              decrement: req.body.detail[i].qty,
            },
          },
        });
      }
      // delete cart
      await prisma.carts.deleteMany({
        where: {
          userId: Number(req.params.userId),
        },
      });
      return post;
    });
    return res.status(200).json({
      message: "Order created successfully",
      result: data,
    });
  } catch (error) {
    logger.error(
      "controllers/order.controller.js : createOrder : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const getAllOrder = async (req, res) => {
  const last_id = parseInt(req.query.lastId) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  let result = [];
  try {
    if (last_id < 1) {
      result = await prisma.$queryRaw`SELECT * FROM orders
        WHERE (
          code LIKE ${`%${search}%`}
          OR
          date LIKE ${`%${search}%`}
          OR
          total LIKE ${`%${search}%`}
          OR
          ppn LIKE ${`%${search}%`}
          OR
          grandTotal LIKE ${`%${search}%`}
        )
        ORDER BY id DESC LIMIT ${limit}`;
    } else {
      result = await prisma.$queryRaw`SELECT * FROM orders
        WHERE (
          code LIKE ${`%${search}%`}
          OR
          date LIKE ${`%${search}%`}
          OR
          total LIKE ${`%${search}%`}
          OR
          ppn LIKE ${`%${search}%`}
          OR
          grandTotal LIKE ${`%${search}%`}
        ) AND id < ${last_id}
        ORDER BY id DESC LIMIT ${limit}`;
    }
    return res.status(200).json({
      message: "Order found successfully",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/order.controller.js : getAllOrder : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const result = await prisma.orders.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        Orderdetail: true,
      },
    });
    return res.status(200).json({
      message: "Order found by id successfully",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/order.controller.js : getOrderById : " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

// Generate PDF Report
export const generatePdf = async (req, res) => {
  const pdfDirectory = "./public/pdf";
  const pdfFileName = "order.pdf";
  const pdfFullPath = `${pdfDirectory}/${pdfFileName}`;
  const templateHtml = fs.readFileSync(
    "./src/templates/OrderTemplate.html",
    "utf-8"
  );

  const pdfOptions = {
    format: "A4",
    orientation: "portrait",
    border: "10mm",
    header: { height: "0.1mm", contents: "" },
    footer: {
      height: "28mm",
      contents: {
        default:
          '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      },
    },
  };

  try {
    // Delete existing PDF file if exists
    if (fs.existsSync(pdfFullPath)) {
      fs.unlinkSync(pdfFullPath);
    }

    const { startDate, endDate } = req.body;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Validate date input
    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
      return res
        .status(400)
        .json({ message: "Invalid date format", result: null });
    }

    // Query orders based on date range
    const ordersData = await prisma.orders.findMany({
      where: {
        date: {
          gte: parsedStartDate,
          lte: parsedEndDate,
        },
      },
      include: {
        user: { select: { name: true } },
        Orderdetail: true,
      },
    });

    // Map data into the format required by the PDF template
    const orders = ordersData.map((order, index) => ({
      no: index + 1,
      code: order.code,
      date: new Date(order.date).toLocaleDateString("id-ID"),
      total: Number(order.total).toLocaleString("id-ID"),
      ppn: Number(order.ppn).toLocaleString("id-ID"),
      grandTotal: Number(order.grandTotal).toLocaleString("id-ID"),
      user: order.user.name,
      orderdetail: order.Orderdetail,
    }));

    const pdfDocument = {
      html: templateHtml,
      data: { orders },
      path: pdfFullPath,
      type: "",
    };

    // Generate PDF
    const pdfProcess = await pdf.create(pdfDocument, pdfOptions);
    if (pdfProcess) {
      return res
        .status(200)
        .json({ message: "success", result: `/pdf/${pdfFileName}` });
    }
  } catch (error) {
    logger.error(`generatePdf error: ${error.message}`);
    return res.status(500).json({ message: error.message, result: null });
  }
};

// Generate Excel Report
export const generateExcel = async (req, res) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");
  const excelDirectory = "./public/excel";
  const excelFilePath = `${excelDirectory}/order.xlsx`;

  try {
    if (fs.existsSync(excelFilePath)) {
      fs.unlinkSync(excelFilePath);
    }

    const { startDate, endDate } = req.body;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Validate date input
    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
      return res
        .status(400)
        .json({ message: "Invalid date format", result: null });
    }

    // Query data from the database
    const orderData = await prisma.$queryRaw`
      SELECT o.code, o.date, o.total, o.ppn, o.grandTotal, d.productName, d.price, d.qty, d.totalPrice 
      FROM Orders o 
      INNER JOIN Orderdetail d ON d.orderId = o.id
      WHERE o.date BETWEEN ${parsedStartDate} AND ${parsedEndDate}`;

    // Define worksheet columns
    worksheet.columns = [
      { header: "No", key: "s_no", width: 5 },
      { header: "Date", key: "date", width: 15 },
      { header: "Code", key: "code", width: 20 },
      { header: "Total", key: "total", width: 25 },
      { header: "PPN", key: "ppn", width: 20 },
      { header: "Grand Total", key: "grandTotal", width: 20 },
      { header: "Product Name", key: "productName", width: 50 },
      { header: "Price", key: "price", width: 25 },
      { header: "QTY", key: "qty", width: 20 },
      { header: "Total Price", key: "totalPrice", width: 30 },
    ];

    // Populate data in the worksheet
    orderData.forEach((order, index) => {
      worksheet.addRow({
        s_no: index + 1,
        date: new Date(order.date).toLocaleDateString("id-ID"),
        code: order.code,
        total: Number(order.total).toLocaleString("id-ID"),
        ppn: Number(order.ppn).toLocaleString("id-ID"),
        grandTotal: Number(order.grandTotal).toLocaleString("id-ID"),
        productName: order.productName,
        price: Number(order.price).toLocaleString("id-ID"),
        qty: Number(order.qty).toLocaleString("id-ID"),
        totalPrice: Number(order.totalPrice).toLocaleString("id-ID"),
      });
    });

    // Style the worksheet
    worksheet.eachRow((row, rowIndex) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowIndex === 1) {
          cell.font = { bold: true };
        }
      });
    });

    // Save Excel file
    await workbook.xlsx.writeFile(excelFilePath);
    return res
      .status(200)
      .json({ message: "success", result: `/excel/order.xlsx` });
  } catch (error) {
    logger.error(`generateExcel error: ${error.message}`);
    return res.status(500).json({ message: error.message, result: null });
  }
};

// Yearly Order Report
export const orderYearly = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  try {
    const yearlyOrders = await prisma.$queryRaw`
      SELECT 
        IFNULL(SUM(CASE WHEN MONTH(date) = 1 THEN grandTotal ELSE 0 END), 0) AS order_01,
        IFNULL(SUM(CASE WHEN MONTH(date) = 2 THEN grandTotal ELSE 0 END), 0) AS order_02,
        IFNULL(SUM(CASE WHEN MONTH(date) = 3 THEN grandTotal ELSE 0 END), 0) AS order_03,
        IFNULL(SUM(CASE WHEN MONTH(date) = 4 THEN grandTotal ELSE 0 END), 0) AS order_04,
        IFNULL(SUM(CASE WHEN MONTH(date) = 5 THEN grandTotal ELSE 0 END), 0) AS order_05,
        IFNULL(SUM(CASE WHEN MONTH(date) = 6 THEN grandTotal ELSE 0 END), 0) AS order_06,
        IFNULL(SUM(CASE WHEN MONTH(date) = 7 THEN grandTotal ELSE 0 END), 0) AS order_07,
        IFNULL(SUM(CASE WHEN MONTH(date) = 8 THEN grandTotal ELSE 0 END), 0) AS order_08,
        IFNULL(SUM(CASE WHEN MONTH(date) = 9 THEN grandTotal ELSE 0 END), 0) AS order_09,
        IFNULL(SUM(CASE WHEN MONTH(date) = 10 THEN grandTotal ELSE 0 END), 0) AS order_10,
        IFNULL(SUM(CASE WHEN MONTH(date) = 11 THEN grandTotal ELSE 0 END), 0) AS order_11,
        IFNULL(SUM(CASE WHEN MONTH(date) = 12 THEN grandTotal ELSE 0 END), 0) AS order_12
      FROM orders
      WHERE YEAR(date) = ${year}
    `;

    const orderTotals = yearlyOrders[0];
    const monthlyOrders = Object.values(orderTotals).map(Number);

    return res.status(200).json({ message: "success", result: monthlyOrders });
  } catch (error) {
    logger.error(`orderYearly error: ${error.message}`);
    return res.status(500).json({ message: error.message, result: null });
  }
};
