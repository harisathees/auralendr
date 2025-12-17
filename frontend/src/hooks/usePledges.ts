import { useEffect, useState } from "react";
import { listPledges } from "../api/pledgeService";

export const usePledges = (search = "") => {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listPledges({ search }).then((res) => {
      setPledges(res.data.data);
      setLoading(false);
    });
  }, [search]);

  return { pledges, loading };
};
