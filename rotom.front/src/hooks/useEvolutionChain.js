import { useEffect, useState } from 'react';
import axios from 'axios';

const useEvolutionChain = (sp_id) => {
  const [evolutions, setEvolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChain = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pokemon/evolution/${sp_id}`);
        setEvolutions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching evolution chain:", err);
        setEvolutions([]);
      } finally {
        setLoading(false);
      }
    };
    if (sp_id) fetchChain();
  }, [sp_id]);

  return { evolutions, loading };
};

export default useEvolutionChain;
