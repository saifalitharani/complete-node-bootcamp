/* eslint-disable */
import '@babel/polyfill';
import {
    login,
    logout,
} from './login';
import {
    displayMap
} from './mapbox';
import {
    updateUserSettings
} from './updateSettings';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataUpdateForm = document.querySelector('.form-user-data');
const userPasswordUpdateForm = document.querySelector('.form-user-password');

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataUpdateForm) {
    userDataUpdateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateUserSettings({
            name,
            email
        }, 'data');
    });
}

if (userPasswordUpdateForm) {
    userPasswordUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating..';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateUserSettings({
            passwordCurrent,
            password,
            passwordConfirm
        }, 'password');
        document.querySelector('.btn--save-password').textContent = 'Save Password';
    });
}