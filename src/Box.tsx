import React from 'react';

interface BoxProps {
    className?: string;
    children?: React.ReactNode;
}

const Box: React.FC<BoxProps> = ({ className, children }) => {
    return (
        <div className={`box ${className ? className : ''}`}>
            {children}
        </div>
    );
}

export default Box;
