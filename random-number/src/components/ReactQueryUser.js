import React from 'react';
import Onboard from '../containers/Onboard';

export default function ReactQueryUser() {
  let { wallet, connecting, disconnect, connect, userEnabled, setUserEnabled } =
    Onboard.useContainer();

  return (
    <div>
      {wallet && userEnabled ? (
        <div>
          <div>
            <button
              onClick={() => {
                setUserEnabled(false);
                disconnect(wallet);
                window.localStorage.removeItem('connectedWallets');
              }}
            >
              Disconnect
            </button>
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: wallet.icon }}
            style={{ height: 20, display: 'inline-block' }}
          ></div>
          <p>Wallet: {connecting ? '...' : wallet.label} </p>
          <p>User: {connecting ? '...' : wallet.accounts[0].address}</p>
        </div>
      ) : (
        <button
          onClick={() => {
            setUserEnabled(true);
            connect();
          }}
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
