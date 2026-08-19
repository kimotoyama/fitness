const routines = {
  a: {
    title: "Full Body A",
    note: "Strength · 3 days/week · Leave 1–3 reps in reserve",
    exercises: [
      ["Push-up", 3, "6–10", "90 sec", "2 sec down, controlled up"],
      ["Chin-up", 3, "Good reps", "2–3 min", "No swing, controlled hang"],
      ["Bulgarian split squat", 3, "8–12 / leg", "90–120 sec", "Load front leg"],
      ["Single-leg glute bridge", 3, "10–15 / leg", "60–90 sec", "Squeeze top, hips level"],
      ["Pike push-up", 2, "6–10", "90–120 sec", "Hips high, head forward/down"],
      ["Single-leg calf raise", 2, "12–20 / leg", "60 sec", "Full stretch, pause at top"],
      ["Dead bug", 2, "8–12 / side", "45–60 sec", "Lower back stays down"]
    ]
  },
  b: {
    title: "Full Body B",
    note: "Strength · Alternate A/B/A, then B/A/B",
    exercises: [
      ["Feet-elevated or regular push-up", 3, "6–12", "90 sec", "Controlled reps"],
      ["Pull-up or chin-up", 3, "Good reps", "2–3 min", "Use pull-up if comfortable"],
      ["Reverse lunge", 3, "8–12 / leg", "90–120 sec", "Controlled step back"],
      ["Single-leg RDL", 3, "8–12 / leg", "90–120 sec", "Hips back, feel hamstring"],
      ["Pike push-up", 2, "6–10", "90–120 sec", "Hips high"],
      ["Side plank", 2, "20–45 sec / side", "45–60 sec", "Body straight"],
      ["Cossack squat", 2, "5–8 / side", "60–90 sec", "Slow and controlled"]
    ]
  },
  mobility: {
    title: "Mobility",
    note: "10–15 min · Flow continuously · Little/no rest",
    exercises: [
      ["Deep squat hold with movement", 1, "60 sec", "Flow", "Shift gently and breathe"],
      ["90/90 hip switches", 1, "10 slow reps", "Flow", "Rotate with control"],
      ["90/90 hip stretch / forward lean", 2, "30–45 sec / side", "Flow", "Long spine, ease forward"],
      ["Half-kneeling hip-flexor stretch", 2, "30–45 sec / side", "Flow", "Tuck pelvis, squeeze rear glute"],
      ["Active hamstring rock-back", 2, "8–10 / side", "Flow", "Hinge back with control"],
      ["Cossack squat", 2, "5 slow reps / side", "Flow", "Move only through good range"],
      ["Knee-to-wall ankle mobility", 2, "10 / side", "Flow", "Heel stays down"]
    ]
  }
};

const guidance = {
  a: "<p><strong>Tempo:</strong> mostly 2 sec down, little/no pause, 1–2 sec up.</p><p>Push-ups: regular → feet elevated → close-grip → deficit → pseudo-planche. Chin-ups: assisted/negative → regular → more reps → weighted. Add load to split squats when ready.</p>",
  b: "<p><strong>Tempo:</strong> controlled throughout; stop with 1–3 good reps left.</p><p>Prefer harder variations over endless reps. For hamstrings: bridge → single-leg bridge → sliding curl → Nordic progression. Add load with a backpack before buying weights.</p>",
  mobility: "<p><strong>Priority:</strong> hip rotation → hip flexors → hamstrings → lateral movement → ankles.</p><p>Use this on most non-strength days, or daily if it feels good. Stretching should feel productive, never sharp or painful.</p>"
};

const storageKey = "workout-guide-v1";
let activeRoutine = localStorage.getItem(`${storageKey}-active`) || "a";
let state;
try { state = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { state = {}; }

const list = document.querySelector("#exercise-list");
const title = document.querySelector("#routine-title");
const note = document.querySelector("#routine-note");
const progress = document.querySelector("#progress");
const guidanceContent = document.querySelector("#guidance-content");

function routineState() {
  state[activeRoutine] ||= {};
  return state[activeRoutine];
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  localStorage.setItem(`${storageKey}-active`, activeRoutine);
}

function updateProgress() {
  const routine = routines[activeRoutine];
  const total = routine.exercises.reduce((sum, item) => sum + item[1], 0);
  const done = Object.values(routineState()).filter(Boolean).length;
  progress.textContent = `${done} / ${total} ${activeRoutine === "mobility" ? "steps" : "sets"}`;
  document.querySelectorAll(".exercise").forEach((card, index) => {
    const count = routine.exercises[index][1];
    const complete = Array.from({ length: count }, (_, set) => routineState()[`${index}-${set}`]).every(Boolean);
    card.classList.toggle("complete", complete);
  });
}

function render() {
  const routine = routines[activeRoutine];
  title.textContent = routine.title;
  note.textContent = routine.note;
  guidanceContent.innerHTML = guidance[activeRoutine];
  document.querySelector("#guidance").open = false;
  document.querySelectorAll(".tab").forEach(tab => {
    const selected = tab.dataset.routine === activeRoutine;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });

  list.replaceChildren(...routine.exercises.map((exercise, index) => {
    const [name, sets, reps, rest, cue] = exercise;
    const card = document.createElement("article");
    card.className = "exercise";
    card.innerHTML = `<div><h2 class="exercise-name">${name}</h2><div class="meta"><span class="prescription">${sets} × ${reps}</span><span>Rest: ${rest}</span></div><p class="cue">${cue}</p></div>`;
    const checks = document.createElement("div");
    checks.className = "checks";
    checks.setAttribute("aria-label", `${name} completion`);
    for (let set = 0; set < sets; set += 1) {
      const key = `${index}-${set}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `check${routineState()[key] ? " done" : ""}`;
      button.innerHTML = `<span>${set + 1}</span>`;
      button.setAttribute("aria-label", `${name}, ${activeRoutine === "mobility" && sets > 1 ? "side" : "set"} ${set + 1}`);
      button.setAttribute("aria-pressed", String(Boolean(routineState()[key])));
      button.addEventListener("click", () => {
        routineState()[key] = !routineState()[key];
        button.classList.toggle("done", routineState()[key]);
        button.setAttribute("aria-pressed", String(routineState()[key]));
        save();
        updateProgress();
      });
      checks.append(button);
    }
    card.append(checks);
    return card;
  }));
  updateProgress();
}

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  activeRoutine = tab.dataset.routine;
  save();
  render();
}));

document.querySelector("#reset").addEventListener("click", () => {
  if (!Object.values(routineState()).some(Boolean) || confirm(`Reset all ${routines[activeRoutine].title} checks?`)) {
    state[activeRoutine] = {};
    save();
    render();
  }
});

render();
