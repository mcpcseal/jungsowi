import { useState } from 'react';
import Character, { Mood } from './Character';

interface Card {
  suit: string;
  value: string;
}

type Phase = 'bet' | 'reveal' | 'done';
type Side = 'player' | 'banker' | 'tie';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) for (const v of VALUES) deck.push({ suit: s, value: v });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardPoint(card: Card): number {
  if (['10', 'J', 'Q', 'K'].includes(card.value)) return 0;
  if (card.value === 'A') return 1;
  return parseInt(card.value);
}

function handScore(cards: Card[]): number {
  return cards.reduce((s, c) => s + cardPoint(c), 0) % 10;
}

function isRed(suit: string): boolean {
  return suit === '♥' || suit === '♦';
}

interface CardCompProps {
  card: Card;
  hidden: boolean;
}

function CardComp({ card, hidden }: CardCompProps) {
  if (hidden) return (
    <div className="card card-back">
      <div className="card-back-pattern">🃏</div>
    </div>
  );
  return (
    <div className={`card ${isRed(card.suit) ? 'red' : 'black'}`}>
      <div className="card-top">{card.value}{card.suit}</div>
      <div className="card-center">{card.suit}</div>
      <div className="card-bottom">{card.value}{card.suit}</div>
    </div>
  );
}

const SIDE_BETS: Side[] = ['player', 'banker', 'tie'];
const SIDE_LABELS: Record<Side, string> = { player: '플레이어', banker: '뱅커', tie: '타이' };
const SIDE_PAYOUTS: Record<Side, number> = { player: 2, banker: 1.95, tie: 9 };

interface BaccaratProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export default function Baccarat({ balance, setBalance }: BaccaratProps) {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>('bet');
  const [bet, setBet] = useState<number>(100);
  const [side, setSide] = useState<Side | null>(null);
  const [message, setMessage] = useState<string>('베팅 후 딜을 시작하세요!');
  const [mood, setMood] = useState<Mood>('neutral');
  const [reveal, setReveal] = useState<boolean>(false);

  const deal = () => {
    if (!side) { setMessage('먼저 베팅 위치를 선택하세요!'); return; }
    if (balance < bet) { setMessage('잔액 부족! 충전하십시오!'); return; }

    setBalance(b => b - bet);
    const d = makeDeck();
    const pc = [d[0], d[2]];
    const bc = [d[1], d[3]];
    let idx = 4;

    const ps = handScore(pc);
    const bs = handScore(bc);

    // 바카라 드로우 룰
    if (ps <= 5) { pc.push(d[idx++]); }
    if (bs <= 5 && pc.length === 2) { bc.push(d[idx++]); }
    else if (bs <= 5 && pc.length === 3) {
      const tp = cardPoint(pc[2]);
      if (bs === 0 || bs === 1 || bs === 2) bc.push(d[idx++]);
      else if (bs === 3 && tp !== 8) bc.push(d[idx++]);
      else if (bs === 4 && [2,3,4,5,6,7].includes(tp)) bc.push(d[idx++]);
      else if (bs === 5 && [4,5,6,7].includes(tp)) bc.push(d[idx++]);
      else if (bs === 6 && [6,7].includes(tp)) bc.push(d[idx++]);
    }

    setPlayerCards(pc);
    setBankerCards(bc);
    setPhase('reveal');
    setReveal(false);
    setMessage('카드를 확인하세요!');
    setMood('neutral');
  };

  const showResult = () => {
    setReveal(true);
    const ps = handScore(playerCards);
    const bs = handScore(bankerCards);
    const winner: Side = ps > bs ? 'player' : bs > ps ? 'banker' : 'tie';

    if (winner === side && side !== null) {
      const winAmount = Math.floor(bet * SIDE_PAYOUTS[side]);
      setBalance(b => b + winAmount);
      setMessage(`🎉 ${SIDE_LABELS[side]} 승리! +${winAmount.toLocaleString()}P (플레이어 ${ps} vs 뱅커 ${bs})`);
      setMood('happy');
    } else {
      setMessage(`😢 ${SIDE_LABELS[winner]} 승리... 아깝습니다! (플레이어 ${ps} vs 뱅커 ${bs})`);
      setMood('crying');
    }
    setPhase('done');
  };

  const reset = () => {
    setPlayerCards([]);
    setBankerCards([]);
    setPhase('bet');
    setSide(null);
    setReveal(false);
    setMessage('베팅 후 딜을 시작하세요!');
    setMood('neutral');
  };

  return (
    <div className="game-container">
      <h2 className="game-title">🃏 소위의 바카라</h2>

      <div className="baccarat-layout">
        <div className="character-side">
          <Character mood={mood} size={100} />
          <p className="char-name">정소위</p>
        </div>

        <div className="baccarat-table">
          <div className="baccarat-side banker-side">
            <div className="side-label">🏦 뱅커</div>
            <div className="cards-row">
              {phase === 'bet' ? <div className="card-placeholder">?</div> :
                bankerCards.map((c, i) => (
                  <CardComp key={i} card={c} hidden={!reveal && i === 1} />
                ))
              }
            </div>
            {reveal && <div className="score-badge">{handScore(bankerCards)}</div>}
          </div>

          <div className="vs-divider">VS</div>

          <div className="baccarat-side player-side">
            <div className="side-label">🧑 플레이어</div>
            <div className="cards-row">
              {phase === 'bet' ? <div className="card-placeholder">?</div> :
                playerCards.map((c, i) => (
                  <CardComp key={i} card={c} hidden={!reveal && i === 1} />
                ))
              }
            </div>
            {reveal && <div className="score-badge">{handScore(playerCards)}</div>}
          </div>
        </div>
      </div>

      <div className={`baccarat-message ${mood === 'happy' ? 'win' : mood === 'crying' ? 'lose' : ''}`}>
        {message}
      </div>

      {phase === 'bet' && (
        <>
          <div className="bet-section">
            <div className="bet-label">베팅 위치 선택:</div>
            <div className="side-bets">
              {SIDE_BETS.map(s => (
                <button
                  key={s}
                  className={`side-bet-btn ${side === s ? 'active' : ''}`}
                  onClick={() => setSide(s)}
                >
                  {SIDE_LABELS[s]}
                  <span className="payout-hint">×{SIDE_PAYOUTS[s]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bet-controls">
            <span className="label">베팅액</span>
            {[100, 500, 1000, 5000].map(v => (
              <button key={v} className={`bet-btn ${bet === v ? 'active' : ''}`} onClick={() => setBet(v)}>
                {v.toLocaleString()}P
              </button>
            ))}
          </div>
          <button className="spin-btn" onClick={deal}>🃏 딜 시작!</button>
        </>
      )}

      {phase === 'reveal' && (
        <button className="spin-btn" onClick={showResult}>🔍 결과 확인!</button>
      )}

      {phase === 'done' && (
        <button className="spin-btn" onClick={reset}>🔄 다음 판</button>
      )}

      <div className="payout-table">
        <h4>배당률</h4>
        <div className="payout-row"><span>플레이어 승</span><span>2배</span></div>
        <div className="payout-row"><span>뱅커 승</span><span>1.95배</span></div>
        <div className="payout-row"><span>타이</span><span>9배</span></div>
      </div>
    </div>
  );
}
