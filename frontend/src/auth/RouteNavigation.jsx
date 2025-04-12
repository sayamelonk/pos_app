import { BrowserRouter, Route, Routes } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import Home from "../components/Home";
import Login from "../components/login";
import { ToastContainer } from "react-toastify";
import Logout from "../components/Logout";
import ListCategory from "../components/category/ListCategory";
import AddCategory from "../components/category/AddCategory";
import EditCategory from "../components/category/EditCategory";
import NotFoundPage from "../components/NotFoundPage";
import ListSupplier from "../components/supplier/ListSupplier";
import AddSupplier from "../components/supplier/AddSupplier";
import EditSupplier from "../components/supplier/EditSupplier";
import ListProduct from "../components/product/ListProduct";
import AddProduct from "../components/product/AddProduct";
import EditProduct from "../components/product/EditProduct";
import ListSales from "../components/sales/ListSales";
import OrderSend from "../components/sales/OrderSend";
import ListSalesHistory from "../components/salesHistory/ListSalesHistory";
import SalesReturn from "../components/salesHistory/SalesReturn";
import ListPurchase from "../components/purchase/ListPurchase";
import AddPurchase from "../components/purchase/AddPurchase";
import PrintPurchase from "../components/purchase/PrintPurchase";
import SupplierReport from "../components/report/supplier/SupplierReport";
import ProductReport from "../components/report/product/ProductReport";
import SalesReport from "../components/report/sales/SalesReport";
import PurchaseReport from "../components/report/purchase/PurchaseReport";

const RouteNavigation = () => {
  const refreshToken = secureLocalStorage.getItem("refreshToken");
  const buildNav = () => {
    if (refreshToken) {
      return (
        <>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/logout" element={<Logout />} />
              {/* Category */}
              <Route path="/category" element={<ListCategory />} />
              <Route path="/category/add" element={<AddCategory />} />
              <Route path="/category/:id" element={<EditCategory />} />
              {/* Page Not Found */}
              <Route path="*" element={<NotFoundPage />} />
              {/* supplier */}
              <Route path="/supplier" element={<ListSupplier />} />
              <Route path="/supplier/add" element={<AddSupplier />} />
              <Route path="/supplier/:id" element={<EditSupplier />} />
              {/* porudct */}
              <Route path="/product" element={<ListProduct />} />
              <Route path="/product/add" element={<AddProduct />} />
              <Route path="/product/:id" element={<EditProduct />} />
              {/* sales */}
              <Route path="/sales" element={<ListSales />} />
              <Route path="/orders/:id" element={<OrderSend />} />
              {/* sales history */}
              <Route path="/sales-history" element={<ListSalesHistory />} />
              <Route path="/sales-return/:id" element={<SalesReturn />} />
              {/* purchase */}
              <Route path="/purchase" element={<ListPurchase />} />
              <Route path="/purchase/add" element={<AddPurchase />} />
              <Route path="/purchase/print/:id" element={<PrintPurchase />} />
              {/* report */}
              <Route path="/supplier-report" element={<SupplierReport />} />
              <Route path="/product-report" element={<ProductReport />} />
              <Route path="/sales-report" element={<SalesReport />} />
              <Route path="/purchase-report" element={<PurchaseReport />} />
            </Routes>
          </BrowserRouter>
        </>
      );
    } else {
      return (
        <>
          <BrowserRouter>
            <Routes>
              <Route path="*" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </>
      );
    }
  };
  return (
    <>
      {buildNav()}
      <ToastContainer />
    </>
  );
};

export default RouteNavigation;
