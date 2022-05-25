import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { ethers } from 'ethers';
import useUser from '../hooks/useUser';
import EnableUser from '../hooks/useEnableUser';

import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json';

const greeterAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const fetchGreeting = (p) => {
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

// eslint-disable-next-line react/prop-types
export function ReactQueryFetchGreeting() {
  const { userEnabled } = EnableUser.useContainer();

  const user = useUser(userEnabled);
  let provider;
  if (user.isFetched) {
    provider = user.data[0].provider;
  }
  const greet = useQuery(['greet'], () => fetchGreeting(provider), {
    enabled: user.isFetched,
  });

  return (
    <div>
      {greet.isIdle ? (
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
          <button onClick={() => greet.refetch()}>Fetch Greeting</button>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react/prop-types
export function ReactQuerySetGreeting() {
  const { userEnabled } = EnableUser.useContainer();

  const [greetVal, setGreetingValue] = useState();
  const [transaction, setTransactionValue] = useState(null);

  const user = useUser(userEnabled);
  let provider;
  if (user.isFetched) {
    provider = user.data[0].provider;
  }

  const greetMutation = useMutation((g) => setGreeting(g, provider));

  return (
    <div>
      {!user.isFetched ? (
        <p>Connect wallet to set...</p>
      ) : (
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
      )}
    </div>
  );
}
