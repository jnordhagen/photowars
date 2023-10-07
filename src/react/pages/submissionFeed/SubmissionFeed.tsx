import * as React from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { LoaderFunction, Outlet, useLoaderData } from 'react-router-dom';
import { SubmissionCard } from '../../components/submissionCard/SubmissionCard';
import { PopulatedSubmissionFrontend } from '../../../definitions/classes/submission';

const submissionFeedLoader: LoaderFunction = async ({ params, request }) => {
  const battleId = params['battleId'];
  const path = `/battle/${battleId}/submissions`;
  const url = new URL(request.url);
  const res = await axios.get<PopulatedSubmissionFrontend[]>(path, {
    params: { sort: url.searchParams.get('sort') },
  });
  return res.data;
};

const feedStyle = {
  paddingTop: 2,
  paddingBottom: 2,
  paddingLeft: 0,
  paddingRight: 0,
  bgcolor: 'background.default',
  display: 'grid',
  gridTemplateColumns: { md: 'minmax(0,1fr) minmax(0,1fr)' },
  gap: 2,
};

const SubmissionFeed = () => {
  const submissions = useLoaderData() as PopulatedSubmissionFrontend[];

  return (
    <React.Fragment>
      <Grid sx={feedStyle}>
        {submissions.map((submission) => {
          return (
            <SubmissionCard
              submissionId={submission._id}
              key={submission._id}
            />
          );
        })}
      </Grid>
      <Outlet />
    </React.Fragment>
  );
};

export { SubmissionFeed, submissionFeedLoader };
