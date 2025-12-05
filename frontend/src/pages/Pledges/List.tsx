import React from "react";
import { usePledges } from "../../hooks/usePledges";
import PledgeList from "../../components/Pledges/PledgeList";

const List = () => {
  const { pledges, loading } = usePledges();

  if (loading) return <div>Loading...</div>;

  return <PledgeList pledges={pledges} />;
};

export default List;
