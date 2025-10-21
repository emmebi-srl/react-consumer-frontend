import axios from 'axios';

/**
 * Class responsible to execute authenticate and refreh the user token
 */
const ariesAuthClient = axios.create({
  baseURL: import.meta.env.VITE_ARIES_AUTH_HOST,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${import.meta.env.VITE_ARIES_BASIC_AUTH_VALUE}`,
  },
});

export default ariesAuthClient;
