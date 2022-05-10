import React, { useEffect, useState, useReducer } from 'react';
import { useQuery } from 'react-query';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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
  return window.ethereum.request({ method: 'eth_requestAccounts' });
};

const ReactQueryUser = () => {
  const user = useQuery(['user'], fetchUser, {
    refetchOnWindowFocus: false,
  });

  if (user.isError) return <p>Error: {user.error.message}</p>;

  return (
    <div>
      <p>User: {user.isLoading || user.isFetching ? '...' : user.data}</p>
      <button onClick={() => user.refetch()}>
        User: {user.isLoading || user.isFetching ? '...' : user.data[0]}
      </button>
    </div>
  );
};

export default function App() {
  const [greeting, setGreetingValue] = useState();
  const user = useQuery(['user'], fetchUser, {
    refetchOnWindowFocus: false,
  });

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (!user.isError && typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        greeterAddress,
        Greeter.abi,
        provider
      );
      try {
        const data = await contract.greet();
        console.log('data: ', data);
      } catch (err) {
        console.log('Error: ', err);
      }
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return;
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      fetchGreeting();
    }
  }

  return (
    <div>
      <header className="App-header">
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input
          onChange={(e) => setGreetingValue(e.target.value)}
          placeholder="Set greeting"
        />
      </header>
      <h2>useEffect</h2>
      <UseEffectRandom />
      <h2>React Query</h2>
      <ReactQueryRandom />
      <h2>User</h2>
      <ReactQueryUser />
    </div>
  );
}
