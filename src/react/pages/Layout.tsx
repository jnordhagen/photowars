import * as React from 'react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LoggedInUser, UserContext } from '../contexts/UserContext';

const Layout = () => {
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser>(new LoggedInUser());
  const [sortBy, setSortBy] = useState<string>('New');

  const contextValue = { openLoginModal, setOpenLoginModal, loggedInUser, setLoggedInUser, sortBy, setSortBy };

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoggedInUser(user);
    }
  }, []);

  return (
    <UserContext.Provider value={contextValue}>
    <Outlet />
    </UserContext.Provider>
  );
};

export { Layout };
