import React from 'react';
import logo from './Resources/1600w-jeSR74GRMC8.webp';
import './Topbar.css';

function TopBar() {
    return (
        <div className="top-bar">
            <div className="logo">
                <div className='logo-container'>
                    <img src={logo} alt="logo" style={{ width: '100px', height: '50px' }} />
                </div>
            </div>
            <div className="reserve-table">
                <button>Reserve Table</button>
            </div>
        </div>
    );
}

export default TopBar;

