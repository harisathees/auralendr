import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

http.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// http.interceptors.response.use(
//   response => {
//     return response;
//   },
//   error => {
//     // Handle 401 Unauthorized - clear token and redirect to login
//     if (error.response?.status === 401 && !error.config.url.includes("/login")) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       // Redirect to login page if not already there
//       if (window.location.pathname !== "/login") {
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default http;
