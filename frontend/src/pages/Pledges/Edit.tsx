import React, { useEffect, useState } from "react";
import { getPledge, updatePledge } from "../../api/pledgeService";
import PledgeForm from "../../components/Pledges/PledgeForm";
import { useParams, useNavigate } from "react-router-dom";

const Edit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pledge, setPledge] = useState<any>(null);

  useEffect(() => {
    getPledge(Number(id)).then((res) => setPledge(res.data));
  }, [id]);

  if (!pledge) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Pledge</h1>
      <PledgeForm
        initial={pledge}
        onSubmit={async (fd) => {
          await updatePledge(Number(id), fd);
          navigate(`/pledges/${id}`);
        }}
      />
    </div>
  );
};

export default Edit;
