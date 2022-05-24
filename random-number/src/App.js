import React, { useEffect, useState, useReducer } from 'react';
import {
  useQuery,
  useMutation,
  QueryClient,
  useQueryClient,
} from 'react-query';
import { ethers } from 'ethers';
import Onboard from '@web3-onboard/core';
import {
  init,
  useConnectWallet,
  useSetChain,
  useWallets,
} from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import coinbaseModule from '@web3-onboard/coinbase';
import ledgerModule from '@web3-onboard/ledger';
import walletConnectModule from '@web3-onboard/walletconnect';
import torusModule from '@web3-onboard/torus';
import gnosisModule from '@web3-onboard/gnosis';

import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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

const fetchNumber = () =>
  fetch(
    'https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new'
  ).then((response) => {
    if (response.status !== 200) {
      throw new Error('Something went wrong. Try again.');
    }

    return response.text();
  });

const ReactQueryRandom = () => {
  const query = useQuery(['random'], fetchNumber, {
    refetchOnWindowFocus: false,
  });

  if (query.isError) return <p>{query.error.message}</p>;

  return (
    <button onClick={() => query.refetch()}>
      Random number: {query.isLoading || query.isFetching ? '...' : query.data}
    </button>
  );
};

const UseEffectRandom = () => {
  const [key, forceUpdate] = useReducer((x) => x + 1, 0);
  const [num, setNum] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);

    fetch(
      'https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new'
    )
      .then((response) => {
        if (response.status !== 200) {
          return {
            error: `Something went wrong. Try again.`,
          };
        }

        return response.text();
      })
      .then((random) => {
        setLoading(false);

        if (isNaN(Number(random))) {
          const errorResponse = JSON.parse(random);
          setError(errorResponse.error);
        } else {
          setNum(random);
        }
      });
  }, [key]);

  if (error) return <p>{error}</p>;

  return (
    <button onClick={forceUpdate}>
      Random number: {loading ? '...' : num}
    </button>
  );
};

const fetchUser = () => {
  // return window.ethereum.request({ method: 'eth_requestAccounts' });
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

const ReactQueryUser = () => {
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
};

const fetchGreeting = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);
  return contract.greet();
};

const setGreeting = async (greeting) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
  const transaction = await contract.setGreeting(greeting);
  return await transaction.wait();
};

const ReactQueryFetchGreeting = () => {
  const greet = useQuery(['greet'], fetchGreeting);

  return (
    <div>
      <p>
        {!greet.isError
          ? greet.isLoading || greet.isFetching
            ? 'Loading...'
            : `Greeting: ${greet.data}`
          : `Error: ${greet.error.message}`}
      </p>
      <button onClick={() => greet.refetch()}>Fetch Greeting</button>
    </div>
  );
};

const ReactQuerySetGreeting = () => {
  const [greetVal, setGreetingValue] = useState();
  const [transaction, setTransactionValue] = useState(null);

  const greetMutation = useMutation((g) => setGreeting(g));

  return (
    <div>
      <button
        onClick={() =>
          greetMutation.mutate(greetVal, {
            onSuccess: (d) => {
              setTransactionValue(d);
            },
          })
        }
      >
        Set Greeting
      </button>
      <input
        onChange={(e) => setGreetingValue(e.target.value)}
        placeholder="Set greeting"
      />
      {transaction && (
        <div>
          <h4>Transaction:</h4>
          <p>From:</p>
          <p>{transaction.from}</p>
          <p>To:</p>
          <p>{transaction.to}</p>
          <p>Transaction:</p>
          <p>{transaction.transactionHash}</p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [greeting, setGreetingValue] = useState();
  const greet = useQuery(['greet'], fetchGreeting);

  // call the smart contract, send an update
  /*async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }
  async function setGreeting2() {
    if (!greeting) return;
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      greet.refetch();
    }
  }*/

  return (
    <div style={{ width: '100%', display: 'flex', alignContent: 'stretch' }}>
      <div style={{ padding: 10, margin: 0 }}>
        <h2>Greeting from Blockchain</h2>
        <h4>Fetch:</h4>
        <ReactQueryFetchGreeting />
        <h4>Set:</h4>
        <ReactQuerySetGreeting />
      </div>

      {/*
      <h1>
        <button onClick={setGreeting2}>Set Greeting</button>
        <input
          onChange={(e) => setGreetingValue(e.target.value)}
          placeholder="Set greeting"
      />
      </h1>
       
      <h2>useEffect</h2>
      <UseEffectRandom />
       */}
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
