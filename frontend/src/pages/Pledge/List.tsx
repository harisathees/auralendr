import { useState } from "react";
import { usePledges } from "../../hooks/usePledges";
import PledgeList from "../../components/Pledges/PledgeList";

const List = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'loans' | 'repledges'>('loans');

  const { pledges, loading } = usePledges(searchTerm, activeTab === 'loans');

  return (
    <PledgeList
      pledges={pledges}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      loading={loading}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export default List;
