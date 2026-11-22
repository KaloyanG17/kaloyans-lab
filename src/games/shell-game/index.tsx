"use client";

import dynamic from "next/dynamic";

/** WebGL only runs in the browser, so the game is never server-rendered. */
const ShellGame = dynamic(() => import("./ShellGame"), { ssr: false });

export default ShellGame;
