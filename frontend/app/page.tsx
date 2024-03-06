"use client";

import { AppProvider } from "@/app/Context";
import View from "@/components/view";
import Settings from "@/components/settings";
import { useState } from "react";

const Home = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  return (
    <AppProvider>
      <main
        className={`${darkMode ? "dark" : ""} m-auto w-screen h-screen flex justify-center items-center display-mode-transition`}
      >
        <Settings
          Theme={{
            darkMode: darkMode,
            setDarkMode: setDarkMode,
          }}
        />
        <View />
      </main>
    </AppProvider>
  );
};

export default Home;
