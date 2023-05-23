import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useSelector, useDispatch } from 'react-redux';
import { setIfOrdered, setOrderId, addToOrderedItems, removeFromCart } from './Redux/menuSlice.js';
import './Cart.css';
import { useNavigate } from 'react-router-dom';

const CartAPI = () => {
    const [order, setOrder] = useState(null);
    const [phone, setPhone] = useState('');
    const cart = useSelector((state) => state.menu.cart);
    const ifOrdered = localStorage.getItem('ifOrdered');
    const dispatch = useDispatch();


    const handleOrderId = (orderId) => {
        dispatch(setOrderId(orderId));
        console.log("added order id")
    };

    const handlePhoneChange = (event) => {
        setPhone(event.target.value);
    };

    const handleaddToOrderedItems = (order) => {
        dispatch(addToOrderedItems(order));
    }

    const handleflushcart = (cart) => {
            for (let i = cart.length - 1; i >= 0; i--) {
              const itemId = cart[i].Item_id;
              dispatch(removeFromCart(itemId));
            }
          }
    let data;

    if (!ifOrdered) {
        data = {
            table_id: 9,
            Item: cart && cart.map((item) => ({
                Item_id: item.Item_id,
                Item_name: item.Item_name,
                quantity: item.quantity,
                price: item.Item_price,
            })),
            customer_phone: phone,
        };
    } else {
        const orderId1 = localStorage.getItem('orderId');
        data = {
            order_id: orderId1.replace(/"/g, ""),
            Item: cart && cart.map((item) => ({
                Item_id: parseInt(item.Item_id),
                Item_name: item.Item_name,
                quantity: item.quantity,
                price: parseInt(item.Item_price),
            })),
        };
    }


    // console.log("data:", data)

    const navigate = useNavigate();

    const handleGenerateOrder = async () => {
        const url = 'http://ec2-54-153-59-14.us-west-1.compute.amazonaws.com:8080/order/createOrder';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to generate order');
            }

            const orderData = await response.json();
            setOrder(orderData);
            handleOrderId(orderData.order_id)
            handleflushcart(cart);

        } catch (error) {
            console.error(error);
        }
        dispatch(setIfOrdered(true));
    };

    const handleUpdateOrder = async () => {
        console.log("data:", JSON.stringify(data))
        const url = 'http://ec2-54-153-59-14.us-west-1.compute.amazonaws.com:8080/order/updateOrder';

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to generate order');
            }

            const orderData = await response.json();
            setOrder(orderData);
            handleaddToOrderedItems(orderData)
            // dispatch(flushCart())
            handleflushcart(cart);
            // console.log(orderData); // log of order data
        } catch (error) {
            console.error(error);
        }
        // dispatch(setIfOrdered(true));
    };

    const handleCheckout = async () => {
        const url = 'http://ec2-54-153-59-14.us-west-1.compute.amazonaws.com:8080/order/createOrder';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to generate order');
            }

            const orderData = await response.json();
            setOrder(orderData);
            console.log(orderData); // log of order data
        } catch (error) {
            console.error(error);
        }

        // if (order.order_id) {
            // const confirmPayment = window.confirm(`You are about to be redirected to the payment page to complete your order of $${order.amount}. Are you sure you want to proceed?`);
            // if (confirmPayment) {
                alert('Payment confirmed! Redirecting to payment page...');
                navigate('/payment');
            // }
        // }
    };

    return (
        <div className="cart-body">
            <p>Please enter your phone number to continue:</p>
            <form className="cart-form">
                <TextField
                    className="phone-number-field"
                    label="Phone Number"
                    variant="outlined"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                />
                {!ifOrdered ? (
                    <Button variant="contained" color="primary" onClick={handleGenerateOrder}>
                        Generate Order
                    </Button>
                )
                    : (
                        <Button variant="contained" color="primary" onClick={handleUpdateOrder}>
                            Update Order
                        </Button>
                    )}
                <Button variant="contained" color="primary" onClick={handleCheckout}>
                    Checkout
                </Button>

            </form>
        </div>
    );
};

export default CartAPI;
