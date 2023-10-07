import * as React from 'react';
import { useEffect, useContext, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import {
  Avatar,
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Typography,
} from '@mui/material';
import { getImageUrl } from '../../../definitions/getImageUrl';
import AddComment from '../../components/addComment/AddComment';
import {
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AspectRatio } from '../../components/aspectRatio/AspectRatio';
import { CommentModalCommentCard } from '../../components/commentModalCommentCard/CommentModalCommentCard';
import { PopulatedBattleFrontend } from '../../../definitions/classes/battle';
import { PopulatedSubmissionFrontend } from '../../../definitions/classes/submission';
import { PopulatedCommentFrontend } from '../../../definitions/classes/comment';
import { Post } from '../../../definitions/classes/post';
import { UserContext } from '../../contexts/UserContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '12px',
  p: 2,
};

interface ILoaderData {
  postComments: PopulatedCommentFrontend[];
  post: PopulatedSubmissionFrontend | PopulatedBattleFrontend;
  postType: string;
}

const commentModalLoader: LoaderFunction = async ({ params, request }) => {
  const postId = params['postId'];
  const postType = new URL(request.url).searchParams.get('postType');
  if (!postType) return redirect('..');
  const commentsPath = `/${postType}/${postId}/comments`;
  const postPath = `/${postType}/${postId}`;
  try {
    const commentsRes = await axios.get<PopulatedCommentFrontend[]>(
      commentsPath
    );
    const postRes = await axios.get<Post>(postPath);
    return {
      postComments: commentsRes.data,
      post: postRes.data,
      postType: postType,
    } as ILoaderData;
  } catch (err) {
    if (isAxiosError(err)) {
      if (err.response?.status === 404) {
        return redirect('/404');
      }
      console.error(err.response?.data);
    } else {
      console.error(err);
    }
    return null;
  }
};

const CommentModal = () => {
  const sortBy = useContext(UserContext).sortBy;
  const { postId } = useParams<'battleId' | 'postId'>();
  const { postComments, post, postType } = useLoaderData() as ILoaderData;
  const [comments, setComments] =
    useState<PopulatedCommentFrontend[]>(postComments);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [authorImageUrl, setAuthorImageUrl] = useState<string>('');

  const navigate = useNavigate();

  /* useEffect for retrieving the image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(post.filename);
      if (shouldUpdate) {
        setImageUrl(newImageUrl);
      }
    };
    try {
      setImage();
    } catch (err) {
      console.error(err);
    }
    return () => {
      shouldUpdate = false;
    };
  }, [post.filename]);

  /* useEffect for retrieving the image.  */
  useEffect(() => {
    let shouldUpdate = true;
    const setImage = async () => {
      const newImageUrl = await getImageUrl(post.author?.filename);
      if (shouldUpdate) {
        setAuthorImageUrl(newImageUrl);
      }
    };
    try {
      setImage();
    } catch (err) {
      console.error(err);
    }
    return () => {
      shouldUpdate = false;
    };
  }, [post.author.filename]);

  const handleClose = (sortBy: string) => {
    navigate(`../?sort=${sortBy.toLocaleLowerCase()}`);
  };

  /* Handler for posting a new comment. */
  const handlePostComment = async (newComment: string) => {
    const path = `/${postType}/${postId}/comment`;
    const commentsPath = `/${postType}/${postId}/comments`;
    try {
      await axios.post(path, { comment: newComment });
      const res = await axios.get<PopulatedCommentFrontend[]>(commentsPath);
      setComments(res.data);
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response?.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <Modal
      open={true}
      onClose={() => handleClose(sortBy)}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={modalStyle}>
        <Grid direction='row' container spacing={1} sx={{ height: '100%' }}>
          <Grid item xs={6}>
            <AspectRatio src={imageUrl} />
          </Grid>
          <Grid item xs={6}>
            <List>
              <ListItem alignItems='flex-start'>
                <ListItemAvatar>
                  <Avatar src={authorImageUrl}>
                    {post.author?.displayName[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component='span'
                        variant='h6'
                        color='text.primary'
                      >
                        {post.caption}
                      </Typography>
                    </React.Fragment>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component='span'
                        variant='body2'
                        color='text.primary'
                      >
                        Created by {post.author?.displayName}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              <Divider variant='inset' component='li' />
              {comments.map((comment: PopulatedCommentFrontend) => {
                return (
                  <div key={comment._id}>
                    <CommentModalCommentCard commentId={comment._id} />
                  </div>
                );
              })}
            </List>
            <AddComment postComment={handlePostComment} />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export { CommentModal, commentModalLoader };
