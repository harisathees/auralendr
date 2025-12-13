import React from "react";
import { usePledges } from "../../hooks/usePledges";
import PledgeList from "../../components/Pledges/PledgeList";
import GoldCoinSpinner from "../../components/Shared/GoldCoinSpinner";

const List = () => {
  const { pledges, loading } = usePledges();

  if (loading) return <GoldCoinSpinner text="Loading loans..." />;

  return <PledgeList pledges={pledges} />;
};

export default List;
