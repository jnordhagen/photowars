import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getImageUrl } from '../../../definitions/getImageUrl';
import {
  Avatar,
  Divider,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
// import { PopulatedCommentFrontend } from '../../../definitions/classes/comment';
import { UserContext } from '../../contexts/UserContext';
import { pink } from '@mui/material/colors';
import { CommentCardInfo } from '../../../definitions/classes/comment';
import { UserFrontend } from '../../../definitions/classes/user';

interface IProps {
  commentId: string;
}

const CommentModalCommentCard = ({ commentId }: IProps) => {
  const { loggedInUser, setOpenLoginModal } = useContext(UserContext);
  const [author, setAuthor] = useState<UserFrontend>(new UserFrontend());
  const [caption, setCaption] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [voted, setVoted] = useState<boolean>(false);

  const _comment = useRef<CommentCardInfo | null>(null);

  useEffect(() => {
    const getComment = async () => {
      const path = `/comment/${commentId}`;
      try {
      const res = await axios.get<CommentCardInfo>(path);
      const comment = res.data;
      setAuthor(comment.author);
      setCaption(comment.caption);
      setVoted(!!comment.votedOn);
      setFilename(comment.author.filename);
      _comment.current = comment;
      } catch (err) {
        console.error(err);
      }
    }
    getComment();
  }, [commentId]);

  /* useEffect for retrieving the image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(filename);
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
  }, [filename]);

  const vote = async () => {
    const path = `/comment/${commentId}/${voted ? 'unvote' : 'vote'}`;
    try {
      await axios.put(path);
      setVoted(!voted);
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <React.Fragment>
      <ListItem
        className='comment-modal-comment'
        alignItems='flex-start'
      >
        <ListItemAvatar>
          <Link href={`/users/${author._id}`}>
            <Avatar src={imageUrl}>{author.displayName[0]}</Avatar>
          </Link>
        </ListItemAvatar>
        <ListItemText
          sx={{
            display: 'inline'
          }}
          color='text.primary'
          secondary={
            <React.Fragment>
                <Link href={`/users/${author._id}`}>
                  {author.displayName}
                </Link>
                {'\n'}
              {caption}
            </React.Fragment>
          }
        />
        <IconButton
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            if (loggedInUser._id) {
              vote();
            } else {
              setOpenLoginModal && setOpenLoginModal(true);
            }
          }}
        >
          <FavoriteIcon sx={{ color: voted ? pink[500] : null }} />
        </IconButton>
      </ListItem>
      <Divider variant='inset' component='li' />
    </React.Fragment>
  );
};

export { CommentModalCommentCard };
