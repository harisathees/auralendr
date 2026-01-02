import { useState } from "react";
import { useLocation } from "react-router-dom";
import { usePledges } from "../../hooks/usePledges";
import PledgeList from "../../components/Pledges/PledgeList";

const List = () => {
  const location = useLocation();
  const initialTab = (location.state as any)?.tab || 'loans';
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'loans' | 'repledges'>(initialTab);

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
