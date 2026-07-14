import { useState, useEffect } from 'react';
import { getListings, createListing, deleteListing } from '../api/listings';

const emptyForm = { title: '', plate: '', price: '', type: 'hybrid', condition: '', description: '', listingType: 'purchase' };

export default function Admin() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const refresh = () => getListings().then(setListings).finally(() => setLoading(false));

  useEffect(() => { refresh(); }, []);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return setError('Title and price are required');
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      files.forEach((f) => fd.append('images', f));
      await createListing(fd);
      setForm(emptyForm);
      setFiles([]);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await deleteListing(id);
    refresh();
  };

  return (
    <div className="main">
      <div className="section-header"><h2>Admin · manage listings</h2></div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Cycle title / brand</label>
          <input value={form.title} onChange={update('title')} placeholder="e.g. Hero Sprint 21-speed" />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Number plate (optional — auto-assigned if blank)</label>
            <input value={form.plate} onChange={update('plate')} placeholder="e.g. CC-0042" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="field">
            <label>Asking price (₹)</label>
            <input type="number" value={form.price} onChange={update('price')} placeholder="e.g. 1200" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Listing Type</label>
            <select value={form.listingType} onChange={update('listingType')}>
              <option value="purchase">Purchase</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div className="field">
            <label>Year / condition</label>
            <input value={form.condition} onChange={update('condition')} placeholder="e.g. 2021 · Good" />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea value={form.description} onChange={update('description')} placeholder="Gear count, repairs, etc." />
        </div>
        <div className="field">
          <label>Photos</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])} />
        </div>
        {error && <div className="error-banner">{error}</div>}
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add listing'}
        </button>
      </form>

      <div className="section-header" style={{ marginTop: 32 }}><h2>All listings</h2></div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="admin-list">
          {listings.map((l) => (
            <div key={l._id} className="admin-row">
              <span className="admin-plate">{l.plate}</span>
              <span className="admin-title">{l.title}</span>
              <span>₹{l.price.toLocaleString()}</span>
              <span className={`badge ${l.status === 'available' ? 'badge-available' : 'badge-sold'}`}>
                {l.status}
              </span>
              <button className="btn" onClick={() => handleDelete(l._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
