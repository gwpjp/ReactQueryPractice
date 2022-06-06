import { useQuery } from 'react-query';
import { ethers } from 'ethers';

export const fetchBalance = async (params) => {
  const { address, web3Provider, readyToTransact } = params;
  if (!readyToTransact()) {
    throw new Error('Not ready to transact');
  }
  if (!web3Provider) {
    throw new Error('No provider');
  }
  if (!address) {
    throw new Error('No address');
  }
  return web3Provider.getBalance(address);
};

export const useBalance = (
  settingChain,
  chain,
  address,
  web3Provider,
  readyToTransact
) => {
  const query = useQuery(
    ['balance', chain?.id, address],
    () => {
      return fetchBalance({
        address,
        web3Provider,
        readyToTransact,
      });
    },
    {
      enabled: !!address && !settingChain && !!web3Provider,
    }
  );
  let balance;
  if (query.isError) {
    balance = '!!!';
    console.log(query.error);
  } else if (query.isLoading || !query.isFetched) {
    balance = '...';
  } else {
    const hexbalance = query.data._hex;
    balance = ethers.utils.formatEther(hexbalance.toString()).slice(0, 10);
  }
  return {
    balance: balance,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
  };
};
