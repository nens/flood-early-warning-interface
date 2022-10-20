// Select a dam or area by its uuid to highlight it
// Also store its name. Make get and set functions available in sub components.

import { createContext, FC, SetStateAction, Dispatch, useState, PropsWithChildren } from "react";

export type Area = {
  id: string;
  name: string;
} | null;

interface HoverAndSelectContextInterface {
  hover: Area;
  select: Area;
  // The type below is returned by useState() for the setter functions
  setHover: Dispatch<SetStateAction<Area>>;
  setSelect: Dispatch<SetStateAction<Area>>;
}

export const HoverAndSelectContext = createContext<HoverAndSelectContextInterface>({
  hover: null,
  select: null,
  setHover: () => null,
  setSelect: () => null,
});

const HoverAndSelectProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [hover, setHover] = useState<Area>(null);
  const [select, setSelect] = useState<Area>(null);

  return (
    <HoverAndSelectContext.Provider
      value={{
        hover: select || hover, // If there is a "select", also use it as the "hover"
        setHover,
        select,
        setSelect,
      }}
    >
      {children}
    </HoverAndSelectContext.Provider>
  );
};

export default HoverAndSelectProvider;
