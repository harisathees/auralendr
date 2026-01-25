import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import PledgeView from "../../components/Pledges/PledgeView";

const View = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get ID from state (redirected) or params (direct - strictly speaking params won't exist on generic route)
  const id = location.state?.id || useParams().id;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      navigate('/pledges'); // Redirect if no ID
      return;
    }
    api.get(`/pledges/${id}`).then(res => setData(res.data));
  }, [id, navigate]);

  if (!data) return null;

  return <PledgeView data={data} />;
};

export default View;
