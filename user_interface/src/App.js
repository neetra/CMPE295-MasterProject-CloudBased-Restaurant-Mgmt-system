import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import HomePage from './Pages/HomePage.js';
import Payment from './Payment.js';
import AdminPage from './Pages/AdminPage.js'
import AdminLogin from './Components/AdminLogin.js'
import MenuInventory from './Pages/MenuInventory.js';
import Login from './Components/Login.js';
import ReservationForm from './Table/table_researvation_form'
import ManagerPage from './Pages/ManagerPage.js';
import TopBar from './Topbar';
import './App.css';

function App() {
  // <TopBar />
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* <Route key="login" exact path="/restaurant/:id/login" element={<Login />} /> */}
          <Route key="login" exact path="/login" element={<Login />} />
          <Route key="manager" exact path="/restaurant/:id/manager" element={<ManagerPage />} />
          <Route exact path="/admin" element={<AdminPage />} />
          <Route exact path="/adminlogin" element={<AdminLogin />} />
          <Route key="home" exact path="/restaurant/:id" element={<HomePage />} />
          <Route key="menu" exact path="/restaurant/:id/menu" element={<MenuInventory />} />
          <Route key="reserve" exact path="/reserve" element={<ReservationForm />} />
          <Route key="reserve" exact path="/checkoutForm" element={<CheckoutForm />} />
          <Route key="reserve" exact path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;