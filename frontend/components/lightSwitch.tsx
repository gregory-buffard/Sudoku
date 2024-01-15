const LightSwitch = ({status, setStatus}: {status: boolean, setStatus: React.SetStateAction<any>}): JSX.Element => {
    return (
        <button onClick={() => setStatus(!status)}
            className={`absolute group top-[2vh] right-[2vh] w-[6vh] h-[6vh] bg-stone-950 dark:bg-stone-100 rounded-[1.25vh] p-[1vh] flex justify-center items-center display-mode-transition`}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 64 64" className={`w-full group-active:w-2/3 ${status ? 'fill-green-400 [filter:_drop-shadow(0_0_0.5vh_#4ade80)]' : 'fill-red-400 [filter:_drop-shadow(0_0_0.5vh_#f87171)]'} [transition:_fill_1s_ease-in-out,_filter_1s_ease-in-out,_width_100ms_ease-in-out]`}>
                <path
                    d="M 32 7 C 30.896 7 30 7.896 30 9 L 30 27 C 30 28.104 30.896 29 32 29 C 33.104 29 34 28.104 34 27 L 34 9 C 34 7.896 33.104 7 32 7 z M 20.970703 13.324219 C 20.585596 13.320967 20.194234 13.427875 19.849609 13.65625 C 13.681609 17.74925 10 24.607 10 32 C 10 44.131 19.869 54 32 54 C 44.131 54 54 44.131 54 32 C 54 24.607 50.317437 17.74925 44.148438 13.65625 C 43.229437 13.04625 41.988906 13.29875 41.378906 14.21875 C 40.767906 15.13875 41.018453 16.379234 41.939453 16.990234 C 46.986453 20.339234 50 25.951 50 32 C 50 41.925 41.925 50 32 50 C 22.075 50 14 41.925 14 32 C 14 25.951 17.014547 20.339234 22.060547 16.990234 C 22.981547 16.380234 23.232094 15.13875 22.621094 14.21875 C 22.239844 13.64375 21.612549 13.329639 20.970703 13.324219 z"></path>
            </svg>
        </button>
    )
}

export default LightSwitch;