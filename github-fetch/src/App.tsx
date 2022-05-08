import React from 'react';
import { useQuery } from 'react-query';
import './App.css';

const fetchUser = (username: string) => fetch(`https://api.github.com/users/${username}`).then((res) => res.json());

type GithubUserProps = {
  username: string;
};

function GithubUser({ username }: GithubUserProps) {
  const userQuery = useQuery([username], () => fetchUser(username));

  const { data } = userQuery;

  if (userQuery.isLoading) {
    return <p>Loading...</p>;
  }

  if (userQuery.isError) {
    let err = '';
    if (userQuery.error instanceof Error) {
      err = userQuery.error.message;
    }
    return (
      <p>
        Error:
        {err}
      </p>
    );
  }

  return <p>{JSON.stringify(data, null, 2)}</p>;
}

function App() {
  return (
    <div>
      <GithubUser username="gwpjp" />
    </div>
  );
}

export default App;
