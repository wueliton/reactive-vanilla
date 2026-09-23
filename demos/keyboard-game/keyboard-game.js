import {
  computed,
  create,
  el,
  signal,
} from "https://wueliton.github.io/reactive-vanilla/dist/reactive.js";

const GAME_TIME_IN_SECONDS = 60;
const MAX_HISTORY_LENGTH = 6;
const WORDS_API_URL = "https://api.datamuse.com/words?sp=*&max=1000";
const FALLBACK_WORDS = [
  "foco",
  "ritmo",
  "tecla",
  "fluxo",
  "mente",
  "pulso",
  "agora",
  "pronto",
  "forca",
  "codigo",
  "clareza",
  "sprint",
  "veloz",
  "acerto",
  "tempo",
];

const state = signal({
  words: FALLBACK_WORDS,
  started: false,
  finished: false,
  keyword: "",
  typed: "",
  score: 0,
  streak: 0,
  history: [],
  status: "",
});
const countdown = signal(GAME_TIME_IN_SECONDS);
let interval = null;

const formattedTime = computed(() => {
  const seconds = countdown();
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
});

const statusText = computed(() => {
  if (state.finished()) return "partida encerrada";
  if (state.started()) return "partida em andamento";
  return "pronto para começar";
});

const input = el("#typing-input", {
  value: state.typed,
  disabled: state.finished,
  oninput: handleInput,
});

bindInterface();
loadWords();

function bindInterface() {
  el("#keyword-box", {
    attr: { "data-status": state.status },
    children: renderKeyword,
  });
  el("#score", { textContent: state.score });
  el("#game-status", { textContent: statusText });
  el("#timer", { textContent: formattedTime });
  el("#streak", { textContent: state.streak });
  el("#recent-words", { children: renderHistory });
  el("#empty-recent", { hidden: () => state.history().length > 0 });
  el("#game-over", { hidden: () => !state.finished() });
  el("#final-score", { textContent: state.score });
  el("#restart-button", { onclick: resetGame });
  el("#play-again", { onclick: resetGame });
}

function renderKeyword() {
  const keyword = state.keyword();

  return [...keyword].map((char, index) =>
    create("span", {
      textContent: char,
      class: [
        "letter",
        () => {
          const typed = state.typed()[index];
          return typed ? (typed === char ? "correct" : "missed") : "";
        },
      ],
    }),
  );
}

function renderHistory() {
  return state.history().map((word, index) =>
    create("li", {
      children: [
        create("span", { textContent: word }),
        create("span", {
          textContent: String(state.score() - index).padStart(2, "0"),
        }),
      ],
    }),
  );
}

function handleInput(event) {
  if (state.finished() || state.status()) return;

  startGame();
  state.typed.set(event.target.value.toLowerCase());

  if (!state.keyword().startsWith(state.typed())) {
    handleInvalidWord();
    return;
  }

  if (state.keyword() === state.typed()) {
    handleCorrectWord();
  }
}

function handleInvalidWord() {
  state.status.set("invalid");
  state.streak.set(0);
  clearTypedWord(320);
}

function handleCorrectWord() {
  state.score.update((score) => score + 1);
  state.streak.update((streak) => streak + 1);
  state.history.update((history) => [state.keyword(), ...history].slice(0, MAX_HISTORY_LENGTH));
  state.status.set("valid");
  clearTypedWord(420, true);
}

function clearTypedWord(delay, changeWord = false) {
  setTimeout(() => {
    state.typed.set("");
    state.status.set("");
    if (changeWord) chooseWord();
  }, delay);
}

function startGame() {
  if (state.started() || state.finished()) return;

  state.started.set(true);
  interval = setInterval(() => {
    countdown.update((seconds) => seconds - 1);
    if (countdown() <= 0) finishGame();
  }, 1000);
}

function finishGame() {
  state.finished.set(true);
  clearInterval(interval);
}

function resetGame() {
  clearInterval(interval);
  state.started.set(false);
  state.finished.set(false);
  state.typed.set("");
  state.score.set(0);
  state.streak.set(0);
  state.history.set([]);
  state.status.set("");
  countdown.set(GAME_TIME_IN_SECONDS);
  chooseWord();

  requestAnimationFrame(() => input.focus());
}

function chooseWord() {
  const currentWord = state.keyword();
  const history = state.history();
  const availableWords = state
    .words()
    .filter((word) => word !== currentWord && !history.includes(word));
  const words = availableWords.length ? availableWords : state.words();
  const nextWord = words[Math.floor(Math.random() * words.length)];
  state.keyword.set(nextWord);
}

async function loadWords() {
  try {
    const response = await fetch(WORDS_API_URL);
    if (!response.ok) return;

    const data = await response.json();
    const words = data
      .map(({ word }) => word.toLowerCase())
      .filter((word) => /^[a-z]+$/.test(word) && word.length >= 4 && word.length <= 10);

    if (words.length) {
      state.words.set(words);
      chooseWord();
    }
  } catch {
    chooseWord();
  }
}
