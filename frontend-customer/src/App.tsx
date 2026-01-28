import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import TrackLoanPagePassword from "./pages/TrackLoanPagePassword";
import ViewLoanPage from "./pages/ViewLoanPage";
import AllPledgesPage from "./pages/AllPledgesPage";
import HomePage from "./pages/HomePage";
import { Toaster } from 'react-hot-toast';
import { useEffect } from "react";

// Helper component to handle QR code redirects and hide URL param
const RedirectToVerify = () => {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (trackingCode) {
      navigate('/verify', { replace: true, state: { trackingCode } });
    } else {
      navigate('/', { replace: true });
    }
  }, [trackingCode, navigate]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/track/:trackingCode" element={<RedirectToVerify />} />
        <Route path="/verify" element={<TrackLoanPagePassword />} />
        <Route path="/view" element={<ViewLoanPage />} />
        <Route path="/pledges" element={<AllPledgesPage />} />
        {/* Default redirect or 404 */}
        <Route path="*" element={<div className="h-screen flex items-center justify-center text-white">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
