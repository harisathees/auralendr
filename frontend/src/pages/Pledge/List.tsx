import { useState } from "react";
import { useLocation } from "react-router-dom";
import { usePledges } from "../../hooks/usePledges";
import PledgeList from "../../components/Pledges/PledgeList";

const List = () => {
  const location = useLocation();
  const initialTab = (location.state as any)?.tab || 'loans';
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'loans' | 'repledges'>(initialTab);
  const [page, setPage] = useState(1);

  const { pledges, loading, totalPages } = usePledges(searchTerm, activeTab === 'loans', page);

  // Reset page when switching tabs or searching
  const handleTabChange = (tab: 'loans' | 'repledges') => {
    setActiveTab(tab);
    setPage(1);
    setSearchTerm(''); // Optional: clear search on tab switch? User preference. Keeping it simple.
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  return (
    <PledgeList
      pledges={pledges}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      loading={loading}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      loansPage={page}
      loansTotalPages={totalPages}
      onLoansPageChange={setPage}
    />
  );
};

export default List;
