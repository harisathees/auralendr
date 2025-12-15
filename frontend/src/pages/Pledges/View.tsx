import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import http from "../../api/http";
import PledgeView from "../../components/Pledges/PledgeView";

const View = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    http.get(`/pledges/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return null;

  return <PledgeView data={data} />;
};

export default View;
