import * as React from 'react';
import { useState } from 'react';
import {
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import { createSearchParams, useNavigate } from 'react-router-dom';

const TabBar = () => {
  const [tab, setTab] = useState<string>('explore');

  const navigate = useNavigate();

  const handleChange = (_event: React.SyntheticEvent, newTab: string) => {
    setTab(newTab);
    switch (newTab) {
      case 'explore': {
        navigate('/');
        return;
      }

      case 'openBattles': {
        navigate({
          pathname: '/',
          search: createSearchParams({
            open: 'true'
          }).toString()
        });
        return;
      }

      default: {
        navigate('/');
        return;
      }
    }
  };

  return (
    <Stack alignItems="center">
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="Explore" value={'explore'} />
        <Tab label="Open Battles" value={'openBattles'} />
      </Tabs>
    </Stack>
  );
};

export { TabBar };
