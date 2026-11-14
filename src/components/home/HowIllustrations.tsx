import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { CategoryId } from "@/config/booking";

/** A four-point sparkle centred on (x, y). */
const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`;

const BRAND = "#0f5e73";
const INK = "#15181c";
const AMBER = "#e8a300";
const BLUE = "#2b4a8a";
const GREEN = "#1f7a4d";

function Ac() {
  return (
    <>
      <circle cx="160" cy="58" r="46" fill="#fff" opacity=".55" />
      <circle cx="30" cy="205" r="34" fill="#fff" opacity=".4" />
      {/* the unit, high on the wall */}
      <rect x="22" y="44" width="156" height="58" rx="14" fill="#fff" stroke={BRAND} strokeWidth="3" />
      <rect x="34" y="84" width="132" height="8" rx="4" fill={BRAND} opacity=".18" />
      <path d="M40 88h120" stroke={BRAND} strokeWidth="2" strokeLinecap="round" />
      <rect x="38" y="56" width="52" height="8" rx="4" fill={BRAND} opacity=".12" />
      <circle cx="152" cy="62" r="4.5" fill={AMBER} />
      {/* cool air */}
      {[52, 100, 148].map((x, i) => (
        <path
          key={x}
          d={`M${x} 112 q-14 22 0 44 t0 44`}
          fill="none"
          stroke={BRAND}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 9"
          opacity={0.75 - i * 0.12}
        />
      ))}
      {/* snowflakes */}
      {[
        [70, 150, 9],
        [128, 178, 11],
        [38, 196, 7],
        [160, 126, 7],
      ].map(([x, y, r]) => (
        <g key={`${x}${y}`} stroke={BRAND} strokeWidth="2.4" strokeLinecap="round">
          <path d={`M${x} ${y - r}V${y + r}M${x - r} ${y}H${x + r}M${x - r * 0.7} ${y - r * 0.7}L${x + r * 0.7} ${y + r * 0.7}M${x + r * 0.7} ${y - r * 0.7}L${x - r * 0.7} ${y + r * 0.7}`} />
        </g>
      ))}
    </>
  );
}

function Electrical() {
  return (
    <>
      <circle cx="40" cy="60" r="40" fill="#fff" opacity=".5" />
      <circle cx="170" cy="210" r="44" fill="#fff" opacity=".4" />
      {/* wall plate and socket */}
      <rect x="22" y="92" width="74" height="74" rx="14" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="34" y="104" width="50" height="50" rx="25" fill="#f4ead0" stroke={INK} strokeWidth="2" />
      <rect x="45" y="116" width="6" height="14" rx="3" fill={INK} />
      <rect x="67" y="116" width="6" height="14" rx="3" fill={INK} />
      <rect x="55" y="136" width="8" height="8" rx="4" fill={INK} />
      {/* plug coming in */}
      <path d="M96 114h22" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M96 146h22" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <rect x="116" y="100" width="44" height="60" rx="12" fill={BRAND} />
      <rect x="124" y="110" width="10" height="40" rx="5" fill="#fff" opacity=".25" />
      <path d="M160 130c26 0 22 38 6 52s-22 26 -18 40" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      {/* the spark */}
      <path d="M104 40 82 78h18l-8 30 30-42h-18l10-26Z" fill={AMBER} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d={star(150, 52, 9)} fill={INK} />
      <path d={star(40, 28, 6)} fill={INK} />
      <path d="M62 62 50 54M70 52 66 38" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Plumbing() {
  return (
    <>
      <circle cx="36" cy="200" r="40" fill="#fff" opacity=".5" />
      <circle cx="170" cy="50" r="38" fill="#fff" opacity=".45" />
      {/* pipe, elbow and spout */}
      <path d="M-4 64H112q34 0 34 34v6" fill="none" stroke={BLUE} strokeWidth="22" strokeLinecap="round" />
      <path d="M-4 64H112q34 0 34 34v6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".25" transform="translate(0 -5)" />
      <rect x="28" y="48" width="12" height="32" rx="4" fill={INK} />
      <rect x="76" y="48" width="12" height="32" rx="4" fill={INK} />
      {/* tap handle */}
      <rect x="104" y="30" width="8" height="18" rx="3" fill={INK} />
      <rect x="86" y="22" width="44" height="12" rx="6" fill={AMBER} stroke={INK} strokeWidth="3" />
      {/* nozzle */}
      <rect x="132" y="108" width="28" height="12" rx="5" fill={INK} />
      {/* drops */}
      {[
        [146, 138, 1],
        [146, 166, 0.82],
        [146, 192, 0.64],
      ].map(([x, y, s]) => (
        <path
          key={y}
          transform={`translate(${x} ${y}) scale(${s})`}
          d="M0 -12 C 8 0 10 6 0 12 C -10 6 -8 0 0 -12Z"
          fill="#5b86d6"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
      {/* ripples */}
      <ellipse cx="146" cy="222" rx="30" ry="7" fill="none" stroke={BLUE} strokeWidth="3" opacity=".7" />
      <ellipse cx="146" cy="222" rx="16" ry="4" fill="none" stroke={BLUE} strokeWidth="3" opacity=".5" />
      <path d={star(40, 120, 8)} fill={BLUE} />
      <path d={star(70, 160, 5)} fill={BLUE} opacity=".6" />
    </>
  );
}

function Cleaning() {
  return (
    <>
      <circle cx="165" cy="205" r="42" fill="#fff" opacity=".5" />
      <circle cx="30" cy="48" r="34" fill="#fff" opacity=".45" />
      {/* spray bottle */}
      <rect x="82" y="116" width="70" height="104" rx="18" fill="#fff" stroke={GREEN} strokeWidth="3" />
      <rect x="82" y="168" width="70" height="52" rx="16" fill={GREEN} opacity=".22" />
      <rect x="94" y="136" width="46" height="26" rx="8" fill={GREEN} opacity=".12" />
      <rect x="104" y="92" width="26" height="28" rx="6" fill={INK} />
      <path d="M98 92h-6c-10 0-14-10-4-16l16-10h42c8 0 8 12 0 12h-26Z" fill={GREEN} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M150 120c10 2 16 10 16 20" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      {/* mist */}
      {[
        [66, 78, 4],
        [52, 66, 5],
        [44, 84, 3.5],
        [32, 72, 6],
        [58, 98, 3],
        [22, 92, 4],
      ].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" stroke={GREEN} strokeWidth="2.4" />
      ))}
      {/* sparkles */}
      <path d={star(40, 140, 14)} fill={AMBER} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={star(176, 70, 11)} fill={AMBER} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={star(24, 190, 7)} fill={GREEN} />
      <path d={star(168, 170, 6)} fill={GREEN} />
    </>
  );
}

const TILES: { id: CategoryId; label: string; bg: string; art: () => React.JSX.Element }[] = [
  { id: "ac", label: "AC service", bg: "bg-brand-tint", art: Ac },
  { id: "electrical", label: "Electrical", bg: "bg-amber-tint", art: Electrical },
  { id: "plumbing", label: "Plumbing", bg: "bg-[#dfe7f6]", art: Plumbing },
  { id: "cleaning", label: "Cleaning", bg: "bg-success-tint", art: Cleaning },
];

/** Four drawn scenes, one per kind of job, in the site colours. Decorative: each tile is labelled in words. */
export function HowIllustrations() {
  return (
    <ul className="mt-8 grid max-w-md grid-cols-2 gap-3 xl1:mt-10 xl1:gap-4 xl3:max-w-xl">
      {TILES.map(({ id, label, bg, art: Art }) => (
        <li
          key={id}
          className={`group relative aspect-[4/5] overflow-hidden rounded-md border border-line ${bg} even:mt-6 xl1:even:mt-8`}
        >
          <svg
            viewBox="0 0 200 250"
            aria-hidden="true"
            className="size-full transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          >
            {/* lifted so the label below never covers the scene */}
            <g transform="translate(0 -16)">
              <Art />
            </g>
          </svg>
          <span className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 rounded-md bg-paper/95 px-2.5 py-1.5 text-sm font-semibold shadow-sm xl1:text-base">
            <CategoryIcon category={id} className="size-4 text-brand xl1:size-5" />
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
