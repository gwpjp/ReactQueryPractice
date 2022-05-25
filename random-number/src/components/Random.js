import React, { useState } from 'react';
import { useQuery } from 'react-query';

const fetchNumber = () =>
  fetch(
    'https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new'
  ).then((response) => {
    if (response.status !== 200) {
      throw new Error('Something went wrong. Try again.');
    }

    return response.text();
  });

export default function ReactQueryRandom() {
  const [enableRandom, setEnableRandom] = useState(false);
  const query = useQuery(['random'], fetchNumber, {
    refetchOnWindowFocus: false,
    enabled: enableRandom,
  });

  if (query.isError) return <p>{query.error.message}</p>;

  return (
    <button
      onClick={() => {
        setEnableRandom(true);
        query.refetch();
      }}
    >
      Random number: {query.isLoading || query.isFetching ? '...' : query.data}
    </button>
  );
}
