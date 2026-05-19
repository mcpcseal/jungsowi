import { useState } from 'react';
import SlotMachine from './components/SlotMachine';
import Baccarat from './components/Baccarat';
import GraphGame from './components/GraphGame';
import Blackjack from './components/Blackjack';
import Character from './components/Character';
import './App.css';

const INITIAL_BALANCE = 10000;

type Tab = 'home' | 'slot' | 'baccarat' | 'graph' | 'blackjack';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);

  const addBalance = () => setBalance(b => b + 10000);

  return (
    <div className="app">
      <div className="neon-banner">
        ⚡ 정소위 카지노 — 군인도 쉬는 날엔 한 판! ⚡
      </div>

      <header className="header">
        <div className="logo-area">
          <span className="logo-star">★</span>
          <span className="logo-text">정소위.com</span>
          <span className="logo-star">★</span>
        </div>
        <div className="balance-area">
          <span className="balance-label">보유 포인트</span>
          <span className="balance-value">{balance.toLocaleString()} P</span>
          <button className="charge-btn" onClick={addBalance}>+충전</button>
        </div>
      </header>

      <nav className="nav">
        {[
          { id: 'home' as Tab,     label: '🏠 홈' },
          { id: 'slot' as Tab,     label: '🎰 슬롯머신' },
          { id: 'baccarat' as Tab, label: '🃏 바카라' },
          { id: 'graph' as Tab,     label: '📈 그래프' },
          { id: 'blackjack' as Tab, label: '🃏 블랙잭' },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={`nav-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'home' && (
          <div className="home">
            <div className="home-hero">
              <Character mood="happy" size={160} />
              <div className="home-text">
                <h1 className="home-title">정소위 카지노에<br />오신 것을 환영합니다!</h1>
                <p className="home-subtitle">
                  "군대에서도 운은 필요하지!"<br />
                  — 정소위, 간부 휴가 첫날
                </p>
                <div className="home-buttons">
                  <button className="home-cta" onClick={() => setTab('slot')}>🎰 슬롯 플레이</button>
                  <button className="home-cta secondary" onClick={() => setTab('baccarat')}>🃏 바카라 플레이</button>
                  <button className="home-cta secondary" onClick={() => setTab('graph')}>📈 그래프 플레이</button>
                  <button className="home-cta secondary" onClick={() => setTab('blackjack')}>🃏 블랙잭 플레이</button>
                </div>
              </div>
            </div>

            <div className="notice-board">
              <div className="notice-title">📋 공지사항</div>
              <ul className="notice-list">
                <li>🔴 본 사이트는 풍자 목적의 가상 카지노입니다. 실제 돈은 사용되지 않습니다.</li>
                <li>🟡 포인트는 화면 우상단 [+충전] 버튼으로 충전 가능합니다.</li>
                <li>🟢 도박은 재미로만! 정소위도 그렇게 생각했습니다... 처음에는.</li>
              </ul>
            </div>

            <div className="game-cards">
              <div className="game-card" onClick={() => setTab('slot')}>
                <div className="game-card-icon">🎰</div>
                <div className="game-card-title">슬롯머신</div>
                <div className="game-card-desc">군대 테마 슬롯! 최대 100배 당첨</div>
                <button className="game-card-btn">플레이</button>
              </div>
              <div className="game-card" onClick={() => setTab('baccarat')}>
                <div className="game-card-icon">🃏</div>
                <div className="game-card-title">바카라</div>
                <div className="game-card-desc">타이에 베팅하면 9배! 운명의 한 수</div>
                <button className="game-card-btn">플레이</button>
              </div>
              <div className="game-card" onClick={() => setTab('graph')}>
                <div className="game-card-icon">📈</div>
                <div className="game-card-title">그래프 게임</div>
                <div className="game-card-desc">폭발 전에 캐시아웃! 최대 500배</div>
                <button className="game-card-btn">플레이</button>
              </div>
              <div className="game-card" onClick={() => setTab('blackjack')}>
                <div className="game-card-icon">🃏</div>
                <div className="game-card-title">블랙잭</div>
                <div className="game-card-desc">딜러를 꺾어라! 블랙잭 1.5배 보너스</div>
                <button className="game-card-btn">플레이</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'slot' && (
          <SlotMachine balance={balance} setBalance={setBalance} />
        )}

        {tab === 'baccarat' && (
          <Baccarat balance={balance} setBalance={setBalance} />
        )}

        {tab === 'graph' && (
          <GraphGame balance={balance} setBalance={setBalance} />
        )}

        {tab === 'blackjack' && (
          <Blackjack balance={balance} setBalance={setBalance} />
        )}
      </main>

      <footer className="footer">
        <p>© 2026 정소위 카지노 | 이 사이트는 풍자/패러디 목적으로 제작된 가상 게임 사이트입니다.</p>
        <p>실제 도박을 조장하지 않습니다. 대한민국 군인 여러분, 파이팅! 🫡</p>
      </footer>
    </div>
  );
}
