import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Tooltip,
  Typography,
} from '@mui/material';
import { getImageUrl } from '../../../definitions/getImageUrl';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { BattleCardInfo } from '../../../definitions/classes/battle';

interface IProps {
  battleId: string;
}

const DailyBattleCard = ({ battleId }: IProps) => {
  const { loggedInUser } = useContext(UserContext);

  const [caption, setCaption] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean | null>(false);

  const location = useLocation();
  const navigate = useNavigate();

  /* useEffect for updating caption and image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setBattleInformation = async () => {
      const path = `/battle/${battleId}`;
      const res = await axios.get<BattleCardInfo>(path);
      const battle = res.data;

      if (shouldUpdate) {
        setCaption(battle.caption);
        setFilename(battle.filename);
        setSubmitted(battle.submittedTo)
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
  }, [battleId]);

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

  return (
    <Card variant='outlined'>
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
        <CardHeader
          title={
            <Typography variant="h6">Battle of the Day</Typography>
          }
        />
        <CardContent sx={{ mt: -3 }}>
          <Typography variant="h6">{caption}</Typography>
        </CardContent>
        <CardMedia
          component='img'
          image={imageUrl}
          loading='lazy'
        />
        <CardActions disableSpacing>
          <Tooltip
            title={
              submitted
                ? 'Only one submission is allowed.'
                : !loggedInUser._id && 'Log in to submit to this battle.'
            }
          >
            <Box
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              sx={{ width: '100%' }}
            >
              <Button
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  navigate(`/battles/${battleId}/submit`);
                }}
                variant='contained'
                disabled={
                  submitted ||
                  !loggedInUser._id ||
                  location.pathname.endsWith('submit')
                }
                fullWidth
              >
                Enter
              </Button>
            </Box>
          </Tooltip>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

export { DailyBattleCard };
