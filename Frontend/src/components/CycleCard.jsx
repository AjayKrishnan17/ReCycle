import { Link } from 'react-router-dom';

export default function CycleCard({ listing }) {
  const isSold = listing.status === 'sold';
  const img = listing.images?.[0];

  return (
    <div className={`card ${isSold ? 'card-sold' : ''}`}>
      <Link to={`/listing/${listing._id}`} className="card-img-link">
        <div className="card-img">
          {img ? <img src={img} alt={listing.title} /> : <span className="card-img-fallback">🚲</span>}
          <div className="plate">{listing.plate}</div>
          {isSold && <div className="sold-ribbon">SOLD</div>}
        </div>
        <div className="card-body">
          <div className="card-title">{listing.title}</div>
          <div className="card-meta">
            <span>{listing.condition}</span>
          </div>
          <div className="card-footer">
            <div className="card-price">₹{listing.price.toLocaleString()}</div>
            <span className={`badge ${listing.listingType === 'rent' ? 'badge-rent' : 'badge-purchase'}`}>
  {listing.listingType === 'rent' ? 'Rent' : 'Purchase'}
            </span>
          </div>
        </div>
      </Link>
      <div className="card-buy-wrap">
        {isSold ? (
          <div className="btn-sold-state">Sold</div>
        ) : (
          <Link to={`/listing/${listing._id}`} className="btn-buy">
            Buy now
          </Link>
        )}
      </div>
    </div>
  );
}
