import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/apiClient";
import PledgeView from "../../components/Pledges/PledgeView";

const View = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/api/pledges/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return null;

  return <PledgeView data={data} />;
};

export default View;
