import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { getImageUrl } from '../../../definitions/getImageUrl';
import { DeleteDialog } from '../../components/deleteDialog/DeleteDialog';
import { Link, useOutletContext } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

interface IUser {
  _id: string;
  description: string;
  displayName: string;
  filename: string;
  firstName: string;
  lastName: string;
}

const UserHeader = () => {
  const { user } = useOutletContext() as { user: IUser };
  const { loggedInUser } = useContext(UserContext);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenDeleteDialog(true);
  };

  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(user.filename);
      if (shouldUpdate) {
        setImageUrl(newImageUrl);
      }
    };
    setImage();
    return () => {
      shouldUpdate = false;
    };
  }, [user.filename]);

  return (
    <Box display='flex' sx={{ padding: '1em' }}>
      <Grid
        sx={{
          minWidth: '15%',
          minHeight: '15%',
          position: 'relative'
        }}
      >
        <Avatar
          src={imageUrl}
          sx={{
            position: 'absolute',
            minWidth: '100%',
            height: 'auto',
            aspectRatio: '1',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </Grid>
      <Box paddingLeft={2}>
        <Typography
          style={{ fontWeight: 'bold', fontSize: '2.5em', marginBottom: '-5%' }}
        >{`${user.firstName} ${user.lastName}`}</Typography>
        <Typography
          style={{
            fontWeight: 'lighter',
            fontSize: '1.8em',
            margin: '0',
            color: 'grey',
            marginBottom: '-1%',
          }}
        >{`@${user.displayName}`}</Typography>
        <Typography style={{ fontSize: '1.2em', marginLeft: '5px' }}>
          Fun Fact: {user.description}
        </Typography>
      </Box>
      {
        user._id === loggedInUser._id &&
        <Stack
          direction="row"
          sx={{marginBottom: 'auto', marginLeft: 'auto'}}
        >
          <Button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={handleDelete}
            sx={{ color: 'red', padding: '0px' }}
          >
            Delete
          </Button>
          <DeleteDialog
            openDeleteDialog={openDeleteDialog}
            setOpenDeleteDialog={setOpenDeleteDialog}
            objectId ={''}
            objectModel={'user'}
          />
          <Button
            component={Link}
            to="edit"
            sx={{ padding: '0px' }}
          >
            Edit
          </Button>
        </Stack>
      }
    </Box>
  );
};

export { UserHeader };
