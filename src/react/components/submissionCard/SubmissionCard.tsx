import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import {
  ButtonBase,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LockIcon from '@mui/icons-material/Lock';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import { getImageUrl } from '../../../definitions/getImageUrl';
import { pink } from '@mui/material/colors';
import { UserContext } from '../../contexts/UserContext';
import { PostCardHeader } from '../postCardHeader/PostCardHeader';
import { updateDeadline } from '../../../definitions/timerLogic';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import './submissionCard.css';
import { SubmissionCardInfo } from '../../../definitions/classes/submission';

interface IProps {
  submissionId: string
}

const SubmissionCard = ({ submissionId }: IProps) => {
  const { loggedInUser, setOpenLoginModal } = useContext(UserContext);
  const [caption, setCaption] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [numComments, setNumComments] = useState<number>(0);
  const [commented, setCommented] = useState<boolean | null>(false);
  const [expired, setExpired] = useState<boolean>(true);
  const [numVotes, setNumVotes] = useState<number>(0);
  const [voted, setVoted] = useState<boolean | null>(false);

  const _submission = useRef<SubmissionCardInfo | null>(null);
  const _timerEvent = useRef<NodeJS.Timer | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  /* useEffect for updating caption, display name, and image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setSubmissionInformation = async () => {
      const path = `/submission/${submissionId}`;
      const res = await axios.get<SubmissionCardInfo>(path);
      const submission = res.data;

      if (shouldUpdate) {
        setCaption(submission.caption);
        setFilename(submission.filename);
        setNumComments(submission.numComments);
        setCommented(submission.commentedOn);
        setNumVotes(submission.numVotes);
        setVoted(submission.votedOn);
        _submission.current = submission;
        updateDeadline(
          new Date(submission.post.deadline),
          _timerEvent,
          null,
          setExpired,
          !!expired
        );
      }
    };
    try {
      setSubmissionInformation();
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
  }, [expired, location, submissionId, loggedInUser._id]);

  /* useEffect for retrieving the image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(filename);
      if (shouldUpdate) {
        setImageUrl(newImageUrl);
      }
    };
    setImage();
    return () => {
      shouldUpdate = false;
    };
  }, [filename]);

  const openCommentModal = () => {
    navigate({
      pathname: `comments/${submissionId}`,
      search: createSearchParams({
        postType: 'submission'
      }).toString()
    });
  }

  const vote = async () => {
    const path = `/submission/${submissionId}/${voted ? 'unvote' : 'vote'}`;
    try {
      await axios.put(path);
      setVoted(!voted);
      setNumVotes(numVotes + (voted ? -1 : 1));
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Card variant='outlined' sx={{ height: 475, width: '100%' }}>
      <CardActionArea component='div'>
        <PostCardHeader post={_submission.current} />
        <CardContent sx={{ mt: -3 }}>
          <Typography noWrap variant='h6'>
            {caption}
          </Typography>
        </CardContent>
        <ButtonBase
          onClick={() => {
            openCommentModal();
          }}
          sx={{ width: '100%' }}
        >
          <CardMedia
            component='img'
            image={imageUrl}
            loading='lazy'
            sx={{ height: 300, objectFit: 'contain' }}
          />
        </ButtonBase>
        <CardActions disableSpacing>
          <IconButton
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (loggedInUser._id !== '' && !expired) {
                vote();
              } else {
                setOpenLoginModal && setOpenLoginModal(true);
              }
            }}
            disableRipple={!!expired}
          >
            {
              expired
              ? <LockIcon sx={{ pr: 1, color: voted ? pink[500] : null }} />
              : <FavoriteIcon sx={{ pr: 1, color: voted ? pink[500] : null }} />
            }
            <Typography>{numVotes}</Typography>
          </IconButton>
          <IconButton
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              openCommentModal();
            }}
          >
            <ModeCommentOutlinedIcon
              sx={{ pr: 1, color: commented ? pink[500] : null }}
            />
            <Typography>{numComments}</Typography>
          </IconButton>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

export { SubmissionCard };
