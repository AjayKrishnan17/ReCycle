import { useState, useEffect } from 'react';
import { getMyOrders } from '../api/orders';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading your orders…</div>;

  return (
    <div className="main">
      <div className="section-header"><h2>My orders</h2></div>
      {orders.length === 0 ? (
        <div className="empty-state">You haven't bought any cycles yet.</div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o._id} className="order-row">
              <div>
                <div className="order-title">{o.listing.title}</div>
                <div className="order-plate">{o.listing.plate}</div>
              </div>
              <div className="order-meta">
                <span>₹{o.amount.toLocaleString()}</span>
                <span>{o.paymentMethod === 'upi' ? 'UPI' : 'Cash'}</span>
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
