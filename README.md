# Kaloyan's Lab

A collection of small, polished, playable experiments, built with **Next.js 15 · React 19 · TypeScript · React Three Fiber**.

Design language: Swiss grid typography × liquid glass.

## Games

| #  | Game                                   | Notes |
|----|----------------------------------------|-------|
| 01 | [Shell Game](src/games/shell-game)     | 3D, honest take on the classic. Hide the pea, shuffle for five seconds, find it. |

### Shell Game

Built from the [app-ideas Shell Game spec](https://github.com/florinpop17/app-ideas/blob/master/Projects/3-Advanced/Shell-Game.md):

- Click a shell to hide the pea under it; the pea rolls under and the shells come down
- **Shuffle** runs a 5-second, accelerating sequence of arcing swaps. The pea always travels with its shell, so the game is honest.
- Click shells to lift them until the pea is found; the winning shell glows and spins
- Score panel: games played, wins (first-try finds only), win rate and streak, saved in `localStorage`
- Keyboard: `1` `2` `3` pick shells by position, `Space` shuffles

## Run locally

Requires Node 18.18+.

```bash
npm install
npm run dev
```

## Adding a game

1. Add an entry to [`src/lib/games.ts`](src/lib/games.ts)
2. Put the game under `src/games/<slug>/`
3. Add a route at `src/app/games/<slug>/page.tsx`

## Credits

3D models by [Polyfork](https://polyfork.dev), licensed under CC BY 4.0:

- [Leather Dice Cup](https://polyfork.dev/asset/leather-dice-cup-f99a7e)
- [Gaming Table](https://polyfork.dev/asset/gaming-table-5ca9d5)
- [Gold Coin Stack](https://polyfork.dev/asset/gold-coin-stack-a9ef52)
