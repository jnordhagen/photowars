import * as React from 'react';
import { useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import {
  Box,
  Drawer,
  Toolbar
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { DailyBattleCard } from '../dailyBattleCard/DailyBattleCard';

const RightBar = () => {
  const [battleId, setBattleId] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    let shouldUpdate = true;
    const getBattleId = async () => {
      const path = '/battle/random';
      const res = await axios.get<{ _id: string }>(path);
      const randomBattleId = res.data?._id;
      if (shouldUpdate) {
        setBattleId(randomBattleId);
      }
    };

    try {
      getBattleId();
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
    return () => {
      shouldUpdate = false;
    };
  }, [battleId]); 

  return (
    <Drawer
      anchor="right"
      variant="permanent"
      sx={{
        width: '20%',
        ['& .MuiDrawer-paper']: {
          boxSizing: 'border-box',
          width: '20%'
        }
      }}
    >
      <Toolbar />
      <Box sx={{ padding: '5px' }}>
        {
          battleId && location.pathname === '/' &&
          <DailyBattleCard
            battleId={battleId}
          />
        }
      </Box>
    </Drawer>
  );
};

export { RightBar };
