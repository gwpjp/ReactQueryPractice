/* eslint-disable no-inner-declarations */
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { ethers } from 'ethers';
import {
  init,
  useConnectWallet,
  useSetChain,
  useWallets,
} from '@web3-onboard/react';
import { createContainer } from 'unstated-next';
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

const fetchUser = () => {
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

export default function useUser(enableUser) {
  const user = useQuery(['user'], fetchUser, {
    refetchOnWindowFocus: false,
    enabled: enableUser,
  });
  const walletsSub = web3Onboard.state.select('wallets');
  const { unsubscribe } = walletsSub.subscribe((wallets) => {
    const connectedWallets = wallets.map(({ label }) => label);
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWallets)
    );
  });
  return user;
}

let provider;

function useOnboard() {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();

  const [vWeb3Onboard, setWeb3Onboard] = useState(null);
  useEffect(() => {
    setWeb3Onboard(web3Onboard);
  }, []);

  useEffect(() => {
    if (!connectedWallets.length) return;

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    );
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWalletsLabelArray)
    );
  }, [connectedWallets, wallet]);

  useEffect(() => {
    if (!wallet?.provider) {
      provider = null;
    } else {
      provider = new ethers.providers.Web3Provider(wallet.provider, 'any');
    }
  }, [wallet]);

  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(
      window.localStorage.getItem('connectedWallets')
    );

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        await connect({ autoSelect: previouslyConnectedWallets[0] });
      }
      setWalletFromLocalStorage();
    }
  }, [web3Onboard, connect]);

  const readyToTransact = async () => {
    if (!wallet) {
      const walletSelected = await connect();
      if (!walletSelected) return false;
    }
    // prompt user to switch to Hardhat for test
    await setChain({ chainId: '0x7A69' });

    return true;
  };

  return { wallet, vWeb3Onboard, connectedWallets };
}

export let Onboard = createContainer(useOnboard);
