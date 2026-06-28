import { useState, useEffect, useCallback } from 'react';
import { getListings } from '../api/listings';
import { getTaskforceConfig } from '../api/config';
import CycleCard from '../components/CycleCard';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [taskforce, setTaskforce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (type) params.type = type;
      if (status) params.status = status;
      const data = await getListings(params);
      setListings(data);
    } finally {
      setLoading(false);
    }
  }, [q, type, status]);

  useEffect(() => {
    getTaskforceConfig().then(setTaskforce);
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchListings, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const available = listings.filter((l) => l.status === 'available').length;
  const sold = listings.filter((l) => l.status === 'sold').length;

  return (
    <>
      <div className="hero">
        <div className="hero-inner">
          <h1>Find your campus ride</h1>
          <p>
            All cycles are verified and managed by TaskForce Team — one pickup point,
            one payment channel, zero hassle.
          </p>

          {taskforce && (
            <div className="pickup-banner">
              <strong>Pickup:</strong> {taskforce.pickup} · {taskforce.hours}
            </div>
          )}

          <div className="search-row">
            <input
              className="search-input"
              placeholder="Search by title, plate, type…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="stats-row">
            <div className="stat"><div className="stat-num">{listings.length}</div><div className="stat-lbl">listings</div></div>
            <div className="stat"><div className="stat-num">{available}</div><div className="stat-lbl">available</div></div>
            <div className="stat"><div className="stat-num">{sold}</div><div className="stat-lbl">sold</div></div>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="section-header">
          <h2>Recent listings</h2>
          <span>{listings.length} cycles</span>
        </div>

        {loading ? (
          <div className="page-loading">Loading listings…</div>
        ) : listings.length === 0 ? (
          <div className="empty-state">No cycles match your search.</div>
        ) : (
          <div className="grid">
            {listings.map((l) => <CycleCard key={l._id} listing={l} />)}
          </div>
        )}
      </div>
    </>
  );
}
