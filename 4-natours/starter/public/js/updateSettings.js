/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from './alerts';

// Type can be 'Password' or 'Data'
export const updateUserSettings = async (data, type) => {
    try {
        const url = (type === 'data') ? 'http://127.0.0.1:8000/api/v1/users/updateMe/' : 'http://127.0.0.1:8000/api/v1/users/updatePassword/'
        const method = (type === 'data') ? 'PATCH' : 'POST'
        const res = await axios({
            method,
            url,
            data,
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
};