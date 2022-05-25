import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { ethers } from 'ethers';

import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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

export function ReactQueryFetchGreeting() {
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
}

export function ReactQuerySetGreeting() {
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
}
