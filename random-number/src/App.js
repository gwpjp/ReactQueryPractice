import React from 'react';
import ReactQueryUser from './components/ReactQueryUser.js';
import ReactQueryRandom from './components/Random.js';
import {
  ReactQueryFetchGreeting,
  ReactQuerySetGreeting,
} from './components/Greeting.js';

export default function App() {
  return (
    <div style={{ width: '100%', display: 'flex', alignContent: 'stretch' }}>
      <div style={{ padding: 10, margin: 0 }}>
        <h2>Greeting from Blockchain</h2>
        <h4>Fetch:</h4>
        <ReactQueryFetchGreeting />
        <h4>Set:</h4>
        <ReactQuerySetGreeting />
      </div>

      <div style={{ padding: 10, marginLeft: 20 }}>
        <h2>Random Number from API</h2>
        <ReactQueryRandom />
      </div>
      <div style={{ padding: 10, marginLeft: 20 }}>
        <h2>User from Metamask</h2>
        <ReactQueryUser />
      </div>
    </div>
  );
}
