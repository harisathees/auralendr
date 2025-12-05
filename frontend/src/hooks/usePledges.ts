import { useEffect, useState } from "react";
import { listPledges } from "../api/pledgeService";

export const usePledges = () => {
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPledges().then((res) => {
      setPledges(res.data.data);
      setLoading(false);
    });
  }, []);

  return { pledges, loading };
};
