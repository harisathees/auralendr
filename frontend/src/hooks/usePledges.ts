import { useEffect, useState } from "react";
import { listPledges } from "../api/pledgeService";

import type { Pledge } from "../types/models";

export const usePledges = (search = "", enabled = true) => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listPledges({ search }).then((res) => {
      setPledges(res.data.data);
      setLoading(false);
    });
  }, [search, enabled]);

  return { pledges, loading };
};
