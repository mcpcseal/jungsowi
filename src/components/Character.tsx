export type Mood = 'neutral' | 'happy' | 'shocked' | 'crying';

interface Expression {
  mouth: string;
  eyebrowL: string;
  eyebrowR: string;
}

interface CharacterProps {
  mood?: Mood;
  size?: number;
}

export default function Character({ mood = 'neutral', size = 120 }: CharacterProps) {
  const expressions: Record<Mood, Expression> = {
    neutral: { mouth: 'M44,68 Q50,72 56,68', eyebrowL: 'M38,50 L48,48', eyebrowR: 'M52,48 L62,50' },
    happy:   { mouth: 'M42,66 Q50,76 58,66', eyebrowL: 'M38,48 L48,46', eyebrowR: 'M52,46 L62,48' },
    shocked: { mouth: 'M45,68 Q50,78 55,68', eyebrowL: 'M36,47 L46,50', eyebrowR: 'M54,50 L64,47' },
    crying:  { mouth: 'M44,72 Q50,66 56,72', eyebrowL: 'M38,52 L48,54', eyebrowR: 'M52,54 L62,52' },
  };
  const expr = expressions[mood];

  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      {/* 귀 */}
      <ellipse cx="24" cy="65" rx="4" ry="6" fill="#F0B27A" />
      <ellipse cx="76" cy="65" rx="4" ry="6" fill="#F0B27A" />
      {/* 얼굴 */}
      <ellipse cx="50" cy="65" rx="26" ry="28" fill="#F5CBA7" />
      {/* 볼 홍조 */}
      <ellipse cx="33" cy="70" rx="6" ry="4" fill="#F1948A" opacity="0.5" />
      <ellipse cx="67" cy="70" rx="6" ry="4" fill="#F1948A" opacity="0.5" />
      {/* 눈썹 */}
      <path d={expr.eyebrowL} stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={expr.eyebrowR} stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 눈 */}
      <circle cx="40" cy="60" r="5" fill="white" />
      <circle cx="60" cy="60" r="5" fill="white" />
      <circle cx="41" cy="61" r="3" fill="#2C3E50" />
      <circle cx="61" cy="61" r="3" fill="#2C3E50" />
      <circle cx="42" cy="60" r="1" fill="white" />
      <circle cx="62" cy="60" r="1" fill="white" />
      {/* 입 */}
      <path d={expr.mouth} stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 군모 */}
      <ellipse cx="50" cy="45" rx="28" ry="6" fill="#2d4a1e" />
      <rect x="24" y="35" width="52" height="14" rx="3" fill="#3a5c26" />
      <rect x="30" y="31" width="40" height="10" rx="3" fill="#3a5c26" />
      {/* 모자 챙 */}
      <ellipse cx="50" cy="49" rx="30" ry="5" fill="#2d4a1e" />
      {/* 모자 다이아몬드 */}
      <polygon points="50,35 53,40 50,45 47,40" fill="#FFD700" />
      {/* 몸통 (군복) */}
      <rect x="28" y="91" width="44" height="40" rx="6" fill="#3a5c26" />
      {/* 넥타이 */}
      <polygon points="50,92 46,102 50,108 54,102" fill="#1a3a10" />
      {/* 왼쪽 어깨 계급장 */}
      <rect x="18" y="92" width="12" height="8" rx="2" fill="#2d4a1e" />
      <text x="24" y="99" fontSize="6" textAnchor="middle" fill="#FFD700">★</text>
      {/* 오른쪽 어깨 계급장 */}
      <rect x="70" y="92" width="12" height="8" rx="2" fill="#2d4a1e" />
      <text x="76" y="99" fontSize="6" textAnchor="middle" fill="#FFD700">★</text>
      {/* 가슴 훈장 */}
      <circle cx="38" cy="108" r="4" fill="#FFD700" />
      <circle cx="38" cy="108" r="2" fill="#FFA500" />
      {/* 단추 */}
      <circle cx="50" cy="115" r="2" fill="#2d4a1e" />
      <circle cx="50" cy="122" r="2" fill="#2d4a1e" />
      {/* 팔 */}
      <rect x="14" y="92" width="14" height="30" rx="6" fill="#3a5c26" />
      <rect x="72" y="92" width="14" height="30" rx="6" fill="#3a5c26" />
      {/* 손 */}
      <ellipse cx="21" cy="124" rx="6" ry="5" fill="#F0B27A" />
      <ellipse cx="79" cy="124" rx="6" ry="5" fill="#F0B27A" />
      {/* 다리 */}
      <rect x="32" y="129" width="14" height="18" rx="4" fill="#2d4a1e" />
      <rect x="54" y="129" width="14" height="18" rx="4" fill="#2d4a1e" />
      {/* 군화 */}
      <ellipse cx="39" cy="147" rx="9" ry="4" fill="#1a1a1a" />
      <ellipse cx="61" cy="147" rx="9" ry="4" fill="#1a1a1a" />
    </svg>
  );
}
