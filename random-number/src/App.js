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
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const injected = injectedModule();

const onboard = Onboard({
  wallets: [injected],
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
    icon: '<SVG_ICON_STRING>',
    description: 'My app using Onboard',
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
  return onboard.connectWallet();
};

const ReactQueryUser = () => {
  const user = useQuery(['user'], fetchUser);

  if (user.isError) return <p>Error: {user.error.message}</p>;

  return (
    <div>
      <p>
        User:{' '}
        {user.isLoading || user.isFetching
          ? '...'
          : user.data[0].provider.selectedAddress}
      </p>
      <button onClick={() => user.refetch()}>Get User</button>
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
  const queryClient = useQueryClient();

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          return greetMutation.mutate(greetVal, {
            onSuccess: (d) => {
              queryClient.invalidateQueries('user');
              setTransactionValue(d);
            },
          });
        }}
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
