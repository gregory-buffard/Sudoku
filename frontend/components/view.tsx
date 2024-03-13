import { useAppContext, AppContextType } from "@/app/Context";
import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent } from "react";

interface INotification {
  state: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
  };
  icon: JSX.Element;
  label: string;
  message: string;
  color: string;
  action: () => void;
}

const gridValidation = (grid: Array<Array<number>>): boolean => {
  const seen = new Set();
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const number = grid[i][j];
      if (number !== 0) {
        const rowCheck = `row${i}-${number}`;
        const colCheck = `col${j}-${number}`;
        const boxCheck = `box${Math.floor(i / 3)}-${Math.floor(j / 3)}-${number}`;
        if (seen.has(rowCheck) || seen.has(colCheck) || seen.has(boxCheck)) {
          return false; // Invalid puzzle
        }
        seen.add(rowCheck);
        seen.add(colCheck);
        seen.add(boxCheck);
      }
    }
  }
  return true;
};

const Notification = ({ content }: { content: INotification }) => {
  useEffect(() => {
    if (content.state.visible) {
      setTimeout(() => {
        content.state.setVisible(false);
      }, 5000);
    }
  }, [content.state.visible]);

  return (
    <button
      type={"button"}
      onClick={() => {
        content.action();
        content.state.setVisible(false);
      }}
      onWheel={() => content.state.setVisible(false)}
      className={`${content.state.visible ? "translate-y-[3vh]" : "-translate-y-[150%]"} ${content.color} backdrop-blur-sm border-[0.5vh] [transition:_transform_400ms_ease-in-out,_background-color_200ms_ease-in-out,_scale_200ms_ease-in-out] absolute top-0 z-30 w-[36vh] rounded-[3vh] flex justify-start items-center gap-[1vh] px-[1.5vh] py-[1.5vh] drop-shadow-2xl notification-scale cursor-pointer`}
    >
      <div className={"w-[8vh]"}>{content.icon}</div>
      <div className={"flex flex-col justify-start items-start w-full"}>
        <div className={"flex justify-between items-center w-full"}>
          <h2 className={"text-[1.75vh]"}>{content.label}</h2>
        </div>
        <p className={"text-left text-[1.5vh]"}>{content.message}</p>
      </div>
      <div
        className={`absolute w-full left-0 right-0 bottom-0 translate-y-[4vh] flex justify-center items-center text-center`}
      >
        <p
          className={`bg-stone-800 dark:bg-stone-200 bg-opacity-50 dark:bg-opacity-50 text-stone-100 dark:text-stone-900 px-[1.5vh] py-[0.5vh] text-[1.5vh] rounded-full`}
        >
          Défilez la souris pour masquer
        </p>
      </div>
    </button>
  );
};

const UI = () => {
  const {
      grid,
      setGrid,
      solving,
      setSolving,
      primaryColor,
      secondaryColor,
      textColor,
      settings,
      setSettings,
      tutorial,
      setTutorial,
    }: AppContextType = useAppContext(),
    [invalid, setInvalid] = useState<boolean>(false),
    [error, setError] = useState<boolean>(false),
    [tutorialMessage, setTutorialMessage] = useState<boolean>(false);

  const generateSubgrids = (
    grid: Array<Array<number>>,
  ): Array<Array<number>> => {
    return Array.from({ length: 9 }, (_, k) => {
      const row = Math.floor(k / 3) * 3;
      const col = (k % 3) * 3;
      return grid.slice(row, row + 3).flatMap((r) => r.slice(col, col + 3));
    });
  };
  const subgrids = generateSubgrids(grid);

  useEffect(() => {
    console.log("checking tutorial");
    if (localStorage.getItem("tutorial") === null) {
      console.log("setting tutorial");
      localStorage.setItem("tutorial", "true");
      setTutorial(true);
    } else {
      setTutorial(localStorage.getItem("tutorial") === "true");
    }
  }, []);

  const inputChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ): void => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    if (value === "") {
      newGrid[rowIndex][colIndex] = "";
    } else {
      newGrid[rowIndex][colIndex] = parseInt(value, 10);
    }
    setGrid(newGrid);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number,
  ): void => {
    const current: string | number = grid[rowIndex][colIndex];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newValue = current === 0 || current === undefined ? 9 : current - 1;
      inputChange(rowIndex, colIndex, newValue.toString());
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newValue =
        current === 9 ? 0 : current === undefined ? 1 : current + 1;
      inputChange(rowIndex, colIndex, newValue.toString());
    }
  };

  const blur = (rowIndex: number, colIndex: number): void => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    if (newGrid[rowIndex][colIndex] === 0) {
      newGrid[rowIndex][colIndex] = "";
      setGrid(newGrid);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const cleanupSolved = window.electronAPI.addListener(
      "solved",
      (e: ChangeEvent, solvedPuzzle: Array<Array<number>>): void => {
        setGrid(solvedPuzzle);
        setSolving(false);
      },
    );

    // @ts-ignore
    const cleanupError = window.electronAPI.addListener(
      "error",
      (e: ChangeEvent, error: string): void => {
        setError(true);
        setSolving(false);
      },
    );

    return (): void => {
      cleanupSolved();
      cleanupError();
    };
  }, []);

  const solve = (): void => {
    if (solving) return;
    setSolving(true);
    const format = (grid: Array<Array<number>>): Array<Array<number>> => {
      const input = grid
        .map((row: Array<number>) =>
          row
            .map((cell: any) =>
              cell === null || cell === "" || cell === undefined
                ? "0"
                : cell.toString(),
            )
            .join(""),
        )
        .join("");
      return Array.from({ length: 9 }, (e: ChangeEvent, i: number) =>
        Array.from({ length: 9 }, (e: ChangeEvent, j: number) =>
          parseInt(input[9 * i + j], 10),
        ),
      );
    };

    const puzzle = format(grid);
    if (!gridValidation(puzzle)) {
      setInvalid(true);
      setSolving(false);
    } else {
      // @ts-ignore
      window.electronAPI.sendSudoku(puzzle);
    }
  };

  return (
    <section
      className={`${primaryColor} display-mode-transition w-full h-full flex justify-center items-center`}
    >
      <Notification
        content={{
          state: {
            visible: invalid,
            setVisible: setInvalid,
          },
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 64 64"
            >
              <path d="M 32 11.919922 C 30.192 11.919922 28.573922 12.854922 27.669922 14.419922 L 9.7246094 45.5 C 8.8216094 47.066 8.8225625 48.935 9.7265625 50.5 C 10.629563 52.065 12.248641 53 14.056641 53 L 49.943359 53 C 51.751359 53 53.370438 52.065 54.273438 50.5 C 55.177438 48.935 55.178391 47.066 54.275391 45.5 L 36.330078 14.419922 C 35.427078 12.854922 33.808 11.919922 32 11.919922 z M 32 15.919922 C 32.174 15.919922 32.605234 15.968922 32.865234 16.419922 L 50.810547 47.5 C 51.071547 47.951 50.897547 48.35 50.810547 48.5 C 50.723547 48.65 50.465359 49 49.943359 49 L 14.054688 49 C 13.533688 49 13.276453 48.65 13.189453 48.5 C 13.102453 48.35 12.928453 47.951 13.189453 47.5 L 31.134766 16.419922 C 31.394766 15.968922 31.826 15.919922 32 15.919922 z M 31.984375 22.994141 C 31.292375 22.994141 30.730828 23.205906 30.298828 23.628906 C 29.865828 24.050906 29.660688 24.578891 29.679688 25.212891 L 29.996094 37.060547 C 30.035094 38.386547 30.706672 39.050781 32.013672 39.050781 C 33.282672 39.050781 33.927312 38.3875 33.945312 37.0625 L 34.320312 25.242188 C 34.339312 24.608187 34.123875 24.074578 33.671875 23.642578 C 33.220875 23.209578 32.657375 22.994141 31.984375 22.994141 z M 32 41.691406 C 30.465 41.691406 29.492188 42.988844 29.492188 44.089844 C 29.492188 45.190844 30.432 46.488281 32 46.488281 C 33.568 46.488281 34.507812 45.260844 34.507812 44.089844 C 34.507813 42.918844 33.535 41.691406 32 41.691406 z"></path>
            </svg>
          ),
          label: "Sudoku invalide",
          message: "Veuillez consulter la règle du jeu dans les paramètres.",
          color:
            "bg-red-500 hover:bg-red-400 border-red-400 fill-red-200 text-red-200",
          action: () => {
            setSettings(true);
          },
        }}
      />
      <Notification
        content={{
          state: {
            visible: error,
            setVisible: setError,
          },
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 64 64"
            >
              <path d="M 32 11.919922 C 30.192 11.919922 28.573922 12.854922 27.669922 14.419922 L 9.7246094 45.5 C 8.8216094 47.066 8.8225625 48.935 9.7265625 50.5 C 10.629563 52.065 12.248641 53 14.056641 53 L 49.943359 53 C 51.751359 53 53.370438 52.065 54.273438 50.5 C 55.177438 48.935 55.178391 47.066 54.275391 45.5 L 36.330078 14.419922 C 35.427078 12.854922 33.808 11.919922 32 11.919922 z M 32 15.919922 C 32.174 15.919922 32.605234 15.968922 32.865234 16.419922 L 50.810547 47.5 C 51.071547 47.951 50.897547 48.35 50.810547 48.5 C 50.723547 48.65 50.465359 49 49.943359 49 L 14.054688 49 C 13.533688 49 13.276453 48.65 13.189453 48.5 C 13.102453 48.35 12.928453 47.951 13.189453 47.5 L 31.134766 16.419922 C 31.394766 15.968922 31.826 15.919922 32 15.919922 z M 31.984375 22.994141 C 31.292375 22.994141 30.730828 23.205906 30.298828 23.628906 C 29.865828 24.050906 29.660688 24.578891 29.679688 25.212891 L 29.996094 37.060547 C 30.035094 38.386547 30.706672 39.050781 32.013672 39.050781 C 33.282672 39.050781 33.927312 38.3875 33.945312 37.0625 L 34.320312 25.242188 C 34.339312 24.608187 34.123875 24.074578 33.671875 23.642578 C 33.220875 23.209578 32.657375 22.994141 31.984375 22.994141 z M 32 41.691406 C 30.465 41.691406 29.492188 42.988844 29.492188 44.089844 C 29.492188 45.190844 30.432 46.488281 32 46.488281 C 33.568 46.488281 34.507812 45.260844 34.507812 44.089844 C 34.507813 42.918844 33.535 41.691406 32 41.691406 z"></path>
            </svg>
          ),
          label: "Une erreur est survenue",
          message: "Veuillez installer Python 3.6+ et redémarrer Sudokiste.",
          color:
            "bg-red-500 hover:bg-red-400 border-red-400 fill-red-200 text-red-200",
          action: () => {
            // @ts-ignore
            window.electronAPI.openExternal(
              "https://apps.microsoft.com/detail/9ncvdn91xzqp",
            );
          },
        }}
      />
      {tutorial && (
        <Notification
          content={{
            state: {
              visible: tutorialMessage,
              setVisible: setTutorialMessage,
            },
            icon: (
              <div
                className={
                  "scale-75 fill-yellow-300 [filter:_drop-shadow(0_0.5vh_0.5vh_rgb(253,_224,_71))]"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  viewBox="0 0 64 64"
                >
                  <path d="M 32 9 C 23.178 9 16 16.178 16 25 C 16 31.049 18.989578 34.352812 21.392578 37.007812 C 23.407578 39.234813 25 40.994 25 44 C 25 45.104 25.896 46 27 46 L 37 46 C 38.104 46 39 45.104 39 44 C 39 40.994 40.592422 39.234813 42.607422 37.007812 C 45.010422 34.352813 48 31.049 48 25 C 48 16.178 40.822 9 32 9 z M 12 10 C 10.896 10 10 10.895 10 12 C 10 13.105 10.896 14 12 14 C 13.104 14 14 13.105 14 12 C 14 10.895 13.104 10 12 10 z M 52 10 C 50.896 10 50 10.895 50 12 C 50 13.105 50.896 14 52 14 C 53.104 14 54 13.105 54 12 C 54 10.895 53.104 10 52 10 z M 32 13 C 38.617 13 44 18.383 44 25 C 44 29.508 41.883578 31.847219 39.642578 34.324219 C 37.805578 36.353219 35.762922 38.61 35.169922 42 L 28.830078 42 C 28.237078 38.611 26.194422 36.353219 24.357422 34.324219 C 22.116422 31.847219 20 29.508 20 25 C 20 18.383 25.383 13 32 13 z M 8 24 C 6.896 24 6 24.895 6 26 C 6 27.105 6.896 28 8 28 C 9.104 28 10 27.105 10 26 C 10 24.895 9.104 24 8 24 z M 56 24 C 54.896 24 54 24.895 54 26 C 54 27.105 54.896 28 56 28 C 57.104 28 58 27.105 58 26 C 58 24.895 57.104 24 56 24 z M 12 38 C 10.896 38 10 38.895 10 40 C 10 41.105 10.896 42 12 42 C 13.104 42 14 41.105 14 40 C 14 38.895 13.104 38 12 38 z M 52 38 C 50.896 38 50 38.895 50 40 C 50 41.105 50.896 42 52 42 C 53.104 42 54 41.105 54 40 C 54 38.895 53.104 38 52 38 z M 28 48 C 26.896 48 26 48.895 26 50 C 26 51.105 26.896 52 28 52 L 28.554688 52 C 29.247618 53.190604 30.523271 54 32 54 C 33.476729 54 34.752382 53.190604 35.445312 52 L 36 52 C 37.104 52 38 51.105 38 50 C 38 48.895 37.104 48 36 48 L 28 48 z"></path>
                </svg>
              </div>
            ),
            label: "Astuce",
            message:
              "Utilisez les flèches du clavier pour changer les valeurs!",
            color:
              "bg-blue-500 hover:bg-blue-400 border-blue-400 text-blue-200",
            action: () => setTutorialMessage(false),
          }}
        />
      )}
      <div
        className={
          "w-max h-full flex flex-col justify-center items-start gap-[3vh]"
        }
      >
        <div className={"grid grid-cols-3 gap-[1vh] font-medium"}>
          {subgrids.map((subgrid, index) => (
            <div
              key={index}
              className={`${secondaryColor} display-mode-transition grid grid-cols-3 gap-[1vh] p-[1vh] rounded-[1.25vh]`}
            >
              {subgrid.map((cell, cellIndex) => (
                <input
                  key={cellIndex}
                  type="text"
                  value={cell || ""}
                  onClick={() => {
                    console.log(tutorial);
                    if (tutorial) {
                      setTutorialMessage(true);
                      setTimeout(() => {
                        setTutorialMessage(false);
                        setTutorial(false);
                        localStorage.setItem("tutorial", "false");
                      }, 7000);
                    }
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    inputChange(
                      Math.floor(index / 3) * 3 + Math.floor(cellIndex / 3),
                      (index % 3) * 3 + (cellIndex % 3),
                      e.target.value,
                    )
                  }
                  onBlur={() =>
                    blur(
                      Math.floor(index / 3) * 3 + Math.floor(cellIndex / 3),
                      (index % 3) * 3 + (cellIndex % 3),
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      Math.floor(index / 3) * 3 + Math.floor(cellIndex / 3),
                      (index % 3) * 3 + (cellIndex % 3),
                    )
                  }
                  className={`${primaryColor} ${textColor} text-[3vh] rounded-[1.25vh] shadow-inner border-b-[1px] border-stone-50/5  place-items-center p-[1vh] text-center z-10 w-[8vh] h-[8vh] display-mode-transition outline-none`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className={"flex justify-between items-center w-full"}>
          <div className={"flex justify-start items-center gap-[1vh]"}>
            <button
              onClick={solve}
              disabled={solving}
              className={
                "group action-button bg-blue-500 active:bg-blue-400 text-blue-200 active:text-blue-100 border-[0.25vh] border-blue-400"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
                className={
                  "w-[2.75vh] fill-blue-200 group-active:fill-blue-100"
                }
              >
                <path d="M42,15H15c-1.654,0-3,1.346-3,3v6.359C12,25.715,12.686,26,13.26,26c1.769,0,2.551-2,6.203-2c4.005,0,8.262,2.804,8.262,8	s-4.257,8-8.262,8c-3.652,0-4.434-2-6.203-2C12.686,38,12,38.285,12,39.641V46c0,1.654,1.346,3,3,3h27c1.654,0,3-1.346,3-3v-6.621	C45,35.709,47.991,34,50.013,34c3.183,0,3.716,2,5.987,2c1.934,0,4-1.051,4-4s-2.066-4-4-4c-2.271,0-2.804,2-5.987,2	C47.991,30,45,28.291,45,24.621V18C45,16.346,43.654,15,42,15z M42,11c3.859,0,7,3.14,7,7v6.621C49,25.889,50.005,26,50.015,26	c1.698,0,2.324-2,5.985-2c4.71,0,8,3.29,8,8s-3.29,8-8,8c-3.662,0-4.288-2-5.985-2C50.005,38,49,38.111,49,39.379V46	c0,3.86-3.141,7-7,7H15c-3.859,0-7-3.14-7-7v-6.359C8,35.938,10.646,34,13.26,34c3.334,0,3.871,2,6.203,2	c1.474,0,4.262-0.836,4.262-4s-2.788-4-4.262-4c-2.332,0-2.87,2-6.203,2C10.646,30,8,28.062,8,24.359V18c0-3.86,3.141-7,7-7H42z"></path>
              </svg>
              {solving ? "Resolution..." : "Resoudre"}
            </button>
            <button
              onClick={() =>
                setGrid(
                  Array(9)
                    .fill(null)
                    .map(() => Array(9).fill(0)),
                )
              }
              disabled={solving}
              className={
                "group action-button bg-red-500 active:bg-red-400 text-red-200 active:text-red-100 border-[0.25vh] border-red-400"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
                className={"w-[2.75vh] fill-red-200 group-active:fill-red-100"}
              >
                <path d="M 28 7 C 25.243 7 23 9.243 23 12 L 23 15 L 13 15 C 11.896 15 11 15.896 11 17 C 11 18.104 11.896 19 13 19 L 15.109375 19 L 16.792969 49.332031 C 16.970969 52.510031 19.600203 55 22.783203 55 L 41.216797 55 C 44.398797 55 47.029031 52.510031 47.207031 49.332031 L 48.890625 19 L 51 19 C 52.104 19 53 18.104 53 17 C 53 15.896 52.104 15 51 15 L 41 15 L 41 12 C 41 9.243 38.757 7 36 7 L 28 7 z M 28 11 L 36 11 C 36.552 11 37 11.449 37 12 L 37 15 L 27 15 L 27 12 C 27 11.449 27.448 11 28 11 z M 19.113281 19 L 44.886719 19 L 43.212891 49.109375 C 43.153891 50.169375 42.277797 51 41.216797 51 L 22.783203 51 C 21.723203 51 20.846109 50.170328 20.787109 49.111328 L 19.113281 19 z M 32 23.25 C 31.033 23.25 30.25 24.034 30.25 25 L 30.25 45 C 30.25 45.966 31.033 46.75 32 46.75 C 32.967 46.75 33.75 45.966 33.75 45 L 33.75 25 C 33.75 24.034 32.967 23.25 32 23.25 z M 24.642578 23.251953 C 23.677578 23.285953 22.922078 24.094547 22.955078 25.060547 L 23.652344 45.146484 C 23.685344 46.091484 24.462391 46.835938 25.400391 46.835938 C 25.421391 46.835938 25.441891 46.835938 25.462891 46.835938 C 26.427891 46.801938 27.183391 45.991391 27.150391 45.025391 L 26.453125 24.939453 C 26.419125 23.974453 25.606578 23.228953 24.642578 23.251953 z M 39.355469 23.251953 C 38.388469 23.224953 37.580875 23.974453 37.546875 24.939453 L 36.849609 45.025391 C 36.815609 45.991391 37.571109 46.801938 38.537109 46.835938 C 38.558109 46.836938 38.578609 46.835938 38.599609 46.835938 C 39.537609 46.835938 40.314656 46.091484 40.347656 45.146484 L 41.044922 25.060547 C 41.078922 24.094547 40.321469 23.285953 39.355469 23.251953 z"></path>
              </svg>
              Effacer
            </button>
          </div>
          <button
            type={"button"}
            onClick={() => setSettings(!settings)}
            className={`${secondaryColor} active:bg-stone-300 dark:active:bg-stone-700 active:scale-95 [transition:_transform_200ms_ease-in-out,_background-color_200ms_ease-in-out] p-[1vh] rounded-[1.25vh] border-[0.25vh] border-stone-300 dark:border-stone-700 drop-shadow-xl`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 64 64"
              className={
                "w-[2.75vh] fill-stone-900 dark:fill-stone-100 display-mode-transition"
              }
            >
              <path d="M 29.054688 10 C 27.715688 10 26.571703 10.964203 26.345703 12.283203 L 25.763672 15.664062 C 25.457672 15.781062 25.152469 15.902156 24.855469 16.035156 L 22.058594 14.058594 C 20.830594 13.209594 19.383344 13.520328 18.527344 14.361328 L 14.361328 18.525391 C 13.414328 19.472391 13.288547 20.962641 14.060547 22.056641 L 16.035156 24.855469 C 15.901156 25.152469 15.781063 25.455719 15.664062 25.761719 L 12.283203 26.34375 C 10.963203 26.57075 10 27.715688 10 29.054688 L 10 34.945312 C 10 36.284312 10.964203 37.428297 12.283203 37.654297 L 15.664062 38.236328 C 15.781062 38.542328 15.902156 38.847531 16.035156 39.144531 L 14.058594 41.941406 C 13.286594 43.034406 13.414328 44.525656 14.361328 45.472656 L 18.525391 49.638672 C 19.609391 50.698672 21.124641 50.614453 22.056641 49.939453 L 24.855469 47.964844 C 25.152469 48.098844 25.455719 48.218938 25.761719 48.335938 L 26.34375 51.716797 C 26.57075 53.036797 27.715688 54 29.054688 54 L 34.945312 54 C 36.284312 54 37.428297 53.035797 37.654297 51.716797 L 38.236328 48.335938 C 38.542328 48.218937 38.847531 48.097844 39.144531 47.964844 L 41.941406 49.941406 C 42.766406 50.549406 44.343656 50.768672 45.472656 49.638672 L 49.638672 45.474609 C 50.585672 44.527609 50.711453 43.037359 49.939453 41.943359 L 47.964844 39.144531 C 48.098844 38.847531 48.218938 38.544281 48.335938 38.238281 L 51.716797 37.65625 C 53.036797 37.42925 54 36.284312 54 34.945312 L 54 29.054688 C 54 27.715688 53.035797 26.571703 51.716797 26.345703 L 48.335938 25.763672 C 48.218937 25.457672 48.097844 25.152469 47.964844 24.855469 L 49.941406 22.058594 C 50.713406 20.965594 50.585672 19.474344 49.638672 18.527344 L 45.474609 14.361328 C 44.417609 13.329328 42.952359 13.351547 41.943359 14.060547 L 39.144531 16.035156 C 38.847531 15.901156 38.544281 15.781063 38.238281 15.664062 L 37.65625 12.283203 C 37.42925 10.963203 36.284312 10 34.945312 10 L 29.054688 10 z M 30.214844 14 L 33.787109 14 C 33.848109 14 33.900156 14.043516 33.910156 14.103516 L 34.681641 18.589844 C 36.449641 19.224844 38.104844 19.894141 39.589844 20.619141 L 43.302734 17.996094 C 43.352734 17.961094 43.421844 17.966766 43.464844 18.009766 L 45.990234 20.537109 C 46.033234 20.580109 46.040859 20.647266 46.005859 20.697266 L 43.380859 24.412109 C 44.139859 26.017109 44.824156 27.649359 45.410156 29.318359 L 49.896484 30.091797 C 49.956484 30.101797 50 30.153844 50 30.214844 L 50 33.787109 C 50 33.848109 49.955531 33.900156 49.894531 33.910156 L 45.410156 34.681641 C 44.825156 36.350641 44.148859 37.985844 43.380859 39.589844 L 46.005859 43.304688 C 46.040859 43.354688 46.033234 43.421844 45.990234 43.464844 L 43.464844 45.992188 C 43.421844 46.035187 43.352734 46.040859 43.302734 46.005859 L 39.589844 43.382812 C 37.949844 44.153812 36.313641 44.829109 34.681641 45.412109 L 33.908203 49.896484 C 33.898203 49.956484 33.846156 50 33.785156 50 L 30.212891 50 C 30.151891 50 30.099844 49.955531 30.089844 49.894531 L 29.318359 45.410156 C 27.709359 44.851156 26.075156 44.184859 24.410156 43.380859 L 20.695312 46.005859 C 20.645312 46.040859 20.578156 46.033234 20.535156 45.990234 L 18.007812 43.464844 C 17.964813 43.421844 17.959141 43.352734 17.994141 43.302734 L 20.617188 39.589844 C 19.838187 37.924844 19.161891 36.288641 18.587891 34.681641 L 14.103516 33.908203 C 14.043516 33.898203 14 33.846156 14 33.785156 L 14 30.212891 C 14 30.151891 14.043516 30.100844 14.103516 30.089844 L 18.589844 29.316406 C 19.170844 27.680406 19.837141 26.045156 20.619141 24.410156 L 17.994141 20.695312 C 17.959141 20.645312 17.966766 20.578156 18.009766 20.535156 L 20.535156 18.007812 C 20.578156 17.964813 20.647266 17.959141 20.697266 17.994141 L 24.410156 20.617188 C 25.958156 19.874187 27.599359 19.201891 29.318359 18.587891 L 30.091797 14.103516 C 30.101797 14.043516 30.153844 14 30.214844 14 z M 32 23 C 27.029 23 23 27.029 23 32 C 23 36.971 27.029 41 32 41 C 36.971 41 41 36.971 41 32 C 41 27.029 36.971 23 32 23 z M 32 27 C 34.761 27 37 29.239 37 32 C 37 34.761 34.761 37 32 37 C 29.239 37 27 34.761 27 32 C 27 29.239 29.239 27 32 27 z"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

const Terminal = () => {
  const {
      primaryColor,
      secondaryColor,
      solving,
      setSolving,
      setGrid,
      textColor,
      placeholder,
      settings,
      setSettings,
    }: AppContextType = useAppContext(),
    [input, setInput] = useState<string>(""),
    [history, setHistory] = useState<string[]>([]),
    inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [input, history]);

  useEffect(() => {
    // @ts-ignore
    const cleanupSolved = window.electronAPI.addListener(
      "solved",
      (e: ChangeEvent, solvedPuzzle: Array<Array<number>>) => {
        setGrid(solvedPuzzle);
        setHistory((prev) => [
          ...prev,
          `Sudokiste > ${solvedPuzzle.flat().join("")}`,
        ]);
        setSolving(false);
        setInput("");
      },
    );

    // @ts-ignore
    const cleanupError = window.electronAPI.addListener(
      "error",
      (e: ChangeEvent, error: string) => {
        setHistory((prev) => [...prev, `Sudokiste > ${error}`]);
        setSolving(false);
        setInput("");
      },
    );

    return () => {
      cleanupSolved();
      cleanupError();
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        return;
      }

      setHistory((prev) => [...prev, `Utilisateur > ${input}`]);
      switch (input.trim().toLowerCase()) {
        case "aide" || "?" || "help":
          setHistory((prev: string[]) => [
            ...prev,
            "Sudokiste > <span class='underline'>Commandes disponibles:</span>",
            "<br />",
            "&#x2022; parametres &mdash; Affiche les paramètres",
            "&#x2022; aide &mdash; Affiche cette liste d'aide",
            "&#x2022; effacer &mdash; Efface l'historique",
            "&#x2022; man &mdash; Affiche le manuel d'utilisation",
            "&#x2022; whoami &mdash; Affiche des informations sur l'utilisateur",
            "<br />",
          ]);
          setInput("");
          return;
        case "effacer":
          setHistory([]);
          setInput("");
          return;
        case "parametres":
          setHistory((prev) => [...prev]);
          setSettings(!settings);
          setInput("");
          return;
        case "man":
          setHistory((prev) => [
            ...prev,
            "Sudokiste > Manuel d'utilisation:",
            "<br />",
            "<span class='underline'>Règles du jeu:</span>",
            "Le Sudoku est un jeu de puzzle où vous remplissez une grille de 9x9 avec des chiffres. Chaque ligne, colonne et carré 3x3 doit contenir tous les chiffres de 1 à 9 sans répétition. Vous commencez avec certains chiffres déjà placés et vous devez remplir les cases vides. Le but est de remplir la grille entière correctement.",
            "<br />",
            "<span class='underline'>Usage en mode terminal:</span>",
            "Pour resoudre un Sudoku, tapez le puzzle sous forme de 81 chiffres (0 pour les cases vides), commencant par la premiere ligne, a partir de la gauche vers la droite, puis la deuxieme ligne, et ainsi de suite (en sens de lecture).",
            "<br /><br />",
            "<i>TIP: Lorsque la solution est trouvee, elle sera affichee ici, ainsi que dans le mode graphique!</i>",
          ]);
          setInput("");
          return;
        case "whoami":
          setHistory((prev) => [
            ...prev,
            "Sudokiste > Alors? On aurait perdu son acte de naissance?",
          ]);
          setInput("");
          return;
        default:
          if (input.trim().length !== 81) {
            setHistory((prev) => [
              ...prev,
              `Sudokiste > Votre commande est invalide. Veuillez consulter l'aide pour plus d'informations (commande "aide")`,
            ]);
            setInput("");
            return;
          }
          setSolving(true);
          const puzzle = Array.from({ length: 9 }, (_, i) =>
            Array.from({ length: 9 }, (_, j) => parseInt(input[9 * i + j], 10)),
          );
          if (!gridValidation(puzzle)) {
            setHistory((prev) => [
              ...prev,
              'Sudokiste > Sudoku invalide. Veuillez consulter la règle du jeu (commande "man").',
            ]);
            setSolving(false);
            setInput("");
            return;
          } else {
            // @ts-ignore
            window.electronAPI.sendSudoku(puzzle);
          }
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (e.target.value.length <= 81) {
      setInput(e.target.value);
    }
  };

  return (
    <section
      className={`${primaryColor} ${textColor} display-mode-transition w-full h-full flex justify-center items-center text-digital`}
    >
      <div
        className={`${secondaryColor} display-mode-transition rounded-[1.25vh] drop-shadow-2xl w-2/3 h-5/6 px-[4vh] py-[4vh] overflow-auto`}
      >
        {history.map((line, index) => (
          <p
            key={index}
            className={"break-words"}
            dangerouslySetInnerHTML={{ __html: line }}
          />
        ))}
        {!solving && (
          <div className={"flex justify-start items-baseline w-full h-min"}>
            <p className={"whitespace-nowrap"}>Utilisateur &gt;&nbsp;</p>
            <textarea
              ref={inputRef}
              className={`bg-transparent ${placeholder} display-mode-transition outline-none resize-none w-full`}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Cliquez ici et commencez à taper..."
              disabled={solving}
            />
          </div>
        )}
      </div>
    </section>
  );
};

const View = () => {
  const { terminal } = useAppContext();
  return terminal ? <Terminal /> : <UI />;
};

export default View;
