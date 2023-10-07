import * as React from 'react';
import { isAxiosError } from 'axios';
import { useContext, useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  CardHeader,
  IconButton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { getImageUrl } from '../../../definitions/getImageUrl';
import { DeleteDialog } from '../deleteDialog/DeleteDialog';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { PopulatedSubmissionFrontend } from '../../../definitions/classes/submission';
import { PopulatedBattleFrontend } from '../../../definitions/classes/battle';

interface IProps {
  post: PopulatedBattleFrontend | PopulatedSubmissionFrontend | null;
}

const PostCardHeader = ({
  post
}: IProps) => {
  const { loggedInUser } = useContext(UserContext);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const navigate = useNavigate();

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!post?.filename) return;
    const url = `/image/${post?.filename}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = post?.filename;
    link.click();
  };

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenDeleteDialog(true);
  }; 

  /* useEffect for retrieving the image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(post?.author.filename || '');
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
  }, [post?.author.filename]);


  return (
    <CardHeader
      avatar={
        <Avatar
            src={imageUrl}
            sx={{ width: 24, height: 24 }}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              navigate(`/users/${post?.author._id}`);
            }}
        />
      }
      title={
        <Link
          to=''
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            navigate(`/users/${post?.author._id}`);
          }}
          style={{ 
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {post?.author.displayName}
        </Link>
      }
      action={
        <React.Fragment>
          {
            loggedInUser._id === post?.author._id
            && <Button
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => handleDelete(event)}
              size="small"
              sx={{ color: 'red' }}
            >
              Delete
            </Button>
          }
          <DeleteDialog
            openDeleteDialog={openDeleteDialog}
            setOpenDeleteDialog={setOpenDeleteDialog}
            objectId={post?._id}
            objectModel={post && 'post' in post ? 'submission' : 'battle'}
          />
          <IconButton
            onMouseDown={(event) => event.stopPropagation()}
            onClick={handleDownload}
          >
            <DownloadIcon />
          </IconButton>
        </React.Fragment>
      }
    />
  );
}

export { PostCardHeader };
