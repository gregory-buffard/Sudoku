import { useAppContext } from "@/app/Context";
import { useState } from "react";
import Link from "next/link";

interface CardPkg {
  icon: JSX.Element;
  color: string;
  content: JSX.Element;
  label: string;
}

interface SwitchablePkg {
  icon: CardPkg["icon"];
  color: CardPkg["color"];
  label: CardPkg["label"];
  setting: boolean;
  setSetting: (value: boolean) => void;
}

interface Theme {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const SwitchSetting = ({ SwitchablePkg }: { SwitchablePkg: SwitchablePkg }) => {
  const { secondaryColor, primaryColor, textColor } = useAppContext();

  return (
    <div
      className={`${primaryColor} display-mode-transition w-full h-[5vh] px-[1.5vh] rounded-[1.25vh] flex justify-between items-center`}
    >
      <div className={"flex justify-start items-center gap-[1vh]"}>
        <div className={`${SwitchablePkg.color} border-[0.25vh] settings-icon`}>
          {SwitchablePkg.icon}
        </div>
        <p className={`${textColor} display-mode-transition`}>
          {SwitchablePkg.label}
        </p>
      </div>
      <button
        type={"button"}
        onClick={() => SwitchablePkg.setSetting(!SwitchablePkg.setting)}
      >
        <div
          className={`flex items-center justify-start ${SwitchablePkg.setting ? "bg-green-400" : secondaryColor} [transition:_background-color_200ms_ease-in-out,_border_1s_ease-in-out] border-[0.25vh] border-stone-200 dark:border-stone-800 w-[5vh] h-[3vh] rounded-[1.25vh]`}
        >
          <div
            className={`bg-stone-50 ${SwitchablePkg.setting ? "translate-x-full" : "translate-x-0"} transition-transform duration-200 ease-in-out rounded-[1vh] w-1/2 h-full`}
          ></div>
        </div>
      </button>
    </div>
  );
};

const TileSetting = ({ CardPkg }: { CardPkg: CardPkg }) => {
  const [selected, setSelected] = useState<boolean>(false),
    { primaryColor, textColor } = useAppContext();

  const SettingCard = () => {
    const { primaryColor, secondaryColor, textColor } = useAppContext();

    return (
      <div
        className={`${secondaryColor} ${textColor} display-mode-transition w-[36vh] p-[2vh] rounded-[2vh] flex justify-center items-center absolute`}
      >
        <div
          className={`w-full gap-[1vh] flex flex-col justify-start items-center`}
        >
          <div className={"flex justify-start items-center gap-[1vh] w-full"}>
            <button
              type={"button"}
              onClick={() => setSelected(!selected)}
              className={`${primaryColor} py-[0.5vh] rounded-[0.75vh] active:scale-90 [transition:_transform_200ms_ease-in-out,_background-color_1s_ease-in-out,_color_1s_ease-in-out,_fill_1s_ease-in-out]`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
                className={"w-[2.5vh] fill-stone-900 dark:fill-stone-100"}
              >
                <path d="M42.852,55.605c-0.504,0-1.008-0.189-1.396-0.568L19.291,33.411c-0.386-0.376-0.604-0.893-0.604-1.432	s0.218-1.055,0.604-1.432L41.412,8.963c0.789-0.77,2.057-0.756,2.828,0.035c0.771,0.791,0.756,2.057-0.035,2.829L23.552,31.979	l20.696,20.194c0.791,0.771,0.807,2.038,0.035,2.829C43.892,55.403,43.371,55.605,42.852,55.605z"></path>
              </svg>
            </button>
            <h2>{CardPkg.label}</h2>
          </div>
          {CardPkg.content}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        type={"button"}
        onClick={() => setSelected(!selected)}
        className={`${primaryColor} ${textColor} w-full h-[5vh] px-[1.5vh] rounded-[1.25vh] flex justify-start items-center gap-[1vh] active:scale-95 [transition:_transform_200ms_ease-in-out,_background-color_1s_ease-in-out,_color_1s_ease-in-out,_fill_1s_ease-in-out]`}
      >
        <div className={`${CardPkg.color} border-[0.25vh] settings-icon`}>
          {CardPkg.icon}
        </div>
        {CardPkg.label}
      </button>
      {selected ? <SettingCard /> : <></>}
    </>
  );
};

const Settings = ({ Theme }: { Theme: Theme }) => {
  const {
    settings,
    setSettings,
    primaryColor,
    secondaryColor,
    terminal,
    setTerminal,
    textColor,
  } = useAppContext();

  return settings ? (
    <>
      <section
        className={`w-full h-full absolute z-20 ${primaryColor} display-mode-transition bg-opacity-75 dark:bg-opacity-75 backdrop-blur-md flex justify-center items-center`}
      >
        <div
          className={`${secondaryColor} display-mode-transition w-[36vh] p-[1vh] gap-[1vh] rounded-[2vh] flex flex-col justify-start items-center overflow-hidden`}
        >
          <SwitchSetting
            SwitchablePkg={{
              icon: (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 64 64"
                  >
                    <path d="M16 44c-.512 0-1.023-.195-1.414-.586l-10-10c-.781-.781-.781-2.047 0-2.828l10-10c.781-.781 2.047-.781 2.828 0 .781.781.781 2.047 0 2.828L8.828 32l8.586 8.586c.781.781.781 2.047 0 2.828C17.023 43.805 16.512 44 16 44zM26 50c-.233 0-.471-.041-.702-.128-1.034-.388-1.559-1.541-1.171-2.575l12-32c.389-1.035 1.541-1.558 2.575-1.17s1.559 1.541 1.171 2.575l-12 32C27.571 49.505 26.81 50 26 50zM48 44c-.512 0-1.023-.195-1.414-.586-.781-.781-.781-2.047 0-2.828L55.172 32l-8.586-8.586c-.781-.781-.781-2.047 0-2.828.781-.781 2.047-.781 2.828 0l10 10c.781.781.781 2.047 0 2.828l-10 10C49.023 43.805 48.512 44 48 44z"></path>
                  </svg>
                </>
              ),
              color: "bg-emerald-500 border-emerald-400 fill-emerald-200",
              label: "Mode terminal",
              setting: terminal,
              setSetting: setTerminal,
            }}
          />
          <SwitchSetting
            SwitchablePkg={{
              icon: (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 64 64"
                  >
                    <path d="M55.68,36.83c0.32,0.45,0.41,1.02,0.22,1.57C52.59,47.73,43.72,54,33.83,54c-12.9,0-23.4-10.5-23.4-23.41	c0-11.02,7.83-20.65,18.61-22.9c0.12-0.03,0.24-0.04,0.36-0.04c0.65,0,1.23,0.37,1.53,0.96c0.3,0.61,0.24,1.33-0.19,1.89	C28.25,13.62,27,17,27,23c0.44,5.97,3.66,11.21,9,14c2.42,1.23,5.62,1.82,8.38,1.82c3.14,0,6.24-0.86,8.96-2.48	c0.27-0.17,0.58-0.25,0.9-0.25C54.81,36.09,55.35,36.36,55.68,36.83z M33.83,50.68c7.04,0,13.51-3.7,17.13-9.61	c-2.11,0.71-4.31,1.07-6.58,1.07c-11.45,0-20.77-9.32-20.77-20.77c0-3.2,0.73-6.31,2.12-9.14c-7.17,3.17-11.98,10.38-11.98,18.36	C13.75,41.67,22.76,50.68,33.83,50.68z"></path>
                  </svg>
                </>
              ),
              color: "bg-violet-500 border-violet-400 fill-violet-200",
              label: "Mode sombre",
              setting: Theme.darkMode,
              setSetting: Theme.setDarkMode,
            }}
          />
          <TileSetting
            CardPkg={{
              icon: (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 64 64"
                  >
                    <path d="M 41.193359 9.8125 C 37.864609 9.8125 34.535 11.080234 32 13.615234 L 26.34375 19.271484 C 21.27375 24.341484 21.27375 32.58625 26.34375 37.65625 C 27.87875 39.19025 29.688812 40.251562 31.632812 40.851562 L 32.707031 39.777344 C 33.407031 39.077344 33.902875 38.242562 34.171875 37.351562 C 32.340875 37.076563 30.578875 36.235125 29.171875 34.828125 C 25.664875 31.321125 25.664875 25.606609 29.171875 22.099609 L 34.828125 16.443359 C 38.335125 12.936359 44.049641 12.936359 47.556641 16.443359 C 51.063641 19.950359 51.063641 25.664875 47.556641 29.171875 L 44.169922 32.558594 C 44.523922 34.397594 44.544234 36.286187 44.240234 38.117188 C 44.403234 37.968187 44.572516 37.81225 44.728516 37.65625 L 50.384766 32 C 55.454766 26.93 55.454766 18.685234 50.384766 13.615234 C 47.849766 11.080234 44.522109 9.8125 41.193359 9.8125 z M 32.369141 23.146484 L 31.294922 24.222656 C 30.594922 24.922656 30.099078 25.755484 29.830078 26.646484 C 31.661078 26.921484 33.421125 27.764875 34.828125 29.171875 C 38.335125 32.678875 38.335125 38.391438 34.828125 41.898438 L 29.171875 47.556641 C 25.664875 51.063641 19.950359 51.063641 16.443359 47.556641 C 12.936359 44.049641 12.936359 38.335125 16.443359 34.828125 L 19.830078 31.441406 C 19.476078 29.602406 19.455766 27.713812 19.759766 25.882812 C 19.596766 26.031813 19.427484 26.18775 19.271484 26.34375 L 13.615234 32 C 8.5452344 37.07 8.5452344 45.314766 13.615234 50.384766 C 18.685234 55.454766 26.93 55.454766 32 50.384766 L 37.65625 44.728516 C 42.72625 39.658516 42.72625 31.41375 37.65625 26.34375 C 36.12125 24.80975 34.312141 23.747484 32.369141 23.146484 z"></path>
                  </svg>
                </>
              ),
              color: "bg-blue-500 border-blue-400 fill-blue-200",
              label: "Accréditations",
              content: (
                <>
                  <div
                    className={
                      "flex flex-col justify-start items-start gap-[1vh]"
                    }
                  >
                    <Link
                      href={"#"}
                      className={"credits"}
                      onClick={() =>
                        // @ts-ignore
                        window.electronAPI.openExternal(
                          "https://github.com/gregory-buffard/Sudoku",
                        )
                      }
                    >
                      &copy; {new Date().getFullYear()} Sudokiste &mdash;
                      Grégory Stehlík Buffard
                    </Link>
                    <Link
                      href={"#"}
                      className={"credits"}
                      onClick={() =>
                        // @ts-ignore
                        window.electronAPI.openExternal(
                          "https://www.refactoringui.com",
                        )
                      }
                    >
                      Refactoring UI &mdash; Adam Wathan & Steve Schoger
                    </Link>
                    <Link
                      href={"#"}
                      className={"credits"}
                      onClick={() =>
                        // @ts-ignore
                        window.electronAPI.openExternal(
                          "https://developer.apple.com/design/human-interface-guidelines/",
                        )
                      }
                    >
                      Human Interface Guidelines &mdash; Apple Developer
                    </Link>
                    <Link
                      href={"#"}
                      className={"credits"}
                      onClick={() =>
                        // @ts-ignore
                        window.electronAPI.openExternal(
                          "https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf",
                        )
                      }
                    >
                      Patterns Recognition & Machine Learning &mdash;
                      Christopher M. Bishop
                    </Link>
                  </div>
                </>
              ),
            }}
          />
          <button
            type={"button"}
            onClick={() => setSettings(!settings)}
            className={`bg-red-500 text-red-200 fill-red-200 border-[0.25vh] border-red-400 w-full h-[5vh] px-[1.5vh] rounded-[1.25vh] flex justify-center items-center gap-[1vh] active:scale-95 transition-transform duration-200 ease-in-out`}
          >
            <div className={"settings-icon"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
              >
                <path d="M 22 9 C 18.69 9 16 11.69 16 15 L 16 49 C 16 52.31 18.69 55 22 55 L 42 55 C 45.31 55 48 52.31 48 49 L 48 42.019531 C 47.632 42.387531 46.365 43.982 44 44 L 44 49 C 44 50.1 43.1 51 42 51 L 22 51 C 20.9 51 20 50.1 20 49 L 20 15 C 20 13.9 20.9 13 22 13 L 42 13 C 43.1 13 44 13.9 44 15 L 44 20 C 46.371 20.018 47.643 21.623469 48 21.980469 L 48 15 C 48 11.69 45.31 9 42 9 L 22 9 z M 43.941406 22.998047 C 43.429406 22.999922 42.91925 23.197844 42.53125 23.589844 C 41.75325 24.373844 41.757016 25.641922 42.541016 26.419922 L 46.146484 30 L 30.949219 30 C 29.845219 30 28.949219 30.896 28.949219 32 C 28.949219 33.104 29.845219 34 30.949219 34 L 46.146484 34 L 42.541016 37.580078 C 41.757016 38.359078 41.75325 39.624203 42.53125 40.408203 C 42.92225 40.802203 43.434219 41 43.949219 41 C 44.459219 41 44.970375 40.807922 45.359375 40.419922 L 52.408203 33.419922 C 52.786203 33.044922 53 32.533 53 32 C 53 31.467 52.786203 30.956078 52.408203 30.580078 L 45.359375 23.580078 C 44.967375 23.190578 44.453406 22.996172 43.941406 22.998047 z"></path>
              </svg>
            </div>
            <p>Quitter</p>
          </button>
        </div>
      </section>
    </>
  ) : null;
};

export default Settings;
