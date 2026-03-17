interface UserHeaderProps {
  username: string;
  onSignOut: () => void;
}

export function UserHeader({ username, onSignOut }: UserHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-amber-400/80 tracking-widest border border-amber-800/50 bg-amber-950/40 px-3 py-1">
        ⚔ {username}
      </span>
      <button
        onClick={onSignOut}
        className="font-mono text-xs text-amber-700/70 hover:text-amber-400 tracking-widest border border-amber-900/40 px-3 py-1 transition-colors hover:border-amber-700/60 bg-transparent"
      >
        SIGN OUT
      </button>
    </div>
  );
}
