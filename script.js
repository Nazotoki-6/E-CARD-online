const CARD_INFO = {
  emperor: { label: '皇帝', image: 'images/emperor.webp' },
  citizen: { label: '市民', image: 'images/citizen.webp' },
  slave: { label: '奴隷', image: 'images/slave.webp' },
};

const TOTAL_MATCHES = 12;
const MATCHES_PER_GROUP = 3;

const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const playerHandEl = document.getElementById('playerHand');
const playerPlayedEl = document.getElementById('playerPlayed');
const cpuPlayedEl = document.getElementById('cpuPlayed');
const playerRoleLabel = document.getElementById('playerRoleLabel');
const cpuRoleLabel = document.getElementById('cpuRoleLabel');
const roundLabel = document.getElementById('roundLabel');
const remainingLabel = document.getElementById('remainingLabel');
const messageBox = document.getElementById('messageBox');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const resultEyebrow = document.getElementById('resultEyebrow');
const resultScore = document.getElementById('resultScore');
const retryBtn = document.getElementById('retryBtn');
const matchLabel = document.getElementById('matchLabel');
const groupLabel = document.getElementById('groupLabel');
const playerScoreLabel = document.getElementById('playerScoreLabel');
const cpuScoreLabel = document.getElementById('cpuScoreLabel');
const seriesProgress = document.getElementById('seriesProgress');
const orderLabel = document.getElementById('orderLabel');
const battleZone = document.getElementById('battleZone');
const battleVersus = document.getElementById('battleVersus');
const compactMatchLabel = document.getElementById('compactMatchLabel');
const compactSideLabel = document.getElementById('compactSideLabel');
const compactPlayLabel = document.getElementById('compactPlayLabel');
const compactPlayerScore = document.getElementById('compactPlayerScore');
const compactCpuScore = document.getElementById('compactCpuScore');
const compactLeadLabel = document.getElementById('compactLeadLabel');
const countdownOverlay = document.getElementById('countdownOverlay');
const statsResetBtn = document.getElementById('statsResetBtn');
const seriesRecordLabel = document.getElementById('seriesRecordLabel');
const seriesWinRateLabel = document.getElementById('seriesWinRateLabel');
const matchRecordLabel = document.getElementById('matchRecordLabel');
const matchWinRateLabel = document.getElementById('matchWinRateLabel');
const streakLabel = document.getElementById('streakLabel');
const bestStreakLabel = document.getElementById('bestStreakLabel');
const emperorRateLabel = document.getElementById('emperorRateLabel');
const emperorRecordLabel = document.getElementById('emperorRecordLabel');
const slaveRateLabel = document.getElementById('slaveRateLabel');
const slaveRecordLabel = document.getElementById('slaveRecordLabel');
const resumePanel = document.getElementById('resumePanel');
const resumeSummary = document.getElementById('resumeSummary');
const resumeBtn = document.getElementById('resumeBtn');
const discardResumeBtn = document.getElementById('discardResumeBtn');
const helpBtn = document.getElementById('helpBtn');
const helpScreen = document.getElementById('helpScreen');
const helpCloseBtn = document.getElementById('helpCloseBtn');
const hapticToggle = document.getElementById('hapticToggle');
const fastModeToggle = document.getElementById('fastModeToggle');
const bgmToggle = document.getElementById('bgmToggle');
const sfxToggle = document.getElementById('sfxToggle');
const speedBtn = document.getElementById('speedBtn');
const installHelp = document.getElementById('installHelp');
const matchLogEl = document.getElementById('matchLog');
const cpuLockLabel = document.getElementById('cpuLockLabel');
const updateToast = document.getElementById('updateToast');
const updateBtn = document.getElementById('updateBtn');
const matchIntro = document.getElementById('matchIntro');
const intermission = document.getElementById('intermission');
const intermissionGroup = document.getElementById('intermissionGroup');
const intermissionRole = document.getElementById('intermissionRole');
const intermissionScore = document.getElementById('intermissionScore');
const matchIntroTop = document.getElementById('matchIntroTop');
const matchIntroMain = document.getElementById('matchIntroMain');
const matchIntroSub = document.getElementById('matchIntroSub');
const resultCard = document.getElementById('resultCard');
const resultStamp = document.getElementById('resultStamp');
const resultDuel = document.getElementById('resultDuel');
const resultPlayerCard = document.getElementById('resultPlayerCard');
const resultCpuCard = document.getElementById('resultCpuCard');
const victoryBurst = document.getElementById('victoryBurst');
const victoryParticles = document.getElementById('victoryParticles');
const victoryKicker = document.getElementById('victoryKicker');
const victoryWord = document.getElementById('victoryWord');
const victorySub = document.getElementById('victorySub');
const lotteryBtn = document.getElementById('lotteryBtn');
const lotteryCard = document.getElementById('lotteryCard');
const lotteryResultImage = document.getElementById('lotteryResultImage');
const lotteryResultLabel = document.getElementById('lotteryResultLabel');
const lotteryResultSub = document.getElementById('lotteryResultSub');


let initialPlayerSide = null;
let playerSide = null;
let playerHand = [];
let cpuHand = [];
let currentMatch = 1;
let playInMatch = 1;
let playerWins = 0;
let cpuWins = 0;
let inputLocked = false;
let selectedHandIndex = null;
let handDragSuppressClickUntil = 0;
const handDragState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  dragging: false,
  lastIndex: null,
};
let cpuPlannedIndex = null;
let matchResults = [];
let battleSequenceId = 0;
let seriesRecorded = false;
let seriesId = null;
let currentMatchLog = [];
let wakeLock = null;
let seriesComplete = false;
let cpuPersonality = null;

// ---- 戦績保存 v4 ------------------------------------------------------
// 12戦マッチの総合成績と、個別試合・陣営別・連勝記録をlocalStorageへ保存する。
const RECORDS_KEY = 'ecard-records-v1';
const RECORDS_VERSION = 1;

function enforceBattleSideOrder() {
  // Position rule: YOU are always left, CPU is always right.
  // Keep this fixed regardless of side, lead order, reveal, or result phase.
  if (battleZone) {
    const playerSide = battleZone.querySelector('.player-battle-side');
    const versus = battleZone.querySelector('.versus');
    const cpuSide = battleZone.querySelector('.cpu-battle-side');
    if (playerSide && versus && cpuSide) {
      battleZone.append(playerSide, versus, cpuSide);
    }
  }
  if (resultDuel) {
    const playerSide = resultDuel.querySelector('.result-player-side');
    const versus = resultDuel.querySelector('.result-duel-vs');
    const cpuSide = resultDuel.querySelector('.result-cpu-side');
    if (playerSide && versus && cpuSide) {
      resultDuel.append(playerSide, versus, cpuSide);
    }
  }
}

function createEmptyRecords() {
  return {
    version: RECORDS_VERSION,
    series: { played: 0, wins: 0, losses: 0, draws: 0 },
    matches: { played: 0, wins: 0, losses: 0 },
    emperor: { played: 0, wins: 0, losses: 0 },
    slave: { played: 0, wins: 0, losses: 0 },
    streak: { current: 0, best: 0 },
    eventIds: [],
  };
}

function loadRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECORDS_KEY) || 'null');
    if (!parsed || parsed.version !== RECORDS_VERSION) return createEmptyRecords();
    const blank = createEmptyRecords();
    return {
      ...blank,
      ...parsed,
      series: { ...blank.series, ...(parsed.series || {}) },
      matches: { ...blank.matches, ...(parsed.matches || {}) },
      emperor: { ...blank.emperor, ...(parsed.emperor || {}) },
      slave: { ...blank.slave, ...(parsed.slave || {}) },
      streak: { ...blank.streak, ...(parsed.streak || {}) },
      eventIds: Array.isArray(parsed.eventIds) ? parsed.eventIds : [],
    };
  } catch (_) {
    return createEmptyRecords();
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (_) {}
}

function percent(wins, played) {
  if (!played) return '--';
  return `${Math.round((wins / played) * 100)}%`;
}

function renderRecords() {
  const records = loadRecords();

  seriesRecordLabel.textContent = `${records.series.played}戦 ${records.series.wins}勝 ${records.series.losses}敗 ${records.series.draws}分`;
  seriesWinRateLabel.textContent = `勝率 ${percent(records.series.wins, records.series.played)}`;

  matchRecordLabel.textContent = `${records.matches.played}戦 ${records.matches.wins}勝 ${records.matches.losses}敗`;
  matchWinRateLabel.textContent = `勝率 ${percent(records.matches.wins, records.matches.played)}`;

  streakLabel.textContent = `現在 ${records.streak.current}連勝`;
  bestStreakLabel.textContent = `最高 ${records.streak.best}連勝`;

  emperorRateLabel.textContent = percent(records.emperor.wins, records.emperor.played);
  emperorRecordLabel.textContent = `${records.emperor.wins}勝 / ${records.emperor.played}戦`;
  slaveRateLabel.textContent = percent(records.slave.wins, records.slave.played);
  slaveRecordLabel.textContent = `${records.slave.wins}勝 / ${records.slave.played}戦`;
}

function recordMatchResult(playerWon, side, eventId = '') {
  const records = loadRecords();
  if (eventId && records.eventIds.includes(eventId)) return;

  records.matches.played += 1;
  const sideRecord = side === 'emperor' ? records.emperor : records.slave;
  sideRecord.played += 1;

  if (playerWon) {
    records.matches.wins += 1;
    sideRecord.wins += 1;
    records.streak.current += 1;
    records.streak.best = Math.max(records.streak.best, records.streak.current);
  } else {
    records.matches.losses += 1;
    sideRecord.losses += 1;
    records.streak.current = 0;
  }

  if (eventId) {
    records.eventIds.push(eventId);
    if (records.eventIds.length > 120) records.eventIds = records.eventIds.slice(-120);
  }
  saveRecords(records);
renderRecords();
}

function recordSeriesResult() {
  if (seriesRecorded) return;
  const eventId = seriesId ? `${seriesId}:series` : '';
  const records = loadRecords();
  if (eventId && records.eventIds.includes(eventId)) {
    seriesRecorded = true;
    return;
  }

  seriesRecorded = true;
  records.series.played += 1;
  if (playerWins > cpuWins) records.series.wins += 1;
  else if (playerWins < cpuWins) records.series.losses += 1;
  else records.series.draws += 1;

  if (eventId) {
    records.eventIds.push(eventId);
    if (records.eventIds.length > 120) records.eventIds = records.eventIds.slice(-120);
  }
  saveRecords(records);
renderRecords();
}

function resetRecords() {
  const ok = window.confirm('保存されている戦績をすべてリセットしますか？');
  if (!ok) return;
  saveRecords(createEmptyRecords());
renderRecords();
}

// ---- 完成度アップ v6：設定 / オートセーブ / 再開 --------------------
const SERIES_STATE_KEY = 'ecard-series-state-v2';
const SERIES_STATE_VERSION = 2;
const PREFS_KEY = 'ecard-preferences-v1';

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {};
    const legacyAudio = typeof saved.audioEnabled === 'boolean' ? saved.audioEnabled : true;
    return {
      ...saved,
      bgmEnabled: typeof saved.bgmEnabled === 'boolean' ? saved.bgmEnabled : legacyAudio,
      sfxEnabled: typeof saved.sfxEnabled === 'boolean' ? saved.sfxEnabled : legacyAudio,
      haptics: typeof saved.haptics === 'boolean' ? saved.haptics : true,
      fastMode: Boolean(saved.fastMode),
    };
  } catch (_) {
    return { bgmEnabled: true, sfxEnabled: true, haptics: true, fastMode: false };
  }
}

function savePrefs(prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (_) {}
}

let preferences = loadPrefs();

function createSeriesId() {
  return `s${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSeriesState() {
  try {
    const state = JSON.parse(localStorage.getItem(SERIES_STATE_KEY) || 'null');
    if (!state || state.version !== SERIES_STATE_VERSION) return null;
    if (!['emperor', 'slave'].includes(state.initialPlayerSide)) return null;
    if (!Array.isArray(state.playerHand) || !Array.isArray(state.cpuHand)) return null;
    const validCards = new Set(['emperor', 'citizen', 'slave']);
    if (!state.playerHand.every((card) => validCards.has(card)) || !state.cpuHand.every((card) => validCards.has(card))) return null;
    if (state.playerHand.length < 1 || state.playerHand.length > 5 || state.cpuHand.length < 1 || state.cpuHand.length > 5) return null;
    if (state.playerHand.length !== state.cpuHand.length) return null;
    if (!Number.isInteger(state.currentMatch) || state.currentMatch < 1 || state.currentMatch > TOTAL_MATCHES) return null;
    if (!Number.isInteger(state.playInMatch) || state.playInMatch < 1 || state.playInMatch > 4) return null;
    return state;
  } catch (_) {
    return null;
  }
}

function saveSeriesState(phase = 'ready', pending = null) {
  if (!initialPlayerSide || seriesComplete) return;
  const state = {
    version: SERIES_STATE_VERSION,
    savedAt: Date.now(),
    seriesId,
    initialPlayerSide,
    playerSide,
    playerHand,
    cpuHand,
    currentMatch,
    playInMatch,
    playerWins,
    cpuWins,
    inputLocked,
    cpuPlannedIndex,
    matchResults,
    currentMatchLog,
    sessionCpuStats,
    cpuPersonality,
    seriesRecorded,
    phase,
    pending,
  };
  try { localStorage.setItem(SERIES_STATE_KEY, JSON.stringify(state)); } catch (_) {}
  renderResumePanel();
}

function clearSeriesState() {
  try { localStorage.removeItem(SERIES_STATE_KEY); } catch (_) {}
  renderResumePanel();
}

function renderResumePanel() {
  if (!resumePanel) return;
  const state = loadSeriesState();
  if (!state) {
    resumePanel.classList.add('hidden');
    return;
  }
  const side = state.playerSide === 'slave' ? '奴隷側' : '皇帝側';
  resumeSummary.textContent = `第${state.currentMatch}戦・${side}　${state.playerWins}勝−${state.cpuWins}勝`;
  resumePanel.classList.remove('hidden');
}

function renderMatchLog() {
  if (!matchLogEl) return;
  if (!currentMatchLog.length) {
    matchLogEl.innerHTML = '<p>まだカードは出されていません。</p>';
    return;
  }
  matchLogEl.innerHTML = currentMatchLog.map((entry, index) => {
    const stateClass = entry.result === '勝ち' ? 'win' : entry.result === '負け' ? 'lose' : 'draw';
    return `<div class="log-row ${stateClass}"><span>${index + 1}手目</span><strong>${entry.player} vs ${entry.cpu}</strong><em>${entry.result}</em></div>`;
  }).join('');
}

async function requestWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible' || setupScreen.classList.contains('hidden') === false) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (_) {}
}

async function releaseWakeLock() {
  if (!wakeLock) return;
  try { await wakeLock.release(); } catch (_) {}
  wakeLock = null;
}

function openHelp(showInstallTip = false) {
  if (showInstallTip && installHelp) installHelp.classList.remove('hidden');
  helpScreen.classList.remove('hidden');
}

function closeHelp() {
  helpScreen.classList.add('hidden');
}

function restoreSeriesState(state) {
  seriesId = state.seriesId || createSeriesId();
  initialPlayerSide = state.initialPlayerSide;
  playerSide = state.playerSide || playerSideForMatch(state.currentMatch);
  playerHand = [...state.playerHand];
  cpuHand = [...state.cpuHand];
  currentMatch = state.currentMatch;
  playInMatch = state.playInMatch;
  playerWins = state.playerWins || 0;
  cpuWins = state.cpuWins || 0;
  cpuPlannedIndex = Number.isInteger(state.cpuPlannedIndex)
    && state.cpuPlannedIndex >= 0
    && state.cpuPlannedIndex < cpuHand.length
    ? state.cpuPlannedIndex
    : null;
  matchResults = Array.isArray(state.matchResults) ? [...state.matchResults] : [];
  currentMatchLog = Array.isArray(state.currentMatchLog) ? [...state.currentMatchLog] : [];
  if (state.sessionCpuStats) Object.assign(sessionCpuStats, createEmptyCpuStats(), state.sessionCpuStats);
  cpuPersonality = CPU_PERSONALITIES[state.cpuPersonality] ? state.cpuPersonality : chooseCpuPersonalityKey();
  seriesRecorded = Boolean(state.seriesRecorded);
  seriesComplete = false;
  inputLocked = Boolean(state.inputLocked);

  setupScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  document.body.classList.add('game-active');
  playerRoleLabel.textContent = sideLabel(playerSide);
  cpuRoleLabel.textContent = sideLabel(oppositeSide(playerSide));
  resetBattleView();
  renderHand();
  renderMatchLog();
  updateStatus();
  if (AUDIO.bgmEnabled) startBgm();
  requestWakeLock();

  if (state.phase === 'pending' && state.pending) {
    resumePendingBattle(state.pending);
  } else if (state.phase === 'betweenMatches' && state.pending) {
    const p = state.pending;
    showMatchResult(Boolean(p.playerWon), p.playerCard, p.cpuCard, Boolean(p.autoResolved));
  } else {
    inputLocked = false;
    if (!Number.isInteger(cpuPlannedIndex)) lockCpuCard();
    renderHand();
    saveSeriesState('ready');
  }
}

// ---- 最強CPU v3 -----------------------------------------------------
// 「後出し」はせず、各プレイの開始時点でCPUのカードを確定する。
// 基本戦略はゲーム理論上の最適混合（特殊カード率 = 1 / 残り枚数）。
// そこへ、プレイヤーの役割・残り枚数・先手/後手・直近傾向を
// ベイズ風に学習した「安全な読み」を重ねる。
const CPU_STATS_KEY = 'ecard-max-cpu-stats-v3';
const CPU_STATS_LEGACY_KEY = 'ecard-max-cpu-stats-v2';
const CPU_STATS_VERSION = 3;
const sessionCpuStats = createEmptyCpuStats();

// ---- CPU戦型 v18.5 ---------------------------------------------------
// 12戦シリーズごとに1つの「戦型」を内部で選ぶ。
// 戦型は最適混合を壊さない範囲で、読みの強さ・特殊カードの切り方・揺らぎ方だけを変える。
// 対戦中は非公開。12戦終了後に今回の戦型を開示する。
const CPU_PERSONALITIES = {
  cautious: {
    label: '慎重分析型',
    description: '最適混合を軸に、読みの不確実性を広めに見積もって崩れにくく戦う。',
    uncertaintyScale: 1.18,
    exploitScale: 0.94,
    jitter: 0.004,
  },
  aggressive: {
    label: '攻撃分析型',
    description: '十分な観測が集まると相手の出し癖へ素早く最適応答する。',
    uncertaintyScale: 0.84,
    exploitScale: 1.10,
    jitter: 0.006,
  },
  trickster: {
    label: '撹乱分析型',
    description: '最適戦略を崩さず、ごく小さな揺らぎでCPU自身のタイミングを読ませにくくする。',
    uncertaintyScale: 1.00,
    exploitScale: 1.00,
    jitter: 0.012,
  },
};

function chooseCpuPersonalityKey() {
  const keys = Object.keys(CPU_PERSONALITIES);
  return keys[secureRandomInt(keys.length)];
}

function getCpuPersonality() {
  return CPU_PERSONALITIES[cpuPersonality] || CPU_PERSONALITIES.cautious;
}

function createEmptyCpuStats() {
  return {
    version: CPU_STATS_VERSION,
    exact: {},      // 役割 + 残り枚数 + 先手/後手
    stage: {},      // 役割 + 残り枚数
    lead: {},       // 役割 + 先手/後手
    role: {},       // 役割のみ
    score: {},      // 役割 + 残り枚数 + シリーズ点差状態
    momentum: {},   // 役割 + 残り枚数 + 直前試合結果
    recent: [],     // 最近の選択列。古い癖より直近の変化を素早く拾う
  };
}

function oppositeSide(side) {
  return side === 'emperor' ? 'slave' : 'emperor';
}

function sideLabel(side) {
  return side === 'emperor' ? '皇帝側' : '奴隷側';
}

function playerSideForMatch(matchNo) {
  const groupIndex = Math.floor((matchNo - 1) / MATCHES_PER_GROUP);
  return groupIndex % 2 === 0 ? initialPlayerSide : oppositeSide(initialPlayerSide);
}

// 原作のカード提出順：各試合の1・3手目は皇帝側、2・4手目は奴隷側が先に伏せる。
// 試合番号ではなく、その試合の「何手目か」で先出し側が決まる。
function leadSideForCurrentPlay() {
  return playInMatch % 2 === 1 ? 'emperor' : 'slave';
}

function loadCpuStats() {
  try {
    // v2の学習結果は捨てず、v3へ読み替えて引き継ぐ。
    const raw = localStorage.getItem(CPU_STATS_KEY)
      || localStorage.getItem(CPU_STATS_LEGACY_KEY)
      || 'null';
    const parsed = JSON.parse(raw);
    if (!parsed || ![2, CPU_STATS_VERSION].includes(parsed.version)) return createEmptyCpuStats();
    return {
      ...createEmptyCpuStats(),
      ...parsed,
      version: CPU_STATS_VERSION,
      exact: parsed.exact || {},
      stage: parsed.stage || {},
      lead: parsed.lead || {},
      role: parsed.role || {},
      score: parsed.score || {},
      momentum: parsed.momentum || {},
      recent: Array.isArray(parsed.recent) ? parsed.recent.slice(-72) : [],
    };
  } catch (_) {
    return createEmptyCpuStats();
  }
}

function saveCpuStats(stats) {
  try {
    localStorage.setItem(CPU_STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

function getCpuContext() {
  const cardsLeft = playerHand.length;
  const lead = leadSideForCurrentPlay() === playerSide ? 'player' : 'cpu';
  const scoreState = playerWins > cpuWins ? 'ahead' : playerWins < cpuWins ? 'behind' : 'even';
  const lastResult = matchResults.length ? matchResults[matchResults.length - 1] : 'start';
  return {
    playerSide,
    cardsLeft,
    lead,
    scoreState,
    lastResult,
    exactKey: `${playerSide}:${cardsLeft}:${lead}`,
    stageKey: `${playerSide}:${cardsLeft}`,
    leadKey: `${playerSide}:${lead}`,
    roleKey: playerSide,
    scoreKey: `${playerSide}:${cardsLeft}:${scoreState}`,
    momentumKey: `${playerSide}:${cardsLeft}:${lastResult}`,
  };
}

function touchBucket(group, key, card, decay = 1) {
  const bucket = group[key] || { special: 0, citizen: 0 };

  // 古い癖を永遠に引きずらない。長期データは少しずつ減衰させる。
  bucket.special *= decay;
  bucket.citizen *= decay;

  if (card === 'citizen') bucket.citizen += 1;
  else bucket.special += 1;

  // 保存データが際限なく強くならないよう上限を設ける。
  const total = bucket.special + bucket.citizen;
  if (total > 80) {
    const scale = 80 / total;
    bucket.special *= scale;
    bucket.citizen *= scale;
  }

  group[key] = bucket;
}

function rememberPlayerChoice(card) {
  const context = getCpuContext();
  const persistent = loadCpuStats();

  touchBucket(persistent.exact, context.exactKey, card, 0.992);
  touchBucket(persistent.stage, context.stageKey, card, 0.994);
  touchBucket(persistent.lead, context.leadKey, card, 0.996);
  touchBucket(persistent.role, context.roleKey, card, 0.997);
  touchBucket(persistent.score, context.scoreKey, card, 0.994);
  touchBucket(persistent.momentum, context.momentumKey, card, 0.995);

  persistent.recent.push({
    role: context.playerSide,
    cardsLeft: context.cardsLeft,
    lead: context.lead,
    scoreState: context.scoreState,
    lastResult: context.lastResult,
    card: card === 'citizen' ? 'citizen' : 'special',
  });
  if (persistent.recent.length > 72) persistent.recent.splice(0, persistent.recent.length - 72);
  saveCpuStats(persistent);

  // 今回の12戦で見えた癖は、過去データより素早く反映する。
  touchBucket(sessionCpuStats.exact, context.exactKey, card);
  touchBucket(sessionCpuStats.stage, context.stageKey, card);
  touchBucket(sessionCpuStats.lead, context.leadKey, card);
  touchBucket(sessionCpuStats.role, context.roleKey, card);
  touchBucket(sessionCpuStats.score, context.scoreKey, card);
  touchBucket(sessionCpuStats.momentum, context.momentumKey, card);
}

function addEvidence(acc, bucket, weight) {
  if (!bucket) return;
  acc.special += (bucket.special || 0) * weight;
  acc.citizen += (bucket.citizen || 0) * weight;
}

function addRecentEvidence(acc, recent, context) {
  if (!Array.isArray(recent) || recent.length === 0) return;
  const reversed = recent.slice(-60).reverse();
  reversed.forEach((event, age) => {
    if (!event || event.role !== context.playerSide) return;
    const recency = Math.pow(0.955, age);
    let weight = 0.05;
    if (event.cardsLeft === context.cardsLeft) weight += 0.62;
    if (event.lead === context.lead) weight += 0.18;
    if (event.scoreState === context.scoreState) weight += 0.15;
    if (event.lastResult === context.lastResult) weight += 0.10;
    weight *= recency;
    if (event.card === 'special') acc.special += weight;
    else if (event.card === 'citizen') acc.citizen += weight;
  });
}

function estimatePlayerSpecialRate() {
  const context = getCpuContext();
  const persistent = loadCpuStats();

  // 相手が完全に最適なら、特殊カードを出す確率は 1 / 残り枚数。
  const nashRate = 1 / context.cardsLeft;
  const evidence = { special: 0, citizen: 0 };

  // 条件が細かいデータほど高く評価。シリーズ点差・直前結果も弱い文脈として利用する。
  addEvidence(evidence, persistent.exact[context.exactKey], 1.00);
  addEvidence(evidence, persistent.stage[context.stageKey], 0.62);
  addEvidence(evidence, persistent.lead[context.leadKey], 0.28);
  addEvidence(evidence, persistent.role[context.roleKey], 0.12);
  addEvidence(evidence, persistent.score[context.scoreKey], 0.42);
  addEvidence(evidence, persistent.momentum[context.momentumKey], 0.24);
  addRecentEvidence(evidence, persistent.recent, context);

  addEvidence(evidence, sessionCpuStats.exact[context.exactKey], 1.70);
  addEvidence(evidence, sessionCpuStats.stage[context.stageKey], 1.00);
  addEvidence(evidence, sessionCpuStats.lead[context.leadKey], 0.44);
  addEvidence(evidence, sessionCpuStats.role[context.roleKey], 0.18);
  addEvidence(evidence, sessionCpuStats.score[context.scoreKey], 0.72);
  addEvidence(evidence, sessionCpuStats.momentum[context.momentumKey], 0.38);

  // データが少ない間は理論上の最適混合を強い事前分布として使う。
  const priorStrength = 8.5;
  const alpha = nashRate * priorStrength + evidence.special;
  const beta = (1 - nashRate) * priorStrength + evidence.citizen;
  const weightedSamples = evidence.special + evidence.citizen;
  const predicted = alpha / (alpha + beta);
  const confidence = Math.min(0.96, weightedSamples / (weightedSamples + 7.0));
  const posteriorVariance = (alpha * beta)
    / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const posteriorStd = Math.sqrt(Math.max(0, posteriorVariance));

  return { predicted, confidence, nashRate, weightedSamples, posteriorStd };
}

function continuationValueForPlayer(side, citizensLeft) {
  let value = side === 'emperor' ? -1 : 1;
  for (let n = 1; n <= citizensLeft; n += 1) {
    value = side === 'emperor'
      ? (value + 1) / (3 - value)
      : (value - 1) / (value + 3);
  }
  return value;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function expectedPlayerValue(cpuSpecialRate, playerSpecialRate, continuation) {
  const q = cpuSpecialRate;
  const p = playerSpecialRate;

  if (playerSide === 'emperor') {
    const ifCpuSpecial = p * -1 + (1 - p) * 1;
    const ifCpuCitizen = p * 1 + (1 - p) * continuation;
    return q * ifCpuSpecial + (1 - q) * ifCpuCitizen;
  }

  const ifCpuSpecial = p * 1 + (1 - p) * -1;
  const ifCpuCitizen = p * -1 + (1 - p) * continuation;
  return q * ifCpuSpecial + (1 - q) * ifCpuCitizen;
}

function robustCpuSpecialRate(model, personality, continuation) {
  // 推定値を一点読みせず、ベイズ事後分布の幅を含む範囲で最悪ケースを最小化する。
  // これにより、読みが外れても理論上の最適混合から大崩れしにくい。
  const uncertainty = clamp(
    (model.posteriorStd * 1.55 + (1 - model.confidence) * 0.035)
      * personality.uncertaintyScale,
    0.025,
    0.30
  );
  const low = clamp(model.predicted - uncertainty, 0.001, 0.999);
  const high = clamp(model.predicted + uncertainty, 0.001, 0.999);
  const center = model.predicted;

  let bestRate = model.nashRate;
  let bestRisk = Infinity;

  // 1%刻みでロバスト最適応答を探索。カードは最大5枚なので十分軽い。
  for (let i = 1; i <= 99; i += 1) {
    const q = i / 100;
    const worstCase = Math.max(
      expectedPlayerValue(q, low, continuation),
      expectedPlayerValue(q, center, continuation),
      expectedPlayerValue(q, high, continuation)
    );
    // データが薄い間だけ、均衡戦略から離れることへ小さな罰則を掛ける。
    const safetyPenalty = Math.abs(q - model.nashRate) * (1 - model.confidence) * 0.10;
    const risk = worstCase + safetyPenalty;
    if (risk < bestRisk - 1e-9) {
      bestRisk = risk;
      bestRate = q;
    } else if (Math.abs(risk - bestRisk) <= 1e-9
      && Math.abs(q - model.nashRate) < Math.abs(bestRate - model.nashRate)) {
      bestRate = q;
    }
  }

  // 戦型差は「強さを落とす癖」ではなく、どれだけ早く読みへ寄せるかだけに限定。
  const trust = clamp(model.confidence * personality.exploitScale, 0, 1);
  let rate = model.nashRate * (1 - trust) + bestRate * trust;

  // 撹乱用の微小揺らぎ。均衡を壊すほど大きくしない。
  if (personality.jitter > 0) {
    rate += (secureRandomFloat() * 2 - 1) * personality.jitter * (0.35 + 0.65 * (1 - model.confidence));
  }
  return clamp(rate, 0.015, 0.985);
}

function chooseStrongCpuCardIndex() {
  const specialIndex = cpuHand.findIndex((card) => card !== 'citizen');
  const citizenIndices = cpuHand
    .map((card, index) => card === 'citizen' ? index : -1)
    .filter((index) => index >= 0);

  if (specialIndex < 0) {
    return citizenIndices[secureRandomInt(citizenIndices.length)];
  }
  if (citizenIndices.length === 0) return specialIndex;

  const model = estimatePlayerSpecialRate();
  const personality = getCpuPersonality();
  const citizensAfterTie = Math.max(0, citizenIndices.length - 1);
  const continuation = continuationValueForPlayer(playerSide, citizensAfterTie);
  const specialRate = robustCpuSpecialRate(model, personality, continuation);

  if (secureRandomFloat() < specialRate) return specialIndex;
  return citizenIndices[secureRandomInt(citizenIndices.length)];
}

function lockCpuCard() {
  cpuPlannedIndex = chooseStrongCpuCardIndex();
  if (cpuLockLabel) cpuLockLabel.textContent = '🔒 CPUカード確定済み';
}

function secureRandomFloat() {
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] / 0x100000000;
  }
  return Math.random();
}

function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 1) return 0;

  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const maxUint = 0x100000000;
    const limit = maxUint - (maxUint % maxExclusive);
    const value = new Uint32Array(1);
    do {
      window.crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

function shuffleCards(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildHand(keyCard) {
  // 皇帝／奴隷の位置が固定で読まれないよう、試合開始時から独立シャッフル。
  return shuffleCards([keyCard, 'citizen', 'citizen', 'citizen', 'citizen']);
}

function reshuffleRemainingHands() {
  // 引き分け後は、残った手札の画面上の位置を両者それぞれ独立に再シャッフルする。
  // 将来の2人オンライン対戦でも、各端末が自分の手札だけをローカルで並べ替える設計に流用できる。
  playerHand = shuffleCards(playerHand);
  cpuHand = shuffleCards(cpuHand);
}


let lotteryDrawing = false;
let lotterySequenceId = 0;

function randomInitialSide() {
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return (value[0] & 1) === 0 ? 'emperor' : 'slave';
  }
  return Math.random() < 0.5 ? 'emperor' : 'slave';
}

function resetLotteryView() {
  // 抽選演出の途中でタイトルへ戻った場合、待機中の非同期処理を確実に無効化する。
  lotterySequenceId += 1;
  lotteryDrawing = false;
  if (lotteryBtn) {
    lotteryBtn.disabled = false;
    lotteryBtn.textContent = '陣営を抽選する';
  }
  if (lotteryCard) lotteryCard.classList.remove('is-drawing', 'is-revealed', 'is-emperor', 'is-slave');
  if (lotteryResultImage) {
    lotteryResultImage.src = 'images/back.webp';
    lotteryResultImage.alt = '抽選前のE-CARD 裏面';
  }
  if (lotteryResultLabel) lotteryResultLabel.textContent = '抽選前';
  if (lotteryResultSub) lotteryResultSub.textContent = '皇帝側 50% ／ 奴隷側 50%';
}

function sfxLotterySpin() {
  tone(220, 0.06, 'square', 0.08);
  tone(277.18, 0.06, 'square', 0.07, 0.11);
  tone(329.63, 0.06, 'square', 0.07, 0.22);
  tone(392, 0.08, 'triangle', 0.08, 0.33);
}

function sfxLotteryReveal(side) {
  if (side === 'emperor') {
    tone(220, 0.10, 'triangle', 0.11);
    tone(329.63, 0.13, 'triangle', 0.12, 0.10);
    tone(493.88, 0.28, 'triangle', 0.13, 0.22);
  } else {
    tone(196, 0.10, 'triangle', 0.11);
    tone(293.66, 0.13, 'triangle', 0.12, 0.10);
    tone(440, 0.28, 'triangle', 0.13, 0.22);
  }
}

async function runSideLottery() {
  if (lotteryDrawing) return;

  // iOS Safari向け: SEをOFFにしていても、抽選ボタンのユーザー操作中に
  // AudioContextを解放しておき、後から始まるBGMが無音になりにくくする。
  if (preferences.bgmEnabled || preferences.sfxEnabled) ensureAudio();

  const saved = loadSeriesState();
  if (saved) {
    const ok = window.confirm('途中の12戦マッチがあります。新しく抽選すると途中データは上書きされます。新しい対戦を始めますか？');
    if (!ok) {
      stopBgm();
      return;
    }
    clearSeriesState();
  }

  lotteryDrawing = true;
  const drawSequenceId = ++lotterySequenceId;
  const chosenSide = randomInitialSide();
  if (lotteryBtn) {
    lotteryBtn.disabled = true;
    lotteryBtn.textContent = '抽選中…';
  }
  if (lotteryResultLabel) lotteryResultLabel.textContent = '抽選中…';
  if (lotteryResultSub) lotteryResultSub.textContent = 'カードが止まるまで待ってください';
  if (lotteryResultImage) {
    lotteryResultImage.src = 'images/back.webp';
    lotteryResultImage.alt = '抽選中のE-CARD 裏面';
  }
  if (lotteryCard) {
    lotteryCard.classList.remove('is-revealed', 'is-emperor', 'is-slave');
    void lotteryCard.offsetWidth;
    lotteryCard.classList.add('is-drawing');
  }
  safeVibrate([12, 28, 12, 28, 12]);
  sfxLotterySpin();

  await wait(1050);
  if (drawSequenceId !== lotterySequenceId) return;
  if (lotteryResultImage) {
    lotteryResultImage.src = CARD_INFO[chosenSide].image;
    lotteryResultImage.alt = `${CARD_INFO[chosenSide].label}カード`;
  }
  if (lotteryCard) {
    lotteryCard.classList.remove('is-drawing');
    lotteryCard.classList.add('is-revealed', chosenSide === 'emperor' ? 'is-emperor' : 'is-slave');
  }
  if (lotteryResultLabel) lotteryResultLabel.textContent = `あなたは${sideLabel(chosenSide)}`;
  if (lotteryResultSub) lotteryResultSub.textContent = `第1〜3戦は${CARD_INFO[chosenSide].label}1枚＋市民4枚`;
  safeVibrate([28, 50, 38]);
  sfxLotteryReveal(chosenSide);

  await wait(1250);
  if (drawSequenceId !== lotterySequenceId) return;
  lotteryDrawing = false;
  // 抽選演出が完全に終わった瞬間からBGMを聞かせる。
  // 抽選中はiPhone対策として無音で再生を準備し、ここで曲頭へ戻して解除する。
  startBgmAfterLottery();
  startSeries(chosenSide);
}

function startSeries(side) {
  initialPlayerSide = side;
  seriesId = createSeriesId();
  currentMatch = 1;
  seriesRecorded = false;
  seriesComplete = false;
  playerWins = 0;
  cpuWins = 0;
  matchResults = [];
  currentMatchLog = [];
  Object.assign(sessionCpuStats, createEmptyCpuStats());
  cpuPersonality = chooseCpuPersonalityKey();

  setupScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  document.body.classList.add('game-active');

  if (AUDIO.bgmEnabled) startBgm();
  requestWakeLock();
  startMatch();
}

function startMatch() {
  battleSequenceId += 1;
  const sequenceId = battleSequenceId;
  playerSide = playerSideForMatch(currentMatch);
  const cpuSide = oppositeSide(playerSide);
  playerHand = buildHand(playerSide);
  cpuHand = buildHand(cpuSide);
  currentMatchLog = [];
  playInMatch = 1;
  inputLocked = true;
  cpuPlannedIndex = null;

  playerRoleLabel.textContent = sideLabel(playerSide);
  cpuRoleLabel.textContent = sideLabel(cpuSide);

  resultScreen.classList.add('hidden');
  hideSelectionTray();
  lockCpuCard();
  resetBattleView();
  renderHand();
  renderMatchLog();
  updateStatus();
  saveSeriesState('ready');
  runMatchIntro(sequenceId);
}

async function runMatchIntro(sequenceId) {
  if (!matchIntro) {
    inputLocked = false;
    renderHand();
    return;
  }

  matchIntroTop.textContent = `MATCH ${currentMatch} / ${TOTAL_MATCHES}`;
  matchIntroMain.textContent = sideLabel(playerSide);
  matchIntroSub.textContent = '最強CPUは毎シリーズ戦型が変化';
  matchIntro.classList.remove('hidden');
  sfxMatchStart();
  safeVibrate([14, 35, 18]);

  await wait(900);
  if (sequenceId !== battleSequenceId || gameScreen.classList.contains('hidden')) return;
  matchIntro.classList.add('hidden');
  inputLocked = false;
  renderHand();
  saveSeriesState('ready');
}

function currentPickPrompt() {
  return 'カードを選んでください。';
}

function setBattleVersusOutcome(kind = 'vs') {
  if (!battleVersus) return;
  const labels = { vs: 'VS', win: 'WIN', lose: 'LOSE', draw: 'DRAW' };
  const normalized = Object.prototype.hasOwnProperty.call(labels, kind) ? kind : 'vs';
  battleVersus.textContent = labels[normalized];
  battleVersus.classList.remove('is-win', 'is-lose', 'is-draw', 'is-outcome-pop');
  if (normalized !== 'vs') {
    battleVersus.classList.add(`is-${normalized}`);
    void battleVersus.offsetWidth;
    battleVersus.classList.add('is-outcome-pop');
  }
}

function hideSelectionTray() {
  // v18.9.3で確認トレイ自体は削除済み。選択状態の初期化だけを担当する。
  selectedHandIndex = null;
}

function updateHandSelectionVisuals() {
  playerHandEl.querySelectorAll('.hand-card').forEach((button) => {
    const index = Number(button.dataset.index);
    const isSelected = selectedHandIndex === index;
    button.classList.toggle('is-selected', isSelected);
    button.classList.toggle('is-dimmed', selectedHandIndex !== null && !isSelected);
  });
}

function chooseHandCard(index, { allowConfirm = true, fromSlide = false } = {}) {
  if (inputLocked || index < 0 || index >= playerHand.length) return;

  // 通常タップは「1回目=選択 / 同じカードをもう1回=確定」。
  // 横スライド中は、同じカード上を通っても誤確定しない。
  if (allowConfirm && selectedHandIndex === index) {
    playCard(index);
    return;
  }
  if (!allowConfirm && selectedHandIndex === index) return;

  const changed = selectedHandIndex !== index;
  selectedHandIndex = index;
  const card = playerHand[index];
  showPlaceholder(playerPlayedEl);
  showPlaceholder(cpuPlayedEl);
  updateHandSelectionVisuals();

  if (changed) {
    sfxCardSelect();
    safeVibrate(fromSlide ? 5 : 9);
  }
  const picked = playerHandEl.querySelector(`[data-index="${index}"]`);
  if (picked) {
    picked.classList.remove('is-pick-pop');
    void picked.offsetWidth;
    picked.classList.add('is-pick-pop');
  }
  setMessage(fromSlide
    ? `${CARD_INFO[card].label}を選択中。指を離しても選択は保持されます。`
    : `${CARD_INFO[card].label}を選択中。スマホはもう一度タップ、PCはダブルクリックでも確定します。`);
}

function nearestHandCardIndex(clientX) {
  const buttons = Array.from(playerHandEl.querySelectorAll('.hand-card:not(:disabled)'));
  if (!buttons.length) return null;

  // 見た目の transform（扇形の回転・選択時の拡大）ではなく、
  // 手札レール上の論理位置で判定する。これにより端カードの判定が
  // 選択アニメーションでズレず、左端まで安定してスライドできる。
  const handRect = playerHandEl.getBoundingClientRect();
  const pointerX = clientX - handRect.left + playerHandEl.scrollLeft;
  const targets = buttons
    .map((button) => ({
      index: Number(button.dataset.index),
      center: button.offsetLeft + button.offsetWidth / 2,
    }))
    .filter((item) => Number.isInteger(item.index))
    .sort((a, b) => a.center - b.center);

  if (!targets.length) return null;
  if (targets.length === 1) return targets[0].index;

  // 左右端は少し広めに吸着させる。画面端まで指を滑らせた時に
  // 一番端のカードを取りこぼさないためのマグネット領域。
  const firstBoundary = (targets[0].center + targets[1].center) / 2 + 14;
  const last = targets.length - 1;
  const lastBoundary = (targets[last - 1].center + targets[last].center) / 2 - 14;
  if (pointerX <= firstBoundary) return targets[0].index;
  if (pointerX >= lastBoundary) return targets[last].index;

  let nearest = targets[0];
  let nearestDistance = Math.abs(pointerX - nearest.center);
  targets.slice(1).forEach((target) => {
    const distance = Math.abs(pointerX - target.center);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = target;
    }
  });
  return nearest.index;
}

function resetHandDrag() {
  handDragState.active = false;
  handDragState.pointerId = null;
  handDragState.dragging = false;
  handDragState.lastIndex = null;
  playerHandEl.classList.remove('is-slide-selecting');
}

function setupHandSlideSelection() {
  if (!playerHandEl || playerHandEl.dataset.slideSelectionReady === '1') return;
  playerHandEl.dataset.slideSelectionReady = '1';

  playerHandEl.addEventListener('pointerdown', (event) => {
    if (inputLocked || !playerHand.length || event.pointerType === 'mouse' && event.button !== 0) return;
    handDragState.active = true;
    handDragState.pointerId = event.pointerId;
    handDragState.startX = event.clientX;
    handDragState.startY = event.clientY;
    handDragState.dragging = false;
    handDragState.lastIndex = null;
  });

  const move = (event) => {
    if (!handDragState.active || handDragState.pointerId !== event.pointerId || inputLocked) return;
    const dx = event.clientX - handDragState.startX;
    const dy = event.clientY - handDragState.startY;

    if (!handDragState.dragging) {
      // 横方向への意図が明確になった時だけスライド選択を開始。
      // 縦スクロールは通常どおり使える。
      if (Math.abs(dx) < 9 || Math.abs(dx) <= Math.abs(dy) * 1.05) return;
      handDragState.dragging = true;
      playerHandEl.classList.add('is-slide-selecting');
      try { playerHandEl.setPointerCapture(event.pointerId); } catch (_) {}
    }

    event.preventDefault();
    const index = nearestHandCardIndex(event.clientX);
    if (index === null || index === handDragState.lastIndex) return;
    handDragState.lastIndex = index;
    chooseHandCard(index, { allowConfirm: false, fromSlide: true });
  };

  const finish = (event) => {
    if (!handDragState.active || (event && handDragState.pointerId !== event.pointerId)) return;
    if (handDragState.dragging) {
      handDragSuppressClickUntil = Date.now() + 380;
      if (event) {
        try { playerHandEl.releasePointerCapture(event.pointerId); } catch (_) {}
      }
    }
    resetHandDrag();
  };

  // iPhoneで画面端へ指を滑らせても追跡が途切れないよう、
  // pointermove / pointerup は window 側でも受ける。
  window.addEventListener('pointermove', move, { passive: false, capture: true });
  window.addEventListener('pointerup', finish, { capture: true });
  window.addEventListener('pointercancel', finish, { capture: true });
  playerHandEl.addEventListener('lostpointercapture', () => {
    if (handDragState.active) resetHandDrag();
  });
}

function renderHand() {
  playerHandEl.innerHTML = '';
  playerHandEl.dataset.count = String(playerHand.length);

  playerHand.forEach((card, index) => {
    const button = document.createElement('button');

    // v18.10.2: 横一列は維持しつつ、手元から見た3Dの持ち角度を付ける。
    // 左右のカードほど少し内向き、中央ほど正面にして「並べたカード」ではなく
    // プレイヤーが手前で保持しているように見せる。
    const rotate = 0;
    const lift = 0;
    const middle = (playerHand.length - 1) / 2;
    const spread = Math.max(1, middle);
    const holdPosition = Math.max(-1, Math.min(1, (index - middle) / spread));
    const holdYaw = -holdPosition * 7.2;
    const holdRoll = holdPosition * 0.75;
    const holdDepth = (1 - Math.abs(holdPosition)) * 9;
    const selectedYaw = -holdPosition * 2.2;

    button.className = 'hand-card';
    if (selectedHandIndex === index) button.classList.add('is-selected');
    if (selectedHandIndex !== null && selectedHandIndex !== index) button.classList.add('is-dimmed');
    button.type = 'button';
    button.disabled = inputLocked;
    button.dataset.index = String(index);
    button.style.setProperty('--fan-rot', `${rotate}deg`);
    button.style.setProperty('--fan-lift', `${lift}px`);
    button.style.setProperty('--hold-yaw', `${holdYaw.toFixed(2)}deg`);
    button.style.setProperty('--hold-roll', `${holdRoll.toFixed(2)}deg`);
    button.style.setProperty('--hold-depth', `${holdDepth.toFixed(2)}px`);
    button.style.setProperty('--selected-yaw', `${selectedYaw.toFixed(2)}deg`);
    button.setAttribute('aria-label', `${CARD_INFO[card].label}を選ぶ。PCではダブルクリックで決定`);
    button.title = 'クリックで選択 / ダブルクリックで決定';
    button.innerHTML = `<img src="${CARD_INFO[card].image}" alt="${CARD_INFO[card].label}カード">`;
    button.addEventListener('click', (event) => {
      if (Date.now() < handDragSuppressClickUntil) {
        event.preventDefault();
        return;
      }
      chooseHandCard(index);
    });

    // v18.9.2: PCではカードをダブルクリックしても即決定できる。
    // 通常のclick処理で2回目のクリック時に確定済みの場合は、
    // playCard側のinputLockedで二重実行を防ぐ。
    button.addEventListener('dblclick', (event) => {
      if (event.button !== 0 || Date.now() < handDragSuppressClickUntil || inputLocked) return;
      event.preventDefault();
      event.stopPropagation();
      playCard(index);
    });

    // v18.10.0: PCのマウス位置に応じてカードをほんの少し立体的に傾ける。
    // タッチ端末では動かさず、既存の横スライド操作を優先する。
    if (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = Math.max(-0.5, Math.min(0.5, (event.clientX - rect.left) / rect.width - 0.5));
        const ny = Math.max(-0.5, Math.min(0.5, (event.clientY - rect.top) / rect.height - 0.5));
        button.style.setProperty('--hover-tilt-y', `${(nx * 11).toFixed(2)}deg`);
        button.style.setProperty('--hover-tilt-x', `${(-ny * 8).toFixed(2)}deg`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--hover-tilt-y', '0deg');
        button.style.setProperty('--hover-tilt-x', '0deg');
      });
    }
    playerHandEl.appendChild(button);
  });

  if (selectedHandIndex === null || !playerHand[selectedHandIndex]) {
    hideSelectionTray();
  }
}

function paceMs(ms, factor = 0.55) {
  if (!preferences.fastMode) return ms;
  return Math.max(70, Math.round(ms * factor));
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, paceMs(ms)));
}

function applySpeedMode() {
  const fast = Boolean(preferences.fastMode);
  document.body.classList.toggle('fast-mode', fast);
  if (speedBtn) {
    speedBtn.classList.toggle('is-on', fast);
    speedBtn.setAttribute('aria-pressed', fast ? 'true' : 'false');
    speedBtn.textContent = fast ? '⏩ 高速 ON' : '⏩ 高速 OFF';
  }
  if (fastModeToggle) fastModeToggle.checked = fast;
}

function setFastMode(enabled) {
  preferences.fastMode = Boolean(enabled);
  savePrefs(preferences);
  applySpeedMode();
  safeVibrate(preferences.fastMode ? 16 : 8);
}

function safeVibrate(pattern) {
  if (!preferences.haptics) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function showPlaceholder(target) {
  target.className = 'played-card placeholder';
  target.textContent = '?';
}

function showCardBack(target, who = '', animate = true) {
  const sideClass = target === cpuPlayedEl ? 'cpu-set' : 'player-set';
  target.className = `played-card${animate ? ` is-set ${sideClass}` : ''}`;
  target.innerHTML = `<img src="images/back.webp" alt="${who ? `${who}の` : ''}E-CARD 裏面">`;
}

function pulseCountdown(text) {
  countdownOverlay.textContent = text;
  countdownOverlay.classList.remove('countdown-pop');
  void countdownOverlay.offsetWidth;
  countdownOverlay.classList.add('countdown-pop');
}

function setCountdownBgmDepth(depth) {
  if (!AUDIO?.bgmEnabled) return;
  const track = ensureBgmTrack();
  if (!track || track.paused) return;
  // duckMusic の復帰予約を無効化し、カウントダウン側で音量を管理する。
  AUDIO.duckToken += 1;
  setBgmElementVolume(AUDIO.bgmBaseVolume * depth);
}

function clearCountdownTension(restoreBgm = true) {
  battleZone?.classList.remove(
    'countdown-tense', 'countdown-step-3', 'countdown-step-2',
    'countdown-step-1', 'countdown-open'
  );
  if (restoreBgm && AUDIO?.bgmEnabled) {
    AUDIO.duckToken += 1;
    setBgmElementVolume(AUDIO.bgmBaseVolume);
  }
}

function applyCountdownTension(step) {
  battleZone?.classList.remove('countdown-step-3', 'countdown-step-2', 'countdown-step-1', 'countdown-open');
  battleZone?.classList.add('countdown-tense', `countdown-step-${step}`);
  const depth = step === '3' ? 0.76 : step === '2' ? 0.62 : 0.48;
  setCountdownBgmDepth(depth);
}

async function runCountdown(sequenceId) {
  countdownOverlay.classList.remove('hidden');
  clearCountdownTension(false);
  battleZone?.classList.add('countdown-tense');
  setMessage('勝負……');

  for (const number of ['3', '2', '1']) {
    if (sequenceId !== battleSequenceId) {
      clearCountdownTension(true);
      countdownOverlay.classList.add('hidden');
      return false;
    }
    applyCountdownTension(number);
    pulseCountdown(number);
    sfxCountdown(number);
    safeVibrate(18);
    await wait(560);
  }

  if (sequenceId !== battleSequenceId) {
    clearCountdownTension(true);
    countdownOverlay.classList.add('hidden');
    return false;
  }

  battleZone?.classList.remove('countdown-step-1');
  battleZone?.classList.add('countdown-open');
  AUDIO.duckToken += 1;
  setBgmElementVolume(AUDIO.bgmBaseVolume);
  pulseCountdown('OPEN');
  sfxOpen();
  safeVibrate([28, 28, 48]);
  await wait(260);
  countdownOverlay.classList.add('hidden');
  clearCountdownTension(true);
  return sequenceId === battleSequenceId;
}

async function revealBothCards(playerCard, cpuCard, sequenceId) {
  battleZone?.classList.add('is-revealing');
  playerPlayedEl.classList.add('flip-out');
  cpuPlayedEl.classList.add('flip-out');
  await wait(paceMs(175, 0.58));
  if (sequenceId !== battleSequenceId) {
    battleZone?.classList.remove('is-revealing');
    return false;
  }

  showPlayedCard(playerPlayedEl, playerCard);
  showPlayedCard(cpuPlayedEl, cpuCard);
  playerPlayedEl.classList.add('flip-in');
  cpuPlayedEl.classList.add('flip-in');
  sfxReveal();

  await wait(paceMs(290, 0.62));
  playerPlayedEl.classList.remove('flip-in');
  cpuPlayedEl.classList.remove('flip-in');
  window.setTimeout(() => battleZone?.classList.remove('is-revealing'), paceMs(300, 0.55));
  return sequenceId === battleSequenceId;
}

function buildVictoryParticles(special = false) {
  if (!victoryParticles) return;
  victoryParticles.innerHTML = '';
  const count = special ? 26 : 18;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement('i');
    const angle = (360 / count) * i + (Math.random() * 14 - 7);
    const distance = special ? 190 + Math.random() * 150 : 140 + Math.random() * 110;
    const delay = Math.random() * 0.12;
    const size = 3 + Math.random() * (special ? 8 : 5);
    particle.style.setProperty('--particle-angle', `${angle}deg`);
    particle.style.setProperty('--particle-distance', `${distance}px`);
    particle.style.setProperty('--particle-delay', `${delay}s`);
    particle.style.setProperty('--particle-size', `${size}px`);
    victoryParticles.appendChild(particle);
  }
}

function isSlaveEmperorReversal(playerCard, cpuCard) {
  return (playerCard === 'slave' && cpuCard === 'emperor')
    || (cpuCard === 'slave' && playerCard === 'emperor');
}

function accentSlaveEmperorReversal(playerCard, cpuCard) {
  if (!isSlaveEmperorReversal(playerCard, cpuCard)) return;
  const playerIsSlave = playerCard === 'slave';
  const slaveEl = playerIsSlave ? playerPlayedEl : cpuPlayedEl;
  const emperorEl = playerIsSlave ? cpuPlayedEl : playerPlayedEl;

  battleZone?.classList.remove('reversal-impact');
  slaveEl?.classList.remove('slave-upset');
  emperorEl?.classList.remove('emperor-fallen');
  void battleZone?.offsetWidth;
  battleZone?.classList.add('reversal-impact');
  slaveEl?.classList.add('slave-upset');
  emperorEl?.classList.add('emperor-fallen');

  window.setTimeout(() => {
    battleZone?.classList.remove('reversal-impact');
    slaveEl?.classList.remove('slave-upset');
    emperorEl?.classList.remove('emperor-fallen');
  }, paceMs(1180, 0.78));
}

function triggerVictoryEffect(playerCard, cpuCard, series = false, playerWon = true, accentBattle = true) {
  if (!victoryBurst) return;
  const special = !series && isSlaveEmperorReversal(playerCard, cpuCard);
  if (special) {
    if (accentBattle) accentSlaveEmperorReversal(playerCard, cpuCard);
    window.setTimeout(sfxSpecialVictory, paceMs(55, 0.75));
  }

  victoryBurst.classList.remove('hidden', 'is-special', 'is-series', 'is-playing');
  if (special) victoryBurst.classList.add('is-special');
  if (series) victoryBurst.classList.add('is-series');

  if (victoryKicker) victoryKicker.textContent = series ? '12 MATCHES COMPLETE' : special ? 'REVERSAL' : 'MATCH WON';
  if (victoryWord) victoryWord.textContent = series ? 'CHAMPION' : special ? 'EMPEROR DOWN' : 'VICTORY';
  if (victorySub) {
    victorySub.textContent = series
      ? '総合勝利'
      : special
        ? (playerWon ? '奴隷が皇帝を撃破' : 'CPUの奴隷が皇帝を撃破')
        : '勝利';
  }

  buildVictoryParticles(special || series);
  void victoryBurst.offsetWidth;
  victoryBurst.classList.add('is-playing');

  if (series) safeVibrate([30, 30, 60, 40, 100]);
  else if (special) safeVibrate([24, 28, 44, 30, 86]);
  else safeVibrate([18, 24, 46]);

  window.setTimeout(() => {
    victoryBurst.classList.add('hidden');
    victoryBurst.classList.remove('is-playing', 'is-special', 'is-series');
  }, paceMs(series ? 1600 : special ? 1420 : 760, 0.78));
}

function decorateOutcome(result) {
  playerPlayedEl.classList.remove('winner-card', 'loser-card', 'draw-card');
  cpuPlayedEl.classList.remove('winner-card', 'loser-card', 'draw-card');

  if (result === 0) {
    playerPlayedEl.classList.add('draw-card');
    cpuPlayedEl.classList.add('draw-card');
    return;
  }

  const playerWon = result === 1;
  playerPlayedEl.classList.add(playerWon ? 'winner-card' : 'loser-card');
  cpuPlayedEl.classList.add(playerWon ? 'loser-card' : 'winner-card');
  document.body.classList.remove('battle-shake');
  void document.body.offsetWidth;
  document.body.classList.add('battle-shake');
  window.setTimeout(() => document.body.classList.remove('battle-shake'), paceMs(430, 0.65));
}

async function resolveChosenBattle(pending, resumed = false, commitSourceRect = null) {
  enforceBattleSideOrder();
  const playerIndex = pending.playerIndex;
  const cpuIndex = pending.cpuIndex;
  const playerCard = pending.playerCard;
  const cpuCard = pending.cpuCard;
  const lead = pending.lead;

  if (playerIndex < 0 || playerIndex >= playerHand.length || cpuIndex < 0 || cpuIndex >= cpuHand.length) {
    clearSeriesState();
    backToSetup();
    return;
  }

  inputLocked = true;
  hideSelectionTray();
  renderHand();
  const sequenceId = ++battleSequenceId;
  cpuPlannedIndex = null;

  // 選択直後に保存。リロードしても同じCPUカードとの勝負を再開する。
  saveSeriesState('pending', pending);
  if (!pending.remembered) {
    rememberPlayerChoice(playerCard);
    pending.remembered = true;
    saveSeriesState('pending', pending);
  }

  if (resumed) {
    showCardBack(playerPlayedEl, 'あなた', false);
    showCardBack(cpuPlayedEl, 'CPU', false);
    setMessage('中断した勝負を同じカードで再開します……');
    await wait(360);
  } else if (lead === playerSide) {
    setMessage('選んだカードを伏せる……');
    await animateCommittedCardToBattle(playerCard, commitSourceRect);
    sfxCardLand(true);
    safeVibrate([9, 12, 24]);
    setMessage('あなたが先にカードを伏せた。CPUが続く……');
    await wait(300);
    if (sequenceId !== battleSequenceId) return;
    showCardBack(cpuPlayedEl, 'CPU');
    sfxCardLand(false);
    safeVibrate([7, 10, 16]);
  } else {
    // CPU先手はCPUが先に伏せ、その後に選んだ手札が左の自分枠へ移動する。
    showCardBack(cpuPlayedEl, 'CPU');
    sfxCardLand(false);
    safeVibrate([7, 10, 16]);
    setMessage('CPUが先にカードを伏せた。あなたが続く……');
    await wait(300);
    if (sequenceId !== battleSequenceId) return;
    await animateCommittedCardToBattle(playerCard, commitSourceRect);
    sfxCardLand(true);
    safeVibrate([9, 12, 24]);
  }

  if (sequenceId !== battleSequenceId) return;
  setMessage('両者、カードを伏せました。');
  await wait(320);

  const counted = await runCountdown(sequenceId);
  if (!counted) return;
  const revealed = await revealBothCards(playerCard, cpuCard, sequenceId);
  if (!revealed) return;

  const result = judge(playerCard, cpuCard);
  decorateOutcome(result);
  if (result !== 0) setBattleVersusOutcome(result === 1 ? 'win' : 'lose');
  playerHand.splice(playerIndex, 1);
  cpuHand.splice(cpuIndex, 1);

  const resultLabel = result === 0 ? '引分' : result === 1 ? '勝ち' : '負け';
  currentMatchLog.push({
    player: CARD_INFO[playerCard].label,
    cpu: CARD_INFO[cpuCard].label,
    result: resultLabel,
  });
  renderMatchLog();

  if (result === 0) {
    sfxDraw();
    setBattleVersusOutcome('draw');

    // 4手連続で市民同士なら、残る1枚は必ず「皇帝 vs 奴隷」。
    // 原作ルールではここで奴隷側の勝利が確定し、5手目を選ぶ必要はない。
    if (playInMatch >= 4 && playerHand.length === 1 && cpuHand.length === 1) {
      const finalPlayerCard = playerHand[0];
      const finalCpuCard = cpuHand[0];
      const finalResult = judge(finalPlayerCard, finalCpuCard);
      const playerWon = finalResult === 1;

      const specialReversal = isSlaveEmperorReversal(finalPlayerCard, finalCpuCard);
      await wait(360);
      if (sequenceId !== battleSequenceId) return;
      setBattleVersusOutcome(playerWon ? 'win' : 'lose');
      if (playerWon) {
        playerWins += 1;
        matchResults.push('win');
        if (specialReversal) triggerVictoryEffect(finalPlayerCard, finalCpuCard, false, true, false);
        else {
          sfxWin();
          triggerVictoryEffect(finalPlayerCard, finalCpuCard, false, true, false);
        }
      } else {
        cpuWins += 1;
        matchResults.push('lose');
        if (specialReversal) triggerVictoryEffect(finalPlayerCard, finalCpuCard, false, false, false);
        else sfxLose();
      }

      recordMatchResult(playerWon, playerSide, `${seriesId}:m${currentMatch}`);
      setMessage('勝負決着。');
      updateStatus();
      punchScore(playerWon);
      renderHand();
      saveSeriesState('betweenMatches', {
        playerWon,
        playerCard: finalPlayerCard,
        cpuCard: finalCpuCard,
        autoResolved: true,
      });

      await wait(1450);
      if (sequenceId !== battleSequenceId) return;
      showMatchResult(playerWon, finalPlayerCard, finalCpuCard, true);
      return;
    }

    setMessage('次のカードを選んでください。');
    playInMatch += 1;
    reshuffleRemainingHands();
    updateStatus();
    lockCpuCard();
    saveSeriesState('ready');

    // 引き分け表示中は次の入力をまだ受け付けない。
    // 表示切替と手札再描画が完了してから操作を解放する。
    await wait(1200);
    if (sequenceId !== battleSequenceId) return;
    resetBattleView();
    inputLocked = false;
    renderHand();
    return;
  }

  const playerWon = result === 1;
  const specialReversal = isSlaveEmperorReversal(playerCard, cpuCard);
  if (playerWon) {
    playerWins += 1;
    matchResults.push('win');
    if (specialReversal) triggerVictoryEffect(playerCard, cpuCard, false, true);
    else {
      sfxWin();
      triggerVictoryEffect(playerCard, cpuCard, false, true);
    }
  } else {
    cpuWins += 1;
    matchResults.push('lose');
    if (specialReversal) triggerVictoryEffect(playerCard, cpuCard, false, false);
    else sfxLose();
  }

  recordMatchResult(playerWon, playerSide, `${seriesId}:m${currentMatch}`);

  setMessage('勝負決着。');
  updateStatus();
  punchScore(playerWon);
  renderHand();
  saveSeriesState('betweenMatches', { playerWon, playerCard, cpuCard });

  await wait(1300);
  if (sequenceId !== battleSequenceId) return;
  showMatchResult(playerWon, playerCard, cpuCard);
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function animateCommittedCardToBattle(card, sourceRect) {
  if (!sourceRect || !playerPlayedEl || prefersReducedMotion()) {
    showCardBack(playerPlayedEl, 'あなた', false);
    return Promise.resolve();
  }

  const targetRect = playerPlayedEl.getBoundingClientRect();
  if (!targetRect.width || !targetRect.height) {
    showCardBack(playerPlayedEl, 'あなた', false);
    return Promise.resolve();
  }

  const flight = document.createElement('div');
  flight.className = 'commit-flight-card commit-flight-natural';
  flight.setAttribute('aria-hidden', 'true');

  // 到着サイズを基準にして、手札位置から同じカードが滑ってくるように見せる。
  // left/top/width/heightを同時に変形すると「飛ぶ・膨らむ」印象が強かったため、
  // 位置と縮尺だけをtransformで補間する。
  flight.style.left = `${targetRect.left}px`;
  flight.style.top = `${targetRect.top}px`;
  flight.style.width = `${targetRect.width}px`;
  flight.style.height = `${targetRect.height}px`;
  flight.style.transformOrigin = '50% 72%';

  const backImage = document.createElement('img');
  backImage.className = 'commit-flight-back-image';
  backImage.src = 'images/back.webp';
  backImage.alt = '';
  flight.appendChild(backImage);
  document.body.appendChild(flight);

  const sourceCx = sourceRect.left + sourceRect.width / 2;
  const sourceCy = sourceRect.top + sourceRect.height / 2;
  const targetCx = targetRect.left + targetRect.width / 2;
  const targetCy = targetRect.top + targetRect.height / 2;
  const dx = sourceCx - targetCx;
  const dy = sourceCy - targetCy;
  const scale = Math.max(.66, Math.min(1.12, sourceRect.width / targetRect.width));
  const handRect = playerHandEl?.getBoundingClientRect?.();
  const handCenterX = handRect?.width ? handRect.left + handRect.width / 2 : sourceCx;
  const handHalfWidth = Math.max(1, (handRect?.width || sourceRect.width * 5) / 2);
  const handPosition = Math.max(-1, Math.min(1, (sourceCx - handCenterX) / handHalfWidth));
  const releaseYaw = -handPosition * 7.2;
  const releaseRoll = handPosition * .75;
  const duration = preferences.fastMode ? 210 : 430;

  if (!flight.animate) {
    flight.style.transform = 'none';
    showCardBack(playerPlayedEl, 'あなた', false);
    flight.remove();
    return Promise.resolve();
  }

  const animation = flight.animate([
    {
      // 手元で保持していた角度をそのまま引き継ぐ。
      transform: `perspective(1000px) translate3d(${dx}px, ${dy}px, 30px) rotateX(9deg) rotateY(${releaseYaw.toFixed(2)}deg) rotateZ(${releaseRoll.toFixed(2)}deg) scale(${scale})`,
      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.58))',
      offset: 0,
    },
    {
      // まず手札から一枚だけ抜き出す。上へ飛ばさず、手前へ持ち上げる感覚。
      transform: `perspective(1000px) translate3d(${dx * .78}px, ${dy * .78 - 12}px, 54px) rotateX(3deg) rotateY(${(releaseYaw * .48).toFixed(2)}deg) rotateZ(${(releaseRoll * .40).toFixed(2)}deg) scale(${scale + .025})`,
      filter: 'drop-shadow(0 24px 34px rgba(0,0,0,.62))',
      offset: .24,
    },
    {
      // 祭壇へ前方に滑らせながら、カード面を徐々に寝かせる。
      transform: `perspective(1000px) translate3d(${dx * .30}px, ${dy * .29 - 7}px, 24px) rotateX(-1.5deg) rotateY(${(releaseYaw * .16).toFixed(2)}deg) rotateZ(${(releaseRoll * .12).toFixed(2)}deg) scale(${scale + (1 - scale) * .74})`,
      filter: 'drop-shadow(0 16px 23px rgba(0,0,0,.54))',
      offset: .72,
    },
    {
      transform: 'perspective(1000px) translate3d(0, -2px, 5px) rotateX(-1deg) rotateY(0deg) rotateZ(0deg) scale(1.004)',
      filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.48))',
      offset: .92,
    },
    {
      transform: 'perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
      filter: 'drop-shadow(0 7px 12px rgba(0,0,0,.42))',
      offset: 1,
    },
  ], {
    duration,
    easing: 'cubic-bezier(.18,.78,.22,1)',
    fill: 'forwards',
  });

  return new Promise((resolve) => {
    const finish = () => {
      // 移動アニメの到着後に、同じ位置で静止カードへ置き換える。
      // is-setを付けないことで「もう一度上から落ちる」二重着地を防ぐ。
      showCardBack(playerPlayedEl, 'あなた', false);
      flight.remove();
      resolve();
    };
    animation.addEventListener('finish', finish, { once: true });
    animation.addEventListener('cancel', finish, { once: true });
  });
}

async function playCard(playerIndex) {
  if (inputLocked || playerIndex < 0 || playerIndex >= playerHand.length) return;

  // 確定時の出発位置を先に保存。選んだ手札から勝負枠へカードが移動する。
  inputLocked = true;
  const selectedButton = playerHandEl.querySelector(`[data-index="${playerIndex}"]`);
  const sourceRect = selectedButton ? selectedButton.getBoundingClientRect() : null;
  playerHandEl.querySelectorAll('.hand-card').forEach((button) => { button.disabled = true; });
  if (selectedButton) {
    selectedButton.classList.remove('is-pick-pop', 'is-chosen');
    selectedButton.classList.add('is-selected', 'is-committing');
  }
  sfxCardConfirm();
  safeVibrate([10, 18, 24]);
  await wait(70);
  selectedHandIndex = null;

  const cpuIndex = Number.isInteger(cpuPlannedIndex) ? cpuPlannedIndex : chooseStrongCpuCardIndex();
  const pending = {
    playerIndex,
    cpuIndex,
    playerCard: playerHand[playerIndex],
    cpuCard: cpuHand[cpuIndex],
    lead: leadSideForCurrentPlay(),
    remembered: false,
  };

  await resolveChosenBattle(pending, false, sourceRect);
}

async function resumePendingBattle(pending) {
  if (!pending || !Number.isInteger(pending.playerIndex) || !Number.isInteger(pending.cpuIndex)) {
    inputLocked = false;
    if (!Number.isInteger(cpuPlannedIndex)) lockCpuCard();
    saveSeriesState('ready');
    renderHand();
    return;
  }
  await resolveChosenBattle({ ...pending }, true);
}

function judge(player, cpu) {
  if (player === cpu) return 0;
  const wins = {
    emperor: 'citizen',
    citizen: 'slave',
    slave: 'emperor',
  };
  return wins[player] === cpu ? 1 : -1;
}

function showPlayedCard(target, card) {
  target.className = 'played-card';
  target.innerHTML = `<img src="${CARD_INFO[card].image}" alt="${CARD_INFO[card].label}カード">`;
}

function resetBattleView() {
  enforceBattleSideOrder();
  hideSelectionTray();
  countdownOverlay.classList.add('hidden');
  countdownOverlay.textContent = '';
  setBattleVersusOutcome('vs');
  showPlaceholder(playerPlayedEl);
  showPlaceholder(cpuPlayedEl);
  setMessage(currentPickPrompt());
}

function updateStatus() {
  matchLabel.textContent = `${currentMatch} / ${TOTAL_MATCHES}`;
  groupLabel.textContent = `${Math.ceil(currentMatch / MATCHES_PER_GROUP)} / 4`;
  roundLabel.textContent = `${Math.min(playInMatch, 4)} / 4`;
  remainingLabel.textContent = `残り${playerHand.length}枚`;
  playerScoreLabel.textContent = playerWins;
  cpuScoreLabel.textContent = cpuWins;

  const lead = leadSideForCurrentPlay();
  orderLabel.textContent = `${sideLabel(lead)}${lead === playerSide ? '（あなた）' : '（CPU）'}`;
  if (compactMatchLabel) compactMatchLabel.textContent = `${currentMatch}/${TOTAL_MATCHES}`;
  if (compactSideLabel) compactSideLabel.textContent = sideLabel(playerSide);
  if (compactPlayLabel) compactPlayLabel.textContent = `${Math.min(playInMatch, 4)}/4`;
  if (compactPlayerScore) compactPlayerScore.textContent = playerWins;
  if (compactCpuScore) compactCpuScore.textContent = cpuWins;
  if (compactLeadLabel) compactLeadLabel.textContent = lead === playerSide ? 'あなた' : 'CPU';
  renderSeriesProgress();
}

function renderSeriesProgress() {
  seriesProgress.innerHTML = '';
  for (let i = 1; i <= TOTAL_MATCHES; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'progress-dot';
    dot.textContent = i;
    if (i < currentMatch || (i === currentMatch && matchResults.length >= currentMatch)) {
      const result = matchResults[i - 1];
      if (result) dot.classList.add(result);
    } else if (i === currentMatch) {
      dot.classList.add('current');
    }
    if (i === 4 || i === 7 || i === 10) dot.classList.add('group-start');
    seriesProgress.appendChild(dot);
  }
}

function setMessage(text, state = '') {
  messageBox.textContent = text;
  messageBox.className = 'message-box';
  if (state) messageBox.classList.add(state);
}

function setResultPresentation(kind, playerCard = null, cpuCard = null, isSeries = false) {
  if (!resultCard) return;
  resultCard.classList.remove('result-win', 'result-lose', 'result-draw', 'series-result', 'result-enter');
  const className = kind === 'win' ? 'result-win' : kind === 'lose' ? 'result-lose' : 'result-draw';
  resultCard.classList.add(className);
  if (isSeries) resultCard.classList.add('series-result');

  if (resultStamp) resultStamp.textContent = kind === 'win' ? 'WIN' : kind === 'lose' ? 'LOSE' : 'DRAW';
  if (!isSeries && playerCard && cpuCard) {
    resultPlayerCard.innerHTML = `<img src="${CARD_INFO[playerCard].image}" alt="あなたの${CARD_INFO[playerCard].label}カード">`;
    resultCpuCard.innerHTML = `<img src="${CARD_INFO[cpuCard].image}" alt="CPUの${CARD_INFO[cpuCard].label}カード">`;
    if (resultDuel) resultDuel.classList.remove('hidden');
  }

  // class の付け直しで、毎試合モーダルの登場演出を再生する。
  void resultCard.offsetWidth;
  resultCard.classList.add('result-enter');
}

function punchScore(playerWon) {
  const target = playerWon ? playerScoreLabel : cpuScoreLabel;
  if (!target) return;
  target.classList.remove('score-punch');
  void target.offsetWidth;
  target.classList.add('score-punch');
  window.setTimeout(() => target.classList.remove('score-punch'), paceMs(520, 0.65));
}

function showMatchResult(playerWon, playerCard, cpuCard, autoResolved = false) {
  inputLocked = true;
  const seriesFinished = currentMatch >= TOTAL_MATCHES;

  if (seriesFinished) {
    showSeriesResult();
    return;
  }

  setResultPresentation(playerWon ? 'win' : 'lose', playerCard, cpuCard, false);
  resultEyebrow.textContent = `MATCH ${currentMatch} / ${TOTAL_MATCHES}`;
  resultTitle.textContent = playerWon ? 'WIN' : 'LOSE';
  resultText.textContent = autoResolved
    ? `4手連続の市民同士で残りが${CARD_INFO[playerCard].label} vs ${CARD_INFO[cpuCard].label}となり、奴隷側の勝利が確定しました。`
    : playerWon
      ? `${CARD_INFO[playerCard].label}で${CARD_INFO[cpuCard].label}を破りました。`
      : `${CARD_INFO[cpuCard].label}に${CARD_INFO[playerCard].label}を破られました。`;

  const nextMatch = currentMatch + 1;
  const nextSide = playerSideForMatch(nextMatch);
  const changesSide = nextSide !== playerSide;
  resultScore.innerHTML = `現在 <strong>${playerWins}勝</strong> − <strong>${cpuWins}勝</strong>${changesSide ? `<small>次の第${nextMatch}戦から ${sideLabel(nextSide)} に交代</small>` : ''}`;

  retryBtn.textContent = `第${nextMatch}戦へ`;
  resultScreen.classList.remove('hidden');
}

function showSeriesResult() {
  seriesComplete = true;
  stopBgm(true);
  releaseWakeLock();
  recordSeriesResult();
  clearSeriesState();
  resultEyebrow.textContent = '12 MATCHES COMPLETE';

  const seriesKind = playerWins > cpuWins ? 'win' : playerWins < cpuWins ? 'lose' : 'draw';
  setResultPresentation(seriesKind, null, null, true);

  if (seriesKind === 'win') {
    resultTitle.textContent = '総合勝利';
    resultText.textContent = '12試合の対戦が終了しました。';
    window.setTimeout(() => {
      sfxSeriesWin();
      triggerVictoryEffect(null, null, true);
    }, paceMs(120, 0.75));
  } else if (seriesKind === 'lose') {
    resultTitle.textContent = '総合敗北';
    resultText.textContent = '12試合の対戦が終了しました。';
    window.setTimeout(sfxSeriesLose, paceMs(120, 0.75));
  } else {
    resultTitle.textContent = '総合引き分け';
    resultText.textContent = '12試合を終えて勝利数が並びました。';
    window.setTimeout(sfxDraw, paceMs(120, 0.75));
  }

  const records = loadRecords();
  const roundMarks = Array.from({ length: TOTAL_MATCHES }, (_, i) => {
    const value = matchResults[i];
    const cls = value === 'win' ? 'final-win' : value === 'lose' ? 'final-lose' : 'final-empty';
    return `<i class="${cls}" title="第${i + 1}戦">${i + 1}</i>`;
  }).join('');
  resultScore.innerHTML = `
    <div class="series-final-tablet">
      <span class="series-final-kicker">FINAL SCORE</span>
      <div class="series-final-score"><b>${playerWins}</b><em>−</em><b>${cpuWins}</b></div>
      <div class="series-final-names"><span>あなた</span><span>CPU</span></div>
      <div class="series-final-rounds">${roundMarks}</div>
      <div class="cpu-profile-reveal">
        <span>CPU PROFILE</span>
        <strong>${getCpuPersonality().label}</strong>
        <small>${getCpuPersonality().description}</small>
      </div>
      <small class="lifetime-line">累計12戦マッチ：${records.series.played}戦 ${records.series.wins}勝 ${records.series.losses}敗 ${records.series.draws}分</small>
    </div>`;
  retryBtn.textContent = 'もう一度抽選して対戦';
  resultScreen.classList.remove('hidden');
}

async function runIntermission() {
  if (!intermission) return;
  const group = Math.ceil(currentMatch / MATCHES_PER_GROUP);
  if (intermissionGroup) intermissionGroup.textContent = `GROUP ${group} / 4`;
  if (intermissionRole) intermissionRole.textContent = `次は${sideLabel(playerSideForMatch(currentMatch))}`;
  if (intermissionScore) intermissionScore.textContent = `${playerWins} − ${cpuWins}`;
  intermission.classList.remove('hidden');
  intermission.setAttribute('aria-hidden', 'false');
  sfxIntermission();
  safeVibrate([18, 45, 28]);
  await wait(860);
  intermission.classList.add('hidden');
  intermission.setAttribute('aria-hidden', 'true');
}

async function continueSeries() {
  if (currentMatch < TOTAL_MATCHES) {
    currentMatch += 1;
    const startsNewGroup = (currentMatch - 1) % MATCHES_PER_GROUP === 0;
    resultScreen.classList.add('hidden');
    if (startsNewGroup) await runIntermission();
    startMatch();
  } else {
    backToSetup();
    resetLotteryView();
    window.setTimeout(() => lotteryBtn?.focus(), 80);
  }
}

function backToSetup() {
  battleSequenceId += 1;
  cpuPersonality = null;
  if (victoryBurst) victoryBurst.classList.add('hidden');
  stopBgm(true);
  releaseWakeLock();
  countdownOverlay.classList.add('hidden');
  if (matchIntro) matchIntro.classList.add('hidden');
  if (intermission) { intermission.classList.add('hidden'); intermission.setAttribute('aria-hidden', 'true'); }
  resultScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
  document.body.classList.remove('game-active');
  hideSelectionTray();
  resetLotteryView();
  renderResumePanel();
}

if (lotteryBtn) lotteryBtn.addEventListener('click', runSideLottery);

retryBtn.addEventListener('click', continueSeries);
document.getElementById('changeRoleBtn').addEventListener('click', backToSetup);
document.getElementById('resetBtn').addEventListener('click', backToSetup);
statsResetBtn.addEventListener('click', resetRecords);

resumeBtn.addEventListener('click', () => {
  const state = loadSeriesState();
  if (state) restoreSeriesState(state);
  else renderResumePanel();
});

discardResumeBtn.addEventListener('click', () => {
  if (!window.confirm('途中の12戦マッチを破棄しますか？')) return;
  clearSeriesState();
});

helpBtn.addEventListener('click', () => openHelp(false));
helpCloseBtn.addEventListener('click', closeHelp);
helpScreen.addEventListener('click', (event) => {
  if (event.target === helpScreen) closeHelp();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !helpScreen.classList.contains('hidden')) {
    closeHelp();
  }
});

hapticToggle.checked = preferences.haptics;
hapticToggle.addEventListener('change', () => {
  preferences.haptics = hapticToggle.checked;
  savePrefs(preferences);
  if (preferences.haptics) safeVibrate(20);
});

if (speedBtn) speedBtn.addEventListener('click', () => setFastMode(!preferences.fastMode));
if (fastModeToggle) fastModeToggle.addEventListener('change', () => setFastMode(fastModeToggle.checked));
applySpeedMode();

setupHandSlideSelection();

renderRecords();
renderResumePanel();
resetLotteryView();

// ---- MP3 BGM / 効果音 ------------------------------------------------
// v18.8.3: BGMはHTMLAudioElementで直接再生。抽選中は無音プリロールし、抽選後にフェードイン。
// iPhone Safari / ホーム画面PWAではMediaElementSource→AudioContext経由が
// 無音になる端末があるため、BGMとWeb Audio製SEを完全に分離している。
const audioBtn = document.getElementById('audioBtn');
const sfxBtn = document.getElementById('sfxBtn');
const BGM_TRACKS = [
  { title: 'The Final Ante', src: './audio/The_Final_Ante.mp3?v=18.10.6' },
  { title: 'The Heavy Hand', src: './audio/The_Heavy_Hand.mp3?v=18.10.6' },
  { title: 'The Midnight Wager', src: './audio/The_Midnight_Wager.mp3?v=18.10.6' },
  { title: 'The Final Gambit', src: './audio/The_Final_Gambit.mp3?v=18.10.6' },
  { title: 'Margin of Error', src: './audio/Margin_of_Error.mp3?v=18.10.6' },
];

const AUDIO = {
  bgmEnabled: preferences.bgmEnabled,
  sfxEnabled: preferences.sfxEnabled,
  ctx: null,
  master: null,
  musicGain: null, // 旧手続きBGM互換用。MP3 BGMには使用しない。
  sfxGain: null,
  compressor: null,
  bgmElement: null,
  bgmBaseVolume: 1.0,
  duckToken: 0,
  bgmPlayPending: false,
  bgmOrder: [],
  bgmOrderIndex: -1,
  currentBgmIndex: -1,
};

function shuffledBgmOrder(excludeIndex = -1) {
  const order = BGM_TRACKS.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length > 1 && excludeIndex >= 0 && order[0] === excludeIndex) {
    const swapIndex = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[swapIndex]] = [order[swapIndex], order[0]];
  }
  return order;
}

function nextBgmIndex({ resetCycle = false } = {}) {
  if (resetCycle || !AUDIO.bgmOrder.length || AUDIO.bgmOrderIndex >= AUDIO.bgmOrder.length - 1) {
    AUDIO.bgmOrder = shuffledBgmOrder(AUDIO.currentBgmIndex);
    AUDIO.bgmOrderIndex = 0;
  } else {
    AUDIO.bgmOrderIndex += 1;
  }
  return AUDIO.bgmOrder[AUDIO.bgmOrderIndex];
}

function applyBgmTrack(index, { resetTime = true } = {}) {
  const track = ensureBgmTrack();
  if (!track || !BGM_TRACKS[index]) return null;
  const next = BGM_TRACKS[index];
  const currentPath = new URL(track.currentSrc || track.src || '', location.href).pathname;
  const nextPath = new URL(next.src, location.href).pathname;
  if (currentPath !== nextPath) {
    track.src = next.src;
    track.load();
  }
  AUDIO.currentBgmIndex = index;
  track.dataset.trackTitle = next.title;
  if (resetTime) {
    try { track.currentTime = 0; } catch (error) { /* loaded前は無視 */ }
  }
  return track;
}

function chooseRandomBgmForSeries() {
  const index = nextBgmIndex({ resetCycle: true });
  return applyBgmTrack(index, { resetTime: true });
}

function advanceRandomBgm() {
  if (!AUDIO.bgmEnabled || seriesComplete) return;
  const index = nextBgmIndex();
  const track = applyBgmTrack(index, { resetTime: true });
  if (!track) return;
  track.muted = false;
  setBgmElementVolume(AUDIO.bgmBaseVolume);
  const promise = track.play();
  if (promise && typeof promise.catch === 'function') {
    promise.catch((error) => console.warn('Random BGM advance blocked:', error));
  }
}

function ensureBgmTrack() {
  if (!AUDIO.bgmElement) {
    const existing = document.getElementById('bgmTrack');
    const track = existing || new Audio(BGM_TRACKS[0].src);
    if (!existing) track.src = BGM_TRACKS[0].src;
    track.loop = false;
    track.preload = 'auto';
    track.playsInline = true;
    track.setAttribute('playsinline', '');
    track.setAttribute('webkit-playsinline', '');
    track.setAttribute('aria-hidden', 'true');
    try { track.volume = AUDIO.bgmBaseVolume; } catch (error) { /* iOSは端末音量を優先 */ }
    track.addEventListener('ended', advanceRandomBgm);
    AUDIO.bgmElement = track;
  }
  return AUDIO.bgmElement;
}

function ensureAudio() {
  // Web AudioはSE専用。BGM再生の成否には影響させない。
  if (!AUDIO.ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    AUDIO.ctx = new AudioContextClass();
    AUDIO.master = AUDIO.ctx.createGain();
    AUDIO.musicGain = AUDIO.ctx.createGain();
    AUDIO.sfxGain = AUDIO.ctx.createGain();
    AUDIO.compressor = AUDIO.ctx.createDynamicsCompressor();

    AUDIO.master.gain.value = 2.10;
    AUDIO.musicGain.gain.value = 1;
    AUDIO.sfxGain.gain.value = 1.15;

    AUDIO.compressor.threshold.value = -18;
    AUDIO.compressor.knee.value = 8;
    AUDIO.compressor.ratio.value = 12;
    AUDIO.compressor.attack.value = 0.0015;
    AUDIO.compressor.release.value = 0.16;

    AUDIO.musicGain.connect(AUDIO.master);
    AUDIO.sfxGain.connect(AUDIO.master);
    AUDIO.master.connect(AUDIO.compressor);
    AUDIO.compressor.connect(AUDIO.ctx.destination);
  }

  if (AUDIO.ctx.state === 'suspended') {
    const resumed = AUDIO.ctx.resume();
    if (resumed && typeof resumed.catch === 'function') resumed.catch(() => {});
  }
  return true;
}

function setBgmElementVolume(value) {
  const track = ensureBgmTrack();
  if (!track) return;
  try { track.volume = Math.max(0, Math.min(1, value)); } catch (error) { /* iOSでは変更不可の場合あり */ }
}

function primeBgmForLottery() {
  if (!AUDIO.bgmEnabled) return;
  let track = ensureBgmTrack();
  if (!track) return;

  // 新しい12戦シリーズごとに5曲をシャッフル。最初の1曲は一度だけ確定する。
  // pointerdown + touchstart が両方発火しても二重抽選しない。
  if (AUDIO.currentBgmIndex < 0) {
    track = chooseRandomBgmForSeries() || track;
  }

  // iPhone/PWA対策: ユーザー操作中に“無音で”再生権だけ確保する。
  // 実際に聞こえるのは抽選終了後。
  track.muted = true;
  try { track.currentTime = 0; } catch (error) { /* loaded前は無視 */ }
  if (!track.paused || AUDIO.bgmPlayPending) return;

  AUDIO.bgmPlayPending = true;
  let playPromise;
  try {
    playPromise = track.play();
  } catch (error) {
    AUDIO.bgmPlayPending = false;
    console.warn('BGM pre-roll failed:', error);
    return;
  }
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => { AUDIO.bgmPlayPending = false; })
      .catch((error) => {
        AUDIO.bgmPlayPending = false;
        console.warn('BGM pre-roll was blocked:', error);
      });
  } else {
    AUDIO.bgmPlayPending = false;
  }
}

function startBgmAfterLottery() {
  if (!AUDIO.bgmEnabled) return;
  let track = ensureBgmTrack();
  if (!track) return;
  if (AUDIO.currentBgmIndex < 0) track = chooseRandomBgmForSeries() || track;

  // 抽選結果が出た直後から、選ばれたランダム曲を曲頭から再生する。
  // 5曲とも曲頭に約2.8秒のフェードを入れ、音量帯も近い状態に揃えている。
  try { track.currentTime = 0; } catch (error) { /* loaded前は無視 */ }
  track.muted = false;
  setBgmElementVolume(AUDIO.bgmBaseVolume);

  if (track.paused) {
    AUDIO.bgmPlayPending = true;
    let playPromise;
    try { playPromise = track.play(); } catch (error) {
      AUDIO.bgmPlayPending = false;
      console.warn('BGM playback failed after lottery:', error);
      return;
    }
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => { AUDIO.bgmPlayPending = false; })
        .catch((error) => {
          AUDIO.bgmPlayPending = false;
          console.warn('BGM playback was blocked after lottery; retry on next touch:', error);
        });
    } else {
      AUDIO.bgmPlayPending = false;
    }
  }
}

function startBgm() {
  if (!AUDIO.bgmEnabled) return;
  let track = ensureBgmTrack();
  if (!track) return;
  if (AUDIO.currentBgmIndex < 0) track = chooseRandomBgmForSeries() || track;
  if (!track.paused || AUDIO.bgmPlayPending) return;

  track.muted = false;
  setBgmElementVolume(AUDIO.bgmBaseVolume);
  AUDIO.bgmPlayPending = true;
  let playPromise;
  try {
    playPromise = track.play();
  } catch (error) {
    AUDIO.bgmPlayPending = false;
    console.warn('BGM playback failed:', error);
    return;
  }

  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => { AUDIO.bgmPlayPending = false; })
      .catch((error) => {
        AUDIO.bgmPlayPending = false;
        console.warn('BGM playback was blocked; retry on next touch:', error);
      });
  } else {
    AUDIO.bgmPlayPending = false;
  }
}

function stopBgm(reset = false) {
  const track = AUDIO.bgmElement || document.getElementById('bgmTrack');
  if (!track) return;
  track.pause();
  AUDIO.bgmPlayPending = false;
  if (reset) {
    try { track.currentTime = 0; } catch (error) { /* loaded前は無視 */ }
    AUDIO.bgmOrder = [];
    AUDIO.bgmOrderIndex = -1;
    AUDIO.currentBgmIndex = -1;
  }
}

function duckMusic(depth = 0.30, hold = 0.18, recover = 0.34) {
  if (!AUDIO.bgmEnabled) return;
  const track = ensureBgmTrack();
  if (!track || track.paused) return;

  const token = ++AUDIO.duckToken;
  const base = AUDIO.bgmBaseVolume;
  const target = Math.max(0.05, Math.min(1, base * depth));
  setBgmElementVolume(target);

  window.setTimeout(() => {
    if (token !== AUDIO.duckToken) return;
    // iOS SafariはJSからのmedia volume変更を無視する場合がある。
    // その場合でも再生自体は止めず、他環境では滑らかに戻す。
    const started = performance.now();
    const from = target;
    const durationMs = Math.max(60, recover * 1000);
    const step = (now) => {
      if (token !== AUDIO.duckToken) return;
      const t = Math.min(1, (now - started) / durationMs);
      setBgmElementVolume(from + (base - from) * t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, Math.max(0, hold * 1000));
}

function resumeBgmFromUserGesture() {
  if (!AUDIO.bgmEnabled || seriesComplete) return;
  if (!gameScreen.classList.contains('hidden') && matchResults.length < TOTAL_MATCHES) startBgm();
}

// iOS/PWAは「ユーザーが画面に触れた瞬間」のplay()が最も確実。
// 抽選中は無音で再生権だけ確保し、抽選終了後に曲頭へ戻して聞こえる状態にする。
if (lotteryBtn) {
  lotteryBtn.addEventListener('pointerdown', () => {
    if (AUDIO.bgmEnabled) primeBgmForLottery();
    if (AUDIO.sfxEnabled) ensureAudio();
  }, { passive: true });
  lotteryBtn.addEventListener('touchstart', () => {
    if (AUDIO.bgmEnabled) primeBgmForLottery();
    if (AUDIO.sfxEnabled) ensureAudio();
  }, { passive: true });
}

// バックグラウンド復帰後に自動再開がiOSに拒否されても、次の1タップで復帰する。
document.addEventListener('pointerdown', resumeBgmFromUserGesture, { capture: true, passive: true });
document.addEventListener('touchstart', resumeBgmFromUserGesture, { capture: true, passive: true });

function tone(freq, duration = 0.12, type = 'square', volume = 0.18, when = 0, destination = null) {
  const isMusic = destination === AUDIO.musicGain;
  if (isMusic ? !AUDIO.bgmEnabled : !AUDIO.sfxEnabled) return;
  if (!ensureAudio()) return;
  const ctx = AUDIO.ctx;
  const start = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const target = destination || AUDIO.sfxGain;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(target);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noiseBurst(duration = 0.08, volume = 0.10, when = 0, destination = null, highpass = 0) {
  const isMusic = destination === AUDIO.musicGain;
  if (isMusic ? !AUDIO.bgmEnabled : !AUDIO.sfxEnabled) return;
  if (!ensureAudio()) return;
  const ctx = AUDIO.ctx;
  const start = ctx.currentTime + when;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const decay = Math.pow(1 - i / length, 2.2);
    data[i] = (Math.random() * 2 - 1) * decay;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  let node = source;
  if (highpass > 0) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    source.connect(filter);
    node = filter;
  }
  node.connect(gain);
  gain.connect(destination || AUDIO.sfxGain);
  source.start(start);
  source.stop(start + duration + 0.02);
}

function metallicHit(baseFreq = 180, volume = 0.10, when = 0) {
  tone(baseFreq, 0.11, 'triangle', volume, when);
  tone(baseFreq * 2.17, 0.055, 'square', volume * 0.50, when + 0.014);
  tone(baseFreq * 3.92, 0.035, 'sine', volume * 0.34, when + 0.025);
  noiseBurst(0.045, volume * 0.48, when, null, 1100);
}

function lowImpact(volume = 0.13, when = 0) {
  tone(64, 0.15, 'sine', volume, when);
  tone(92, 0.09, 'triangle', volume * 0.72, when + 0.012);
  noiseBurst(0.075, volume * 0.72, when, null, 90);
}

function sfxIntermission() {
  if (!AUDIO.sfxEnabled || !ensureAudio()) return;
  duckMusic(0.45, 0.18, 0.34);
  lowImpact(0.09);
  metallicHit(154, 0.072, 0.10);
  metallicHit(196, 0.055, 0.26);
}

function sfxMatchStart() {
  lowImpact(0.095);
  metallicHit(146.83, 0.075, 0.10);
  tone(220, 0.24, 'triangle', 0.060, 0.23);
}

function sfxSeriesWin() {
  lowImpact(0.16);
  metallicHit(164.81, 0.13, 0.08);
  tone(220, 0.18, 'triangle', 0.12, 0.12);
  tone(277.18, 0.20, 'triangle', 0.11, 0.25);
  tone(329.63, 0.24, 'triangle', 0.11, 0.39);
  tone(440, 0.48, 'sine', 0.12, 0.56);
  tone(659.25, 0.72, 'sine', 0.070, 0.74);
  noiseBurst(0.10, 0.065, 0.05, null, 900);
}

function sfxSeriesLose() {
  lowImpact(0.13);
  tone(196, 0.20, 'sawtooth', 0.085, 0.10);
  tone(164.81, 0.22, 'sawtooth', 0.082, 0.25);
  tone(130.81, 0.28, 'sawtooth', 0.078, 0.42);
  tone(82.41, 0.52, 'sine', 0.080, 0.62);
  noiseBurst(0.12, 0.055, 0.08, null, 180);
}

function sfxCountdown(number) {
  const frequencies = { '3': 196, '2': 207.65, '1': 220 };
  const f = frequencies[number] || 196;
  metallicHit(f, 0.085);
  tone(f / 2, 0.15, 'sine', 0.080, 0.005);
}

function sfxOpen() {
  // 3→2→1で沈めたBGMをOPENで戻し、低い衝撃＋金属音を前面に出す。
  lowImpact(0.24);
  noiseBurst(0.105, 0.16, 0.018, null, 120);
  metallicHit(220, 0.19, 0.045);
  tone(659.25, 0.20, 'triangle', 0.12, 0.105);
}

function sfxCard() {
  // 古い金属板／厚いカードを卓上へ置くイメージ。
  lowImpact(0.10);
  noiseBurst(0.050, 0.080, 0.004, null, 160);
  metallicHit(154, 0.075, 0.018);
}

function sfxCardLand(isPlayer = false) {
  // 卓上へ厚い金属カードが「ドン」と着地し、わずかに金属が鳴る感触。
  if (!AUDIO.sfxEnabled || !ensureAudio()) return;
  duckMusic(isPlayer ? 0.74 : 0.82, 0.045, 0.14);
  lowImpact(isPlayer ? 0.145 : 0.115);
  noiseBurst(0.060, isPlayer ? 0.095 : 0.072, 0.004, null, 105);
  metallicHit(isPlayer ? 138 : 128, isPlayer ? 0.105 : 0.082, 0.018);
  tone(isPlayer ? 278 : 244, 0.075, 'triangle', isPlayer ? 0.060 : 0.046, 0.055);
}

function sfxCardSelect() {
  // 手札へ指を置いた瞬間。重すぎない低い金属の触感。
  tone(118, 0.055, 'triangle', 0.050);
  metallicHit(236, 0.045, 0.012);
  noiseBurst(0.028, 0.035, 0.006, null, 1300);
}

function sfxCardConfirm() {
  // 確定時は「浮いたカードが卓へ沈み、ロックされる」感触。
  duckMusic(0.72, 0.055, 0.18);
  lowImpact(0.115);
  noiseBurst(0.050, 0.060, 0.008, null, 120);
  metallicHit(132, 0.082, 0.024);
  tone(264, 0.075, 'triangle', 0.055, 0.055);
}

function sfxCardCancel() {
  // 選び直しは短く軽く。勝負音より前に出さない。
  tone(210, 0.045, 'triangle', 0.035);
  tone(164, 0.055, 'triangle', 0.028, 0.028);
}

function sfxReveal() {
  metallicHit(196, 0.095);
  noiseBurst(0.060, 0.070, 0.015, null, 800);
  tone(293.66, 0.14, 'triangle', 0.075, 0.055);
}

function sfxDraw() {
  // 乾いた短い音。勝敗より余韻を抑える。
  noiseBurst(0.045, 0.070, 0, null, 1200);
  metallicHit(132, 0.060, 0.008);
  tone(132, 0.09, 'triangle', 0.050, 0.08);
}

function sfxWin() {
  duckMusic(0.46, 0.11, 0.30);
  lowImpact(0.13);
  metallicHit(185, 0.12, 0.035);
  tone(246.94, 0.17, 'triangle', 0.10, 0.12);
  tone(329.63, 0.23, 'triangle', 0.105, 0.25);
  tone(493.88, 0.42, 'sine', 0.080, 0.40);
}

function sfxSpecialVictory() {
  duckMusic(0.16, 0.22, 0.54);
  lowImpact(0.23);
  noiseBurst(0.15, 0.13, 0.018, null, 92);
  metallicHit(96, 0.17, 0.045);
  metallicHit(192, 0.145, 0.17);
  metallicHit(288, 0.095, 0.28);
  tone(329.63, 0.20, 'triangle', 0.13, 0.31);
  tone(440, 0.26, 'triangle', 0.14, 0.45);
  tone(659.25, 0.38, 'sine', 0.12, 0.63);
  tone(880, 0.52, 'sine', 0.082, 0.84);
}

function sfxLose() {
  duckMusic(0.58, 0.08, 0.28);
  lowImpact(0.11);
  tone(196, 0.17, 'sawtooth', 0.080, 0.06);
  tone(164.81, 0.20, 'sawtooth', 0.080, 0.18);
  tone(130.81, 0.34, 'triangle', 0.082, 0.34);
  noiseBurst(0.085, 0.055, 0.08, null, 180);
}

function updateAudioButtons() {
  if (audioBtn) {
    audioBtn.textContent = AUDIO.bgmEnabled ? '♪ BGM ON' : '♪ BGM OFF';
    audioBtn.classList.toggle('is-on', AUDIO.bgmEnabled);
    audioBtn.setAttribute('aria-pressed', AUDIO.bgmEnabled ? 'true' : 'false');
  }
  if (sfxBtn) {
    sfxBtn.textContent = AUDIO.sfxEnabled ? '🔊 SE ON' : '🔇 SE OFF';
    sfxBtn.classList.toggle('is-on', AUDIO.sfxEnabled);
    sfxBtn.setAttribute('aria-pressed', AUDIO.sfxEnabled ? 'true' : 'false');
  }
  if (bgmToggle) bgmToggle.checked = AUDIO.bgmEnabled;
  if (sfxToggle) sfxToggle.checked = AUDIO.sfxEnabled;
}

function setBgmEnabled(enabled) {
  AUDIO.bgmEnabled = Boolean(enabled);
  preferences.bgmEnabled = AUDIO.bgmEnabled;
  savePrefs(preferences);
  updateAudioButtons();
  if (AUDIO.bgmEnabled && !gameScreen.classList.contains('hidden') && !seriesComplete && matchResults.length < TOTAL_MATCHES) {
    startBgm();
  } else {
    stopBgm();
  }
}

function setSfxEnabled(enabled) {
  AUDIO.sfxEnabled = Boolean(enabled);
  preferences.sfxEnabled = AUDIO.sfxEnabled;
  savePrefs(preferences);
  updateAudioButtons();
}

if (audioBtn) audioBtn.addEventListener('click', () => setBgmEnabled(!AUDIO.bgmEnabled));
if (sfxBtn) sfxBtn.addEventListener('click', () => setSfxEnabled(!AUDIO.sfxEnabled));
if (bgmToggle) bgmToggle.addEventListener('change', () => setBgmEnabled(bgmToggle.checked));
if (sfxToggle) sfxToggle.addEventListener('change', () => setSfxEnabled(sfxToggle.checked));

updateAudioButtons();

// ---- PWA / install / update v6 ---------------------------------------
let deferredInstallPrompt = null;
let waitingServiceWorker = null;
const installBtn = document.getElementById('installBtn');
const offlineStatus = document.getElementById('offlineStatus');
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

function updateConnectionStatus() {
  if (!offlineStatus) return;
  const offline = !navigator.onLine;
  offlineStatus.textContent = offline ? 'オフラインで起動中' : 'オフライン対応';
  offlineStatus.classList.toggle('is-offline', offline);
}

function showUpdateToast(worker) {
  waitingServiceWorker = worker || waitingServiceWorker;
  if (updateToast) updateToast.classList.remove('hidden');
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js');
    if (registration.waiting) showUpdateToast(registration.waiting);

    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast(worker);
        }
      });
    });

    registration.update().catch(() => {});
  } catch (_) {}
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installBtn) {
    installBtn.textContent = 'ホーム画面に追加';
    installBtn.classList.remove('hidden');
  }
});

if (installBtn && isIOS && !isStandalone) {
  installBtn.textContent = 'ホーム画面追加方法';
  installBtn.classList.remove('hidden');
  installHelp.classList.remove('hidden');
}

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch (_) {}
      deferredInstallPrompt = null;
      installBtn.classList.add('hidden');
      return;
    }
    if (isIOS && !isStandalone) openHelp(true);
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installBtn) installBtn.classList.add('hidden');
});

if (updateBtn) {
  updateBtn.addEventListener('click', () => {
    if (waitingServiceWorker) {
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      return;
    }
    window.location.reload();
  });
}

let reloadingForUpdate = false;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!waitingServiceWorker || reloadingForUpdate) return;
    reloadingForUpdate = true;
    window.location.reload();
  });
}

window.addEventListener('load', registerServiceWorker);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    stopBgm();
    return;
  }
  if (AUDIO.bgmEnabled && !gameScreen.classList.contains('hidden') && !seriesComplete && matchResults.length < TOTAL_MATCHES) {
    startBgm();
    requestWakeLock();
  }
});

// v18.7.4 final side-position guard
enforceBattleSideOrder();
