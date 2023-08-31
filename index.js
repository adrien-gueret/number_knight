const styleSheet = s.sheet;

let selectors = [];

for (let tuto of document.querySelectorAll("[data-t]")) {
  selectors.push(
    `body[data-t="${tuto.dataset.t}"] aside[data-t="${tuto.dataset.t}"]`
  );
}

styleSheet.insertRule(
  `${selectors.join(",")}{display:block;}`,
  styleSheet.cssRules.length
);

let isCustomLevel = false;

for (let text of document.querySelectorAll(".split")) {
  text.innerHTML = `<span>${text.textContent
    .trim()
    .split("")
    .join("</span><span>")}</span>`.replaceAll(/ /g, "&nbsp;");

  let i = 0;

  for (let letter of text.querySelectorAll("span")) {
    letter.style.animationDelay = `${i++ * 10}ms`;
  }
}

const levels = [
  "10t5",
  "5t3_5",
  "8t5_12t25_65_20",
  "30t25ft100p",
  "10t10_50p_1f_5",
  "8ft4_7a_2f",
  "5t15p_3f_5a",
  "10at5p_40a_15_10ft70p",
  "5pt3p_3a_3_3ft15a_15f_15p_15t1_80a_300f",
  "100t40st30st20s",
  "50t10_40st10s_10",
  "20at10sa_10sf_10ft5sf",
  "20at10sp_10sf_10ft25f_15a_30ps_10ast10a_10sf",
  "20t10w_10w_10wt10w_10w",
  "10t5w_10_5t35",
  "10t4_5s_3wt14",
  "5ft10a_5wp_5aw_5sp",
  "10at3wf_3sf_3wp_3sp",
  "8ft4a_2sf_3wpt4p_8wa_10sft9a_18wf_9_9pt230f",
  "1t+20mt-10mt11_x2m",
  "10t-10m_+1mt-20m_+30m_-100m_+200m",
  "5t+10m_10a_5spt20wa_5sp_+20mt70",
  "100ft+5mpt-10mpt/2mft+10matx2mftx2mat/2mft119",
  "10t10f_5a_+10mpt-6mf_10wp_10sat+10m_70_20w",
  "4t+6mf_+6ma_+6mp_10wft100w_+80pm_+80amt-500m",
  "10t-2mp_-2m_-2mf_-2mat5p",
  "10t-20mp_4sa_-10mf_6wp_6wft-20ma",
  "999t1",
];

const t = (i, n) => (n - i) / n;

const removeSound = (i) => {
  i = i * 0.75;
  const n = 1.3e4;
  const c = n / 3;
  if (i > n) return null;
  const q = Math.pow(t(i, n), 3.1) * 0.1;
  return Math.pow(i, 1.08) & (i < c ? 98 : 99) ? q : -q;
};

const buttonSound = (i) => {
  const n = 1e4;
  const c = n / 3;
  if (i > n) return null;
  const q = Math.pow(t(i, n), 2);
  return Math.pow(i, 2) & (i < c ? 1.6 : 9.9) ? q : -q;
};

const playerDieSound = (i) => {
  i = Math.pow(i, 0.96) * 1.3;
  const n = 9e4;
  if (i > n) return null;
  return (
    ((i + Math.sin(i / 1900) * 80) & 128 ? 0.05 : -0.05) * Math.pow(t(i, n), 5)
  );
};

const hitSound = (i) => {
  var n = 3e3;
  if (i > n) return null;
  return (
    3 *
    Math.sin(i / 100 - Math.sin(i / 10) * Math.sin(i / 100)) *
    Math.cos(Math.random()) *
    t(i, n)
  );
};

const winSound = (i) => {
  const notes = [0, 4, 7, 12, undefined, 7, 12];
  const n = 3.5e4;
  if (i > n) return null;
  const idx = ((notes.length * i) / n) | 0;
  const note = notes[idx];
  if (note === undefined) return 0;
  const r = Math.pow(2, note / 12) * 0.8;
  const q = t((i * notes.length) % n, n);
  return (i * r) & 64 ? q : -q;
};

const drinkSound = (i) => {
  const n = 2e4;
  if (i > n) return null;
  const q = t(i, n);
  return (
    Math.sin(
      i * 0.001 * Math.sin(0.009 * i + Math.sin(i / 200)) + Math.sin(i / 100)
    ) *
    q *
    q
  );
};

const destroyTowerSound = (i) => {
  const n = 5e4;
  if (i > n) return null;
  return (
    (Math.pow(i + Math.sin(i * 0.03) * 100, 0.6) & 20 ? 0.1 : -0.1) *
    Math.pow(t(i, n), 2)
  );
};

let soundsEnabled = false;

const playSound = (soundFn) => {
  if (!soundsEnabled) {
    return;
  }

  const A = new AudioContext();
  const m = A.createBuffer(1, 96e3, 48e3);
  const b = m.getChannelData(0);
  for (let i = 96e3; i--; ) b[i] = soundFn(i);
  let s = A.createBufferSource();
  s.buffer = m;
  s.connect(A.destination);
  s.start();
};

const getPlaySound = (fn) => () => playSound(fn);

window.playThunderSound = getPlaySound(winSound);

const toggleSound = (forcedValue) => {
  const newValue = forcedValue === undefined ? !soundsEnabled : forcedValue;

  if (newValue === soundsEnabled) {
    return;
  }

  soundsEnabled = newValue;

  soundButton.classList.toggle("on", soundsEnabled);

  if (soundsEnabled) {
    playBackgroundMusic();
  } else {
    backgroundMusicOscillators.forEach((oscillator) => {
      oscillator.onended = null;
      oscillator.stop();
    });
  }
};
soundButton.onclick = () => toggleSound();

const backgroundMusicOscillators = [];

function playBackgroundMusic() {
  if (!soundsEnabled) {
    return;
  }

  backgroundMusicOscillators.length = 0;

  const track = [
    13, 13, 13, 11, 10, 11, 15, 16, 15, 13, 13, 13, 15, 16, 15, 11, 10, 11, 13,
    13, 13, 16, 17, 16, 10, 9, 10, 13, 13, 13, 9, 8, 9, 17, 18, 17, 13, 13, 16,
    17, 10, 9, 13, 13, 15, 16, 11, 10, 13, 13, 9, 8, 17, 18, 13, 13, 11, 10, 15,
    16,
  ];
  const trackLength = track.length;

  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.07;

  gainNode.connect(audioContext.destination);

  track.forEach((note, i) => {
    const backgroundMusicOscillator = audioContext.createOscillator();
    backgroundMusicOscillators.push(backgroundMusicOscillator);

    backgroundMusicOscillator.type = "sine";
    backgroundMusicOscillator.connect(gainNode);
    backgroundMusicOscillator.onended =
      soundsEnabled && i === trackLength - 1 ? playBackgroundMusic : null;

    const speedStart = 0.35;
    const speedEnd = 0.34;

    backgroundMusicOscillator.start(i * speedStart);

    backgroundMusicOscillator.frequency.setValueAtTime(
      340 * 1.06 ** (13 - note),
      i * speedStart
    );

    backgroundMusicOscillator.stop(i * speedStart + speedEnd);
  });
}

let currentLevelIndex,
  playerValue,
  playerValueDom,
  playerDom,
  isAttacking = false;

function getMultipler(ennemyElement, potionSign) {
  const isNegativePotion = ["-", "/"].includes(potionSign);

  const playerElement = playerDom.parentNode.dataset.e;

  if (!ennemyElement || !playerElement) {
    return 1;
  }

  const typesAdvantages = {
    f: "p",
    p: "a",
    a: "f",
  };

  if (typesAdvantages[playerElement] === ennemyElement) {
    return isNegativePotion ? 0.5 : 2;
  }

  if (typesAdvantages[ennemyElement] === playerElement) {
    return isNegativePotion ? 2 : 0.5;
  }

  return 1;
}

function isAttackSuccess(ennemyValue, ennemyElement) {
  const value = playerValue * getMultipler(ennemyElement);

  return value > ennemyValue;
}

gameOverDialog.addEventListener("close", () => {
  goToLevel(currentLevelIndex);
});

endLevelDialog.addEventListener("close", () => {
  const nextIndex = currentLevelIndex + 1;
  if (levels[nextIndex]) {
    goToLevel(nextIndex);
  } else {
    window.location.hash = "";
    window.location.reload();
  }
});

function gameOver() {
  document.body.classList.add("gameover");
  document.body.classList.remove("attacking");
  isAttacking = false;

  playerDom.classList.add("dead");

  window.setTimeout(() => {
    playSound(playerDieSound);
    gameOverDialog.showModal();
  }, 500);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function explodeTowerFloor(floor) {
  floor.classList.add("destroying");
  floor.parentNode.classList.add("destroying-floor");
  floor.tabIndex = -1;

  const towerSize = 144;
  const amount = 4;
  const pieceSize = towerSize / amount;

  const totalPieces = amount * amount;
  let totalDestroyed = 0;

  return new Promise((resolve) => {
    for (let x = 0; x < towerSize; x += pieceSize) {
      for (let y = 0; y < towerSize; y += pieceSize) {
        const piece = document.createElement("div");
        piece.className = "tower-floor destroying piece";

        piece.style.setProperty("--initialX", `${x}px`);
        piece.style.setProperty("--initialY", `${y}px`);

        floor.append(piece);

        const v = rand(80, 50),
          angle = rand(80, 89),
          theta = (angle * Math.PI) / 180,
          g = -9.8;

        let t = 0;

        const negate = [1, -1, 0],
          direction = negate[Math.floor(Math.random() * negate.length)];

        const randSkew = rand(-5, 10),
          randScale = rand(9, 11) / 10,
          randDeg = rand(30, 5);

        piece.style.transform = `translateX(var(--x)) translateY(var(--y)) scale(${randScale}) skew(${randSkew}deg) rotateZ(${randDeg}deg)`;

        const timer = window.setInterval(() => {
          const ux = Math.cos(theta) * v * direction;
          const uy = Math.sin(theta) * v - -g * t;

          const nx = ux * t;
          const ny = uy * t + 0.5 * g * Math.pow(t, 2);

          window.requestAnimationFrame(() => {
            piece.style.setProperty("--x", nx + "px");
            piece.style.setProperty("--y", -ny + "px");
          });

          t += 0.1;

          if (ny < -30) {
            clearInterval(timer);
            piece.remove();

            if (++totalDestroyed >= totalPieces) {
              const tower = floor.parentNode;
              tower.classList.remove("destroying-floor");
              floor.remove();
              resolve(tower);
            }
          }
        }, 10);
      }
    }
  });
}

function attackTowerFloor(e) {
  if (isAttacking) {
    return;
  }

  isAttacking = true;

  const floor = e.target;

  const isPotion = floor.classList.contains("m");
  const value = Number(floor.dataset.value);
  const element = floor.dataset.e;

  const ennemy = floor.querySelector(".character");

  const playerBoudingClientRect = playerDom.getBoundingClientRect();
  const ennemyBoudingClientRect = ennemy.getBoundingClientRect();

  const x =
    (ennemyBoudingClientRect.left - playerBoudingClientRect.left) / 4 - 8;
  const y = (ennemyBoudingClientRect.top - playerBoudingClientRect.top) / 4;

  playerDom.addEventListener(
    "transitionend",
    () => {
      const hit = document.createElement("div");
      hit.className = `hit${isPotion ? " drink" : ""}`;
      hit.style.setProperty(
        "--rotate",
        [90, 180, 270, 0][Math.floor(value * Math.random() * 100) % 4] + "deg"
      );

      const multipler = getMultipler(element, floor.dataset.sign);

      let hitMultipler;

      if (multipler !== 1) {
        hitMultipler = document.createElement("div");
        hitMultipler.className = "hit-modifier";
        hitMultipler.innerHTML = multipler === 2 ? "x2" : "/2";
      }

      const success = isPotion || isAttackSuccess(value, element);

      hit.addEventListener("animationend", () => {
        window.setTimeout(
          () => {
            hit.remove();

            if (hitMultipler) {
              hitMultipler.remove();
            }

            if (!success) {
              gameOver();

              return;
            }

            if (isPotion) {
              const modifierValue = value * multipler;

              playerValue = Math.floor(
                {
                  "+": playerValue + modifierValue,
                  "-": playerValue - modifierValue,
                  x: playerValue * modifierValue,
                  "/": playerValue / modifierValue,
                }[floor.dataset.sign]
              );
            } else {
              playerValue += value * (floor.classList.contains("s") ? -1 : 1);
            }

            playerValueDom.innerHTML = playerValue;

            const tower = floor.parentNode;
            const isLastFloor = tower.childNodes.length === 1;

            if (!isLastFloor) {
              if (floor.classList.contains("w")) {
                for (let uFloor of tower.querySelectorAll(".tower-floor")) {
                  if (uFloor === floor) {
                    continue;
                  }

                  const uFloorSign = uFloor.dataset.sign;
                  const uFloorValue = uFloor.dataset.value;

                  const newFloorValue =
                    value + Number(uFloorValue) * (uFloorSign === "-" ? -1 : 1);

                  const absNewFloorValue = Math.abs(newFloorValue);

                  if (uFloorSign === "-" && newFloorValue >= 0) {
                    uFloor.dataset.sign = "+";
                  }

                  uFloor.dataset.value = absNewFloorValue;
                  uFloor.querySelector(".floor-value").innerHTML = `${
                    uFloor.dataset.sign ?? ""
                  }${absNewFloorValue}`;
                }
              }

              playSound(destroyTowerSound);
              explodeTowerFloor(e.target);

              if (element) {
                playerDom.parentNode.dataset.e = element;
              } else {
                delete playerDom.parentNode.dataset.e;
              }

              // Make player going back to its tower
              playerDom.addEventListener(
                "transitionend",
                () => {
                  document.body.classList.remove("attacking");
                  isAttacking = false;
                  if (playerValue <= 0) {
                    gameOver();
                  }
                },
                { once: true }
              );
              playerDom.style.removeProperty("transform");
            } else {
              // Move player to next tower
              floor.innerHTML = "";
              document.body.classList.remove("attacking");
              isAttacking = false;

              document
                .querySelector(".tower.current")
                .classList.remove("current");

              delete playerDom.parentNode.dataset.e;

              tower.classList.add("current");
              floor.tabIndex = -1;
              playerDom.style.removeProperty("transform");
              floor.append(playerValueDom, playerDom);
              floor.blur();

              if (playerValue <= 0) {
                gameOver();
                return;
              }

              const nextTower = c.querySelector(".current+.tower");

              if (nextTower === null) {
                window.setTimeout(() => {
                  const lastLevel = getLastReachedLevel();

                  if (!isCustomLevel) {
                    localStorage.setItem(
                      "number-knight-last-level",
                      Math.max(lastLevel, currentLevelIndex + 1)
                    );
                  }

                  playSound(winSound);
                  floor.querySelector(".character").addEventListener(
                    "transitionend",
                    (e) => {
                      e.target.remove();
                    },
                    { once: true }
                  );
                  document.body.classList.add("walking");
                  floor.querySelector(".floor-value").style.visibility =
                    "hidden";

                  const isGameEnd = currentLevelIndex === levels.length - 1;

                  endLevelDialog.classList.toggle(
                    "end",
                    isGameEnd || isCustomLevel
                  );
                  endLevelDialog.classList.toggle("custom", isCustomLevel);
                  endLevelDialog.showModal();
                }, 500);
              } else {
                const nextFloors = nextTower.querySelectorAll(".tower-floor");

                for (let f of nextFloors) {
                  f.tabIndex = 1;
                }

                document.body.style.setProperty(
                  "--scrollX",
                  `-${192 * c.querySelectorAll(".tower-floor:empty").length}px`
                );
              }
            }
          },
          multipler === 1 ? 0 : 200
        );
      });

      playSound(isPotion ? drinkSound : hitSound);
      playerDom.append(hit);

      if (hitMultipler) {
        playerDom.append(hitMultipler);
      }
    },
    { once: true }
  );

  document.body.classList.add("attacking");
  playerDom.style.transform = `scale(4) translate(${x}px, ${y}px)`;
}

const towersSeparator = "t";
const floorsSeparator = "_";

function decodeLevel(levelString) {
  const towers = levelString.split(towersSeparator);

  const modifiersToProp = {
    p: "e",
    a: "e",
    f: "e",
    b: "type",
    s: "type",
    w: "type",
    m: "type",
  };

  return towers.map((towerString) => {
    const towerFloors = towerString.split(floorsSeparator);

    return towerFloors.map((floorString) => {
      const sign = ["+", "-", "x", "/"].includes(floorString[0])
        ? floorString[0]
        : null;
      const value = Number.parseInt(
        sign ? floorString.substring(1) : floorString,
        10
      );

      const stringValue = String(value);

      const tower = { value, sign };

      if (stringValue === floorString) {
        return tower;
      }

      const modifiers = floorString.substring(stringValue.length);
      modifiers.split("").forEach((modifier) => {
        if (modifier in modifiersToProp) {
          tower[modifiersToProp[modifier]] = modifier;
        }
      });

      return tower;
    });
  });
}

function generateLevel(towers) {
  isAttacking = false;
  document.body.classList.remove("gameover", "attacking");

  c.innerHTML = "";
  document.body.style.setProperty("--scrollX", "0px");

  towers.forEach((towerFloors, towerIndex) => {
    const tower = document.createElement("div");
    tower.className = "tower";
    const isFirstTower = towerIndex === 0;

    if (isFirstTower) {
      tower.className += " current";
    }

    towerFloors.forEach((floor, floorIndex) => {
      const towerFloor = document.createElement("div");
      towerFloor.role = "button";
      towerFloor.tabIndex = towerIndex === 1 ? 1 : -1;
      towerFloor.className = "tower-floor";

      let floorValue;
      let elementDom = null;

      floorValue = floor.value;

      ["e", "sign", "value"].forEach(
        (prop) => floor[prop] && (towerFloor.dataset[prop] = floor[prop])
      );

      if (!isFirstTower) {
        towerFloor.classList.add(floor.type ?? "b");
      }

      const floorValueDom = document.createElement("div");
      floorValueDom.innerHTML = `${floor.sign ?? ""}${floorValue}`;
      floorValueDom.className = "floor-value";
      towerFloor.append(floorValueDom);
      tower.append(towerFloor);

      const character = document.createElement("div");
      character.className = "character";
      character.style.animationDelay =
        Math.random() * 100 * (towerIndex + 1) * (floorIndex + 1) + "ms";

      towerFloor.append(character);

      if (elementDom) {
        towerFloor.append(elementDom);
      }

      if (isFirstTower) {
        playerDom = character;
        playerValue = floorValue;
        playerValueDom = floorValueDom;
      }

      towerFloor.addEventListener("click", attackTowerFloor);
    });

    c.append(tower);
  });
}

function getLastReachedLevel() {
  return Number(localStorage.getItem("number-knight-last-level") || 0);
}

function goToLevel(levelIndex) {
  document.body.classList.remove("walking");
  currentLevelIndex = levelIndex;

  if (!Number.isInteger(levelIndex)) {
    generateLevel(decodeLevel(levelIndex));
    return;
  }

  document.body.dataset.t = levelIndex;

  generateLevel(decodeLevel(levels[levelIndex]));
}

document.body.addEventListener("keydown", (e) => {
  if (
    (e.key === "Enter" || e.key === " ") &&
    document.activeElement?.role === "button"
  ) {
    document.activeElement.click();
  }
});

function startGame(levelIndex) {
  document.body.classList.add("walking");

  const start = () => {
    document.body.style.display = "none";
    document.body.offsetHeight;
    document.body.style.display = "block";

    document.body.dataset.s = "game";

    goToLevel(levelIndex);
  };

  if (isCustomLevel) {
    start();
    return;
  }

  document.body.addEventListener("transitionend", start, { once: true });
}

titleDialog.addEventListener("close", (e) => {
  if (e.target.returnValue === "editor") {
    createFloor(createTower());
    createTower();
    updateEditorUICode();
    document.body.dataset.s = "editor";
    return;
  }

  const lastReachedLevel = getLastReachedLevel();

  toggleSound(e.target.returnValue !== "no-sound");

  if (lastReachedLevel === 0) {
    startGame(0);
  } else {
    const totalLevels = levels.length;
    const menuFragment = document.createDocumentFragment();

    for (let i = 0; i < totalLevels; i++) {
      const link = document.createElement("button");
      link.innerHTML = i + 1;
      link.className = "button";
      link.style.animationDelay = `${i * 10}ms`;

      if (lastReachedLevel >= i) {
        link.onclick = () => startGame(i);
      } else {
        link.disabled = true;
      }

      menuFragment.append(link);
    }

    levelList.append(menuFragment);

    document.body.dataset.s = "menu";
  }
});

const isSign = (t) => ["+", "-", "/", "*", "x"].includes(t);

ce.onbeforeinput = (e) => {
  const isInputAllowed = [
    "deleteContentBackward",
    "deleteContentForward",
  ].includes(e.inputType);

  if (
    isInputAllowed ||
    (e.inputType === "insertText" &&
      ((e.target.className === "value" &&
        Number.isInteger(parseInt(e.data, 10))) ||
        (e.target.className === "sign" && isSign(e.data))))
  ) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();
};

const getCustomLevelCode = () => {
  const modifiers = ["p", "a", "f", "b", "s", "w", "m"];

  const towers = [];

  for (let tower of ce.querySelectorAll(".tower")) {
    const floors = [];

    for (let floor of tower.querySelectorAll(".tower-floor")) {
      if (
        floor.classList.contains("ghost") ||
        floor.classList.contains("destroying")
      ) {
        continue;
      }
      let floorCode = "";

      if (floor.classList.contains("m")) {
        floorCode += floor.dataset.sign;
      }

      const nodeValue =
        floor.querySelector(".floor-value .value") ||
        floor.querySelector(".floor-value");

      floorCode += nodeValue.textContent;

      [floor.dataset.type, floor.dataset.e].forEach((modifier) => {
        modifiers.includes(modifier) && (floorCode += modifier);
      });

      floors.push(floorCode);
    }

    if (floors.length) {
      towers.push(floors.join(floorsSeparator));
    }
  }
  return towers.join(towersSeparator);
};

const updateEditorUICode = () => {
  cu.value = `${document.location.origin}${
    document.location.pathname
  }#${getCustomLevelCode()}`;
  ca.href = cu.value;
};

const formatValue = (domNode) => {
  if (domNode.classList.contains("value")) {
    domNode.textContent = Math.max(
      1,
      Math.min(999999, Number(domNode.textContent))
    );
  } else if (domNode.className === "sign") {
    const newSign =
      (domNode.textContent[0] === "*" ? "x" : domNode.textContent[0]) || "+";

    domNode.parentNode.parentNode.dataset.sign = newSign;
    domNode.textContent = newSign;
  }
  updateEditorUICode();
};

ce.oninput = (e) => {
  !["deleteContentBackward", "deleteContentForward"].includes(e.inputType) &&
    formatValue(e.target);
};

ce.addEventListener("blur", (e) => formatValue(e.target), true);

ce.onkeydown = (e) => {
  if (!e.target.classList.contains("value")) {
    return;
  }

  const value = Number(e.target.textContent);

  const delta = { ArrowUp: 1, ArrowDown: -1 }[e.key];

  if (delta) {
    e.target.textContent = value + delta;
    formatValue(e.target);
  }
};

const createTower = () => {
  const tower = document.createElement("div");
  tower.className = "tower";
  tower.innerHTML = `<div role="button" tabindex="1" class="tower-floor ghost"><div class="floor-value">+</div></div>`;
  ce.append(tower);
  return tower;
};

const createFloor = (tower) => {
  const floor = document.createElement("div");
  floor.dataset.e = "none";
  floor.dataset.type = "b";
  floor.dataset.sign = "+";
  floor.className = "tower-floor b";
  floor.innerHTML = `<button class="d">❌</button><div class="floor-value"><span class="sign" contenteditable>+</span><span class="value" contenteditable>10</span></div><div role="button" tabindex="1" class="character"></div><div role="button" tabindex="1" class="element none">♦️</div>`;
  tower.firstChild.after(floor);
};

ce.onclick = (e) => {
  if (e.target.classList.contains("d")) {
    explodeTowerFloor(e.target.parentNode).then((tower) => {
      tower.children.length === 1 && tower.remove();
      updateEditorUICode();
    });
    return;
  }

  const next = (
    classNameToHave,
    items,
    datasetProp,
    domToUpdateClassname,
    baseClassname
  ) => {
    if (e.target.classList.contains(classNameToHave)) {
      const nextItem =
        items[items.indexOf(e.target.parentNode.dataset[datasetProp]) + 1] ||
        items[0];
      e.target.parentNode.dataset[datasetProp] = nextItem;
      domToUpdateClassname.className = baseClassname + " " + nextItem;

      updateEditorUICode();
    }
  };

  next("element", ["none", "f", "a", "p"], "e", e.target, "element");

  next(
    "character",
    ["b", "s", "w", "m"],
    "type",
    e.target.parentNode,
    "tower-floor"
  );

  if (!e.target.classList.contains("ghost")) {
    return;
  }

  createFloor(e.target.parentNode);

  if (!e.target.parentNode.nextSibling) {
    createTower();
  }

  updateEditorUICode();
};

if (window.location.hash) {
  isCustomLevel = true;
  startGame(window.location.hash.substring(1));
}

window.onhashchange = () => window.location.reload();
