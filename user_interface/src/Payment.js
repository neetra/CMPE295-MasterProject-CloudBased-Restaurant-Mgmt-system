import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const orderId = localStorage.getItem('orderId')

const Payment = () => {
    const [clientSecret, setClientSecret] = useState(null);

// const getOrderClientSecret = async (orderId) => {
//   try {
//     const response = await fetch(`http://ec2-54-153-81-157.us-west-1.compute.amazonaws.com:8080/create-payment-intent`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ order_id: orderId }),
//     });
//     const data = await response.json();
//     console.log(data)
//     return data.client_secret;
//   } catch (error) {
//     console.error(error);
//   }
// }


  useEffect(() => {
    // async function fetchClientSecret() {
    //   const secret = await getOrderClientSecret(orderId);
      setClientSecret("pi_3N5KulFjzCoO1teW1XQQzPwr_secret_6T6Cb7oILs1R838Kic5bXQbRd");
      console.log("clientSecret", clientSecret)
    // }
    // fetchClientSecret();
//   }, [orderId]);
    // }
});

  return (
    <Elements stripe={stripePromise}>
      {clientSecret && <CheckoutForm clientSecret={clientSecret} />}
    </Elements>
  );
};


export default Payment;

