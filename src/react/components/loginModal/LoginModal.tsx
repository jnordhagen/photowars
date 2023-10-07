import * as React from 'react';
import { useContext, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import {
  Box,
  Button,
  Fade,
  Grid,
  Link,
  Modal,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { LoggedInUser, UserContext } from '../../contexts/UserContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '25%',
  minWidth: 400,
  height: '50%',
  minHeight: 550,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '12px',
  p: 2
};

interface IFormData {
  displayName?: string;
  loginName: string;
  loginPassword: string;
  loginPasswordRepeat: string;
}

const LoginModal = () => {
  const { openLoginModal, setOpenLoginModal, setLoggedInUser } = useContext(UserContext);
  const [responseError, setResponseError] = useState<string>('');
  const [registering, setRegistering] = useState<boolean>(false);

  const { control,
          getValues,
          handleSubmit,
          reset: clearForm
  } = useForm<IFormData>({ mode: 'onChange' });

  const closeModal = () => {
    clearForm();
    setOpenLoginModal && setOpenLoginModal(false);
    setResponseError('');
  }

  const handleFormSubmit = async (data: IFormData) => {
    try {
      const path = registering ? '/account/new' : '/account/login';
      const res = await axios.post<LoggedInUser>(path, data);
      const user = res.data;
      closeModal();
      setLoggedInUser && setLoggedInUser(user);
      localStorage.setItem('loggedInUser', JSON.stringify(user));
    } catch (err) {
      if (isAxiosError(err)) {
        if (typeof err.response?.data === 'string') {
          setResponseError(err.response?.data);
        } else if (err.response?.data.errors !== null) {
          setResponseError(err.response?.data.errors[0].msg);
        }
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <React.Fragment>
    <Modal 
      open={openLoginModal}
      onClose={() => {
        closeModal();
      }}
    >
      <Fade in={openLoginModal} onExited={() => clearForm()}>
      <Box>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack
          sx={modalStyle}
          direction="column"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography sx={{ fontWeight: 800, color: 'white' }} variant="h3">
            PHOTOWARS
          </Typography>

          <Stack direction="column" spacing={2}>
            {
              registering && <Controller
                name="displayName"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Display name required',
                  minLength: {
                    value: registering ? 3 : 0,
                    message: 'Must be at least 3 character long.'
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    error={!!error}
                    helperText={error ? error.message : null}
                    label="Display name"
                    variant="outlined"
                    {...field}
                  />
                )}
              />
            }
            <Controller
              name="loginName"
              control={control}
              defaultValue=""
              rules={{
                required: 'Username required',
                minLength: {
                  value: registering ? 6 : 0,
                  message: 'Must be at least 6 characters long.'
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  error={!!error}
                  helperText={error ? error.message : null}
                  label="Username"
                  variant="outlined"
                  {...field}
                />
              )}
            />
            <Controller
              name="loginPassword"
              control={control}
              defaultValue=""
              rules={{
                required: 'Password required.',
                minLength: {
                  value: registering ? 8 : 0,
                  message: 'Must be at least 8 characters long'
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  error={!!error}
                  helperText={error ? error.message : null}
                  label="Password"
                  type="Password"
                  variant="outlined"
                  {...field}
                />
              )}
            />
            {
              registering && <Controller
                name="loginPasswordRepeat"
                control={control}
                defaultValue=""
                rules={{
                  validate: {
                    passwordsMatch: value => value === getValues('loginPassword') || 'Passwords must match.'
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    error={!!error}
                    helperText={error ? error.message : null}
                    label="Repeat password"
                    type="password"
                    variant="outlined"
                    {...field}
                  />
                )}
              />
            }
            { responseError !== '' && <Typography>{responseError}</Typography> }
            <Button type="submit" variant="contained">
              { registering ? 'Register' : 'Login' }
            </Button>

          </Stack>

          {
            registering ?
              <Typography color='white'>
                {"Already have an account? "}
                <Link
                  style={{ cursor: 'pointer'}}
                  onClick={() => {
                    setRegistering(false);
                    clearForm();
                  }}
                >
                  Login here.
                </Link>
              </Typography>
            :
              <Typography color='white'>
                {"Don't have an account? "}
                <Link
                  style={{ cursor: 'pointer'}}
                  onClick={() => {
                    setRegistering(true);
                    clearForm();
                  }}
                >
                  Register here.
                </Link>
              </Typography>
          }
        </Stack>
      </form>
      </Box>
      </Fade>
    </Modal>
      <Grid container wrap="nowrap" spacing={1}>
        <Grid item>
          <Button
            onClick={() => {
              setOpenLoginModal && setOpenLoginModal(true);
              setRegistering(false);
            }}
            variant="contained"
          >
            Login
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              setOpenLoginModal && setOpenLoginModal(true);
              setRegistering(true);
            }}
            variant="contained"
          >
            Register
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export { LoginModal };
