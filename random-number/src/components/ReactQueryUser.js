import React, { useState } from 'react';
import useUser from '../hooks/useUser';

// eslint-disable-next-line react/prop-types
export default function ReactQueryUser({ enableUser, setEnableUser }) {
  const user = useUser(enableUser);

  if (user.isError) return <p>Error: {user.error.message}</p>;

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
}
