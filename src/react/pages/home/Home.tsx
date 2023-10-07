import * as React from 'react';
// import { RightBar } from '../../components/rightBar/RightBar';
// import { SideBar } from '../../components/sideBar/SideBar';
import { TopBar } from '../../components/topBar/TopBar';
import { Outlet } from 'react-router-dom';
import { Stack, Toolbar } from '@mui/material';

const Home = () => {
  return (
  <Stack spacing={2} m={4} margin={0} padding={"24px"}>
    <TopBar />
    <Stack direction="row" justifyContent="space-around" spacing={4}>
      {/* <SideBar /> */}
      <Stack>
        <Toolbar />
        <Outlet />
      </Stack>
      {/* <RightBar /> */}
    </Stack>
  </Stack>
  );
};

export { Home };
