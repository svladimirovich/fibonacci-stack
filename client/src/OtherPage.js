import React from 'react';
import { Link } from 'react-router-dom';

export default() => {
    return (
        <div>
            I'm the Other Page!
            <Link to="/">Go back</Link>
        </div>
    );
};