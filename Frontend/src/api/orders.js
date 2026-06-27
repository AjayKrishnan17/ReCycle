import api from './axios';

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);
export const getMyOrders = () => api.get('/orders/mine').then((r) => r.data);
export const getAllOrders = () => api.get('/orders').then((r) => r.data);