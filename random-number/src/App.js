import * as React from 'react';
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
  const [key, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const [num, setNum] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
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
export default function App() {
  return (
    <div>
      <h2>useEffect</h2>
      <UseEffectRandom />
      <h2>React Query</h2>
      <ReactQueryRandom />
    </div>
  );
}
