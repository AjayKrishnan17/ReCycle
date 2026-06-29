import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing } from '../api/listings';
import { getTaskforceConfig } from '../api/config';
import { useAuth } from '../context/AuthContext';
import BuyModal from '../components/BuyModal';
import SuccessModal from '../components/SuccessModal';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [taskforce, setTaskforce] = useState(null);
  const [showBuy, setShowBuy] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getListing(id), getTaskforceConfig()])
      .then(([l, t]) => { setListing(l); setTaskforce(t); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuyClick = () => {
    if (!user) return navigate('/login');
    setShowBuy(true);
  };

  const handlePurchased = (confirmedOrder) => {
    setShowBuy(false);
    setOrder(confirmedOrder);
    setListing((l) => ({ ...l, status: 'sold' }));
  };

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!listing) return <div className="empty-state">Listing not found.</div>;

  const isSold = listing.status === 'sold';

  return (
    <div className="main detail-page">
      <div className="detail-img">
        {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.title} /> : '🚲'}
        <div className="detail-plate">{listing.plate}</div>
      </div>
      <div className="detail-price">₹{listing.price.toLocaleString()}</div>
      <div className="org-chip">Verified by TaskForce Team</div>
      <p className="detail-desc">{listing.description}</p>

      <div className="detail-info">
        <div className="info-chip"><span>{listing.plate}</span></div>
        <div className="info-chip"><span>{listing.condition}</span></div>
        <div className="info-chip"><span>{taskforce?.pickupShort}</span></div>
      </div>

      {isSold ? (
        <div className="contact-box sold-box">This cycle has been sold.</div>
      ) : (
        <>
          <div className="contact-box">
            Managed by {taskforce?.name} · {taskforce?.hours}
          </div>
          <button className="btn-buy" style={{ marginTop: 14 }} onClick={handleBuyClick}>
            Buy now
          </button>
        </>
      )}

      {showBuy && (
        <BuyModal
          listing={listing}
          taskforce={taskforce}
          onClose={() => setShowBuy(false)}
          onPurchased={handlePurchased}
        />
      )}

      {order && (
        <SuccessModal
          order={order}
          taskforce={taskforce}
          onClose={() => navigate('/')}
        />
      )}
    </div>
  );
}
