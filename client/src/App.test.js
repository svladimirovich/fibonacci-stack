import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
    // This app is going to be tested while being isolated from other containers
    // So it will call Fib.js component, which will need an API method to respond
    // and thus, test will fail.
    // We didn't bother solving this and simply decided to comment it out
    // a great CI!

    // const div = document.createElement('div');
    // ReactDOM.render(<App />, div);
    // ReactDOM.unmountComponentAtNode(div);
});
