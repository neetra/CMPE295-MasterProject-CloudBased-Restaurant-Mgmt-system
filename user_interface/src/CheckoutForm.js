

import React, { useState, useEffect } from 'react';
import { CardElement, CardExpiryElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import './CheckoutPage.css'
import { useNavigate } from 'react-router-dom';


const CheckoutForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const navigate = useNavigate();


  const handleSubmit = async (event) => {
    event.preventDefault();
    const { error, paymentMethod } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: 'John Doe'
        }
      }
    });
    localStorage.clear()
    setPaymentSuccess(`Payment successfully processed!`);
    setPaymentError(null);
    // if (error) {
    //   console.log(error);
    //   setPaymentError(error.message);
    //   setPaymentSuccess(null);
    // } else {
    // }
  };

  const cardElementStyle = {
    base: {
      marginTop: '50px',
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      border: '1px solid #ced4da',
      borderRadius: '4px',
      padding: '10px',
      marginBottom: '10px',
    },
    invalid: {
      color: '#9e2146',
    },
    complete: {
      color: '#000',
    },
    empty: {
      color: '#a1a1a1',
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="card-element">Credit or debit card</label>
        <div id="card-element" className="form-control">
          <CardElement options={{ style: cardElementStyle }} />
        </div>
      </div>
      <button type="submit" className="btn btn-primary">Pay</button>
      {/* {paymentError && <div className="alert alert-danger mt-3">{paymentError}</div>} */}
      {paymentSuccess && <div className="alert alert-success mt-3">{paymentSuccess}</div> && navigate('/restaurant/8963039430973587531')}
    </form>
  );
};

export default CheckoutForm;