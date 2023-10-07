import * as React from 'react';
import axios from 'axios';
import { BattleCard } from '../../components/battleCard/BattleCard';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ImageList, ImageListItem } from '@mui/material';
import { TabBar } from '../../components/tabBar/TabBar';

const feedLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const path = '/battle/all';
  const res = await axios.get<{ _id: string }[]>(path, {
    params: { open: url.searchParams.get('open') },
  });
  return res.data;
};

const Feed = () => {
  /* First element in battles is the battle of the day.  */
  const battles = useLoaderData() as { _id: string}[];
  const battlesRecent = battles.slice(1).reverse();

  /* Move battle of the day to the front of the array.  */
  if (battles[0]) battlesRecent.unshift(battles[0]);

  return (
    <React.Fragment>
      <TabBar />
      <ImageList variant="masonry" cols={3} gap={12}>
         {battlesRecent.map((battle, i) => (
            <ImageListItem key={battle._id}>
              <BattleCard
                battleId={battle._id}
                isPhotoOfTheDay={i === 0}
              />
            </ImageListItem>
          ))}
      </ImageList>
    </React.Fragment>
  );
};

export { Feed, feedLoader };
