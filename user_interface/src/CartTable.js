import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from './Redux/menuSlice.js';
import './Cart.css';
import { 
    Button, 
    IconButton
} from "@mui/material";
import {
    Close as CloseIcon,
} from "@mui/icons-material";

const CartTable = () => {
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.menu.cart);
    const ifOrdered = localStorage.getItem('ifOrdered');
    const orderId = useSelector((state) => state.menu.orderId);
    const [orderedTillNow, setOrderedTillNow] = useState([]);
    const orderedItems = useSelector((state) => localStorage.getItem('orderedItems'));

    console.log("addToOrderedItems", orderedItems)

    console.log("orderedTillNow", orderedTillNow)

    useEffect(() => {
        async function fetchDataAndStoreInLocalStorage() {
            const ifOrdered = localStorage.getItem('ifOrdered');
            console.log("ifOrdered", localStorage.getItem('ifOrdered'))
            if (ifOrdered === 'true') {
                try {
                    const response = await fetch(`http://ec2-54-153-59-14.us-west-1.compute.amazonaws.com:8080/order/getOrderItemsInfo/${orderId}`);
                    const data = await response.json();
                    setOrderedTillNow(data);
                    console.log('Data stored in local storage:', data);
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.log('ifOrdered is not true, skipping data fetch');
            }
        }

        fetchDataAndStoreInLocalStorage();
    }, [orderId , orderedItems]);


    const handleRemoveFromCart = (itemId) => {
        dispatch(removeFromCart(itemId));
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + item.Item_price * item.quantity, 0);
    };

    const renderCartItem = (item) => (
        <tr key={item.Item_id}>
            <td>{item.Item_name}</td>
            <td>${item.Item_price}</td>
            <td>{item.quantity}</td>
            <td>${(item.Item_price * item.quantity).toFixed(2)}</td>
            <td>
                <IconButton
                    variant="contained"
                    color="error"
                    onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveFromCart(item.Item_id);
                    }}
                    >
                        <CloseIcon />
                </IconButton>
            </td>
        </tr>
    );

    const renderOrderedItems = (orderedTillNow) => (
        <tr key={orderedTillNow.item_id}>
          <td>{orderedTillNow.item_name}</td>
          <td>${orderedTillNow.item_price}</td>
          <td>{orderedTillNow.quantity}</td>
          <td>${(orderedTillNow.item_price * orderedTillNow.quantity).toFixed(2)}</td>
        </tr>
      );

    return (
        <div>
            {!ifOrdered ? (
                <div className="cart-body">
                    {/* <h2>Order Till Now</h2> */}
                    <div className="cart-body-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th className="cart-column">Item Name</th>
                                    <th className="cart-column">Price</th>
                                    <th className="cart-column">Qty</th>
                                    <th className="cart-column">Subtotal</th>
                                    <th className="cart-column">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map(renderCartItem)}
                            </tbody>
                        </table>
                    </div>
                    <h3>Total: ${getTotal().toFixed(2)}</h3>
                </div>
            ) : (
                <div>
                    <div className="cart-body">
                        {/* <h2>Order Till Now</h2> */}
                        <div className="cart-body-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="cart-column">Item Name</th>
                                        <th className="cart-column">Price</th>
                                        <th className="cart-column">Qty</th>
                                        <th className="cart-column">Subtotal</th>
                                        {/* <th>Action</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderedTillNow.map(renderOrderedItems)}
                                </tbody>
                            </table>
                        </div>
                        {/* <h3>Total: ${getTotal().toFixed(2)}</h3> */}
                    </div>

                    <div className="cart-body">
                        {/* <h2>New Items</h2> */}
                        <div className="cart-body-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="cart-column">Item Name</th>
                                        <th className="cart-column">Price</th>
                                        <th className="cart-column">Qty</th>
                                        <th className="cart-column">Subtotal</th>
                                        <th className="cart-column">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(renderCartItem)}
                                </tbody>
                            </table>
                        </div>
                        <h3>Total: ${getTotal().toFixed(2)}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartTable;


