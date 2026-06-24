export default function SuccessModal({ order, taskforce, onClose }) {
  const isUpi = order.paymentMethod === 'upi';
  return (
    <div className="overlay">
      <div className="success-card">
        <div className="success-ring">✅</div>
        <h2>Purchase confirmed!</h2>
        <p>
          {order.listing.plate} is reserved for you. Collect from {taskforce.pickupShort}.
        </p>
        <div className="receipt-box">
          <div className="receipt-row"><span>Cycle</span><span>{order.listing.title}</span></div>
          <div className="receipt-row"><span>Plate</span><span>{order.listing.plate}</span></div>
          <div className="receipt-row"><span>Amount</span><span>₹{order.amount.toLocaleString()}</span></div>
          <div className="receipt-row"><span>Paid to</span><span>{taskforce.name}</span></div>
          <div className="receipt-row"><span>Method</span><span>{isUpi ? 'UPI' : 'Cash'}</span></div>
          {isUpi && <div className="receipt-row"><span>UTR</span><span>{order.utrNumber}</span></div>}
          <div className="receipt-row"><span>Pickup</span><span>{taskforce.pickupShort}</span></div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}