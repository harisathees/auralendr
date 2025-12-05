import React, { useEffect, useState } from "react";
import { getPledge } from "../../api/pledgeService";
import { useParams } from "react-router-dom";
import PledgeView from "../../components/Pledges/PledgeView";

const View = () => {
  const { id } = useParams();
  const [pledge, setPledge] = useState<any>(null);

  useEffect(() => {
    getPledge(Number(id)).then((res) => setPledge(res.data));
  }, [id]);

  return <PledgeView pledge={pledge} />;
};

export default View;
