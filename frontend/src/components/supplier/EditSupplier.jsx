import { Breadcrumb, Button, Col, Container, Form, Row } from "react-bootstrap";
import NavbarComponent from "../NavbarComponent";
import { FaSave } from "react-icons/fa";
import { axiosInstance } from "../../auth/AxiosConfig";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditSupplier = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const loadData = useCallback(async () => {
    let reqOptions = {
      url: `/api/suppliers/${id}`,
      method: "GET",
    };
    try {
      const response = await axiosInstance.request(reqOptions);
      if (response.data) {
        setFirstName(response.data.result.firstName);
        setLastName(
          response.data.result.lastName ? response.data.result.lastName : ""
        );
        setEmail(response.data.result.email ? response.data.result.email : "");
        setPhone(response.data.result.phone);
        setAddress(response.data.result.address);
      }
    } catch (error) {
      const errMessage = JSON.parse(error.request.response);
      toast.error(errMessage.errMessage, {
        position: "top-center",
      });
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let bodyContent = JSON.stringify({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      address: address,
    });

    let reqOptions = {
      url: `/api/suppliers/${id}`,
      method: "PUT",
      data: bodyContent,
    };

    try {
      const response = await axiosInstance.request(reqOptions);
      if (response.data) {
        toast.success(response.data.message, {
          position: "top-center",
        });
        navigate("/supplier");
      }
    } catch (error) {
      const errMessage = JSON.parse(error.request.response);
      toast.error(errMessage.message, {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container>
        <Row className="mt-3 bg-body-tertiary rounded p-3 pb-0">
          <Col>
            <Breadcrumb>
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
              <Breadcrumb.Item href="#">Master</Breadcrumb.Item>
              <Breadcrumb.Item href="/supplier">Supplier</Breadcrumb.Item>
              <Breadcrumb.Item active>Add Supplier</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row className="mt-3 bg-body-tertiary rounded p-3">
          <Col>
            <form onSubmit={handleSubmit}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  First Name
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  Last Name
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  Phone
                </Form.Label>
                <Col sm="5">
                  <Form.Control
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  Email
                </Form.Label>
                <Col sm="5">
                  <Form.Control
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">
                  Address
                </Form.Label>
                <Col sm="10">
                  <Form.Control
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Col>
              </Form.Group>
              <Row>
                <Col md={{ span: 10, offset: 2 }}>
                  <Button type="submit" variant="primary">
                    <FaSave /> Submit
                  </Button>
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EditSupplier;
