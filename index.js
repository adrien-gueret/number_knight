(() => {
  const d = document;
  const b = d.body;
  const cr = d.createElement.bind(d);

  const styleSheet = s.sheet;

  let selectors = [];

  for (let tuto of d.querySelectorAll("[data-t]")) {
    selectors.push(
      `body[data-t="${tuto.dataset.t}"] aside[data-t="${tuto.dataset.t}"]`
    );
  }

  styleSheet.insertRule(
    `${selectors.join(",")}{display:block;}`,
    styleSheet.cssRules.length
  );

  let isCustomLevel = false;

  for (let text of d.querySelectorAll(".split")) {
    text.innerHTML = `<span>${text.textContent
      .trim()
      .split("")
      .join("</span><span>")}</span>`.replace(/ /g, "&nbsp;");

    let i = 0;

    for (let letter of text.querySelectorAll("span")) {
      letter.style.animationDelay = `${i++ * 10}ms`;
    }
  }

  const levels = [
    "1t0",
    "2t1_2",
    "3t2_4t16_32_8",
    "4t6f_3f_12ft45p",
    "5t5_25p_2f_1",
    "6ft2_5a_1f",
    "7t20p_5f_7a",
    "8at4p_38a_13_8ft70p",
    "9pt7p_7a_7_7ft35a_35f_35p_35t1_300a_950f",
    "10t4st3st2s",
    "11t1_10st1s_1",
    "12at6sa_6sf_6ft5sf",
    "13at3sp_3sf_3ft25f_15a_30ps_10ast10a_10sf",
    "14t2w_2wt10w_10wt40",
    "15t10w_15_10t65",
    "16t10_11s_10wt24",
    "17ft22a_17wp_17aw_17sp",
    "18at7wf_7sf_7wp_7sp",
    "19ft12a_10sf_11wpt24p_28wa_30sft50a_65wf_50_50pt940f",
    "20t+100mt-50mt130_x2m",
    "21t-25m_+5mt-20m_+30m_-10m",
    "22t+28m_40a_40spt20wa_5sp_+20mt100",
    "23ft+30mpt+17mpt/2mft+10matx2mftx2mat/2mft119",
    "24t10f_6a_+10mpt-6mf_10wp_10sat+10m_90_20w",
    "25t+40mf_+40ma_+40mp_30wft100wp_+80pm_+80amt-1000m",
    "26t-8mp_-8m_-8mf_-8mat3p",
    "27t-20mp_15sa_-10mf_6wp_6sp_6wft-30ma",
    "28ft1f_+1mf_13s_30wa_14at90_/2m_90wt-100mf_+10mp_180ft360p",
    "29t+1mf_+1ma_+1mpt+35ma_35bpt1b_-140mat-30mp_30wa_30sft35bp",
    "999t1",
  ];
  let levelsToUse = levels;
  const t = (i, n) => (n - i) / n;

  const playerDieSound = (i) => {
    i = Math.pow(i, 0.96) * 1.3;
    const n = 9e4;
    return i > n
      ? null
      : ((i + Math.sin(i / 1900) * 80) & 128 ? 0.05 : -0.05) *
          Math.pow(t(i, n), 5);
  };

  const hitSound = (i) => {
    var n = 3e3;
    return i > n
      ? null
      : 3 *
          Math.sin(i / 100 - Math.sin(i / 10) * Math.sin(i / 100)) *
          Math.cos(Math.random()) *
          t(i, n);
  };

  const winSound = (i) => {
    const notes = [0, 4, 7, 12, undefined, 7, 12];
    const n = 3.5e4;
    if (i > n) return null;
    const note = notes[((notes.length * i) / n) | 0];
    if (note === undefined) return 0;
    const q = t((i * notes.length) % n, n);
    return (i * (Math.pow(2, note / 12) * 0.8)) & 128 ? q : -q;
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
    return i > n
      ? null
      : (Math.pow(i + Math.sin(i * 0.03) * 100, 0.6) & 20 ? 0.1 : -0.1) *
          Math.pow(t(i, n), 2);
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

  const toggleSound = (forcedValue) => {
    const newValue = forcedValue === undefined ? !soundsEnabled : forcedValue;

    if (newValue === soundsEnabled) {
      return;
    }

    soundsEnabled = newValue;

    soundButton.classList.toggle("on", soundsEnabled);

    if (soundsEnabled) {
      playBackgroundMusic();
      return;
    }
    backgroundMusicOscillators.forEach((oscillator) => {
      oscillator.onended = null;
      oscillator.stop();
    });
  };
  soundButton.onclick = () => toggleSound();

  const backgroundMusicOscillators = [];

  function playBackgroundMusic() {
    if (!soundsEnabled) {
      return;
    }

    backgroundMusicOscillators.length = 0;

    const track = [
      13, 13, 13, 11, 10, 11, 15, 16, 15, 13, 13, 13, 15, 16, 15, 11, 10, 11,
      13, 13, 13, 16, 17, 16, 10, 9, 10, 13, 13, 13, 9, 8, 9, 17, 18, 17, 13,
      13, 16, 17, 10, 9, 13, 13, 15, 16, 11, 10, 13, 13, 9, 8, 17, 18, 13, 13,
      11, 10, 15, 16,
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

  gameOverDialog.onclose = () => {
    goToLevel(currentLevelIndex);
  };

  endLevelDialog.onclose = () => {
    const nextIndex = currentLevelIndex + 1;
    if (levelsToUse[nextIndex]) {
      goToLevel(nextIndex);
    } else {
      location.href = location.origin + location.pathname;
    }
  };

  menuDialog.onclose = (e) => {
    startGame(Number(e.target.returnValue));
  };

  function gameOver() {
    b.classList.add("gameover");
    b.classList.remove("attacking");
    isAttacking = false;

    playerDom.classList.add("dead");

    setTimeout(() => {
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
          const piece = cr("div");
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

          const timer = setInterval(() => {
            const ux = Math.cos(theta) * v * direction;
            const uy = Math.sin(theta) * v - -g * t;

            const ny = uy * t + 0.5 * g * Math.pow(t, 2);

            requestAnimationFrame(() => {
              piece.style.setProperty("--x", ux * t + "px");
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
        const hit = cr("div");
        hit.className = `hit${isPotion ? " drink" : ""}`;
        hit.style.setProperty(
          "--rotate",
          [90, 180, 270, 0][Math.floor(value * Math.random() * 100) % 4] + "deg"
        );

        const multipler = getMultipler(element, floor.dataset.sign);

        let hitMultipler;

        if (multipler !== 1) {
          hitMultipler = cr("div");
          hitMultipler.className = "hit-m";
          hitMultipler.innerHTML = multipler === 2 ? "x2" : "/2";
        }

        const success = isPotion || isAttackSuccess(value, element);

        hit.addEventListener("animationend", () => {
          setTimeout(
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
                    if (uFloor !== floor) {
                      const uFloorSign = uFloor.dataset.sign;

                      const newFloorValue =
                        value +
                        Number(uFloor.dataset.value) *
                          (uFloorSign === "-" ? -1 : 1);

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
                    b.classList.remove("attacking");
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
                b.classList.remove("attacking");
                isAttacking = false;

                d.querySelector(".tower.current").classList.remove("current");

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
                  setTimeout(() => {
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
                    b.classList.add("walking");
                    floor.querySelector(".floor-value").style.visibility =
                      "hidden";

                    const isGameEnd =
                      currentLevelIndex === levelsToUse.length - 1;

                    endLevelDialog.classList.toggle("end", isGameEnd);
                    endLevelDialog.classList.toggle(
                      "hideEndMessage",
                      levelsToUse.length < 2
                    );
                    endLevelDialog.showModal();
                  }, 500);
                } else {
                  const nextFloors = nextTower.querySelectorAll(".tower-floor");

                  for (let f of nextFloors) {
                    f.tabIndex = 1;
                  }

                  b.style.setProperty(
                    "--scrollX",
                    `-${
                      192 * c.querySelectorAll(".tower-floor:empty").length
                    }px`
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

    b.classList.add("attacking");
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
      b: "t",
      s: "t",
      w: "t",
      m: "t",
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

        const towerFloor = { value };
        sign && (towerFloor.sign = sign);

        if (stringValue === floorString) {
          return towerFloor;
        }

        const modifiers = floorString.substring(stringValue.length);
        modifiers.split("").forEach((modifier) => {
          if (modifier in modifiersToProp) {
            towerFloor[modifiersToProp[modifier]] = modifier;
          }
        });

        return towerFloor;
      });
    });
  }

  function generateLevel(towers) {
    isAttacking = false;
    b.classList.remove("gameover", "attacking");

    c.innerHTML = "";
    b.style.setProperty("--scrollX", "0px");

    towers.forEach((towerFloors, towerIndex) => {
      const tower = cr("div");
      tower.className = "tower";
      const isFirstTower = towerIndex === 0;

      if (isFirstTower) {
        tower.className += " current";
      }

      towerFloors.forEach((floor, floorIndex) => {
        const towerFloor = cr("div");
        towerFloor.role = "button";
        towerFloor.tabIndex = towerIndex === 1 ? 1 : -1;
        towerFloor.className = "tower-floor";

        let floorValue;
        let elementDom = null;

        floorValue = floor.value;

        ["e", "sign", "value"].forEach(
          (prop) => prop in floor && (towerFloor.dataset[prop] = floor[prop])
        );

        if (!isFirstTower) {
          towerFloor.classList.add(floor.t ?? "b");
        }

        const floorValueDom = cr("div");
        floorValueDom.innerHTML = `${floor.sign ?? ""}${floorValue}`;
        floorValueDom.className = "floor-value";
        towerFloor.append(floorValueDom);
        tower.append(towerFloor);

        const character = cr("div");
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
    b.classList.remove("walking");
    currentLevelIndex = levelIndex;

    if (!Number.isInteger(levelIndex)) {
      generateLevel(decodeLevel(levelIndex));
      return;
    }

    if (!isCustomLevel) {
      b.dataset.t = levelIndex;
    }

    generateLevel(decodeLevel(levelsToUse[levelIndex]));
    d.scrollingElement.scrollTo(0, 0);
  }

  b.onkeydown = (e) => {
    if (["Enter", " "].includes(e.key) && d.activeElement?.role === "button") {
      d.activeElement.click();
    }
  };

  function startGame(levelIndex) {
    b.classList.add("walking");

    const start = () => {
      b.style.display = "none";
      b.offsetHeight;
      b.style.display = "block";

      b.dataset.s = "game";

      goToLevel(levelIndex);
    };

    if (isCustomLevel) {
      start();
      return;
    }

    b.addEventListener("transitionend", start, { once: true });
  }

  const goToEditor = () => {
    createFloor(createTower());
    createTower();
    updateEditorUICode();
    b.dataset.s = "editor";
  };

  titleDialog.onclose = (e) => {
    if (e.target.returnValue === "editor") {
      goToEditor();
      return;
    }

    const lastReachedLevel = getLastReachedLevel();

    toggleSound(e.target.returnValue !== "no-sound");

    if (lastReachedLevel === 0) {
      startGame(0);
    } else {
      const menuFragment = d.createDocumentFragment();

      for (let i = 0; i < levels.length; i++) {
        const link = cr("button");
        link.value = i;
        link.innerText = i + 1;
        link.className = "button";
        link.style.animationDelay = `${i * 10}ms`;

        link.disabled = lastReachedLevel < i;

        menuFragment.append(link);
      }

      b.dataset.s = "menu";
      menuDialog.showModal();
      levelList.append(menuFragment);
    }
  };

  const isSign = (t) => ["+", "-", "/", "*", "x"].includes(t);

  ce.onbeforeinput = (e) => {
    const isInputAllowed = [
      "deleteContentBackward",
      "deleteContentForward",
    ].includes(e.inputType);

    if (
      isInputAllowed ||
      (e.inputType === "insertText" &&
        ((e.target.classList.contains("value") &&
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
    const origin = d.location.origin;
    const pathname = d.location.pathname;
    const code = getCustomLevelCode();

    cu.value = `${origin}${pathname}?p=${code}`;
    ca.href = cu.value;
    cs.href = `https://adrien-gueret.github.io/number_knight/your_levels.html#${code}`;
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
    const tower = cr("div");
    tower.className = "tower";
    tower.innerHTML = `<div role="button" tabindex="1" class="tower-floor ghost"><div class="floor-value">+</div></div>`;
    ce.append(tower);
    return tower;
  };

  const createFloor = (tower) => {
    const floor = cr("div");
    floor.dataset.e = "none";
    floor.dataset.type = "b";
    floor.dataset.sign = "+";
    floor.className = "tower-floor b";
    floor.innerHTML = `<button class="d">❌</button><div class="floor-value"><span class="sign" contenteditable>+</span><span class="value" contenteditable>10</span></div><div role="button" tabindex="1" class="character"></div><div role="button" tabindex="1" class="e none">◆</div>`;
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

    next("e", ["none", "f", "a", "p"], "e", e.target, "e");

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

  const params = new URLSearchParams(location.search);

  if (params.has("p")) {
    isCustomLevel = true;
    levelsToUse = params.getAll("p");
    startGame(0);
  } else if (params.has("e")) {
    goToEditor();
  } else {
    titleDialog.showModal();
  }
})();
