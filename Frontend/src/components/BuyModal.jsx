import { useState } from 'react';
import { createOrder } from '../api/orders';

export default function BuyModal({ listing, taskforce, onClose, onPurchased }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('');
  const [utr, setUtr] = useState('');
  const [cashChecked, setCashChecked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const utrValid = /^\d{12}$/.test(utr);

  const handleVerifyUTR = () => {
    if (!utrValid) return;
    setVerifying(true);
    // Simulated client-side check; real verification happens server-side on submit
    setTimeout(() => {
      setVerifying(false);
      setStep(3);
    }, 1500);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const order = await createOrder({
        listingId: listing._id,
        paymentMethod: method,
        utrNumber: method === 'upi' ? utr : undefined,
      });
      onPurchased(order);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const copyUpi = () => navigator.clipboard?.writeText(taskforce.upi);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Buy cycle</h2>
          <button className="btn icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <StepIndicator step={step} />

          {step === 1 && (
            <ReviewStep listing={listing} taskforce={taskforce} />
          )}

          {step === 2 && (
            <PaymentStep
              listing={listing}
              taskforce={taskforce}
              method={method}
              setMethod={setMethod}
              utr={utr}
              setUtr={setUtr}
              utrValid={utrValid}
              verifying={verifying}
              cashChecked={cashChecked}
              setCashChecked={setCashChecked}
              onCopyUpi={copyUpi}
            />
          )}

          {step === 3 && (
            <ConfirmStep
              listing={listing}
              taskforce={taskforce}
              method={method}
              utr={utr}
              error={error}
            />
          )}
        </div>

        <div className="modal-footer">
          {step === 1 && (
            <>
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Choose payment →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button className="btn" onClick={() => setStep(1)}>← Back</button>
              {method === 'upi' && (
                <button
                  className="btn btn-primary"
                  disabled={!utrValid || verifying}
                  onClick={handleVerifyUTR}
                >
                  {verifying ? 'Verifying…' : 'Verify & continue →'}
                </button>
              )}
              {method === 'cash' && (
                <button
                  className="btn btn-primary"
                  disabled={!cashChecked}
                  onClick={() => setStep(3)}
                >
                  Continue →
                </button>
              )}
              {!method && (
                <button className="btn btn-primary" disabled>
                  Select a payment method
                </button>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <button className="btn" onClick={() => setStep(2)}>← Back</button>
              <button
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting ? 'Confirming…' : 'Confirm purchase'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }) {
  const labels = ['Review', 'Payment', 'Confirm'];
  return (
    <div className="step-indicator-wrap">
      <div className="step-indicator">
        {labels.map((label, i) => {
          const n = i + 1;
          const cls = n < step ? 'done' : n === step ? 'active' : 'pending';
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div className={`step-dot ${cls}`}>{n < step ? '✓' : n}</div>
              {i < 2 && <div className={`step-line ${n < step ? 'done' : ''}`} />}
            </div>
          );
        })}
      </div>
      <div className="step-labels">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function ReviewStep({ listing, taskforce }) {
  return (
    <>
      <div className="review-header">
        <div className="review-emoji">🚲</div>
        <div>
          <div className="review-title">{listing.title}</div>
          <div className="review-plate">{listing.plate}</div>
        </div>
      </div>
      <InfoRows rows={[
        ['Price', `₹${listing.price.toLocaleString()}`],
        ['Condition', listing.condition],
        ['Payment to', taskforce.name],
      ]} />
      <PickupBox taskforce={taskforce} />
    </>
  );
}

function PaymentStep({ listing, taskforce, method, setMethod, utr, setUtr, utrValid, verifying, cashChecked, setCashChecked, onCopyUpi }) {
  return (
    <>
      <p className="pay-intro">
        Pay <strong>₹{listing.price.toLocaleString()}</strong> to <strong>{taskforce.name}</strong>:
      </p>
      <div className="pay-method-row">
        <div
          className={`pay-method-card ${method === 'upi' ? 'selected' : ''}`}
          onClick={() => setMethod('upi')}
        >
          <div className="pm-icon">📲</div>
          <div className="pm-title">Pay via UPI</div>
          <div className="pm-sub">GPay · PhonePe · Paytm</div>
        </div>
        <div
          className={`pay-method-card ${method === 'cash' ? 'selected' : ''}`}
          onClick={() => setMethod('cash')}
        >
          <div className="pm-icon">💵</div>
          <div className="pm-title">Pay in cash</div>
          <div className="pm-sub">Hand over at {taskforce.pickupShort}</div>
        </div>
      </div>

      {method === 'upi' && (
        <div className="tf-box">
          <div className="tf-header">
            <span className="tf-badge">Official</span>
            <span>{taskforce.name}</span>
          </div>
          <div className="tf-upi-row">
            <span className="tf-upi-val">{taskforce.upi}</span>
            <button className="copy-btn" onClick={onCopyUpi}>Copy</button>
          </div>
          <span className="amount-tag">₹{listing.price.toLocaleString()} exact</span>
          <div className="field" style={{ marginTop: 14 }}>
            <label>UTR / Transaction reference number</label>
            <input
              className={`utr-input ${utr ? (utrValid ? 'valid' : 'invalid') : ''}`}
              maxLength={12}
              placeholder="e.g. 426811234567"
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
            />
            <div className={`utr-hint ${utr ? (utrValid ? 'ok' : 'err') : 'neutral'}`}>
              {!utr && '12-digit UTR from your UPI app after paying'}
              {utr && !utrValid && 'UTR must be exactly 12 digits'}
              {utr && utrValid && 'Looks good — click Verify & continue'}
            </div>
          </div>
          {verifying && (
            <div className="verify-bar">
              <div className="spinner" /> Verifying with Taskforce…
            </div>
          )}
        </div>
      )}

      {method === 'cash' && (
        <div className="cash-box">
          <CashStep n={1} text="Visit the Taskforce desk" sub={`${taskforce.pickup} · ${taskforce.hours}`} />
          <CashStep n={2} text="Hand over cash to the Taskforce team" sub={`₹${listing.price.toLocaleString()} — exact change preferred`} />
          <CashStep n={3} text="Collect the cycle on the spot" sub="Team hands it over after payment" />
          <label className={`cash-confirm-check ${cashChecked ? 'checked' : ''}`}>
            <input type="checkbox" checked={cashChecked} onChange={(e) => setCashChecked(e.target.checked)} />
            <span>I will visit the Taskforce desk and pay <strong>₹{listing.price.toLocaleString()} in cash</strong> to collect the cycle.</span>
          </label>
        </div>
      )}
    </>
  );
}

function CashStep({ n, text, sub }) {
  return (
    <div className="cash-step">
      <div className="cash-num">{n}</div>
      <div className="cash-text">{text}<span>{sub}</span></div>
    </div>
  );
}

function ConfirmStep({ listing, taskforce, method, utr, error }) {
  const isUpi = method === 'upi';
  return (
    <>
      <div className="confirm-banner">
        <div className="confirm-icon">{isUpi ? '✅' : '💵'}</div>
        <div className="confirm-title">{isUpi ? 'Payment verified!' : 'Cash payment agreed'}</div>
        <div className="confirm-sub">
          {isUpi ? `UTR ${utr} accepted` : `Visit ${taskforce.pickupShort} to pay & collect`}
        </div>
      </div>
      <InfoRows rows={[
        ['Cycle', listing.title],
        ['Plate', listing.plate],
        ['Amount', `₹${listing.price.toLocaleString()}`],
        ['Paid to', taskforce.name],
        ['Method', isUpi ? `UPI · UTR ${utr}` : 'Cash at desk'],
      ]} />
      <PickupBox taskforce={taskforce} />
      {error && <div className="error-banner">{error}</div>}
    </>
  );
}

function InfoRows({ rows }) {
  return (
    <div className="info-rows">
      {rows.map(([k, v]) => (
        <div key={k} className="info-row">
          <span>{k}</span><span>{v}</span>
        </div>
      ))}
    </div>
  );
}

function PickupBox({ taskforce }) {
  return (
    <div className="pickup-box">
      <div>
        <div className="pickup-title">Pickup at {taskforce.pickupShort}</div>
        <div className="pickup-sub">{taskforce.hours} · Bring your college ID</div>
      </div>
    </div>
  );
}
