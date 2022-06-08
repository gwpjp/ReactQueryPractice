/* eslint-disable no-inner-declarations */
import { useState, useEffect } from 'react';
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

const initWeb3Onboard = init({
  wallets: [injected, coinbase, ledger, walletConnect, torus, gnosis],
  chains: [
    {
      id: '0x7a69',
      token: 'ETH',
      label: 'Hardhat',
      rpcUrl: 'http://localhost:8545',
    },
    {
      id: '0x4',
      token: 'rETH',
      label: 'Rinkeby Testnet',
      rpcUrl: `https://rinkeby.infura.io/v3/7940d39fb5dc4fc0b12a17ff931cc442`,
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

function useOnboard() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains, connectedChain, settingChain }, setChain] = useSetChain();
  const connectedWallets = useWallets();

  const [web3Onboard, setWeb3Onboard] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userEnabled, setUserEnabled] = useState(false);

  useEffect(() => {
    setWeb3Onboard(initWeb3Onboard);
  }, []);

  const [web3Provider, setWeb3Provider] = useState(null);

  const [blockNumber, setBlockNumber] = useState(null);

  useEffect(() => {
    if (provider && !connecting) {
      const p = new ethers.providers.Web3Provider(provider, 'any');
      setWeb3Provider(p);

      //Force page refreshes on network changes according to Ethers best practices
      p.on('network', (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (oldNetwork) {
          window.location.reload();
        }

        // Check that the network is one of the accepted chains
        const chainsList = chains.map((c) => {
          return parseInt(c.id, 16);
        });
        if (chainsList.indexOf(newNetwork.chainId) == -1) {
          setUserEnabled(false);
          alert('Not an acceptable network');
        }
      });
      p.on('block', (blockNumber) => {
        setBlockNumber(blockNumber);
      });
    }
  }, [provider, connectedChain, wallet, connecting]);

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
      setProvider(null);
    } else {
      setProvider(wallet.provider);
    }
  }, [wallet, connectedChain]);

  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(
      window.localStorage.getItem('connectedWallets')
    );

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        await connect({
          autoSelect: {
            label: previouslyConnectedWallets[0],
            disableModals: true,
          },
        });
        setUserEnabled(true);
      }
      setWalletFromLocalStorage();
    }
  }, [web3Onboard, connect]);

  const readyToTransact = async () => {
    if (!wallet) {
      const walletSelected = await connect();
      if (!walletSelected) return false;
    }

    // prompt user to switch to the correct chain
    //await setChain({ chainId: connectedChain.id });

    return true;
  };

  return {
    wallet,
    provider,
    connecting,
    disconnect,
    connect,
    web3Onboard,
    connectedWallets,
    readyToTransact,
    userEnabled,
    setUserEnabled,
    chains,
    connectedChain,
    setChain,
    settingChain,
    blockNumber,
    web3Provider,
    address: wallet?.accounts[0].address,
  };
}

let Onboard = createContainer(useOnboard);
export default Onboard;
