import { useEffect, useState } from "react";
import { listPledges } from "../api/pledgeService";

import type { Pledge } from "../types/models";

export const usePledges = (search = "", enabled = true, page = 1, perPage = 10, filters: any = {}) => {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listPledges({ search, page, per_page: perPage, ...filters }).then((res) => {
      setPledges(res.data.data);
      setTotalPages(res.data.last_page);
      setTotalCount(res.data.total);
      setLoading(false);
    });
  }, [search, enabled, page, perPage, JSON.stringify(filters)]);

  return { pledges, loading, totalPages, totalCount };
};
