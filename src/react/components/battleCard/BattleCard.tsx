import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LockIcon from '@mui/icons-material/Lock';
import ImageIcon from '@mui/icons-material/Image';
import { blue, pink, grey } from '@mui/material/colors';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { getImageUrl } from '../../../definitions/getImageUrl';
import { PostCardHeader } from '../postCardHeader/PostCardHeader';
import { updateDeadline } from '../../../definitions/timerLogic';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import './battleCard.css';
import { BattleCardInfo } from '../../../definitions/classes/battle';

interface IProps {
  battleId: string;
  isPhotoOfTheDay?: boolean;
}

const BattleCard = ({ battleId, isPhotoOfTheDay }: IProps) => {
  const { loggedInUser, setOpenLoginModal } = useContext(UserContext);
  const [caption, setCaption] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [numSubmissions, setNumSubmissions] = useState<number>(0);
  const [numComments, setNumComments] = useState<number>(0);
  const [commented, setCommented] = useState<boolean>(false);
  const [numVotes, setNumVotes] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [voted, setVoted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  const [expired, setExpired] = useState<boolean>(true);

  const _battle = useRef<BattleCardInfo| null>(null);
  const _timerEvent = useRef<NodeJS.Timer | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  /* useEffect for updating caption, display name, and image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setBattleInformation = async () => {
      const path = `/battle/${battleId}`;
      const res = await axios.get<BattleCardInfo>(path);
      const battle = res.data;

      if (shouldUpdate) {
        setCaption(battle.caption);
        setFilename(battle.filename);
        setNumComments(battle.numComments);
        setCommented(!!battle.commentedOn);
        setNumSubmissions(battle.numSubmissions);
        setSubmitted(!!battle.submittedTo);
        setNumVotes(battle.numVotes);
        setVoted(!!battle.votedOn);
        _battle.current = battle;
        updateDeadline(
          new Date(battle.deadline),
          _timerEvent,
          setTimeRemaining,
          setExpired,
          !!expired
        );
      }
    };
    try {
      setBattleInformation();
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
  }, [battleId, expired, location, loggedInUser._id]);

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

  const openCommentModal = () => {
    navigate({
      pathname: `/battles/${battleId}/comments/${battleId}`,
      search: createSearchParams({
        postType: 'battle'
      }).toString()
    });
  }

  const vote = async () => {
    const path = `/battle/${battleId}/${voted ? 'unvote' : 'vote'}`;
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
    <Card variant="outlined">
      <CardActionArea
        component='div'
        onClick={() => {
          if (
            location.pathname === '/' ||
            location.pathname.startsWith('/users')
          ) {
            navigate(`/battles/${battleId}`);
          }
        }}
        onMouseDown={(event) => {
          if (location.pathname !== '/') {
            event.stopPropagation();
          }
        }}
      >
        {location.pathname.startsWith('/battles') && (
          <PostCardHeader post={_battle.current} />
        )}
        <ButtonBase
          onClick={() => {
            openCommentModal();
          }}
          sx={{ width: '100%', position: 'relative' }}
        >
          {isPhotoOfTheDay &&
            (
              <Chip
                label="Photo of the Day"
                color="warning"
                sx={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                }}
              />
            )
          }
          <CardMedia
            component='img'
            image={imageUrl}
            loading='lazy'
            sx={{ height: '80vh', objectFit: 'contain' }}
          />
        </ButtonBase>
        <CardContent sx={{ mb: -2 }}>
          <Typography variant="h6">
            {caption}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton 
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
            }}
            disableRipple
          >
            <ImageIcon
              sx={{
                pr: 1,
                color: submitted ? blue[500] : null,
              }}
            />
            <Typography sx={{ color: grey[400] }}>{numSubmissions}</Typography>
          </IconButton>
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
            <Typography sx={{ color: grey[400] }}>{numVotes}</Typography>
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
            <Typography sx={{ color: grey[400] }}>{numComments}</Typography>
          </IconButton>
          <Box display='flex' marginLeft='auto' alignItems='center'>
            {timeRemaining === 'Finished' ? (
              <Typography variant="caption" sx={{ color: grey[400], pr: 1 }}>Finished</Typography>
            ) : (
              <>
                <Typography sx={{ pr: 2 }}>{timeRemaining}</Typography>
                <Tooltip
                  title={
                    submitted
                      ? 'Only one submission is allowed.'
                      : !loggedInUser._id && 'Log in to submit to this battle.'
                  }
                >
                  <span
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <Button
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        navigate(`/battles/${battleId}/submit`);
                      }}
                      variant='outlined'
                      size='small'
                      color='primary'
                      disabled={
                        submitted ||
                        !loggedInUser._id ||
                        location.pathname.endsWith('submit')
                      }
                    >
                      Enter
                    </Button>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

export { BattleCard };
