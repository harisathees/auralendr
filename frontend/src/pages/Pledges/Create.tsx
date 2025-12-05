import React from "react";
import { createPledge } from "../../api/pledgeService";
import PledgeForm from "../../components/Pledges/PledgeForm";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Create Pledge</h1>
      <PledgeForm
        onSubmit={async (fd) => {
          await createPledge(fd);
          navigate("/pledges");
        }}
      />
    </div>
  );
};

export default Create;
