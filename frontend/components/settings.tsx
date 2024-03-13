import { useAppContext } from "@/app/Context";
import { useEffect, useState } from "react";
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
      <section
        className={
          "w-screen h-screen absolute flex justify-center items-center top-0"
        }
      >
        <div
          className={`${secondaryColor} ${textColor} display-mode-transition w-[36vh] p-[2vh] rounded-[2vh] flex justify-center items-center`}
        >
          <div
            className={`w-full gap-[1vh] flex flex-col justify-start items-center`}
          >
            <div className={"flex justify-start items-center gap-[1vh] w-full"}>
              <button
                type={"button"}
                onClick={() => {
                  setSelected(!selected);
                }}
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
      </section>
    );
  };

  return (
    <>
      <button
        type={"button"}
        onClick={() => {
          setSelected(!selected);
        }}
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
    } = useAppContext(),
    [settingFocus, setFocus] = useState<boolean>(false),
    gameRules: string[] = [
      "Le Sudoku est un jeu de puzzle où vous remplissez une grille de 9x9 avec des chiffres.",
      "Chaque ligne, colonne et carré 3x3 doit contenir tous les chiffres de 1 à 9 sans répétition.",
      "Vous commencez avec certains chiffres déjà placés et vous devez remplir les cases vides.",
      "Le but est de remplir la grille entière correctement.",
    ];

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 64 64"
                >
                  <path d="M16 44c-.512 0-1.023-.195-1.414-.586l-10-10c-.781-.781-.781-2.047 0-2.828l10-10c.781-.781 2.047-.781 2.828 0 .781.781.781 2.047 0 2.828L8.828 32l8.586 8.586c.781.781.781 2.047 0 2.828C17.023 43.805 16.512 44 16 44zM26 50c-.233 0-.471-.041-.702-.128-1.034-.388-1.559-1.541-1.171-2.575l12-32c.389-1.035 1.541-1.558 2.575-1.17s1.559 1.541 1.171 2.575l-12 32C27.571 49.505 26.81 50 26 50zM48 44c-.512 0-1.023-.195-1.414-.586-.781-.781-.781-2.047 0-2.828L55.172 32l-8.586-8.586c-.781-.781-.781-2.047 0-2.828.781-.781 2.047-.781 2.828 0l10 10c.781.781.781 2.047 0 2.828l-10 10C49.023 43.805 48.512 44 48 44z"></path>
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 50 50"
                >
                  <path d="M41.67,30.97c-0.06,0.168-0.122,0.335-0.187,0.5C39.008,37.798,32.832,42.3,25.64,42.3c-9.37,0-17-7.63-17-17	c0-8.013,5.575-14.75,13.05-16.535c0.156-0.037,0.313-0.072,0.47-0.105c0.51-0.11,0.85,0.51,0.54,0.92	c-0.103,0.129-0.204,0.26-0.303,0.393c-1.736,2.334-2.757,5.214-2.757,8.327c0,6,3.42,10.33,7.73,12.51	c1.89,0.96,4.02,1.49,6.27,1.49c2.405,0,4.659-0.61,6.64-1.678c0.186-0.1,0.369-0.204,0.55-0.312	C41.28,30.04,41.84,30.47,41.67,30.97z"></path>
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 64 64"
                >
                  <path d="M 41.193359 9.8125 C 37.864609 9.8125 34.535 11.080234 32 13.615234 L 26.34375 19.271484 C 21.27375 24.341484 21.27375 32.58625 26.34375 37.65625 C 27.87875 39.19025 29.688812 40.251562 31.632812 40.851562 L 32.707031 39.777344 C 33.407031 39.077344 33.902875 38.242562 34.171875 37.351562 C 32.340875 37.076563 30.578875 36.235125 29.171875 34.828125 C 25.664875 31.321125 25.664875 25.606609 29.171875 22.099609 L 34.828125 16.443359 C 38.335125 12.936359 44.049641 12.936359 47.556641 16.443359 C 51.063641 19.950359 51.063641 25.664875 47.556641 29.171875 L 44.169922 32.558594 C 44.523922 34.397594 44.544234 36.286187 44.240234 38.117188 C 44.403234 37.968187 44.572516 37.81225 44.728516 37.65625 L 50.384766 32 C 55.454766 26.93 55.454766 18.685234 50.384766 13.615234 C 47.849766 11.080234 44.522109 9.8125 41.193359 9.8125 z M 32.369141 23.146484 L 31.294922 24.222656 C 30.594922 24.922656 30.099078 25.755484 29.830078 26.646484 C 31.661078 26.921484 33.421125 27.764875 34.828125 29.171875 C 38.335125 32.678875 38.335125 38.391438 34.828125 41.898438 L 29.171875 47.556641 C 25.664875 51.063641 19.950359 51.063641 16.443359 47.556641 C 12.936359 44.049641 12.936359 38.335125 16.443359 34.828125 L 19.830078 31.441406 C 19.476078 29.602406 19.455766 27.713812 19.759766 25.882812 C 19.596766 26.031813 19.427484 26.18775 19.271484 26.34375 L 13.615234 32 C 8.5452344 37.07 8.5452344 45.314766 13.615234 50.384766 C 18.685234 55.454766 26.93 55.454766 32 50.384766 L 37.65625 44.728516 C 42.72625 39.658516 42.72625 31.41375 37.65625 26.34375 C 36.12125 24.80975 34.312141 23.747484 32.369141 23.146484 z"></path>
                </svg>
              ),
              color: "bg-blue-500 border-blue-400 fill-blue-200",
              label: "Accréditations",
              content: (
                <>
                  <footer
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
                          "https://fr.wikipedia.org/wiki/Howard_Garns",
                        )
                      }
                    >
                      Sudoku &mdash; Howard Garns
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
                  </footer>
                </>
              ),
            }}
          />
          <TileSetting
            CardPkg={{
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 50 50"
                >
                  <path d="M33 38v4c0 .55-.45 1-1 1H18c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3V24h-2c-.55 0-1-.45-1-1v-3.1c0-.55.45-1 1-1h9c.55 0 1 .45 1 1V37h3C32.55 37 33 37.45 33 38zM25 7c2.206 0 4 1.794 4 4s-1.794 4-4 4-4-1.794-4-4S22.794 7 25 7z"></path>
                </svg>
              ),
              color: "bg-amber-500 border-amber-400 fill-amber-200",
              label: "Règle du jeu",
              content: (
                <div
                  className={`${textColor} display-mode-transition flex flex-col justify-start items-start gap-[1vh]`}
                >
                  {gameRules.map((rule, index) => (
                    <div
                      key={index}
                      className={`${primaryColor} display-mode-transition p-[1vh] rounded-[1.25vh]`}
                    >
                      <p>
                        <span className={`font-medium`}>{index + 1}.</span>{" "}
                        {gameRules[index]}
                      </p>
                    </div>
                  ))}
                </div>
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
