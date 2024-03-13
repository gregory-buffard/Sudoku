import {
  createContext,
  useContext,
  ReactNode,
  useState,
  FunctionComponent,
} from "react";

interface AppState {
  grid: Array<Array<number>>;
  lightSwitch: boolean;
  solving: boolean;
  terminal: boolean;
  settings: boolean;
  tutorial: boolean;
}
interface AppActions {
  setGrid: (value: Array<Array<number>>) => void;
  setLightSwitch: (value: boolean) => void;
  setSolving: (value: boolean) => void;
  setTerminal: (value: boolean) => void;
  setSettings: (value: boolean) => void;
  setTutorial: (value: boolean) => void;
}
interface AppVar {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  placeholder: string;
}

export type AppContextType = AppState & AppActions & AppVar;

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within a AppProvider");
  return context;
};

export const AppProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [grid, setGrid] = useState<AppState["grid"]>(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill(0)),
    ),
    [lightSwitch, setLightSwitch] = useState<AppState["lightSwitch"]>(true),
    [solving, setSolving] = useState<AppState["solving"]>(false),
    [terminal, setTerminal] = useState<AppState["terminal"]>(false),
    [settings, setSettings] = useState<AppState["settings"]>(false),
    primaryColor: AppVar["primaryColor"] = "bg-stone-50 dark:bg-stone-950",
    secondaryColor: AppVar["secondaryColor"] = "bg-stone-200 dark:bg-stone-800",
    textColor: AppVar["textColor"] = "text-stone-900 dark:text-stone-100",
    placeholder: AppVar["placeholder"] =
      "placeholder-stone-400 dark:placeholder-stone-600",
    [tutorial, setTutorial] = useState<AppState["tutorial"]>(false);

  const state: AppState = {
    grid,
    lightSwitch,
    solving,
    terminal,
    settings,
    tutorial,
  };
  const actions: AppActions = {
    setGrid,
    setLightSwitch,
    setSolving,
    setTerminal,
    setSettings,
    setTutorial,
  };
  const variables: AppVar = {
    primaryColor,
    secondaryColor,
    textColor,
    placeholder,
  };
  const value: AppContextType = { ...state, ...actions, ...variables };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
