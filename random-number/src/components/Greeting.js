import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { ethers } from 'ethers';
import Onboard from '../containers/Onboard';

import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const fetchGreeting = async (web3Provider) => {
  const contract = new ethers.Contract(
    greeterAddress,
    Greeter.abi,
    web3Provider
  );
  return contract.greet();
};

const setGreeting = async (greeting, web3Provider) => {
  const signer = web3Provider.getSigner();
  const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
  const transaction = await contract.setGreeting(greeting);
  return await transaction.wait();
};

export function ReactQueryFetchGreeting() {
  const { web3Provider, readyToTransact, userEnabled, connectedChain } =
    Onboard.useContainer();

  const greet = useQuery(['greet'], () => fetchGreeting(web3Provider), {
    enabled: !!web3Provider && userEnabled && connectedChain.id == '0x7a69',
  });

  return (
    <div>
      {!web3Provider || !userEnabled ? (
        <p>Connect wallet to fetch...</p>
      ) : (
        <div>
          <p>
            {!greet.isError
              ? greet.isLoading || greet.isFetching
                ? 'Loading...'
                : `Greeting: ${greet.data}`
              : `Error: ${greet.error.message}`}
          </p>
          <button
            onClick={async () => {
              const ready = await readyToTransact();
              if (!ready) return;
              greet.refetch();
            }}
          >
            Fetch Greeting
          </button>
        </div>
      )}
    </div>
  );
}

export function ReactQuerySetGreeting() {
  const { web3Provider, readyToTransact, userEnabled } = Onboard.useContainer();

  const [greetVal, setGreetingValue] = useState();
  const [transaction, setTransactionValue] = useState(null);

  const greetMutation = useMutation((g) => setGreeting(g, web3Provider), {
    enabled: !!web3Provider && userEnabled,
  });

  return (
    <div>
      {!web3Provider || !userEnabled ? (
        <p>Connect wallet to set...</p>
      ) : (
        <div>
          <button
            onClick={async () => {
              const ready = await readyToTransact();
              if (!ready) return;
              greetMutation.mutate(greetVal, {
                onSuccess: (d) => {
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
      )}
    </div>
  );
}
