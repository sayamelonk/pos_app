import { Container, Row } from "react-bootstrap";
import NavbarComponent from "../NavbarComponent";
import ListCategory from "./ListCategory";
import ListProduct from "./ListProduct";
import ListOrder from "./ListOrder";

const ListSales = () => {
  return (
    <>
      <NavbarComponent />
      <Container fluid>
        <Row className="mt-3">
          <ListCategory />
          <ListProduct />
          <ListOrder />
        </Row>
      </Container>
    </>
  );
};

export default ListSales;
