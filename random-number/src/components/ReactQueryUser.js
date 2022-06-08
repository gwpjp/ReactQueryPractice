import React from 'react';
import Onboard from '../containers/Onboard';
import { useBalance } from '../hooks/useBalance';

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
    web3Provider,
    blockNumber,
    address,
    readyToTransact,
  } = Onboard.useContainer();

  const balance = useBalance(
    settingChain,
    connectedChain,
    address,
    web3Provider,
    readyToTransact
  );

  return (
    <div>
      {wallet && userEnabled && !connecting ? (
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
            <p>
              Current Network:{' '}
              {settingChain ? 'Connecting...' : connectedChain.id}
            </p>
            <p>Block: {blockNumber}</p>
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
            <img
              height={25}
              width={25}
              style={{ marginRight: 10 }}
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                wallet?.icon ?? ''
              )}`}
            />
            {!wallet || !wallet.label || connecting ? '...' : wallet.label}{' '}
          </div>
          <p>User: {!address || connecting ? '...' : address}</p>
          <p>Balance: {balance.balance} ETH</p>
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
