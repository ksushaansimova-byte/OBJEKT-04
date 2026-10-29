const $ = (selector) => document.querySelector(selector);

const LOGIN_CODE = "0417";
const RECOVERY_CODE = "1804";

// ЧАСЫ
function updateClock() {
  $("#clock").textContent = new Date().toLocaleTimeString("ru-RU", {
    hour12: false
  });
}

updateClock();
setInterval(updateClock, 1000);

// СООБЩЕНИЯ ТЕРМИНАЛА
function terminalLine(text) {
  const output = $("#terminal-output");
  if (!output) return;

  const line = document.createElement("p");
  line.textContent = text;
  output.append(line);
  output.scrollTop = output.scrollHeight;
}

// ВХОД
$("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  if ($("#login-code").value.trim() !== LOGIN_CODE) {
    $("#login-error").textContent = "Неверный код. Доступ запрещён.";
    return;
  }

  $("#login").hidden = true;
  $("#site").hidden = false;
  $("#login-error").textContent = "";
  $("#home-message").textContent = "Пользователь подключён. Архив загружен.";

  terminalLine("ACCESS GRANTED.");
});

// ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ
function openPage(name) {
  const page = $(`#page-${name}`);

  if (!page) return;

  document.querySelectorAll(".page").forEach((item) => {
    item.hidden = item !== page;
  });

  document.querySelectorAll(".nav").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === name);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav").forEach((button) => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.open === "camera") {
      openCameraModal();
    } else {
      openPage(button.dataset.open);
    }
  });
});

// ВИДЕОКАМЕРЫ
const basementCameras = [
  { id: "CAM-01", title: "Коридор подвала", file: "videos/camera01.mp4" },
  { id: "CAM-02", title: "Техническое помещение", file: "videos/camera02.mp4" },
  { id: "CAM-03", title: "Лестница", file: "videos/camera03.mp4" },
  { id: "CAM-04", title: "Служебный проход", offline: true },
  { id: "CAM-05", title: "Вход в подвал", file: "videos/camera05.mp4" }
];

const towerCameras = [
  { id: "T-01", title: "Периметр", file: "videos/tower/tower01.mp4" },
  { id: "T-02", title: "Лестничный пролёт", file: "videos/tower/tower02.mp4" },
  { id: "T-03", title: "Верхняя площадка", file: "videos/tower/tower03.mp4" },
  { id: "T-04", title: "Служебный сектор", offline: true },
  { id: "T-05", title: "Подъездная дорога", file: "videos/tower/tower05.mp4" }
];

function renderCameras(list, selector) {
  const container = $(selector);
  container.replaceChildren();

  list.forEach((camera) => {
    const card = document.createElement("article");
    card.className = "camera-card";

    const title = document.createElement("div");
    title.className = "camera-title";

    const name = document.createElement("span");
    name.textContent = `${camera.id} / ${camera.title}`;

    const status = document.createElement("span");
    status.textContent = camera.offline ? "NO SIGNAL" : "REC";

    if (camera.offline) status.className = "red-text";

    title.append(name, status);

    const screen = document.createElement("div");
    screen.className = "camera-screen";

    if (camera.offline) {
      const message = document.createElement("div");
      message.className = "no-signal";
      message.innerHTML = "● NO SIGNAL<small>CONNECTION LOST</small>";
      screen.append(message);
    } else {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.src = camera.file;

      video.addEventListener("error", () => {
        screen.replaceChildren();

        const message = document.createElement("div");
        message.className = "no-signal";
        message.textContent = "VIDEO NOT FOUND";
        screen.append(message);
      });

      screen.append(video);
    }

    const foot = document.createElement("div");
    foot.className = "camera-foot";
    foot.textContent = camera.offline
      ? "SIGNAL LOST / ARCHIVE UNAVAILABLE"
      : `ARCHIVE VIDEO / ${camera.id}`;

    card.append(title, screen, foot);
    container.append(card);
  });
}

renderCameras(basementCameras, "#basement-cameras");
renderCameras(towerCameras, "#tower-cameras");

// МОДАЛЬНОЕ ОКНО
const modal = $("#device-modal");
const modalHeading = $("#modal-heading");
const modalContent = $("#modal-content");

function openModal(title, builder, button = null) {
  modalHeading.textContent = title;
  modalContent.replaceChildren();

  document.querySelectorAll(".device-button").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  builder(modalContent);
  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;

  document.querySelectorAll(".device-button").forEach((button) => {
    if (button.id !== "music-button" || !music.paused) {
      if (button.id !== "music-button") button.classList.remove("active");
    }
  });
}

$("#modal-close").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

function makeElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) element.className = className;

  return element;
}

// КНОПКА CAMERA — ФОТО СОТРУДНИКА
function openCameraModal() {
  openModal("CAMERA // PERSONNEL FILE №004", (content) => {
    content.append(makeElement("p", "ЛИЧНОЕ ДЕЛО / ДОСТУП ОГРАНИЧЕН", "eyebrow"));
    content.append(makeElement("h3", "СОТРУДНИК №004"));

    const photo = document.createElement("img");
    photo.className = "modal-photo";
    photo.src = "сотрудникмайн.jfif";
    photo.alt = "Фотография сотрудника №004";

    photo.addEventListener("error", () => {
      photo.alt = "Фотография не найдена";

      const warning = makeElement(
        "p",
        "ФОТО НЕ НАЙДЕНО. Проверь имя файла сотрудникмайн.jfif и его расположение.",
        "red-text"
      );

      content.append(warning);
    });

    content.append(photo);

    content.append(makeElement(
      "div",
      "STATUS: MISSING\nPOSITION: OBSERVATION OPERATOR\nLAST LOCATION: TOWER / SECTOR B\nLAST SHIFT: 18.04.2025",
      "modal-meta"
    ));

    terminalLine("PERSONNEL FILE 004 OPENED.");
  }, $("#camera-button"));
}

$("#camera-button").addEventListener("click", openCameraModal);

// МУЗЫКА И КАССЕТА
const music = $("#background-music");
const musicButton = $("#music-button");
const musicStatus = $("#music-status");

music.volume = 0.7;

function setMusicState(playing) {
  musicButton.classList.toggle("playing", playing);
  musicButton.classList.toggle("active", playing);
  musicButton.setAttribute("aria-pressed", String(playing));

  musicStatus.textContent = playing
    ? "СЕЙЧАС ИГРАЕТ"
    : "Нажми на кассету";
}

musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      setMusicState(true);
      terminalLine("BACKGROUND TAPE: PLAYING.");
    } catch {
      musicStatus.textContent = "ПРОВЕРЬ background.mp3";
    }
  } else {
    music.pause();
    setMusicState(false);
    terminalLine("BACKGROUND TAPE: PAUSED.");
  }
});

music.addEventListener("pause", () => {
  setMusicState(false);
});

music.addEventListener("play", () => {
  setMusicState(true);
});

music.addEventListener("error", () => {
  musicStatus.textContent = "ФАЙЛ МУЗЫКИ НЕ НАЙДЕН";
});

// НАСТРОЙКИ
$("#settings-button").addEventListener("click", (event) => {
  openModal("TERMINAL SETUP", (content) => {
    content.append(makeElement("h3", "НАСТРОЙКИ ТЕРМИНАЛА"));

    const volumeRow = document.createElement("div");
    volumeRow.className = "setting-row";

    const label = makeElement("label", "Громкость музыки");
    label.htmlFor = "music-volume";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "music-volume";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(Math.round(music.volume * 100));

    slider.addEventListener("input", () => {
      music.volume = Number(slider.value) / 100;
    });

    volumeRow.append(label, slider);
    content.append(volumeRow);

    const brightnessRow = document.createElement("div");
    brightnessRow.className = "setting-row";

    const brightnessLabel = makeElement("label", "Яркость экрана");
    brightnessLabel.htmlFor = "screen-brightness";

    const brightness = document.createElement("input");
    brightness.type = "range";
    brightness.id = "screen-brightness";
    brightness.min = "65";
    brightness.max = "115";
    brightness.value = "100";

    brightness.addEventListener("input", () => {
      $("#site").style.filter =
        `brightness(${Number(brightness.value) / 100})`;
    });

    brightnessRow.append(brightnessLabel, brightness);
    content.append(brightnessRow);
  }, event.currentTarget);
});

// FILES — WIKI
$("#files-button").addEventListener("click", () => {
  closeModal();
  openPage("wiki");
  terminalLine("KNOWLEDGE BASE OPENED.");
});

// LOG — СИСТЕМНЫЕ СОБЫТИЯ
$("#incident-button").addEventListener("click", (event) => {
  openModal("SYSTEM LOG // INCIDENTS", (content) => {
    content.append(makeElement("h3", "ЖУРНАЛ СОБЫТИЙ"));

    [
      "17.04.2003 / SECTOR B / CONNECTION INTERRUPTED",
      "03:17 / CAMERA T-04 / NO SIGNAL",
      "18.04.2025 / PERSONNEL 004 / EXIT RECORD NOT FOUND",
      "UNKNOWN / INCIDENT_04.DAT / RECOVERY REQUIRED"
    ].forEach((line) => {
      content.append(makeElement("div", line, "modal-log"));
    });
  }, event.currentTarget);
});

// ВОССТАНОВЛЕНИЕ
let archiveRestored = false;

$("#restore-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const error = $("#restore-error");

  if ($("#restore-code").value.trim() !== RECOVERY_CODE) {
    error.textContent = "Ключ не подходит. Восстановление невозможно.";
    return;
  }

  archiveRestored = true;
  $("#progress-fill").style.width = "100%";
  $("#file-percent").textContent = "100% — RESTORED";

  $("#file-text").textContent =
    "ARCHIVE RECOVERY COMPLETE\n" +
    "ADDITIONAL FILE DETECTED\n" +
    "ACCESS: DENIED\n" +
    "RESTRICTION REASON: UNKNOWN";

  $("#restore-result").hidden = false;
  $("#home-message").textContent = "Архив восстановлен. Обнаружен дополнительный файл.";
  error.textContent = "";

  terminalLine("INCIDENT_04.DAT RESTORED.");
});

// ЗАПИСЬ
const recording = $("#system-recording");

$("#play-recording").addEventListener("click", async () => {
  try {
    if (recording.paused) {
      await recording.play();
      $("#play-recording").textContent = "Ⅱ ОСТАНОВИТЬ ЗАПИСЬ";
    } else {
      recording.pause();
      recording.currentTime = 0;
      $("#play-recording").textContent = "▶ ПРОСЛУШАТЬ ЗАПИСЬ";
    }
  } catch {
    $("#play-recording").textContent = "ФАЙЛ ЗАПИСИ НЕ НАЙДЕН";
  }
});

recording.addEventListener("ended", () => {
  $("#play-recording").textContent = "▶ ПРОСЛУШАТЬ ЗАПИСЬ";
});

// WIKI
const articles = [
  {
    title: "Сотрудник №004",
    keywords: "сотрудник пропавший оператор персонал",
    intro: "Единственный сотрудник, числящийся пропавшим.",
    body: "Сотрудник №004 работал оператором наблюдения. Последняя смена отмечена 18.04.2025. Пропуск не возвращён. Запись о выходе с территории отсутствует."
  },
  {
    title: "Вышка",
    keywords: "вышка башня tower камеры",
    intro: "Наблюдательная вышка на территории объекта.",
    body: "На вышке зарегистрированы камеры T-01, T-02, T-03 и T-05. Камера T-04 числится в системе, но её видеозапись отсутствует."
  },
  {
    title: "Камера T-04",
    keywords: "t-04 камера сигнал запись",
    intro: "Последняя передача сигнала — 03:17.",
    body: "После потери сигнала видеозапись не появилась в архиве. Причина сбоя не установлена. В журнале есть ссылка на сектор B."
  },
  {
    title: "Сектор B",
    keywords: "сектор b помещение подвал вышка",
    intro: "Сектор, упомянутый в последнем отчёте.",
    body: "Сектор B упоминается в нескольких документах. Подробности частично повреждены. Рекомендуется проверить журналы камер и личное дело сотрудника №004."
  },
  {
    title: "Пропуск",
    keywords: "пропуск карта ключ доступ сотрудник",
    intro: "Пропуск сотрудника, который не был возвращён.",
    body: "По данным отдела персонала, пропуск не сдан после окончания смены. Последняя отметка доступа требует дополнительной проверки."
  },
  {
    title: "История объекта",
    keywords: "история объект архив дата база",
    intro: "Краткая история внутренней базы.",
    body: "Архив содержит журналы наблюдения, документы персонала и отчёты о технических сбоях. Часть записей повреждена или закрыта для просмотра."
  }
];

const HISTORY_KEY = "objectArchiveSearchHistory";
let history = [];

try {
  const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  if (Array.isArray(saved)) history = saved.filter((item) => typeof item === "string");
} catch {
  history = [];
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Поиск всё равно работает, даже если сохранение запрещено.
  }
}

function showArticle(article) {
  const target = $("#wiki-article");
  target.replaceChildren();

  target.append(makeElement("p", "DATABASE ARTICLE", "eyebrow"));
  target.append(makeElement("h3", article.title));
  target.append(makeElement("p", article.intro));
  target.append(makeElement("h4", "ОБЩИЕ СВЕДЕНИЯ"));
  target.append(makeElement("p", article.body));
}

function renderHistory() {
  const box = $("#wiki-history");
  box.replaceChildren();

  if (!history.length) {
    box.append(makeElement("p", "История поиска пока пуста.", "hint"));
    return;
  }

  history.forEach((query) => {
    const button = makeElement("button", "↳ " + query, "history-item");
    button.type = "button";

    button.addEventListener("click", () => {
      $("#wiki-input").value = query;
      searchWiki(query, false);
    });

    box.append(button);
  });
}

function searchWiki(rawQuery, addToHistory = true) {
  const query = rawQuery.trim();
  const resultBox = $("#wiki-results");
  resultBox.replaceChildren();

  if (!query) {
    resultBox.append(makeElement("p", "Введи слово для поиска.", "hint"));
    return;
  }

  if (addToHistory) {
    history = [
      query,
      ...history.filter((old) => old.toLowerCase() !== query.toLowerCase())
    ].slice(0, 8);

    saveHistory();
    renderHistory();
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const found = articles.filter((article) => {
    const text = `${article.title} ${article.keywords} ${article.intro} ${article.body}`.toLowerCase();
    return terms.some((term) => text.includes(term));
  });

  if (!found.length) {
    resultBox.append(makeElement(
      "p",
      "Ничего не найдено. Попробуй другой запрос.",
      "hint"
    ));
    return;
  }

  found.forEach((article) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "result-item";

    button.append(makeElement("strong", article.title));
    button.append(makeElement("small", article.intro));

    button.addEventListener("click", () => showArticle(article));

    resultBox.append(button);
  });

  showArticle(found[0]);
}

$("#wiki-search").addEventListener("click", () => {
  searchWiki($("#wiki-input").value);
});

$("#wiki-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchWiki($("#wiki-input").value);
  }
});

$("#clear-history").addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
});

renderHistory();

// ТЕРМИНАЛ
$("#terminal-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#terminal-input");
  const raw = input.value.trim();
  const command = raw.toLowerCase();

  if (!command) return;

  terminalLine("user@object:~$ " + raw);
  input.value = "";

  switch (command) {
    case "help":
      terminalLine("help — список команд");
      terminalLine("status — состояние базы");
      terminalLine("employee — сведения о сотруднике №004");
      terminalLine("camera t-04 — статус камеры T-04");
      terminalLine("restore — состояние восстановления");
      terminalLine("clear — очистить терминал");
      break;

    case "status":
      terminalLine("DATABASE: ONLINE");
      terminalLine("PERSONNEL RECORD 004: MISSING");
      terminalLine("CAMERA T-04: NO SIGNAL");
      break;

    case "employee":
      terminalLine("SUBJECT 004 / STATUS: MISSING");
      terminalLine("LAST LOCATION: TOWER / SECTOR B");
      break;

    case "camera t-04":
      terminalLine("LAST TRANSMISSION: 03:17");
      terminalLine("CURRENT STATUS: NO SIGNAL");
      break;

    case "restore":
      terminalLine(archiveRestored
        ? "ARCHIVE RESTORED. ADDITIONAL FILE: ACCESS DENIED."
        : "ARCHIVE DAMAGED. OPEN THE RECOVERY SECTION.");
      break;

    case "clear":
      $("#terminal-output").replaceChildren();
      break;

    default:
      terminalLine("UNKNOWN COMMAND. TYPE help.");
  }
});