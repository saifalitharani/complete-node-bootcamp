/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// Type can be 'Password' or 'Data'
export const updateUserSettings = async (data, type) => {
    try {
        const url =
            type === 'data'
                ? '/api/v1/users/updateMe/'
                : '/api/v1/users/updatePassword/';
        const method = type === 'data' ? 'PATCH' : 'POST';
        const res = await axios({
            method,
            url,
            data,
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
