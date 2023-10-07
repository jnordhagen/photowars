import * as React from 'react';
import { useContext, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Box,
  Button,
  Icon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
// import { LoggedInUser, UserContext } from '../../pages/Layout';
import { LoggedInUser, UserContext } from '../../contexts/UserContext';
import { LoginModal } from '../loginModal/LoginModal';
import { Link, useNavigate } from 'react-router-dom';
// import SwordIcon from '../../assets/swords-icon.svg';

// eslint-disable-next-line
const SwordIcon = require('../../assets/swords-icon.svg');

const TopBar = () => {
  const {
    loggedInUser,
    setLoggedInUser
  } = useContext(UserContext);
  const navigate = useNavigate();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  const handleLogOut = async () => {
    const path = '/account/logout';
    try {
      await axios.post(path);
      setLoggedInUser && setLoggedInUser(new LoggedInUser())
      localStorage.removeItem('loggedInUser');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };

  return (
    <AppBar
      elevation={0}
      position='fixed'
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Typography
            onClick={() => navigate('/')}
            sx={{
              '&:hover': {
                cursor: 'pointer'
              },
              fontWeight: 800
            }}
            variant="h5"
          >
            <Icon>
              <Box
                component="img"
                src={SwordIcon}
              />
            </Icon>
            PHOTOWARS
          </Typography>
          <Box>
            {loggedInUser._id === null ? <div /> : loggedInUser._id !== '' ?
              <Stack direction="row" spacing={2}>
                  <Button
                    component={Link}
                    to="/create"
                    variant="contained"
                  >
                    Create War
                  </Button>
                  <Button
                    onClick={handleOpenUserMenu}
                    startIcon={<AccountCircleOutlinedIcon />}
                  >
                    {loggedInUser.displayName}
                  </Button>
                  <Menu
                    sx={{ mt: '45px' }}
                    anchorEl={anchorElement}
                    anchorOrigin={{
                      horizontal: 'right',
                      vertical: 'top'
                    }}
                    keepMounted
                    transformOrigin={{
                      horizontal: 'right',
                      vertical: 'top'
                    }}
                    open={Boolean(anchorElement)}
                    onClose={() => setAnchorElement(null)}
                  >
                    <MenuItem
                      key={'profile'} 
                      onClick={() => {
                        navigate(`/users/${loggedInUser._id}`)
                        setAnchorElement(null);
                      }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      key={'logout'} 
                      onClick={() => {
                        handleLogOut();
                        setAnchorElement(null);
                      }}
                    >
                      Log Out
                    </MenuItem>
                  </Menu>
              </Stack>
              :
              <LoginModal />
            }
          </Box>

        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export { TopBar };
