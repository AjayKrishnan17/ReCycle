import api from './axios';

export const submitProfileDetails = (data) => api.post('/profile/details', data).then((r) => r.data);
export const verifyProfileOtp = (code) => api.post('/profile/verify-otp', { code }).then((r) => r.data);
export const resendProfileOtp = () => api.post('/profile/resend-otp').then((r) => r.data);
