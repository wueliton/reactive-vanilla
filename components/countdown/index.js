import {
  signal,
  el,
  component,
  defineComponent,
} from "https://wueliton.github.io/reactive-vanilla/dist/reactive.js";

const countDown = defineComponent(({ root, seconds = 5, initialSeconds = seconds }) => {
  const count = signal(initialSeconds);
  const isRunning = signal(false);
  let intervalId = null;
  let audioContext;

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
    isRunning.set(false);
  };

  const setRunning = (value) => {
    if (value === isRunning()) {
      return;
    }

    if (value) {
      intervalId = setInterval(() => {
        const canStop = count() <= 1;
        count.update((time) => --time);

        if (canStop) {
          stop();
          playAlarm();
        }
      }, 1000);
      isRunning.set(true);
      return;
    }

    stop();
  };

  const playAlarm = () => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    const gain = audioContext.createGain();

    oscillator.frequency.value = 1046.5;
    gain.gain.value = 0.3;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(audioContext.currentTime + 1);
  };

  el("[counter-spin]", {
    attr: {
      ["data-active"]: () => isRunning(),
    },
  });

  el("[counter-time]", {
    textContent: () => {
      const time = count();
      const minutes = String(Math.floor(time / 60)).padStart(2, "0");
      const seconds = String(Math.floor(time % 60)).padStart(2, "0");

      return `${minutes}:${seconds}`;
    },
  });

  el("[counter-btn]", {
    onclick: () => {
      audioContext ??= new AudioContext();

      const countDownEnded = count() === 0;
      if (countDownEnded) {
        count.set(seconds);
        return;
      }

      setRunning(!isRunning());
    },
    textContent: () => (isRunning() ? "⏸︎" : count() === 0 ? "↻" : "▶"),
  });

  root.timeline = {
    set(target, value) {
      if (target === "count") {
        count.set(Number(value));
      }

      if (target === "isRunning") {
        setRunning(Boolean(value));
      }
    },
  };
});

function createCountDown(selector, props) {
  return component(selector, countDown(props));
}

export { createCountDown };
