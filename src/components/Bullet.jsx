import React from 'react';

const Bullet = ({ className = "" }) => {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`shrink-0 ${className}`}
            aria-hidden="true"
        >
            {/* Top Diamond */}
            <path d="M12 2L16 6L12 10L8 6L12 2Z" />
            {/* Bottom Diamond */}
            <path d="M12 14L16 18L12 22L8 18L12 14Z" />
            {/* Left Diamond */}
            <path d="M4 8L8 12L4 16L0 12L4 8Z" />
            {/* Right Diamond */}
            <path d="M20 8L24 12L20 16L16 12L20 8Z" />
        </svg>
    );
};

export default Bullet;
