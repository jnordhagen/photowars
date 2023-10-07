import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, Box } from '@mui/material';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

/* Importing Components */
import { BattleView, battleViewLoader } from './react/pages/battleView/BattleView';
import { CommentModal, commentModalLoader } from './react/pages/commentModal/CommentModal';
import { Create } from './react/pages/create/Create';
import { Feed, feedLoader } from './react/pages/feed/Feed';
import { Home } from './react/pages/home/Home';
import { Layout } from './react/pages/Layout';
import {
  SubmissionFeed,
  submissionFeedLoader,
} from './react/pages/submissionFeed/SubmissionFeed';
import { Submit } from './react/pages/submit/Submit';
import { UserHeader } from './react/pages/userHeader/UserHeader';
import { UserHeaderEdit } from './react/pages/userHeaderEdit/UserHeaderEdit';
import { UserView, userViewLoader } from './react/pages/userView/UserView';
import theme from './theme';
import { RequireLoginRoute } from './react/components/requireLoginRoute/RequireLoginRoute';

const PhotoWars = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />}>
        <Route path='/' element={<Home />}>
          <Route
            path='battles/:battleId'
            element={<BattleView />}
            loader={battleViewLoader}
            errorElement={<div>Error viewing battle</div>}
          >
            <Route
              path=""
              element={<SubmissionFeed />}
              loader={submissionFeedLoader}
              errorElement={<div>Error loading submissions</div>}
            >
              <Route
                path="comments/:postId"
                element={<CommentModal />}
                loader={commentModalLoader}
                errorElement={<div>Error loading comments</div>}
              />
            </Route>
            <Route path='submit' element={<RequireLoginRoute><Submit /></RequireLoginRoute>} />
          </Route>
          <Route path='create' element={<Create />} />
          <Route
            path='users/:userId'
            element={<UserView />}
            loader={userViewLoader}
          >
            <Route
              path="edit"
              element={<UserHeaderEdit />}
              errorElement={<div>Error editing user information.</div>}
            />
            <Route
              index
              element={<UserHeader />}
              errorElement={<div>Error loading user information.</div>}
            />
          </Route>
          <Route
            index
            element={<Feed />}
            loader={feedLoader}
            errorElement={<div>Error fetching battles</div>}
          />
        </Route>
        <Route path="/404" element={<div>404 Not Found</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>
    )
  );
  return (
    <React.StrictMode>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default
          }}
        >
          <RouterProvider router={router} />
        </Box>
      </ThemeProvider>
    </React.StrictMode>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<PhotoWars />);
