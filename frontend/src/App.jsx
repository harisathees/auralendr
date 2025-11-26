import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";
import Login from "../src/pages/login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

const Private = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
