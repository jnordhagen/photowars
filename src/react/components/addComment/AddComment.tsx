import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  Avatar,
  Box,
  Button,
  Card,
  Stack,
  TextField,
} from '@mui/material';
import { getImageUrl } from '../../../definitions/getImageUrl';
import { UserContext } from '../../contexts/UserContext';

interface IProps {
  postComment: (newComment: string) => Promise<void>;
}

const AddComment = ({ postComment }: IProps) => {
  const { loggedInUser } = useContext(UserContext);
  const [commentText, setCommentText] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  /* useEffect for retrieving the image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(loggedInUser.filename);
      if (shouldUpdate) {
        setImageUrl(newImageUrl);
      }
    };
    try {
      setImage();
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
  }, [loggedInUser.filename]);

  return (
    <Card>
      <Box sx={{ p: '15px' }}>
        <Stack direction='row' spacing={2} alignItems='flex-start'>
          <Avatar
            src={imageUrl}
          >
            {loggedInUser.displayName[0]}
          </Avatar>
          <TextField
            fullWidth
            placeholder='Add a comment'
            value={commentText}
            disabled={!loggedInUser._id}
            onChange={(e) => {
              setCommentText(e.target.value);
            }}
          />
          <Button
            size='large'
            variant='contained'
            disabled={!loggedInUser._id}
            onClick={(e) => {
              if (commentText.trim()) {
                postComment(commentText.trim());
              } else {
                e.preventDefault();
              }
              setCommentText('');
            }}
          >
            Send
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default AddComment;
