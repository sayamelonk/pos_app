import axios from "axios";
import secureLocalStorage from "react-secure-storage";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.timeout = import.meta.env.VITE_API_TIMEOUT;
axios.defaults.headers.common["Content-Type"] = "application/json";

const api = axios.create();

api.interceptors.request.use((request) => {
  const accessToken = secureLocalStorage.getItem("accessToken");
  if (accessToken) {
    // request.headers["Content-Type"] = "application/json";
    request.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return request;
});

// refresh token logic
const refreshToken = async (failedRequest) => {
  try {
    let headersList = {
      Authorization: `Bearer ${secureLocalStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    };
    let reqOptions = {
      url: "/api/users/refresh",
      method: "GET",
      headers: headersList,
    };
    const response = await axios.request(reqOptions);
    secureLocalStorage.setItem("accessToken", response.data.accessToken);
    secureLocalStorage.setItem("refreshToken", response.data.refreshToken);
    secureLocalStorage.setItem("user", response.data.result);
    console.log("Token refreshed successfully");
    failedRequest.headers[
      "Authorization"
    ] = `Bearer ${response.data.accessToken}`;
    return Promise.resolve(failedRequest);
  } catch (error) {
    // handle refresh token expiration, e.g., redirect to login page
    secureLocalStorage.clear();
    console.log(error.message);
    window.location.href = "/";
    return Promise.reject(error);
  }
};

// interceptor to refresh token when it expires
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshToken(originalRequest);
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export const axiosInstance = api;
