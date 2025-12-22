import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ToastProvider } from "./context/Toast/ToastContext";
// import Snowfall from "react-snowfall";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        {/* <Snowfall 
         color="#82C3D9"
          snowflakeCount={30}
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        /> */}
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );     

}

export default App;