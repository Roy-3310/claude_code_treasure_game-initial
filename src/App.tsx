import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import closedChest from "./assets/treasure_closed.png";
import treasureChest from "./assets/treasure_opened.png";
import skeletonChest from "./assets/treasure_opened_skeleton.png";
import keyCursor from "./assets/key.png";
import chestOpenSound from "./audios/chest_open.mp3";
import evilLaughSound from "./audios/chest_open_with_evil_laugh.mp3";
import { useAuth } from "./hooks/useAuth";
import { AuthModal } from "./components/AuthModal";
import { UserHeader } from "./components/UserHeader";
import * as api from "./lib/api";

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

const ROMAN = ["I", "II", "III"];

const DUST = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.5 + 2) % 100}%`,
  delay: `${(i * 1.7) % 14}s`,
  duration: `${9 + ((i * 1.9) % 9)}s`,
  width: i % 4 === 0 ? "3px" : "2px",
  height: i % 4 === 0 ? "3px" : "2px",
}));

export default function App() {
  const { user, isGuest, signIn, signUp, signOut, continueAsGuest } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameEnded && user) {
      api.saveScore(score).catch(() => {});
    }
  }, [gameEnded, user]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    const box = boxes.find((b) => b.id === boxId);
    if (box && !box.isOpen) {
      new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
    }
    setBoxes((prevBoxes) => {
      const updatedBoxes = prevBoxes.map((box) => {
        if (box.id === boxId && !box.isOpen) {
          setScore((prev) => (box.hasTreasure ? prev + 100 : prev - 50));
          return { ...box, isOpen: true };
        }
        return box;
      });
      const treasureFound = updatedBoxes.some((b) => b.isOpen && b.hasTreasure);
      const allOpened = updatedBoxes.every((b) => b.isOpen);
      if (treasureFound || allOpened) setGameEnded(true);
      return updatedBoxes;
    });
  };

  const treasureFound = useMemo(
    () => boxes.some((b) => b.isOpen && b.hasTreasure),
    [boxes],
  );

  return (
    <div className="dungeon-bg vignette min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* CRT scanlines */}
      <div className="scanlines" />

      {/* Floating dust particles */}
      {DUST.map((d) => (
        <div
          key={d.id}
          className="dust"
          style={{
            left: d.left,
            bottom: 0,
            width: d.width,
            height: d.height,
            animationDuration: d.duration,
            animationDelay: d.delay,
          }}
        />
      ))}

      {/* Torches */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 torch torch-left select-none z-10">
        🔥
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 torch torch-right select-none z-10">
        🔥
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={!user && !isGuest}
        onSignIn={signIn}
        onSignUp={signUp}
        onGuest={continueAsGuest}
      />

      <div className="w-full max-w-3xl relative z-10">
        {/* User header */}
        {user && (
          <div className="flex justify-center mb-4">
            <UserHeader username={user.username} onSignOut={signOut} />
          </div>
        )}

        {/* ── Title ── */}
        <div className="text-center mb-10">
          <div className="inline-block w-full max-w-xl">
            <div className="pixel-divider mb-5" />
            <h1 className="pixel-font text-base md:text-xl text-yellow-300 shimmer-gold mb-3 leading-loose tracking-widest">
              ⚔ DUNGEON HUNT ⚔
            </h1>
            <div className="pixel-divider mb-5" />
            <p className="font-mono text-amber-300/80 text-xs md:text-sm tracking-[0.2em] uppercase mb-2">
              Seek the treasure, brave soul
            </p>
            <p className="font-mono text-amber-700/60 text-xs tracking-widest">
              💰 +$100 gold &nbsp;·&nbsp; 💀 -$50 cursed
            </p>
          </div>
        </div>

        {/* ── Score HUD ── */}
        <div className="flex justify-center mb-10">
          <div className="dungeon-panel px-8 py-4 flex items-center gap-6">
            <span className="font-mono text-amber-600/70 text-xs tracking-widest">
              SCORE
            </span>
            <span
              className={`pixel-font text-lg leading-none ${score >= 0 ? "text-yellow-300 text-glow-gold" : "text-red-400 text-glow-red"}`}
            >
              ${score}
            </span>
            <span
              className={`score-badge px-3 py-1 ${score > 0 ? "badge-win" : score < 0 ? "badge-loss" : "badge-neutral"}`}
            >
              {score > 0 ? "▲ WIN" : score < 0 ? "▼ LOSS" : "— TIE"}
            </span>
          </div>
        </div>

        {/* ── Chests ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {boxes.map((box, i) => (
            <motion.div
              key={box.id}
              className={`chest-card ${!box.isOpen ? "chest-card-hover" : ""} flex flex-col items-center p-6 rounded-sm`}
              style={{
                cursor: box.isOpen
                  ? "default"
                  : `url(${keyCursor}) 16 16, pointer`,
              }}
              whileHover={{
                scale: box.isOpen ? 1 : 1.04,
                y: box.isOpen ? 0 : -6,
              }}
              whileTap={{ scale: box.isOpen ? 1 : 0.97 }}
              onClick={() => openBox(box.id)}
            >
              {/* Roman numeral label */}
              <div
                className={`chest-numeral mb-5 tracking-widest ${
                  box.isOpen
                    ? box.hasTreasure
                      ? "text-yellow-400 text-glow-gold"
                      : "text-red-400 text-glow-red"
                    : "text-amber-700/70"
                }`}
              >
                CHEST {ROMAN[i]}
              </div>

              {/* Chest image with flip */}
              <div className="relative">
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: box.isOpen ? 180 : 0,
                    scale: box.isOpen ? 1.08 : 1,
                  }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative"
                >
                  <img
                    src={
                      box.isOpen
                        ? box.hasTreasure
                          ? treasureChest
                          : skeletonChest
                        : closedChest
                    }
                    alt={
                      box.isOpen
                        ? box.hasTreasure
                          ? "Treasure!"
                          : "Skeleton!"
                        : "Chest"
                    }
                    className="w-40 h-40 object-contain"
                    style={{
                      filter:
                        box.isOpen && box.hasTreasure
                          ? "drop-shadow(0 0 12px rgba(255,215,0,0.6))"
                          : box.isOpen
                            ? "drop-shadow(0 0 10px rgba(180,0,0,0.5))"
                            : "drop-shadow(0 4px 12px rgba(0,0,0,0.8))",
                    }}
                  />
                </motion.div>

                {/* Pop-up effect on open */}
                <AnimatePresence>
                  {box.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.6 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl"
                    >
                      {box.hasTreasure ? (
                        <span className="animate-bounce inline-block">
                          ✨💰✨
                        </span>
                      ) : (
                        <span className="animate-pulse inline-block">
                          💀👻💀
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Result / prompt */}
              <div className="mt-5 h-8 flex items-center justify-center">
                {box.isOpen ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                    className={`pixel-font text-xs ${box.hasTreasure ? "text-yellow-300 text-glow-gold" : "text-red-400 text-glow-red"}`}
                  >
                    {box.hasTreasure ? "+$100 GOLD" : "-$50 CURSED"}
                  </motion.div>
                ) : (
                  <div className="font-mono text-amber-700/55 text-xs tracking-[0.18em] label-pulse">
                    [ CLICK TO OPEN ]
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Game Over ── */}
        <AnimatePresence>
          {gameEnded && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <div className="dungeon-panel p-8 mb-6 rounded-sm">
                <div className="pixel-divider mb-6" />
                <h2
                  className={`pixel-font text-sm md:text-base mb-4 leading-loose ${
                    treasureFound
                      ? "text-yellow-300 shimmer-gold"
                      : "text-red-400 text-glow-red"
                  }`}
                >
                  {treasureFound ? "⚔  VICTORY!  ⚔" : "☠  DEFEATED  ☠"}
                </h2>
                <p className="font-mono text-amber-400/80 text-sm mb-1">
                  FINAL SCORE:{" "}
                  <span
                    className={`${score >= 0 ? "text-yellow-300" : "text-red-400"} font-bold`}
                  >
                    ${score}
                  </span>
                </p>
                <p className="font-mono text-amber-700/60 text-xs mt-3 tracking-wide">
                  {treasureFound
                    ? "✦ The treasure is yours, legendary hunter! ✦"
                    : "✦ The dungeon claims another soul... ✦"}
                </p>
                <div className="pixel-divider mt-6" />
              </div>

              <button onClick={() => initializeGame()} className="pixel-btn">
                ▶ PLAY AGAIN ▶
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
