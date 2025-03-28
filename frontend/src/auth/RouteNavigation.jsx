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
