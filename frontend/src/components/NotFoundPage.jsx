import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <div>
          <h1>404 Page Not Found</h1>
          <div className="d-flex align-items-center justify-content-center">
            <Link
              to={"/"}
              className="btn btn-primary mb-3"
              style={{ width: "200px" }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
