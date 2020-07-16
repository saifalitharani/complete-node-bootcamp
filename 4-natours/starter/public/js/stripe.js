/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from './alerts';

const stripe = Stripe(
    'pk_test_51H5Yw1IHxsVmnh8nkD2R63QNZuSUZhx4CNTeTUszCIt15NKwyEhgtFvA8UCXwX9ISqoTyakidqgdBu5OWkY69N5m00MhlgM78z'
);

export const bookTour = async (tourId) => {
    try {
        // 1: GET checkout-session from the API
        const checkoutSession = await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout_session/${tourId}`);

        // 2: Create checkout form + Charge credit card.
        await stripe.redirectToCheckout({
            sessionId: checkoutSession.data.session.id,
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};