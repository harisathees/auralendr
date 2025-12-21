import { useEffect, useState } from "react";
import { listPledges } from "../api/pledgeService";

import type { Pledge } from "../types/models";

export const usePledges = (search = "") => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
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
