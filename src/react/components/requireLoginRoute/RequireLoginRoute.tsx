import * as React from 'react';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

interface IProps {
  children?: React.ReactNode;
}

const RequireLoginRoute = ({ children }: IProps) => {
  const { loggedInUser } = useContext(UserContext);

  if (loggedInUser._id) {
    return (
      <React.Fragment>
        {children}
      </React.Fragment>
    );
  } else {
    return (
      <Navigate to='..' replace/>
    );
  }
}

export { RequireLoginRoute };