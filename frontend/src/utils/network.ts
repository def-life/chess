import axios from 'axios';

const baseURL = "http://localhost:3001"
export const websocketURL = "ws://localhost:3001/socket"

const axiosInstance = axios.create({
    baseURL: baseURL, // Replace this with your base URL
    timeout: 10000, // Adjust the timeout as per your requirements
    withCredentials: true, // Allow Axios to send cookies with cross-origin requests
    headers: {
        'Content-Type': 'application/json',
        // Add any other default headers you need
    }
});

export function setHeader(accessToken: string | null) {
    if (accessToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
}

export default axiosInstance;
