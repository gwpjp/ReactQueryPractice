import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { ethers } from 'ethers';
import Onboard from '../containers/Onboard';

import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const fetchGreeting = async (p, setChain) => {
  await setChain({ chainId: '0x7A69' });
  const provider = new ethers.providers.Web3Provider(p);
  const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);
  return contract.greet();
};

const setGreeting = async (greeting, p) => {
  const provider = new ethers.providers.Web3Provider(p);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);
  const transaction = await contract.setGreeting(greeting);
  return await transaction.wait();
};

export function ReactQueryFetchGreeting() {
  const { provider, readyToTransact, userEnabled, setChain } =
    Onboard.useContainer();

  const greet = useQuery(['greet'], () => fetchGreeting(provider, setChain), {
    enabled: !!provider && userEnabled,
  });

  return (
    <div>
      {!provider || !userEnabled ? (
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
  const { provider, readyToTransact, userEnabled } = Onboard.useContainer();

  const [greetVal, setGreetingValue] = useState();
  const [transaction, setTransactionValue] = useState(null);

  const greetMutation = useMutation((g) => setGreeting(g, provider), {
    enabled: !!provider && userEnabled,
  });

  return (
    <div>
      {!provider || !userEnabled ? (
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
