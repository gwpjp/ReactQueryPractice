import { useState } from 'react';
import { createContainer } from 'unstated-next';

function useEnableUser() {
  const [userEnabled, setUserEnabled] = useState(false);

  return { userEnabled, setUserEnabled };
}

let EnableUser = createContainer(useEnableUser);

export default EnableUser;
