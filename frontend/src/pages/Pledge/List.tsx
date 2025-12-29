import { useState } from "react";
import { usePledges } from "../../hooks/usePledges";
import PledgeList from "../../components/Pledges/PledgeList";

const List = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // Simple debounce logic or direct pass? Let's assume direct for now and optimize later if needed,
  // or implement a simple useEffect debounce here.

  /* 
  // No need for debounce here anymore as PledgeList handles interaction 
  // and only triggers search on explicit selection/enter
  */

  const { pledges, loading } = usePledges(searchTerm);

  // Loading state handling can be smarter (e.g. keep showing list while searching)
  // For now simple:

  return (
    <PledgeList
      pledges={pledges}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      loading={loading}
    />
  );
};

export default List;
