import type { Metadata } from "next";
import ShellGame from "@/games/shell-game";
import "@/games/shell-game/shell-game.css";

export const metadata: Metadata = {
  title: "Shell Game",
  description: "A 3D, honest take on the classic shell game. Hide the pea, shuffle, and find it.",
};

export default function ShellGamePage() {
  return <ShellGame />;
}
