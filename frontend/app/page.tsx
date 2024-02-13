'use client';

import {useState} from "react";
import axios from "axios";
import LightSwitch from "@/components/lightSwitch";

const Home = () => {
  const initGrid = Array(9).fill(null).map(() => Array(9).fill(0)),
      [grid, setGrid] = useState(initGrid),
      [lightSwitch, setLightSwitch] = useState<boolean>(true),
      [selectedFile, setSelectedFile] = useState<File | null>(null),
      [solving, setSolving] = useState<boolean>(false);

  const inputChange = (row: number, col: number, value: string): void => {
    if (value === '' || (/^[1-9]$/).test(value)) {
      const newGrid = [...grid];
      newGrid[row][col] = value ? parseInt(value) : 0;
      setGrid(newGrid);
    }
  };

  const solve = async (): Promise<void> => {
    setSolving(true);
    try {
      const res = await axios.post('http://localhost:5000/solve', {board: grid});
      console.log('HERE', res)
      setGrid(res.data.solution);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err.response?.data.error || 'Une erreur est survenue';
        alert(error);
      } else {
        alert('Une erreur est survenue');
      }
    } finally {
      setSolving(false);
    }
  }

  const fileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file && file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        setSelectedFile(file);
      } else {
        alert('Veuillez sélectionner une image au format png ou jpg');
        setSelectedFile(null);
      }
    }
  }

  const upload = async (): Promise<void> => {
    if (!selectedFile) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setSolving(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await axios.post('http://localhost:5000/solve-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('=================================================================')
      console.log('HERE', res.data.solution)
      setGrid(res.data.solution);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err.response?.data.error || 'Une erreur est survenue';
        alert(error);
      } else {
        alert('Une erreur est survenue');
      }
    } finally {
        setSolving(false);
    }
  }

  return (
    <main className={`${lightSwitch ? '' : 'dark'} m-auto flex justify-center items-center display-mode-transition`}>
      <LightSwitch status={lightSwitch} setStatus={setLightSwitch} />
      <div className={'w-screen h-screen bg-stone-100 dark:bg-stone-950 flex justify-center items-center display-mode-transition'}>
        <div className={'w-max h-full flex flex-col justify-center items-start gap-[3vh]'}>
          <div
              className={'grid grid-cols-9 gap-[1vh] text-[3vh] text-stone-950 dark:text-stone-100 font-medium display-mode-transition'}>
            {grid.map((row, i) => row.map((cell, j) => (
                <input key={`${i}-${j}`} type={'number'} min={'1'} max={'9'} value={cell || ''}
                       onChange={(e) => inputChange(i, j, e.target.value)}
                       className={`bg-stone-200 dark:bg-stone-800 rounded-[1.25vh] shadow-inner border-b-[1px] border-stone-50/5 justify-self-center place-items-center p-[1vh] pl-[2.5vh] text-center z-0 w-[8vh] h-[8vh] display-mode-transition outline-none`}/>
            )))}
          </div>
          <div className={'flex justify-start items-center gap-[1vh]'}>
            <button onClick={solve} disabled={solving}
                    className={'bg-blue-400 dark:bg-blue-800 text-blue-200 dark:text-blue-400 text-[2vh] px-[1.5vh] py-[1vh] rounded-[1.25vh] display-mode-transition font-medium'}>
              {solving ? 'Resolution...' : 'Resoudre'}
            </button>
            {solving ? <></> :<>
                <button onClick={() => setGrid(initGrid)} disabled={solving}
                                       className={'bg-red-400 dark:bg-red-800 text-red-200 dark:text-red-400 text-[2vh] px-[1.5vh] py-[1vh] rounded-[1.25vh] display-mode-transition font-medium'}>Effacer</button>
                <div>
                  <input type={'file'} onChange={fileChange} />
                  <button onClick={upload}>Upload and solve</button>
                </div>
            </>
            }
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
