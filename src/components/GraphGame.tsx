import { useState, useEffect, useRef } from 'react';
import Character, { Mood } from './Character';

interface GraphGameProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

type Phase = 'idle' | 'waiting' | 'running' | 'cashed' | 'crashed';

const GRAPH_W = 400;
const GRAPH_H = 220;
const K = 0.1; // 배수 증가 계수: m(t) = e^(K*t)
const MAX_TIME = 60; // x축 최대 시간 (초)

function calcCrashPoint(): number {
  const r = Math.random();
  if (r < 0.01) return 1.0; // 1% 즉시 폭발
  return Math.min(500, parseFloat((0.99 / (1 - r * 0.99)).toFixed(2)));
}

function timeToMultiplier(t: number): number {
  return parseFloat(Math.pow(Math.E, K * t).toFixed(2));
}

function multiplierToY(m: number): number {
  // log scale: 1x → bottom, 500x → top
  const normalized = Math.min(Math.log(m) / Math.log(500), 1);
  return GRAPH_H - normalized * GRAPH_H * 0.88 - 8;
}

function timeToX(t: number): number {
  return Math.min((t / MAX_TIME) * GRAPH_W, GRAPH_W - 4);
}

function buildPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  return 'M ' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
}

export default function GraphGame({ balance, setBalance }: GraphGameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [bet, setBet] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [message, setMessage] = useState<string>('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [svgPath, setSvgPath] = useState<string>('');
  const [fillPath, setFillPath] = useState<string>('');
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const [lineColor, setLineColor] = useState<string>('#00ff88');
  const [useAutoCashout, setUseAutoCashout] = useState<boolean>(false);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.0);
  const phaseRef = useRef<Phase>('idle');
  const betRef = useRef<number>(100);
  const useAutoCashoutRef = useRef<boolean>(false);
  const autoCashoutRef = useRef<number>(2.0);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => { betRef.current = bet; }, [bet]);
  useEffect(() => { useAutoCashoutRef.current = useAutoCashout; }, [useAutoCashout]);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);

  const getMColor = (m: number, p: Phase): string => {
    if (p === 'crashed') return '#e74c3c';
    if (p === 'cashed') return '#27ae60';
    if (m >= 10) return '#ff6b35';
    if (m >= 3) return '#FFD700';
    return '#00ff88';
  };

  const doFinishCash = (m: number, b: number, color: string) => {
    const win = Math.floor(b * m);
    setPhase('cashed');
    phaseRef.current = 'cashed';
    setBalance(prev => prev + win);
    setMessage(`💰 ${m.toFixed(2)}x 캐시아웃! +${win.toLocaleString()}P`);
    setMood('happy');
    setLineColor(color);
  };

  const handleCashOut = () => {
    if (phaseRef.current !== 'running') return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const m = timeToMultiplier(elapsed);
    doFinishCash(m, betRef.current, getMColor(m, 'cashed'));
  };

  const startGame = () => {
    if (balance < bet) {
      setMessage('잔액이 부족합니다! 충전하십시오!');
      return;
    }

    const cp = calcCrashPoint();
    crashPointRef.current = cp;
    pointsRef.current = [{ x: 0, y: GRAPH_H - 8 }];

    setBalance(b => b - bet);
    setMultiplier(1.0);
    setSvgPath('');
    setFillPath('');
    setDotPos({ x: 0, y: GRAPH_H - 8 });
    setLineColor('#00ff88');
    setMessage('');
    setMood('neutral');
    setPhase('waiting');
    phaseRef.current = 'waiting';

    setTimeout(() => {
      setPhase('running');
      phaseRef.current = 'running';
      startTimeRef.current = Date.now();

      const animate = () => {
        if (phaseRef.current !== 'running') return;

        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const m = timeToMultiplier(elapsed);
        const x = timeToX(elapsed);
        const y = multiplierToY(m);
        const color = getMColor(m, 'running');

        // 포인트 스로틀: x 또는 y 변화가 2px 이상일 때만 추가
        const pts = pointsRef.current;
        const last = pts[pts.length - 1];
        if (!last || Math.abs(x - last.x) >= 2 || Math.abs(y - last.y) >= 2) {
          const newPts = [...pts, { x, y }];
          pointsRef.current = newPts;
          const line = buildPath(newPts);
          setSvgPath(line);
          setFillPath(line + ` L ${x.toFixed(1)},${(GRAPH_H - 8).toFixed(1)} L 0,${(GRAPH_H - 8).toFixed(1)} Z`);
        }

        setDotPos({ x, y });
        setMultiplier(m);
        setLineColor(color);

        // 자동 캐시아웃
        if (useAutoCashoutRef.current && m >= autoCashoutRef.current) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          doFinishCash(m, betRef.current, getMColor(m, 'cashed'));
          return;
        }

        // 폭발 체크
        if (m >= crashPointRef.current) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setPhase('crashed');
          phaseRef.current = 'crashed';
          setMessage(`💥 ${crashPointRef.current.toFixed(2)}x 에서 폭발! 베팅금액 몰수!`);
          setMood('crying');
          setLineColor('#e74c3c');
          return;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 1200);
  };

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const isActive = phase === 'running' || phase === 'waiting';
  const displayMultiplier = phase === 'crashed' ? crashPointRef.current : multiplier;

  return (
    <div className="game-container">
      <h2 className="game-title">📈 소위의 그래프 게임</h2>

      <div className="graph-wrapper">
        <div className="character-side">
          <Character mood={mood} size={100} />
          <p className="char-name">정소위</p>
        </div>

        <div className="graph-area">
          <div className="graph-multiplier" style={{ color: lineColor }}>
            {phase === 'crashed' ? `💥 ${displayMultiplier.toFixed(2)}x` : `${displayMultiplier.toFixed(2)}x`}
          </div>

          <svg className="graph-svg" width={GRAPH_W} height={GRAPH_H}>
            <defs>
              <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* 가이드라인 */}
            <line x1="0" y1={multiplierToY(10)} x2={GRAPH_W} y2={multiplierToY(10)}
              stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1={multiplierToY(3)} x2={GRAPH_W} y2={multiplierToY(3)}
              stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1={multiplierToY(2)} x2={GRAPH_W} y2={multiplierToY(2)}
              stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1={GRAPH_H - 8} x2={GRAPH_W} y2={GRAPH_H - 8}
              stroke="#3a3a3a" strokeWidth="1" />

            {/* Y축 라벨 */}
            <text x="4" y={multiplierToY(10) - 3} fill="#444" fontSize="10">10x</text>
            <text x="4" y={multiplierToY(3) - 3} fill="#444" fontSize="10">3x</text>
            <text x="4" y={multiplierToY(2) - 3} fill="#444" fontSize="10">2x</text>
            <text x="4" y={GRAPH_H - 12} fill="#444" fontSize="10">1x</text>

            {/* 채우기 영역 */}
            {fillPath && <path d={fillPath} fill="url(#graphFill)" />}

            {/* 그래프 선 */}
            {svgPath && (
              <path d={svgPath} fill="none" stroke={lineColor} strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* 현재 위치 점 */}
            {dotPos && phase === 'running' && (
              <circle cx={dotPos.x} cy={dotPos.y} r="5" fill={lineColor} />
            )}

            {phase === 'waiting' && (
              <text x={GRAPH_W / 2} y={GRAPH_H / 2} textAnchor="middle"
                fill="#FFD700" fontSize="18" fontWeight="bold">게임 시작 중...</text>
            )}

            {phase === 'idle' && (
              <text x={GRAPH_W / 2} y={GRAPH_H / 2} textAnchor="middle"
                fill="#555" fontSize="14">게임을 시작하세요</text>
            )}
          </svg>
        </div>
      </div>

      {message && (
        <div className={`slot-message ${phase === 'cashed' ? 'win' : phase === 'crashed' ? 'lose' : ''}`}>
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
            disabled={isActive}
          >
            {v.toLocaleString()}P
          </button>
        ))}
      </div>

      <div className="auto-cashout-row">
        <label className="auto-cashout-label">
          <input
            type="checkbox"
            checked={useAutoCashout}
            onChange={e => setUseAutoCashout(e.target.checked)}
            disabled={isActive}
          />
          자동 캐시아웃
        </label>
        {useAutoCashout && (
          <div className="auto-cashout-options">
            {[1.5, 2.0, 3.0, 5.0, 10.0].map(v => (
              <button
                key={v}
                className={`bet-btn ${autoCashout === v ? 'active' : ''}`}
                onClick={() => setAutoCashout(v)}
                disabled={isActive}
              >
                {v.toFixed(1)}x
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="graph-actions">
        {!isActive && (
          <button className="spin-btn" onClick={startGame}>
            {phase === 'idle' ? '📈 게임 시작' : '🔄 다시 하기'}
          </button>
        )}
        {phase === 'running' && (
          <button className="cashout-btn" onClick={handleCashOut}>
            💰 캐시아웃&nbsp;&nbsp;
            {multiplier.toFixed(2)}x = {Math.floor(bet * multiplier).toLocaleString()}P
          </button>
        )}
        {phase === 'waiting' && (
          <button className="spin-btn" disabled>준비 중...</button>
        )}
      </div>

      <div className="graph-info">
        <div className="graph-info-item">
          <span className="graph-info-label">베팅 금액</span>
          <span className="graph-info-value">{bet.toLocaleString()}P</span>
        </div>
        <div className="graph-info-item">
          <span className="graph-info-label">예상 수익</span>
          <span className="graph-info-value" style={{ color: phase === 'running' ? '#00ff88' : undefined }}>
            {phase === 'running'
              ? `+${(Math.floor(bet * multiplier) - bet).toLocaleString()}P`
              : '-'}
          </span>
        </div>
        <div className="graph-info-item">
          <span className="graph-info-label">하우스 엣지</span>
          <span className="graph-info-value" style={{ color: '#888' }}>1%</span>
        </div>
      </div>
    </div>
  );
}
