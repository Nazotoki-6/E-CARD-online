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
const selectionTray = document.getElementById('selectionTray');
const selectionPreview = document.getElementById('selectionPreview');
const selectionName = document.getElementById('selectionName');
const selectionHint = document.getElementById('selectionHint');
const confirmCardBtn = document.getElementById('confirmCardBtn');
const cancelCardBtn = document.getElementById('cancelCardBtn');


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

// ---- 最強CPU v2 -----------------------------------------------------
// 「後出し」はせず、各プレイの開始時点でCPUのカードを確定する。
// 基本戦略はゲーム理論上の最適混合（特殊カード率 = 1 / 残り枚数）。
// そこへ、プレイヤーの役割・残り枚数・先手/後手・直近傾向を
// ベイズ風に学習した「安全な読み」を重ねる。
const CPU_STATS_KEY = 'ecard-max-cpu-stats-v2';
const CPU_STATS_VERSION = 2;
const sessionCpuStats = createEmptyCpuStats();

// ---- CPU戦型 v18.5 ---------------------------------------------------
// 12戦シリーズごとに1つの「戦型」を内部で選ぶ。
// 戦型は最適混合を壊さない範囲で、読みの強さ・特殊カードの切り方・揺らぎ方だけを変える。
// 対戦中は非公開。12戦終了後に今回の戦型を開示する。
const CPU_PERSONALITIES = {
  cautious: {
    label: '慎重型',
    description: '均衡を崩しにくく、読みを過信せず終盤まで特殊カードを温存しやすい。',
    exploitScale: 0.72,
    exploration: 0.022,
    earlySpecialBias: -0.035,
    lateSpecialBias: 0.025,
    jitter: 0.010,
  },
  aggressive: {
    label: '攻撃型',
    description: '相手の癖を強めに読んで、好機では特殊カードを早めに切りやすい。',
    exploitScale: 1.18,
    exploration: 0.028,
    earlySpecialBias: 0.040,
    lateSpecialBias: -0.010,
    jitter: 0.012,
  },
  trickster: {
    label: '撹乱型',
    description: '均衡を軸にしつつ小さな揺らぎを混ぜ、タイミングを固定しにくい。',
    exploitScale: 0.94,
    exploration: 0.050,
    earlySpecialBias: 0.000,
    lateSpecialBias: 0.000,
    jitter: 0.055,
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
    exact: {},   // 役割 + 残り枚数 + 先手/後手
    stage: {},   // 役割 + 残り枚数
    lead: {},    // 役割 + 先手/後手
    role: {},    // 役割のみ
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
    const parsed = JSON.parse(localStorage.getItem(CPU_STATS_KEY) || 'null');
    if (!parsed || parsed.version !== CPU_STATS_VERSION) return createEmptyCpuStats();
    return {
      ...createEmptyCpuStats(),
      ...parsed,
      exact: parsed.exact || {},
      stage: parsed.stage || {},
      lead: parsed.lead || {},
      role: parsed.role || {},
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
  return {
    cardsLeft,
    lead,
    exactKey: `${playerSide}:${cardsLeft}:${lead}`,
    stageKey: `${playerSide}:${cardsLeft}`,
    leadKey: `${playerSide}:${lead}`,
    roleKey: playerSide,
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
  saveCpuStats(persistent);

  // 今回の12戦で見えた癖は、過去データより素早く反映する。
  touchBucket(sessionCpuStats.exact, context.exactKey, card);
  touchBucket(sessionCpuStats.stage, context.stageKey, card);
  touchBucket(sessionCpuStats.lead, context.leadKey, card);
  touchBucket(sessionCpuStats.role, context.roleKey, card);
}

function addEvidence(acc, bucket, weight) {
  if (!bucket) return;
  acc.special += (bucket.special || 0) * weight;
  acc.citizen += (bucket.citizen || 0) * weight;
}

function estimatePlayerSpecialRate() {
  const context = getCpuContext();
  const persistent = loadCpuStats();

  // 相手が完全に最適なら、特殊カードを出す確率は 1 / 残り枚数。
  const nashRate = 1 / context.cardsLeft;
  const evidence = { special: 0, citizen: 0 };

  // 条件が細かいデータほど高く評価。直近12戦の癖はさらに強く見る。
  addEvidence(evidence, persistent.exact[context.exactKey], 1.00);
  addEvidence(evidence, persistent.stage[context.stageKey], 0.62);
  addEvidence(evidence, persistent.lead[context.leadKey], 0.28);
  addEvidence(evidence, persistent.role[context.roleKey], 0.12);

  addEvidence(evidence, sessionCpuStats.exact[context.exactKey], 1.55);
  addEvidence(evidence, sessionCpuStats.stage[context.stageKey], 0.92);
  addEvidence(evidence, sessionCpuStats.lead[context.leadKey], 0.42);
  addEvidence(evidence, sessionCpuStats.role[context.roleKey], 0.18);

  // データが少ない間はゲーム理論の確率を強い事前分布として使う。
  const priorStrength = 7.0;
  const weightedSamples = evidence.special + evidence.citizen;
  const predicted = (
    nashRate * priorStrength + evidence.special
  ) / (priorStrength + weightedSamples);

  // 十分な観測がないうちは読みを過信しない。
  const confidence = Math.min(0.90, weightedSamples / (weightedSamples + 8.5));

  return { predicted, confidence, nashRate, weightedSamples };
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

function chooseStrongCpuCardIndex() {
  const specialIndex = cpuHand.findIndex((card) => card !== 'citizen');
  const citizenIndices = cpuHand
    .map((card, index) => card === 'citizen' ? index : -1)
    .filter((index) => index >= 0);

  if (specialIndex < 0) {
    return citizenIndices[Math.floor(Math.random() * citizenIndices.length)];
  }
  if (citizenIndices.length === 0) return specialIndex;

  const model = estimatePlayerSpecialRate();
  const personality = getCpuPersonality();
  const p = model.predicted;
  const citizensAfterTie = Math.max(0, citizenIndices.length - 1);
  const continuation = continuationValueForPlayer(playerSide, citizensAfterTie);

  // CPUが特殊カード / 市民を出したときの「プレイヤー側期待値」。
  // CPUはこの値をできるだけ小さくする手を選ぶ。
  let playerValueIfCpuSpecial;
  let playerValueIfCpuCitizen;

  if (playerSide === 'emperor') {
    playerValueIfCpuSpecial = p * -1 + (1 - p) * 1;
    playerValueIfCpuCitizen = p * 1 + (1 - p) * continuation;
  } else {
    playerValueIfCpuSpecial = p * 1 + (1 - p) * -1;
    playerValueIfCpuCitizen = p * -1 + (1 - p) * continuation;
  }

  // 正ならCPU特殊カードの方が有利、負なら市民の方が有利。
  const advantage = playerValueIfCpuCitizen - playerValueIfCpuSpecial;
  const direction = advantage >= 0 ? 1 : -1;

  // 予測が均衡点の近くなら無理に読みへ寄せず、差が明確なときだけ攻める。
  const signalStrength = Math.min(1, Math.abs(advantage) / 0.28);
  const exploitStrength = clamp(model.confidence * signalStrength * personality.exploitScale, 0, 0.96);
  const exploitTarget = direction > 0 ? 0.985 : 0.015;

  // 最適混合を土台にするため、性格差があっても簡単には攻略されない。
  let specialRate = model.nashRate * (1 - exploitStrength)
    + exploitTarget * exploitStrength;

  // 戦型ごとの「切り時」の癖。差は小さくし、最適混合から大きく外れないようにする。
  const stageProgress = 1 - ((playerHand.length - 1) / 4); // 0=序盤寄り / 1=終盤
  const stageBias = personality.earlySpecialBias * (1 - stageProgress)
    + personality.lateSpecialBias * stageProgress;
  specialRate += stageBias;

  // 撹乱型を中心に、毎手ごく小さなランダム揺らぎを入れる。
  if (personality.jitter > 0) {
    specialRate += (Math.random() * 2 - 1) * personality.jitter;
  }

  // 戦型ごとの探索率。均衡点へ引き戻すことで強さを維持する。
  specialRate = specialRate * (1 - personality.exploration)
    + model.nashRate * personality.exploration;
  specialRate = clamp(specialRate, 0.02, 0.98);

  if (Math.random() < specialRate) return specialIndex;
  return citizenIndices[Math.floor(Math.random() * citizenIndices.length)];
}

function lockCpuCard() {
  cpuPlannedIndex = chooseStrongCpuCardIndex();
  if (cpuLockLabel) cpuLockLabel.textContent = '🔒 CPUカード確定済み';
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
  matchIntroSub.textContent = `${leadSideForCurrentPlay() === playerSide ? 'あなたが先手' : 'CPUが先手'} ・ 最強CPUは毎シリーズ戦型が変化`;
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
  const lead = leadSideForCurrentPlay();
  return lead === playerSide
    ? `先手は${sideLabel(lead)}（あなた）。カードを選んでください。`
    : `先手は${sideLabel(lead)}（CPU）。CPUの手は確定済みです。あなたのカードを選んでください。`;
}

function hideSelectionTray() {
  selectedHandIndex = null;
  if (selectionTray) selectionTray.classList.add('hidden');
  if (selectionPreview) selectionPreview.innerHTML = `<img src="images/back.webp" alt="選択中のカード">`;
  if (selectionName) selectionName.textContent = '-';
  if (selectionHint) selectionHint.textContent = 'カードを1枚選ぶと、ここに表示されます。';
}

function showSelectionTray(card) {
  if (!selectionTray || !selectionPreview || !selectionName || !selectionHint) return;
  selectionPreview.innerHTML = `<img src="${CARD_INFO[card].image}" alt="${CARD_INFO[card].label}カード">`;
  selectionName.textContent = CARD_INFO[card].label;
  selectionHint.textContent = '同じカードをもう一度タップすると確定。下のボタンでも決定できます。';
  selectionTray.classList.remove('hidden');
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
  showSelectionTray(card);
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
    : `${CARD_INFO[card].label}を選択中。同じカードをもう一度タップで確定します。`);
}

function nearestHandCardIndex(clientX) {
  const buttons = Array.from(playerHandEl.querySelectorAll('.hand-card:not(:disabled)'));
  if (!buttons.length) return null;

  let nearest = null;
  let nearestDistance = Infinity;
  buttons.forEach((button) => {
    const rect = button.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(clientX - center);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = Number(button.dataset.index);
    }
  });
  return Number.isInteger(nearest) ? nearest : null;
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

  playerHandEl.addEventListener('pointermove', (event) => {
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
  }, { passive: false });

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

  playerHandEl.addEventListener('pointerup', finish);
  playerHandEl.addEventListener('pointercancel', finish);
  playerHandEl.addEventListener('lostpointercapture', () => {
    if (handDragState.active) resetHandDrag();
  });
}

function renderHand() {
  playerHandEl.innerHTML = '';
  playerHandEl.dataset.count = String(playerHand.length);

  playerHand.forEach((card, index) => {
    const button = document.createElement('button');
    const middle = (playerHand.length - 1) / 2;
    const distance = index - middle;
    const rotate = distance * 7;
    const lift = Math.abs(distance) * 12;

    button.className = 'hand-card';
    if (selectedHandIndex === index) button.classList.add('is-selected');
    if (selectedHandIndex !== null && selectedHandIndex !== index) button.classList.add('is-dimmed');
    button.type = 'button';
    button.disabled = inputLocked;
    button.dataset.index = String(index);
    button.style.setProperty('--fan-rot', `${rotate}deg`);
    button.style.setProperty('--fan-lift', `${lift}px`);
    button.setAttribute('aria-label', `${CARD_INFO[card].label}を選ぶ`);
    button.innerHTML = `<img src="${CARD_INFO[card].image}" alt="${CARD_INFO[card].label}カード">`;
    button.addEventListener('click', (event) => {
      if (Date.now() < handDragSuppressClickUntil) {
        event.preventDefault();
        return;
      }
      chooseHandCard(index);
    });
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

function showCardBack(target, who = '') {
  target.className = 'played-card is-set';
  target.innerHTML = `<img src="images/back.webp" alt="${who ? `${who}の` : ''}E-CARD 裏面">`;
}

function pulseCountdown(text) {
  countdownOverlay.textContent = text;
  countdownOverlay.classList.remove('countdown-pop');
  void countdownOverlay.offsetWidth;
  countdownOverlay.classList.add('countdown-pop');
}

async function runCountdown(sequenceId) {
  countdownOverlay.classList.remove('hidden');
  setMessage('勝負……');

  for (const number of ['3', '2', '1']) {
    if (sequenceId !== battleSequenceId) return false;
    pulseCountdown(number);
    sfxCountdown(number);
    safeVibrate(18);
    await wait(560);
  }

  if (sequenceId !== battleSequenceId) return false;
  pulseCountdown('OPEN');
  sfxOpen();
  safeVibrate([28, 28, 48]);
  await wait(260);
  countdownOverlay.classList.add('hidden');
  return sequenceId === battleSequenceId;
}

async function revealBothCards(playerCard, cpuCard, sequenceId) {
  battleZone?.classList.add('is-revealing');
  playerPlayedEl.classList.add('flip-out');
  cpuPlayedEl.classList.add('flip-out');
  await wait(135);
  if (sequenceId !== battleSequenceId) {
    battleZone?.classList.remove('is-revealing');
    return false;
  }

  showPlayedCard(playerPlayedEl, playerCard);
  showPlayedCard(cpuPlayedEl, cpuCard);
  playerPlayedEl.classList.add('flip-in');
  cpuPlayedEl.classList.add('flip-in');
  sfxReveal();

  await wait(220);
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

function triggerVictoryEffect(playerCard, cpuCard, series = false) {
  if (!victoryBurst) return;
  const special = playerCard === 'slave' && cpuCard === 'emperor';
  if (special && !series) window.setTimeout(sfxSpecialVictory, paceMs(80, 0.75));

  victoryBurst.classList.remove('hidden', 'is-special', 'is-series', 'is-playing');
  if (special) victoryBurst.classList.add('is-special');
  if (series) victoryBurst.classList.add('is-series');

  if (victoryKicker) victoryKicker.textContent = series ? '12 MATCHES COMPLETE' : special ? 'REVERSAL' : 'MATCH WON';
  if (victoryWord) victoryWord.textContent = series ? 'CHAMPION' : special ? 'EMPEROR DOWN' : 'VICTORY';
  if (victorySub) victorySub.textContent = series ? '総合勝利' : special ? '奴隷が皇帝を撃破' : '勝利';

  buildVictoryParticles(special || series);
  void victoryBurst.offsetWidth;
  victoryBurst.classList.add('is-playing');

  if (series) safeVibrate([30, 30, 60, 40, 100]);
  else if (special) safeVibrate([22, 35, 38, 35, 78]);
  else safeVibrate([18, 24, 46]);

  window.setTimeout(() => {
    victoryBurst.classList.add('hidden');
    victoryBurst.classList.remove('is-playing', 'is-special', 'is-series');
  }, paceMs(series ? 1600 : special ? 1250 : 760, 0.78));
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
    showCardBack(playerPlayedEl, 'あなた');
    showCardBack(cpuPlayedEl, 'CPU');
    setMessage('中断した勝負を同じカードで再開します……');
    await wait(360);
  } else if (lead === playerSide) {
    setMessage('選んだカードを伏せる……');
    await animateCommittedCardToBattle(playerCard, commitSourceRect);
    sfxCard();
    safeVibrate(20);
    setMessage('あなたが先にカードを伏せた。CPUが続く……');
    await wait(300);
    if (sequenceId !== battleSequenceId) return;
    showCardBack(cpuPlayedEl, 'CPU');
    sfxCard();
  } else {
    // CPU先手はCPUが先に伏せ、その後に選んだ手札が左の自分枠へ移動する。
    showCardBack(cpuPlayedEl, 'CPU');
    sfxCard();
    setMessage('CPUが先にカードを伏せた。あなたが続く……');
    await wait(300);
    if (sequenceId !== battleSequenceId) return;
    await animateCommittedCardToBattle(playerCard, commitSourceRect);
    sfxCard();
    safeVibrate(20);
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

    // 4手連続で市民同士なら、残る1枚は必ず「皇帝 vs 奴隷」。
    // 原作ルールではここで奴隷側の勝利が確定し、5手目を選ぶ必要はない。
    if (playInMatch >= 4 && playerHand.length === 1 && cpuHand.length === 1) {
      const finalPlayerCard = playerHand[0];
      const finalCpuCard = cpuHand[0];
      const finalResult = judge(finalPlayerCard, finalCpuCard);
      const playerWon = finalResult === 1;

      if (playerWon) {
        playerWins += 1;
        matchResults.push('win');
        sfxWin();
        triggerVictoryEffect(finalPlayerCard, finalCpuCard, false);
      } else {
        cpuWins += 1;
        matchResults.push('lose');
        sfxLose();
      }

      recordMatchResult(playerWon, playerSide, `${seriesId}:m${currentMatch}`);
      setMessage(
        `4手連続で市民同士。残りは${CARD_INFO[finalPlayerCard].label} vs ${CARD_INFO[finalCpuCard].label}のため、${sideLabel('slave')}の勝利が確定。`,
        playerWon ? 'win' : 'lose'
      );
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

    setMessage(`${CARD_INFO[playerCard].label} vs ${CARD_INFO[cpuCard].label}。引き分け。次のカードへ。`);
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
  if (playerWon) {
    playerWins += 1;
    matchResults.push('win');
    sfxWin();
    triggerVictoryEffect(playerCard, cpuCard, false);
  } else {
    cpuWins += 1;
    matchResults.push('lose');
    sfxLose();
  }

  recordMatchResult(playerWon, playerSide, `${seriesId}:m${currentMatch}`);

  setMessage(
    `${CARD_INFO[playerCard].label} vs ${CARD_INFO[cpuCard].label}。${playerWon ? `第${currentMatch}戦はあなたの勝ち！` : `第${currentMatch}戦はCPUの勝ち。`}`,
    playerWon ? 'win' : 'lose'
  );
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
    showCardBack(playerPlayedEl, 'あなた');
    return Promise.resolve();
  }

  const targetRect = playerPlayedEl.getBoundingClientRect();
  if (!targetRect.width || !targetRect.height) {
    showCardBack(playerPlayedEl, 'あなた');
    return Promise.resolve();
  }

  const flight = document.createElement('div');
  flight.className = 'commit-flight-card';
  flight.setAttribute('aria-hidden', 'true');
  flight.style.left = `${sourceRect.left}px`;
  flight.style.top = `${sourceRect.top}px`;
  flight.style.width = `${sourceRect.width}px`;
  flight.style.height = `${sourceRect.height}px`;

  const inner = document.createElement('div');
  inner.className = 'commit-flight-card-inner';
  inner.innerHTML = `
    <div class="commit-flight-face commit-flight-front"><img src="${CARD_INFO[card].image}" alt=""></div>
    <div class="commit-flight-face commit-flight-back"><img src="images/back.webp" alt=""></div>
  `;
  flight.appendChild(inner);
  document.body.appendChild(flight);

  const duration = preferences.fastMode ? 190 : 320;
  const flipDelay = preferences.fastMode ? 42 : 92;

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flight.classList.add('is-moving');
        flight.style.left = `${targetRect.left}px`;
        flight.style.top = `${targetRect.top}px`;
        flight.style.width = `${targetRect.width}px`;
        flight.style.height = `${targetRect.height}px`;
        window.setTimeout(() => inner.classList.add('is-flipped'), flipDelay);
      });
    });

    window.setTimeout(() => {
      showCardBack(playerPlayedEl, 'あなた');
      flight.remove();
      resolve();
    }, duration + 36);
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
  if (selectionTray) selectionTray.classList.add('is-confirming');
  if (selectionHint) selectionHint.textContent = 'カードを確定しました。勝負枠へ伏せます。';
  sfxCardConfirm();
  safeVibrate([10, 18, 24]);
  await wait(70);
  if (selectionTray) selectionTray.classList.remove('is-confirming');
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

function confirmSelectedCard() {
  if (inputLocked || selectedHandIndex === null) return;
  playCard(selectedHandIndex);
}

function cancelSelectedCard() {
  if (inputLocked) return;
  sfxCardCancel();
  safeVibrate(6);
  hideSelectionTray();
  // 選び直し時も、確定前の勝負枠にはカードを表示しない。
  showPlaceholder(playerPlayedEl);
  showPlaceholder(cpuPlayedEl);
  renderHand();
  setMessage(currentPickPrompt());
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
  resultTitle.textContent = playerWon ? '勝利' : '敗北';
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

if (confirmCardBtn) confirmCardBtn.addEventListener('click', confirmSelectedCard);
if (cancelCardBtn) cancelCardBtn.addEventListener('click', cancelSelectedCard);
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
const BGM_SRC = './audio/Devil_Disaster.mp3?v=18.8.3';

const AUDIO = {
  bgmEnabled: preferences.bgmEnabled,
  sfxEnabled: preferences.sfxEnabled,
  ctx: null,
  master: null,
  musicGain: null, // 旧手続きBGM互換用。MP3 BGMには使用しない。
  sfxGain: null,
  compressor: null,
  bgmElement: null,
  bgmBaseVolume: 1.0, // 音源自体をv18.8.3で55%相当に調整済み
  duckToken: 0,
  bgmPlayPending: false,
};

function ensureBgmTrack() {
  if (!AUDIO.bgmElement) {
    const existing = document.getElementById('bgmTrack');
    const track = existing || new Audio(BGM_SRC);
    if (!existing) track.src = BGM_SRC;
    track.loop = true;
    track.preload = 'auto';
    track.playsInline = true;
    track.setAttribute('playsinline', '');
    track.setAttribute('webkit-playsinline', '');
    track.setAttribute('aria-hidden', 'true');
    try { track.volume = AUDIO.bgmBaseVolume; } catch (error) { /* iOSは端末音量を優先 */ }
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
  const track = ensureBgmTrack();
  if (!track) return;

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
  const track = ensureBgmTrack();
  if (!track) return;

  // 音源の先頭2.8秒には実音量フェードインを焼き込み済み。
  // いったん曲頭へ戻すことで、抽選結果が出た直後から自然に立ち上がる。
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
  const track = ensureBgmTrack();
  if (!track || !track.paused || AUDIO.bgmPlayPending) return;

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
  // BGMを一瞬沈めてから、低い衝撃＋金属音を前面に出す。
  duckMusic(0.17, 0.20, 0.38);
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
  duckMusic(0.20, 0.22, 0.46);
  lowImpact(0.19);
  noiseBurst(0.12, 0.11, 0.02, null, 100);
  metallicHit(110, 0.14, 0.06);
  metallicHit(220, 0.13, 0.18);
  tone(329.63, 0.18, 'triangle', 0.12, 0.30);
  tone(440, 0.24, 'triangle', 0.13, 0.44);
  tone(659.25, 0.34, 'sine', 0.11, 0.62);
  tone(880, 0.48, 'sine', 0.075, 0.82);
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
