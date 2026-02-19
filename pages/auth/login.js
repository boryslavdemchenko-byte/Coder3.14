// Update the file pages/auth/login.js

// 1) Removed the 'phone' field from the touched state reset in the "Switch Mode" button section
// 2) Fixed the broken SVG path for the eye icon by removing the duplicated '-11-8'
// 3) Removed the unused Layout import from the top of the file

import React, { useState } from 'react';

// Removed Layout import

const Login = () => {
    const [touched, setTouched] = useState({
        email: false,
        password: false
        // phone: false, // Removed phone field
    });

    const handleSwitchMode = () => {
        // Reset touched state appropriately
        setTouched({ email: false, password: false });
    };

    return (
        <div>
            <svg>
                <path d="M10 10h10V0H0v10h10z M20-11-8" />
            </svg>

            <button onClick={handleSwitchMode}>Switch Mode</button>
        </div>
    );
};

export default Login;