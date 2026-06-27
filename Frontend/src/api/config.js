import api from './axios';

export const getTaskforceConfig = () =>
  api.get('/config/taskforce').then((r) => r.data);