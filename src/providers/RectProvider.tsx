// Gives result of useRect() to underlying components

import React from 'react';
import { RectResult, EMPTY_RECT } from '../util/hooks';
import { WithChildren } from '../types/util';

export const RectContext = React.createContext<{rect: RectResult}>({rect: EMPTY_RECT});

interface Props {
  rect: RectResult
}

function RectProvider({ children, rect }: WithChildren<Props>) {
  return (
    <RectContext.Provider value={{rect}}>
      {children}
    </RectContext.Provider>
  );
}

export default RectProvider;
