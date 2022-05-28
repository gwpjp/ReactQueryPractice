import React from 'react';
import Onboard from '../containers/Onboard';

export default function ReactQueryUser() {
  let {
    wallet,
    connecting,
    disconnect,
    connect,
    userEnabled,
    setUserEnabled,
    connectedChain,
    chains,
    setChain,
    settingChain,
  } = Onboard.useContainer();

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
          <div>
            Current Network:{' '}
            {settingChain ? 'Connecting...' : connectedChain.id}
          </div>
          <div>
            <label>
              Change Network
              <select
                value={connectedChain.id}
                onChange={async (e) => {
                  await setChain({ chainId: e.target.value });
                }}
              >
                {chains.map((chain) => {
                  return (
                    <option value={chain.id} key={chain.id}>
                      {chain.label}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          <div>
            Wallet:{' '}
            <div
              dangerouslySetInnerHTML={{ __html: wallet.icon }}
              style={{ height: 20, display: 'inline-block' }}
            ></div>
            {connecting ? '...' : wallet.label}{' '}
          </div>
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
