const CARD_INFO = {
  emperor: { label: '皇帝', image: 'images/emperor.jpeg' },
  citizen: { label: '市民', image: 'images/citizen.jpeg' },
  slave: { label: '奴隷', image: 'images/slave.jpeg' },
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
let cpuPlannedIndex = null;
let matchResults = [];
let battleSequenceId = 0;
let seriesRecorded = false;
let seriesId = null;
let currentMatchLog = [];
let wakeLock = null;
let seriesComplete = false;

// ---- 戦績保存 v4 ------------------------------------------------------
// 12戦マッチの総合成績と、個別試合・陣営別・連勝記録をlocalStorageへ保存する。
const RECORDS_KEY = 'ecard-records-v1';
const RECORDS_VERSION = 1;

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
  seriesRecorded = Boolean(state.seriesRecorded);
  seriesComplete = false;
  inputLocked = Boolean(state.inputLocked);

  setupScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
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
  const exploitStrength = model.confidence * signalStrength;
  const exploitTarget = direction > 0 ? 0.985 : 0.015;

  // 最適混合を土台にするため、学習が外れても簡単には攻略されない。
  let specialRate = model.nashRate * (1 - exploitStrength)
    + exploitTarget * exploitStrength;

  // ごく小さな探索成分を残し、プレイヤーがCPUの学習そのものを固定読みしにくくする。
  const exploration = 0.035;
  specialRate = specialRate * (1 - exploration) + model.nashRate * exploration;
  specialRate = clamp(specialRate, 0.015, 0.985);

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

  const saved = loadSeriesState();
  if (saved) {
    const ok = window.confirm('途中の12戦マッチがあります。新しく抽選すると途中データは上書きされます。新しい対戦を始めますか？');
    if (!ok) return;
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

  setupScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

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
  matchIntroSub.textContent = `${leadSideForCurrentPlay() === playerSide ? 'あなたが先手' : 'CPUが先手'} ・ 最強CPUとの読み合い`;
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
    ? `先に伏せるのは${sideLabel(lead)}（あなた）。カードを選んでください。`
    : `${sideLabel(lead)}（CPU）が先にカードを伏せた。あなたのカードを選んでください。`;
}

function hideSelectionTray() {
  selectedHandIndex = null;
  if (selectionTray) selectionTray.classList.add('hidden');
  if (selectionPreview) selectionPreview.innerHTML = `<img src="images/back.jpeg" alt="選択中のカード">`;
  if (selectionName) selectionName.textContent = '-';
  if (selectionHint) selectionHint.textContent = 'カードを1枚選ぶと、ここに表示されます。';
}

function showSelectionTray(card) {
  if (!selectionTray || !selectionPreview || !selectionName || !selectionHint) return;
  selectionPreview.innerHTML = `<img src="${CARD_INFO[card].image}" alt="${CARD_INFO[card].label}カード">`;
  selectionName.textContent = CARD_INFO[card].label;
  selectionHint.textContent = 'このカードで確定すると、そのまま伏せて勝負します。';
  selectionTray.classList.remove('hidden');
}

function chooseHandCard(index) {
  if (inputLocked || index < 0 || index >= playerHand.length) return;
  selectedHandIndex = index;
  const card = playerHand[index];
  showSelectionTray(card);
  renderHand();
  safeVibrate(10);
  setMessage(`${CARD_INFO[card].label}を選択中。確定すると戻せません。`);
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
    button.addEventListener('click', () => chooseHandCard(index));
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
  target.innerHTML = `<img src="images/back.jpeg" alt="${who ? `${who}の` : ''}E-CARD 裏面">`;
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
  playerPlayedEl.classList.add('flip-out');
  cpuPlayedEl.classList.add('flip-out');
  await wait(135);
  if (sequenceId !== battleSequenceId) return false;

  showPlayedCard(playerPlayedEl, playerCard);
  showPlayedCard(cpuPlayedEl, cpuCard);
  playerPlayedEl.classList.add('flip-in');
  cpuPlayedEl.classList.add('flip-in');
  sfxReveal();

  await wait(220);
  playerPlayedEl.classList.remove('flip-in');
  cpuPlayedEl.classList.remove('flip-in');
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

async function resolveChosenBattle(pending, resumed = false) {
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
    showCardBack(playerPlayedEl, 'あなた');
    sfxCard();
    safeVibrate(20);
    setMessage('あなたが先にカードを伏せた。CPUが続く……');
    await wait(430);
    if (sequenceId !== battleSequenceId) return;
    showCardBack(cpuPlayedEl, 'CPU');
    sfxCard();
  } else {
    // CPU先手の裏面は resetBattleView() で先に置かれている。
    showCardBack(playerPlayedEl, 'あなた');
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
    inputLocked = false;
    saveSeriesState('ready');

    await wait(1200);
    if (sequenceId !== battleSequenceId) return;
    resetBattleView();
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

async function playCard(playerIndex) {
  if (inputLocked || playerIndex < 0 || playerIndex >= playerHand.length) return;

  // 確定後は取り消せない。選んだカードだけを大きく持ち上げて伏せる。
  inputLocked = true;
  const selectedButton = playerHandEl.querySelector(`[data-index="${playerIndex}"]`);
  playerHandEl.querySelectorAll('.hand-card').forEach((button) => { button.disabled = true; });
  if (selectedButton) {
    selectedButton.classList.add('is-selected', 'is-chosen');
    selectedButton.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
  if (selectionHint) selectionHint.textContent = 'カードを確定しました。勝負を開始します。';
  safeVibrate(12);
  await wait(180);
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

  await resolveChosenBattle(pending, false);
}

function confirmSelectedCard() {
  if (inputLocked || selectedHandIndex === null) return;
  playCard(selectedHandIndex);
}

function cancelSelectedCard() {
  if (inputLocked) return;
  hideSelectionTray();
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
  hideSelectionTray();
  countdownOverlay.classList.add('hidden');
  countdownOverlay.textContent = '';
  showPlaceholder(playerPlayedEl);

  const lead = leadSideForCurrentPlay();
  const actor = lead === playerSide ? 'あなた' : 'CPU';

  if (lead === playerSide) {
    showPlaceholder(cpuPlayedEl);
    setMessage(currentPickPrompt());
  } else {
    showCardBack(cpuPlayedEl, 'CPU');
    setMessage(currentPickPrompt());
    window.setTimeout(() => sfxCard(), paceMs(80, 0.75));
  }
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
  stopBgm();
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
  resultScore.innerHTML = `<span>FINAL SCORE</span><strong>${playerWins} − ${cpuWins}</strong><small>あなた　　　CPU</small><small class="lifetime-line">累計12戦マッチ：${records.series.played}戦 ${records.series.wins}勝 ${records.series.losses}敗 ${records.series.draws}分</small>`;
  retryBtn.textContent = 'もう一度抽選して対戦';
  resultScreen.classList.remove('hidden');
}

function continueSeries() {
  if (currentMatch < TOTAL_MATCHES) {
    currentMatch += 1;
    startMatch();
  } else {
    backToSetup();
    resetLotteryView();
    window.setTimeout(() => lotteryBtn?.focus(), 80);
  }
}

function backToSetup() {
  battleSequenceId += 1;
  if (victoryBurst) victoryBurst.classList.add('hidden');
  stopBgm();
  releaseWakeLock();
  countdownOverlay.classList.add('hidden');
  if (matchIntro) matchIntro.classList.add('hidden');
  resultScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
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

renderRecords();
renderResumePanel();
resetLotteryView();

// ---- オリジナル手続き生成BGM / 効果音 -------------------------------
// 外部音源不要。Web Audio APIでブラウザ内生成するためGitHub Pagesで動作する。
const audioBtn = document.getElementById('audioBtn');
const sfxBtn = document.getElementById('sfxBtn');

const AUDIO = {
  bgmEnabled: preferences.bgmEnabled,
  sfxEnabled: preferences.sfxEnabled,
  ctx: null,
  master: null,
  musicGain: null,
  sfxGain: null,
  timer: null,
  step: 0,
};

function ensureAudio() {
  if (!AUDIO.ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    AUDIO.ctx = new AudioContextClass();
    AUDIO.master = AUDIO.ctx.createGain();
    AUDIO.musicGain = AUDIO.ctx.createGain();
    AUDIO.sfxGain = AUDIO.ctx.createGain();

    AUDIO.master.gain.value = 0.72;
    AUDIO.musicGain.gain.value = 0.13;
    AUDIO.sfxGain.gain.value = 0.24;

    AUDIO.musicGain.connect(AUDIO.master);
    AUDIO.sfxGain.connect(AUDIO.master);
    AUDIO.master.connect(AUDIO.ctx.destination);
  }

  if (AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume();
  return true;
}

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

function bgmTick() {
  if (!AUDIO.bgmEnabled || !AUDIO.ctx) return;

  const bass = [110.00, 110.00, 98.00, 103.83, 110.00, 130.81, 98.00, 103.83];
  const lead = [220.00, 0, 261.63, 0, 246.94, 0, 196.00, 207.65,
                220.00, 0, 293.66, 0, 261.63, 0, 207.65, 196.00];
  const i = AUDIO.step % lead.length;

  if (i % 2 === 0) tone(bass[(i / 2) % bass.length], 0.19, 'triangle', 0.24, 0, AUDIO.musicGain);
  if (lead[i]) tone(lead[i], 0.095, 'square', 0.075, 0.02, AUDIO.musicGain);
  if (i % 4 === 3) tone(880, 0.025, 'square', 0.022, 0.015, AUDIO.musicGain);

  AUDIO.step += 1;
}

function startBgm() {
  if (!AUDIO.bgmEnabled || !ensureAudio()) return;
  if (AUDIO.timer) return;
  AUDIO.step = 0;
  bgmTick();
  AUDIO.timer = window.setInterval(bgmTick, 220);
}

function stopBgm() {
  if (AUDIO.timer) {
    clearInterval(AUDIO.timer);
    AUDIO.timer = null;
  }
}

function sfxMatchStart() {
  tone(98, 0.18, 'sawtooth', 0.08);
  tone(146.83, 0.16, 'triangle', 0.09, 0.12);
  tone(220, 0.20, 'triangle', 0.07, 0.25);
}

function sfxSeriesWin() {
  tone(220, 0.13, 'triangle', 0.12);
  tone(277.18, 0.13, 'triangle', 0.11, 0.12);
  tone(329.63, 0.13, 'triangle', 0.11, 0.24);
  tone(440, 0.18, 'triangle', 0.13, 0.36);
  tone(659.25, 0.42, 'sine', 0.10, 0.52);
}

function sfxSeriesLose() {
  tone(196, 0.16, 'sawtooth', 0.08);
  tone(164.81, 0.18, 'sawtooth', 0.08, 0.14);
  tone(130.81, 0.22, 'sawtooth', 0.075, 0.30);
  tone(98, 0.42, 'triangle', 0.07, 0.46);
}

function sfxCountdown(number) {
  const frequencies = { '3': 330, '2': 370, '1': 415 };
  tone(frequencies[number] || 330, 0.10, 'square', 0.11);
  tone((frequencies[number] || 330) / 2, 0.12, 'triangle', 0.07, 0.015);
}

function sfxOpen() {
  tone(110, 0.10, 'sawtooth', 0.10);
  tone(440, 0.14, 'square', 0.14, 0.04);
  tone(659.25, 0.16, 'triangle', 0.12, 0.09);
}

function sfxCard() {
  tone(185, 0.07, 'square', 0.12);
  tone(247, 0.06, 'square', 0.09, 0.045);
}

function sfxReveal() {
  tone(196, 0.08, 'triangle', 0.13);
  tone(293.66, 0.10, 'triangle', 0.11, 0.07);
}

function sfxDraw() {
  tone(164.81, 0.12, 'triangle', 0.10);
  tone(164.81, 0.12, 'triangle', 0.08, 0.12);
}

function sfxWin() {
  tone(220, 0.12, 'square', 0.16);
  tone(277.18, 0.12, 'square', 0.14, 0.12);
  tone(329.63, 0.18, 'square', 0.14, 0.24);
  tone(440, 0.30, 'triangle', 0.15, 0.38);
}

function sfxSpecialVictory() {
  tone(110, 0.16, 'sawtooth', 0.12);
  tone(220, 0.10, 'square', 0.13, 0.08);
  tone(329.63, 0.12, 'square', 0.14, 0.16);
  tone(440, 0.16, 'triangle', 0.14, 0.28);
  tone(659.25, 0.22, 'triangle', 0.15, 0.42);
  tone(880, 0.34, 'sine', 0.10, 0.58);
}

function sfxLose() {
  tone(220, 0.14, 'sawtooth', 0.10);
  tone(185, 0.16, 'sawtooth', 0.10, 0.12);
  tone(146.83, 0.30, 'sawtooth', 0.09, 0.26);
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
