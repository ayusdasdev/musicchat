import axios from "axios";
import store from "../redux/store";
import { LOGOUT } from "../redux/actions/types";

// Backend URL comes from the REACT_APP_API_URL env variable at build time,
// e.g. http://localhost:5000/api
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * intercept any error response from the api
 * and check if the token is no longer valid
 * i.e Token has expired or user is no longer authenticated
 * logout the user if the token has expired
 */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      // Network / CORS error or the backend is not running
      err.response = {
        status: 0,
        statusText: "Cannot reach server. Please try again in a minute.",
        data: { errors: [{ msg: "Cannot reach server. Please try again in a minute." }] },
      };
    } else if (err.response.status === 401) {
      store.dispatch({ type: LOGOUT });
    }
    return Promise.reject(err);
  }
);

export default api;
