import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitProfileDetails, verifyProfileOtp, resendProfileOtp } from '../api/profile';
import { useAuth } from '../context/AuthContext';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const handleSendDetails = async (e) => {
    e.preventDefault();
    setError('');
    if (!rollNumber.trim()) return setError('Roll number is required');
    if (!/^\d{10}$/.test(phone)) return setError('Enter a valid 10-digit phone number');

    setLoading(true);
    try {
      await submitProfileDetails({ rollNumber, phone });
      setStep('otp');
      setInfo('OTP sent to your phone');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyProfileOtp(otp);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await resendProfileOtp();
      setInfo('OTP resent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={step === 'details' ? handleSendDetails : handleVerify}>
        <h2>Complete your profile</h2>
        <p className="auth-note">
          We need your roll number and phone number to verify you're a student before you can buy a cycle.
        </p>

        {step === 'details' && (
          <>
            <div className="field">
              <label>Roll number</label>
              <input
                placeholder="e.g. CS2024001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>
            <div className="field">
              <label>Mobile number</label>
              <input
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                required
              />
            </div>
          </>
        )}

        {step === 'otp' && (
          <div className="field">
            <label>Enter OTP sent to {phone}</label>
            <input
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              required
            />
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={handleResend}>
              Resend OTP
            </button>
          </div>
        )}

        {info && <p style={{ color: 'var(--c-accent)', fontSize: 13, marginBottom: 10 }}>{info}</p>}
        {error && <div className="error-banner">{error}</div>}

        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Please wait…' : step === 'details' ? 'Send OTP' : 'Verify & continue'}
        </button>
      </form>
    </div>
  );
}
