import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../auth/AxiosConfig";
import { toast } from "react-toastify";
import NavbarComponent from "../NavbarComponent";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { IoIosAdd, IoMdPrint } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";

const ListPurchase = () => {
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [lastId, setLastId] = useState(0);
  const limit = 25;
  const [data, setData] = useState([]);
  const [tempId, setTempId] = useState(0);
  const [hashMore, setHasMore] = useState(true);

  const loadData = useCallback(
    async (search) => {
      let reqOptions = {
        url: `/api/purchase?search_query=${keyword}&lastId=${lastId}&limit=${limit}`,
        method: "GET",
      };
      try {
        const response = await axiosInstance.request(reqOptions);
        const newData = response.data.result;
        if (search) {
          setData(newData);
        } else {
          setData([...data, ...newData]);
        }
        setTempId(response.data.lastId);
        setHasMore(response.data.hashMore);
      } catch (error) {
        const errMessage = error.request.response
          ? JSON.parse(error.request.response)
          : error.message;
        toast.error(errMessage.message, {
          position: "top-center",
        });
      }
    },
    [data, lastId, keyword]
  );

  useEffect(() => {
    loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId, keyword]);

  const searchData = (e) => {
    e.preventDefault();
    setLastId(0);
    setData([]);
    setKeyword(query);
    loadData(true);
  };

  const fetchMore = () => {
    setLastId(tempId);
  };

  return (
    <>
      <NavbarComponent />
      <Container>
        <Row className="mt-3 bg-body-tertiary rounded p-3 pb-0">
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="#">Transaction</Breadcrumb.Item>
              <Breadcrumb.Item active>Purchase</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row className="mt-3 bg-body-tertiary rounded p-3">
          <Col>
            <Row>
              <Col md={5}>
                <Link to={"/purchase/add"} className="btn-primary mb-3">
                  <IoIosAdd /> Create Purchase
                </Link>
              </Col>
              <Col md={7}>
                <form onSubmit={searchData}>
                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder="Search ..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                      <FaSearch /> Search
                    </Button>
                  </InputGroup>
                </form>
              </Col>
            </Row>
            <Row>
              <Col>
                <InfiniteScroll
                  dataLength={data.length}
                  next={fetchMore}
                  hasMore={hashMore}
                  loader={<h4>Loading...</h4>}
                >
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Code</th>
                        <th>Date</th>
                        <th>Note</th>
                        <th>User</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.code}</td>
                          <td>
                            {new Date(item.date).toLocaleDateString("id-ID")}
                          </td>
                          <td>{item.note}</td>
                          <td>{item.name}</td>
                          <td>
                            <Link
                              to={"/purchase/print/" + item.id}
                              className="btn btn-primary"
                            >
                              <IoMdPrint /> Print
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </InfiniteScroll>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ListPurchase;
