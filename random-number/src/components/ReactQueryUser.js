import React from 'react';
import useUser, { Onboard } from '../hooks/useUser';
import EnableUser from '../hooks/useEnableUser';

export default function ReactQueryUser() {
  let { userEnabled, setUserEnabled } = EnableUser.useContainer();
  let { wallet } = Onboard.useContainer();
  const user = useUser(userEnabled);

  if (user.isError) return <p>Error: {user.error.message}</p>;

  let icon = '';
  if (user.isFetched) {
    icon = user.data[0].icon;
  }

  return (
    <div>
      {userEnabled && user.isFetched ? (
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
          <p>User2:{wallet.accounts[0].address}</p>
        </div>
      ) : (
        <button
          onClick={() => {
            setUserEnabled(true);
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
