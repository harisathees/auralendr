import { useEffect, useState } from "react";
import { listPledges } from "../api/pledgeService";

import type { Pledge } from "../types/models";

export const usePledges = (search = "", enabled = true, page = 1, perPage = 10) => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listPledges({ search, page, per_page: perPage }).then((res) => {
      setPledges(res.data.data);
      setTotalPages(res.data.last_page);
      setLoading(false);
    });
  }, [search, enabled, page, perPage]);

  return { pledges, loading, totalPages };
};
