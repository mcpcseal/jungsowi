import { useState } from 'react';
import Character, { Mood } from './Character';

interface BlackjackProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
interface Card { suit: Suit; rank: Rank; hidden?: boolean; }

type Phase = 'idle' | 'playing' | 'dealer' | 'result';
type Result = 'blackjack' | 'win' | 'push' | 'lose' | 'bust';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS)
    for (const rank of RANKS)
      deck.push({ suit, rank });
  // 2덱 사용
  return [...deck, ...deck];
}

function shuffle(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function cardValue(rank: Rank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
}

function handScore(hand: Card[]): number {
  let score = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.hidden) continue;
    score += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handScore(hand) === 21;
}

function resultMessage(result: Result, win: number): string {
  switch (result) {
    case 'blackjack': return `🎉 블랙잭! +${win.toLocaleString()}P`;
    case 'win':       return `✅ 승리! +${win.toLocaleString()}P`;
    case 'push':      return `🤝 타이! 베팅금 반환`;
    case 'lose':      return `💸 패배! 베팅금 몰수`;
    case 'bust':      return `💥 버스트! 베팅금 몰수`;
  }
}

function CardView({ card, small }: { card: Card; small?: boolean }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  if (card.hidden) {
    return (
      <div className={`card card-back ${small ? 'card-small' : ''}`}>
        <div className="card-back-pattern">🂠</div>
      </div>
    );
  }
  return (
    <div className={`card ${isRed ? 'red' : 'black'} ${small ? 'card-small' : ''}`}>
      <div className="card-top">{card.rank}{card.suit}</div>
      <div className="card-center">{card.suit}</div>
      <div className="card-bottom">{card.rank}{card.suit}</div>
    </div>
  );
}

export default function Blackjack({ balance, setBalance }: BlackjackProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [bet, setBet] = useState<number>(100);
  const [currentBet, setCurrentBet] = useState<number>(100);
  const [doubled, setDoubled] = useState<boolean>(false);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState<string>('');
  const [mood, setMood] = useState<Mood>('neutral');

  const deal = () => {
    if (balance < bet) { setMessage('잔액이 부족합니다!'); return; }

    const newDeck = shuffle(buildDeck());
    const p: Card[] = [newDeck[0], newDeck[2]];
    const d: Card[] = [newDeck[1], { ...newDeck[3], hidden: true }];

    setBalance(b => b - bet);
    setCurrentBet(bet);
    setDeck(newDeck.slice(4));
    setPlayerHand(p);
    setDealerHand(d);
    setResult(null);
    setMessage('');
    setMood('neutral');
    setDoubled(false);

    if (isBlackjack(p)) {
      // 딜러 카드 공개 후 블랙잭 체크
      const revealedDealer = d.map(c => ({ ...c, hidden: false }));
      if (isBlackjack(revealedDealer)) {
        setDealerHand(revealedDealer);
        endGame(p, revealedDealer, bet, false);
      } else {
        setDealerHand(revealedDealer);
        endGame(p, revealedDealer, bet, false);
      }
    } else {
      setPhase('playing');
    }
  };

  const hit = (currentDeck: Card[], currentHand: Card[], currentBetAmt: number) => {
    const [drawn, ...rest] = currentDeck;
    const newHand = [...currentHand, drawn];
    setPlayerHand(newHand);
    setDeck(rest);

    if (handScore(newHand) > 21) {
      const revealedDealer = dealerHand.map(c => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      endGame(newHand, revealedDealer, currentBetAmt, false);
    }
    return { newHand, rest };
  };

  const handleHit = () => {
    if (phase !== 'playing') return;
    hit(deck, playerHand, currentBet);
  };

  const handleDouble = () => {
    if (phase !== 'playing' || doubled) return;
    if (balance < currentBet) { setMessage('잔액이 부족합니다!'); return; }
    setBalance(b => b - currentBet);
    const newBet = currentBet * 2;
    setCurrentBet(newBet);
    setDoubled(true);

    const [drawn, ...rest] = deck;
    const newHand = [...playerHand, drawn];
    setPlayerHand(newHand);
    setDeck(rest);

    if (handScore(newHand) > 21) {
      const revealedDealer = dealerHand.map(c => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      endGame(newHand, revealedDealer, newBet, false);
    } else {
      dealerPlay(rest, newHand, newBet);
    }
  };

  const handleStand = () => {
    if (phase !== 'playing') return;
    dealerPlay(deck, playerHand, currentBet);
  };

  const dealerPlay = (currentDeck: Card[], pHand: Card[], betAmt: number) => {
    setPhase('dealer');
    let d = dealerHand.map(c => ({ ...c, hidden: false }));
    let currentD = [...currentDeck];

    while (handScore(d) < 17) {
      const [drawn, ...rest] = currentD;
      d = [...d, drawn];
      currentD = rest;
    }

    setDealerHand(d);
    setDeck(currentD);
    endGame(pHand, d, betAmt, false);
  };

  const endGame = (pHand: Card[], dHand: Card[], betAmt: number, _: boolean) => {
    setPhase('result');
    const pScore = handScore(pHand);
    const dScore = handScore(dHand);
    const pBJ = isBlackjack(pHand);
    const dBJ = isBlackjack(dHand);

    let res: Result;
    let payout = 0;

    if (pScore > 21) {
      res = 'bust';
    } else if (pBJ && dBJ) {
      res = 'push';
      payout = betAmt;
    } else if (pBJ) {
      res = 'blackjack';
      payout = Math.floor(betAmt * 2.5); // 블랙잭 1.5배 보너스
    } else if (dScore > 21) {
      res = 'win';
      payout = betAmt * 2;
    } else if (pScore > dScore) {
      res = 'win';
      payout = betAmt * 2;
    } else if (pScore === dScore) {
      res = 'push';
      payout = betAmt;
    } else {
      res = 'lose';
    }

    if (payout > 0) setBalance(b => b + payout);

    const profit = payout - betAmt;
    setResult(res);
    setMessage(resultMessage(res, profit > 0 ? profit : betAmt));
    setMood(res === 'bust' || res === 'lose' ? 'crying' : res === 'push' ? 'neutral' : 'happy');
  };

  const playerScore = handScore(playerHand);
  const dealerScore = handScore(dealerHand.filter(c => !c.hidden));
  const canDouble = phase === 'playing' && !doubled && playerHand.length === 2 && balance >= currentBet;

  return (
    <div className="game-container">
      <h2 className="game-title">🃏 소위의 블랙잭</h2>

      <div className="bj-layout">
        {/* 딜러 */}
        <div className="bj-side">
          <div className="bj-label">딜러</div>
          <div className="bj-score">
            {phase === 'idle' ? '' : `${dealerScore}${dealerScore > 21 ? ' 버스트' : ''}`}
          </div>
          <div className="cards-row">
            {dealerHand.length === 0
              ? <div className="card-placeholder">🂠</div>
              : dealerHand.map((c, i) => <CardView key={i} card={c} />)
            }
          </div>
        </div>

        <div className="bj-divider">VS</div>

        {/* 플레이어 */}
        <div className="bj-side">
          <div className="bj-label">정소위</div>
          <div className="bj-score">
            {phase === 'idle' ? '' : `${playerScore}${playerScore > 21 ? ' 버스트' : playerScore === 21 ? ' 블랙잭!' : ''}`}
          </div>
          <div className="cards-row">
            {playerHand.length === 0
              ? <div className="card-placeholder">🂠</div>
              : playerHand.map((c, i) => <CardView key={i} card={c} />)
            }
          </div>
        </div>

        <div className="character-side">
          <Character mood={mood} size={100} />
          <p className="char-name">정소위</p>
        </div>
      </div>

      {message && (
        <div className={`slot-message ${result === 'win' || result === 'blackjack' ? 'win' : result === 'push' ? '' : 'lose'}`}>
          {message}
        </div>
      )}

      {/* 베팅 */}
      <div className="bet-controls">
        <span className="label">베팅</span>
        {[100, 500, 1000, 5000].map(v => (
          <button
            key={v}
            className={`bet-btn ${bet === v ? 'active' : ''}`}
            onClick={() => setBet(v)}
            disabled={phase === 'playing' || phase === 'dealer'}
          >
            {v.toLocaleString()}P
          </button>
        ))}
      </div>

      {/* 현재 베팅 표시 */}
      {phase !== 'idle' && (
        <div className="bj-current-bet">
          현재 베팅: <span>{currentBet.toLocaleString()}P</span>
          {doubled && <span className="bj-doubled-badge">더블다운</span>}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="bj-actions">
        {(phase === 'idle' || phase === 'result') && (
          <button className="spin-btn" onClick={deal}>
            {phase === 'idle' ? '🃏 딜 시작' : '🔄 다시 하기'}
          </button>
        )}
        {phase === 'playing' && (
          <>
            <button className="bj-btn bj-hit" onClick={handleHit}>히트 (Hit)</button>
            <button className="bj-btn bj-stand" onClick={handleStand}>스탠드 (Stand)</button>
            {canDouble && (
              <button className="bj-btn bj-double" onClick={handleDouble}>더블다운 ×2</button>
            )}
          </>
        )}
      </div>

      {/* 룰 안내 */}
      <div className="payout-table">
        <h4>배당표</h4>
        <div className="payout-row"><span>블랙잭</span><span>베팅 × 1.5</span></div>
        <div className="payout-row"><span>승리</span><span>베팅 × 1</span></div>
        <div className="payout-row"><span>타이</span><span>베팅 반환</span></div>
        <div className="payout-row"><span>버스트 / 패배</span><span>베팅 몰수</span></div>
        <div className="payout-row"><span>더블다운</span><span>추가 베팅 후 카드 1장</span></div>
      </div>
    </div>
  );
}
