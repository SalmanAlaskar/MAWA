/** Presentational toggle (search filters aren't wired to live query state yet — see README). */
export function Switch({ on = false }: { on?: boolean }) {
  return (
    <div className={`relative h-[19px] w-[34px] shrink-0 rounded-full ${on ? 'bg-accent' : 'bg-line'}`}>
      <span
        className={`absolute top-0.5 h-[15px] w-[15px] rounded-full bg-white transition-all ${
          on ? 'start-[17px]' : 'start-0.5'
        }`}
      />
    </div>
  );
}
