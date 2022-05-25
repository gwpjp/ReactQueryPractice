import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import coinbaseModule from '@web3-onboard/coinbase';
import ledgerModule from '@web3-onboard/ledger';
import walletConnectModule from '@web3-onboard/walletconnect';
import torusModule from '@web3-onboard/torus';
import gnosisModule from '@web3-onboard/gnosis';

const injected = injectedModule();
const coinbase = coinbaseModule();
const ledger = ledgerModule();
const walletConnect = walletConnectModule();
const torus = torusModule();
const gnosis = gnosisModule();

const web3Onboard = init({
  wallets: [injected, coinbase, ledger, walletConnect, torus, gnosis],
  chains: [
    {
      id: '0x7A69',
      token: 'ETH',
      label: 'Hardhat',
      rpcUrl: 'http://localhost:8545',
    },
  ],
  appMetadata: {
    name: 'My App',
    icon: '<svg width="48px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 286.3 286.3" class="jss12"><path d="M143.15 3.88C66.23 3.88 3.88 66.23 3.88 143.15s62.35 139.28 139.27 139.28 139.27-62.36 139.27-139.28S220.07 3.88 143.15 3.88" fill="#6400ff"></path><path fill="#fff" d="M142.46 164.84v-31.22l-85.35 43.79h158.45V89.83z"></path></svg>',
    description: 'My app using Onboard',
  },
  i18n: {
    en: {
      connect: {
        selectingWallet: {
          header: 'Available Wallets',
          sidebar: {
            heading: 'Maverick Protocol',
            subheading: 'Get started',
            paragraph: 'Connect your wallet to start using the app.',
          },
        },
      },
    },
  },
  accountCenter: {
    desktop: {
      enabled: false, // default: true
    },
  },
});

export const fetchUser = () => {
  const previouslyConnectedWallets = JSON.parse(
    window.localStorage.getItem('connectedWallets')
  );

  try {
    if (previouslyConnectedWallets && previouslyConnectedWallets.length > 0) {
      return web3Onboard.connectWallet({
        autoSelect: {
          label: previouslyConnectedWallets[0],
          disableModals: true,
        },
      });
    } else {
      return web3Onboard.connectWallet();
    }
  } catch (error) {
    console.log(error);
  }
};

export default function ReactQueryUser() {
  const [enableUser, setEnableUser] = useState(false);

  const user = useQuery(['user'], fetchUser, {
    refetchOnWindowFocus: false,
    enabled: enableUser,
  });

  if (user.isError) return <p>Error: {user.error.message}</p>;

  const walletsSub = web3Onboard.state.select('wallets');
  const { unsubscribe } = walletsSub.subscribe((wallets) => {
    const connectedWallets = wallets.map(({ label }) => label);
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWallets)
    );
  });

  let icon = '';
  if (user.isFetched) {
    icon = user.data[0].icon;
  }

  return (
    <div>
      {enableUser && user.isFetched ? (
        <div>
          <div
            dangerouslySetInnerHTML={{ __html: icon }}
            style={{ height: 20, display: 'inline-block' }}
          ></div>
          <p>
            Wallet:{' '}
            {user.isLoading || user.isFetching ? '...' : user.data[0].label}{' '}
          </p>
          <p>
            User:{' '}
            {user.isLoading || user.isFetching
              ? '...'
              : user.data[0].provider.selectedAddress}
          </p>
        </div>
      ) : (
        <button
          onClick={() => {
            setEnableUser(true);
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
