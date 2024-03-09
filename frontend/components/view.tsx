import { useAppContext, AppContextType } from "@/app/Context";
import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent } from "react";

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
  }: AppContextType = useAppContext();

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

  const inputChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ): void => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    newGrid[rowIndex][colIndex] = value ? parseInt(value) : 0;
    setGrid(newGrid);
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
        alert(error);
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

    setSolving(true);
    const puzzle = format(grid);
    // @ts-ignore
    window.electronAPI.sendSudoku(puzzle);
  };

  return (
    <section
      className={`${primaryColor} display-mode-transition w-full h-full flex justify-center items-center`}
    >
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
                  type="number"
                  min="1"
                  max="9"
                  value={cell || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    inputChange(
                      Math.floor(index / 3) * 3 + Math.floor(cellIndex / 3),
                      (index % 3) * 3 + (cellIndex % 3),
                      e.target.value,
                    )
                  }
                  className={`${primaryColor} ${textColor} text-[3vh] rounded-[1.25vh] shadow-inner border-b-[1px] border-stone-50/5 justify-self-center place-items-center p-[1vh] pl-[2.5vh] text-center z-0 w-[8vh] h-[8vh] display-mode-transition outline-none`}
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
      grid,
      setGrid,
      textColor,
      placeholder,
      settings,
      setSettings,
    }: AppContextType = useAppContext(),
    [input, setInput] = useState<string>(""),
    [history, setHistory] = useState<string[]>([]),
    inputRef = useRef<HTMLTextAreaElement>(null),
    whoamiPool: string[] = [
      "I live in the American Gardens Building on West 81st Street on the 11th floor. My name is Patrick Bateman. I’m 27 years old. I believe in taking care of myself and a balanced diet and rigorous exercise routine. In the morning if my face is a little puffy I’ll put on an ice pack while doing stomach crunches. I can do 1000 now. After I remove the ice pack I use a deep pore cleanser lotion. In the shower I use a water activated gel cleanser, then a honey almond body scrub, and on the face an exfoliating gel scrub. Then I apply an herb-mint facial mask which I leave on for 10 minutes while I prepare the rest of my routine. I always use an after shave lotion with little or no alcohol, because alcohol dries your face out and makes you look older. Then moisturizer, then an anti-aging eye balm followed by a final moisturizing protective lotion. There is an idea of a Patrick Bateman, some kind of abstraction, but there is no real me, only an entity, something illusory, and though I can hide my cold gaze and you can shake my hand and feel flesh gripping yours and maybe you can even sense our lifestyles are probably comparable: I simply am not there.",
      "La Matrice est un systeme, Neo. Ce systeme est notre ennemi. Mais quand vous etes a l'interieur, vous regardez autour de vous, que voyez-vous ? Des hommes d'affaires, des enseignants, des avocats, des charpentiers.",
      "Je suis Sudokiste ! La cle pour vaincre tous les Sudokus du monde.",
    ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

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
        case "aide":
          setHistory((prev: string[]) => [
            ...prev,
            "Sudokiste > Commandes disponibles:",
            "parametres - Affiche les parametres",
            "aide - Affiche cette liste d'aide",
            "effacer - Efface l'historique",
            "manuel - Affiche le manuel d'utilisation",
            "whoami - Affiche des informations sur l'utilisateur",
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
        case "manuel":
          setHistory((prev) => [
            ...prev,
            "Sudokiste > Pour resoudre un Sudoku, tapez le puzzle sous forme de 81 chiffres (0 pour les cases vides).",
            "TIP: Lorsque la solution est trouvee, elle sera affichee ici, ainsi que dans le mode graphique!",
          ]);
          setInput("");
          return;
        case "whoami":
          setHistory((prev) => [
            ...prev,
            `Sudokiste > ${whoamiPool[Math.floor(Math.random() * whoamiPool.length)]}`,
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
          // @ts-ignore
          window.electronAPI.sendSudoku(puzzle);
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
          <p key={index} className={"break-words"}>
            {line}
          </p>
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
              placeholder="Type a Sudoku puzzle as 81 characters..."
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
