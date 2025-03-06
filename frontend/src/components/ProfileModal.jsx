import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { axiosInstance } from "../auth/AxiosConfig";
import { toast } from "react-toastify";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import PropTypes from "prop-types";

const ProfileModal = (props) => {
  const user = secureLocalStorage.getItem("user");
  const { show, onHide, size } = props;
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.userName);
    }
  }, [user]);
  const actionUpdate = async (e) => {
    e.preventDefault();

    let bodyContent = JSON.stringify({
      name: name,
      userName: username,
      password: password,
      confirmPassword: confirmPassword,
      role: user.role,
    });

    let reqOptions = {
      url: `/api/users/${user.id}`,
      method: "PUT",
      data: bodyContent,
    };

    try {
      const response = await axiosInstance.request(reqOptions);
      if (response.data) {
        toast.success(response.data.message, {
          position: "top-center",
        });
        props.onHide();
      }
      secureLocalStorage.setItem("user", response.data.result);
    } catch (error) {
      const errMessage = JSON.parse(error.request.response);
      toast.error(errMessage.message, {
        position: "top-center",
      });
    }
  };
  return (
    <>
      <Modal
        onClose={onHide}
        show={show}
        size={size}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={actionUpdate}>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="2">
                Full Name
              </Form.Label>
              <Col sm="7">
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="2">
                Username
              </Form.Label>
              <Col sm="2">
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="2">
                Password
              </Form.Label>
              <Col sm="3">
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm="2">
                Confirm Password
              </Form.Label>
              <Col sm="3">
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Col>
            </Form.Group>
            <Row>
              <Col>
                <Button type="submit" variant="primary">
                  Submit
                </Button>
              </Col>
            </Row>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

ProfileModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  size: PropTypes.string,
};

export default ProfileModal;