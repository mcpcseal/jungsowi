import { useState, useRef } from 'react';
import Character, { Mood } from './Character';

const SYMBOLS: string[] = ['⭐', '🎖️', '🪖', '🔫', '💣', '🎯', '🏅', '💰'];
const PAYOUTS: Record<string, number> = {
  '⭐⭐⭐': 50, '🎖️🎖️🎖️': 30, '🪖🪖🪖': 20,
  '🏅🏅🏅': 15, '💰💰💰': 100,
};

function randomSymbol(): string {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

interface SlotMachineProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export default function SlotMachine({ balance, setBalance }: SlotMachineProps) {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [bet, setBet] = useState<number>(100);
  const [message, setMessage] = useState<string>('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [reelDisplay, setReelDisplay] = useState<string[][]>([['⭐'], ['⭐'], ['⭐']]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spin = () => {
    if (spinning) return;
    if (balance < bet) { setMessage('잔액이 부족합니다! 충전하십시오!'); return; }

    setBalance(b => b - bet);
    setSpinning(true);
    setMessage('');
    setMood('neutral');

    const duration = 2000;
    const start = Date.now();

    intervalRef.current = setInterval(() => {
      setReelDisplay([
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
        [randomSymbol(), randomSymbol(), randomSymbol()],
      ]);
      if (Date.now() - start > duration) {
        clearInterval(intervalRef.current!);
        const result = [randomSymbol(), randomSymbol(), randomSymbol()];
        setReelDisplay([
          [randomSymbol(), result[0], randomSymbol()],
          [randomSymbol(), result[1], randomSymbol()],
          [randomSymbol(), result[2], randomSymbol()],
        ]);
        setSpinning(false);
        const key = result.join('');
        if (PAYOUTS[key]) {
          const win = bet * PAYOUTS[key];
          setBalance(b => b + win);
          setMessage(`🎉 ${PAYOUTS[key]}배 당첨! +${win.toLocaleString()}P`);
          setMood('happy');
        } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
          const win = bet * 2;
          setBalance(b => b + win);
          setMessage(`✨ 2개 일치! +${win.toLocaleString()}P`);
          setMood('happy');
        } else {
          setMessage('꽝! 다음 판을 노려라!');
          setMood('crying');
        }
      }
    }, 80);
  };

  return (
    <div className="game-container">
      <h2 className="game-title">🎰 소위의 슬롯머신</h2>

      <div className="slot-wrapper">
        <div className="character-side">
          <Character mood={mood} size={100} />
          <p className="char-name">정소위</p>
        </div>

        <div className="slot-machine-body">
          <div className="slot-top-bar">LUCKY JUNGSOWI</div>
          <div className="reels-container">
            {reelDisplay.map((col, i) => (
              <div key={i} className={`reel ${spinning ? 'spinning' : ''}`}>
                {col.map((sym, j) => (
                  <div key={j} className={`reel-cell ${j === 1 ? 'center' : 'side'}`}>
                    {sym}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="payline-indicator">▶ ━━━━━━━━━━━━━━━━ ◀</div>
        </div>
      </div>

      {message && (
        <div className={`slot-message ${message.includes('당첨') || message.includes('일치') ? 'win' : 'lose'}`}>
          {message}
        </div>
      )}

      <div className="bet-controls">
        <span className="label">베팅</span>
        {[100, 500, 1000, 5000].map(v => (
          <button
            key={v}
            className={`bet-btn ${bet === v ? 'active' : ''}`}
            onClick={() => setBet(v)}
            disabled={spinning}
          >
            {v.toLocaleString()}P
          </button>
        ))}
      </div>

      <button className="spin-btn" onClick={spin} disabled={spinning}>
        {spinning ? '돌아가는 중...' : '🎰 SPIN!'}
      </button>

      <div className="payout-table">
        <h4>배당표</h4>
        {Object.entries(PAYOUTS).map(([k, v]) => (
          <div key={k} className="payout-row">
            <span>{k}</span><span>{v}배</span>
          </div>
        ))}
        <div className="payout-row"><span>2개 일치</span><span>2배</span></div>
      </div>
    </div>
  );
}
