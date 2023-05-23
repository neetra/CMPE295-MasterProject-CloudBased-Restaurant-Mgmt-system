// import React, { useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { removeFromCart } from './Redux/menuSlice.js';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// // import { PaymentElement } from '@stripe/react-stripe-js';
// // import StripeWrapper from './StripeWrapper';
// import './Cart.css';

// const Cart = () => {
//   const dispatch = useDispatch();
//   const cart = useSelector((state) => state.menu.cart);
//   const [order, setOrder] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [phone, setPhone] = useState('');

//   const handleRemoveFromCart = (itemId) => {
//     dispatch(removeFromCart(itemId));
//   };

//   const handlePhoneChange = (event) => {
//     setPhone(event.target.value);
//   };

//   const data = {
//     table_id: 9,
//     Item: cart.map((item) => ({
//       Item_id: item.Item_id,
//       quantity: item.quantity,
//       price: item.Item_price,
//     })),
//     customer_phone: phone,
//   };

//   // console.log("data:", data)

//   const handleGenerateOrder = async () => {
//     const url = 'http://ec2-13-56-236-90.us-west-1.compute.amazonaws.com:8080/order/createOrder';

//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to generate order');
//       }

//       const orderData = await response.json();
//       setOrder(orderData);
//       // console.log(orderData); // log of order data
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const getTotal = () => {
//     return cart.reduce((total, item) => total + item.Item_price * item.quantity, 0);
//   };

//   const handleOpenCart = () => {
//     setIsOpen(true);
//   };

//   const handleCloseCart = () => {
//     setIsOpen(false);
//   };

//   return (
//     <div className={`cart-container ${isOpen ? 'open' : ''}`}>
//       <div className="cart-header">
//         <button className="cart-toggle-button" onClick={isOpen ? handleCloseCart : handleOpenCart}>
//           {isOpen ? 'Close' : 'Open'}
//         </button>
//         <h2>Cart</h2>
//       </div>
//       <div className="cart-body">
//         <table>
//           <thead>
//             <tr>
//               <th>Item Name</th>
//               <th>Price</th>
//               <th>Quantity</th>
//               <th>Subtotal</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {cart.map((item) => (
//               <tr key={item.Item_id}>
//                 <td>{item.Item_name}</td>
//                 <td>{item.Item_price}</td>
//                 <td>{item.quantity}</td>
//                 <td>{(item.Item_price * item.quantity).toFixed(2)}</td>
//                 <td>
//                   <Button variant="contained" color="error" onClick={() => handleRemoveFromCart(item.Item_id)}>
//                     Remove
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <h3>Total: ${getTotal().toFixed(2)}</h3>
//         <form>
//           <TextField
//             label="Phone Number"
//             variant="outlined"
//             value={phone}
//             onChange={handlePhoneChange}
//           />
//           <Button variant="contained" color="primary" onClick={handleGenerateOrder}>
//             Generate Order
//             </Button>
//           </form>
//        </div>
//      </div>
//    );
// };
// export default Cart;


// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import TextField from '@mui/material/TextField';
// import { removeFromCart } from './menuSlice';
// import CartAPI from './CartAPI';
// import CartTable from './CartTable';
// import './Cart.css';

// const Cart = () => {
//   const dispatch = useDispatch();
//   const cartItems = useSelector((state) => state.menu.cart);
//   const [phone, setPhone] = useState('');
//   const [isOpen, setIsOpen] = useState(true);


//   const handleRemoveFromCart = (itemId) => {
//     dispatch(removeFromCart(itemId));
//   };

//   const handlePhoneChange = (event) => {
//     setPhone(event.target.value);
//   };

//   const cart = cartItems.map((item) => ({
//     Item_id: item.Item_id,
//     quantity: item.quantity,
//     price: item.Item_price,
//   }));

//   return (
//     <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
//       <div className="cart-body">
//         <h3>Cart</h3>
//         <ul>
//           {cartItems.map((item) => (
//             <li key={item.Item_id}>
//               <span>{item.Item_name}</span>
//               <span>{item.quantity}</span>
//               <span>${item.Item_price * item.quantity}</span>
//               <button onClick={() => handleRemoveFromCart(item.Item_id)}>Remove</button>
//             </li>
//           ))}
//         </ul>
//         <TextField
//           label="Phone Number"
//           variant="outlined"
//           value={phone}
//           onChange={handlePhoneChange}
//         />
//         <CartAPI cart={cart} />
//         <CartTable cart={cart} />
//       </div>
//     </div>
//   );
// };

// export default Cart;

// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import TextField from '@mui/material/TextField';
// import { removeFromCart } from './menuSlice';
// import CartAPI from './CartAPI';
// import CartTable from './CartTable';
// import './Cart.css';

// const Cart = () => {
//   const dispatch = useDispatch();
//   const cartItems = useSelector((state) => state.menu.cart);
//   const [phone, setPhone] = useState('');
//   const [isOpen, setIsOpen] = useState('true');
//   const handleRemoveFromCart = (itemId) => {
//     dispatch(removeFromCart(itemId));
//   };

//   const handlePhoneChange = (event) => {
//     setPhone(event.target.value);
//   };

//   const cart = cartItems.map((item) => ({
//     Item_id: item.Item_id,
//     quantity: item.quantity,
//     price: item.Item_price,
//   }));

//   const toggleCart = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
//       <div className="cart-body">
//         <div className="cart-header">
//         <button onClick={toggleCart}>Toggle Cart</button>
//           <h3>Cart</h3>
//         </div>
//         <CartTable cart={cart} />
//         <CartAPI cart={cart} />
//       </div>
//     </div>
//   );
// };

// export default Cart;
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import CartAPI from './CartAPI';
import CartTable from './CartTable';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from './Redux/menuSlice.js';
import './Cart.css';
import { 
  TextField, 
  Button, 
  IconButton
} from "@mui/material";

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.menu.cart);
  const [phone, setPhone] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const handleRemoveFromCart = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const cart = cartItems.map((item) => ({
    Item_id: item.Item_id,
    quantity: item.quantity,
    price: item.Item_price,
  }));

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const handleCartHover = () => {
    setIsCartExpanded(true);
  };

  const handleCartHoverEnd = () => {
    setIsCartExpanded(false);
  };

  const handleCartClick = (event) => {
    // Prevent cart from toggling when user clicks on a button inside the cart body
    if (event.target.tagName.toLowerCase() !== "button" &&
      event.target.tagName.toLowerCase() !== "input") {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`cart-sidebar ${isOpen ? 'open' : ''}`}
      style={{ right: isCartExpanded ? '75px' : '16px' }}
      onMouseEnter={!isOpen ? handleCartHover : null}
      onMouseLeave={!isOpen ? handleCartHoverEnd : null}
      onClick={handleCartClick}
    >
      <div className="cart-header">
        <h2>Cart</h2>
        <IconButton
          sx={{
              position: "absolute",
              top: 8,
              right: 2,
              padding: 2,
              color: "white",
          }}
          onClick={(event) => {
            event.stopPropagation();
            toggleCart();
          }}
          >
          <CloseIcon />
        </IconButton>
      </div>
      <CartTable cart={cart} />
      <CartAPI cart={cart} />
    </div>
  );
};

export default Cart;



