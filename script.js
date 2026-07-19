console.log("mobile script loaded");

const CONFIG = {
  CLOUD_COUNT: 150,

  IMAGES: [
    "Cloud1.png",
    "Cloud2.png",
    "Cloud3.png",
    "Cloud4.png",
    "Cloud5.png",
    "Cloud6.png",
    "Cloud7.png",
    "Cloud8.png",
    "Cloud9.png",
    "Cloud10.png",
    "Cloud11.png"
  ],

  MIN_SIZE: 28,
  MAX_SIZE: 65,

  TOUCH_RADIUS: 130,

  // 둥둥 움직임 크기
  FLOAT_RADIUS_X: 14,
  FLOAT_RADIUS_Y: 14,

  // 둥둥 움직임 속도
  FLOAT_SPEED_MIN: 0.00018,
  FLOAT_SPEED_MAX: 0.00035,

  // 터치 회피
  REPULSION_FORCE: 3.0,

  // 터치에서 멀어지는 속도
  REPULSION_SPEED: 0.12,

  DOUBLE_TAP_DELAY: 320,

  MAX_SELECTED_SIZE: 330
};


const STATE = {
  IDLE: "idle",
  SELECTED: "selected",
  MODAL: "modal",
  POPUP: "popup"
};


let state = STATE.IDLE;

let selectedCloud = null;

let lastTapCloud = null;
let lastTapTime = 0;

let touchPoint = {
  x: -9999,
  y: -9999,
  active: false
};

let archiveData = [];

const clouds = [];

let thunder = null;

const WORD_COLORS = [
  "#c5c8cc",
  "#b8bcc1",
  "#a9afb5",
  "#9ba2a9",
  "#8b939b"
];


const cloudStage =
  document.getElementById("cloud-stage");

const rainDays =
  document.getElementById("rain-days");

const archiveTrigger =
  document.getElementById("archive-trigger");

const wordModal =
  document.getElementById("wordModal");

const wordInput =
  document.getElementById("wordInput");

const exchangeBtn =
  document.getElementById("exchangeBtn");

const saveModal =
  document.getElementById("saveModal");

const saveModalTitle =
  document.getElementById("saveModalTitle");

const confirmBtn =
  document.getElementById("confirmBtn");

const archivePage =
  document.getElementById("archive-page");

const closeArchiveBtn =
  document.getElementById("close-archive");

const archiveList =
  document.getElementById("archive-list");


function init() {

  if (!cloudStage) {

    console.error(
      "#cloud-stage not found"
    );

    return;

  }

  thunder =
  new Audio("thunder.mp3");

thunder.preload =
  "auto";

  createClouds();

  bindTouchEvents();

  bindModalEvents();

  bindArchiveEvents();

  updateRainCounter();

  requestAnimationFrame(animate);

}

function playThunder() {

  if (!thunder) {
    return;
  }


  thunder.currentTime =
    0;


  thunder.play().catch(() => {});

}



let lightningTimeout = null;
let lightningActive = false;

function flashLightning() {

  lightningActive = true;

  function createFlash() {

    // 번개가 끝났으면 새로 만들지 않음
    if (!lightningActive) {
      return;
    }

    const flash =
      document.createElement("div");

    flash.className =
      "lightning-flash";

    flash.style.position =
      "fixed";

    flash.style.left =
      "0";

    flash.style.top =
      "0";

    flash.style.width =
      "100vw";

    flash.style.height =
      "100vh";

    flash.style.background =
      "#eef6ff";

    flash.style.opacity =
      "0";

    flash.style.pointerEvents =
      "none";

    // 구름보다 위에 있지만 화면을 영구적으로 덮지 않음
    flash.style.zIndex =
      "9999";

    document.body.appendChild(flash);


    // 번개 밝기 랜덤
    const strength =
      0.35 +
      Math.random() * 0.65;


    // 첫 번째 번쩍임
    flash.style.transition =
      "opacity 0.04s";

    flash.style.opacity =
      strength;


    setTimeout(() => {

      flash.style.transition =
        "opacity 0.12s";

      flash.style.opacity =
        "0";

    }, 50);


    // 랜덤한 잔광
    if (Math.random() > 0.4) {

      setTimeout(() => {

        if (!lightningActive) {
          return;
        }

        flash.style.transition =
          "opacity 0.04s";

        flash.style.opacity =
          strength * 0.35;

      }, 150);


      setTimeout(() => {

        flash.style.transition =
          "opacity 0.2s";

        flash.style.opacity =
          "0";

      }, 230);

    }


    // 번개 레이어 삭제
    setTimeout(() => {

      flash.remove();

    }, 600);


    // 다음 번개 예약
    lightningTimeout =
      setTimeout(() => {

        createFlash();

      }, 1200 + Math.random() * 4000);

  }


  // 첫 번개
  createFlash();

}

function createClouds() {

  const width =
    window.innerWidth;

  const height =
    window.innerHeight;


  for (
    let i = 0;
    i < CONFIG.CLOUD_COUNT;
    i++
  ) {

    const img =
      document.createElement("img");


    img.src =
      CONFIG.IMAGES[
        Math.floor(
          Math.random() *
          CONFIG.IMAGES.length
        )
      ];


    img.className =
      "cloud";


    img.draggable =
      false;


    const size =
      CONFIG.MIN_SIZE +
      Math.random() *
      (
        CONFIG.MAX_SIZE -
        CONFIG.MIN_SIZE
      );


    const x =
      Math.random() *
      Math.max(
        1,
        width - size
      );


    const y =
      Math.random() *
      Math.max(
        1,
        height - size
      );


    const cloud = {

      element: img,

      x: x,
      y: y,

      homeX: x,
      homeY: y,

      size: size,

      phase:
        Math.random() *
        Math.PI *
        2,

      floatSpeed:
        CONFIG.FLOAT_SPEED_MIN +
        Math.random() *
        (
          CONFIG.FLOAT_SPEED_MAX -
          CONFIG.FLOAT_SPEED_MIN
        ),

      floatRadiusX:
        CONFIG.FLOAT_RADIUS_X *
        (
          0.6 +
          Math.random() *
          0.8
        ),

      floatRadiusY:
        CONFIG.FLOAT_RADIUS_Y *
        (
          0.6 +
          Math.random() *
          0.8
        ),

      velocityX: 0,
      velocityY: 0,

      idNum:
        String(i + 1)
        .padStart(3, "0"),

      active: true

    };


    img.dataset.cloudId =
      i;


    img.style.width =
      `${size}px`;


    img.style.transform =
      `translate3d(
        ${x}px,
        ${y}px,
        0
      )`;


    cloudStage.appendChild(img);


    clouds.push(cloud);

  }

}


function bindTouchEvents() {

  cloudStage.addEventListener(
    "pointerdown",
    handlePointerDown,
    {
      passive: true
    }
  );


  cloudStage.addEventListener(
    "pointermove",
    handlePointerMove,
    {
      passive: true
    }
  );


  cloudStage.addEventListener(
    "pointerup",
    handlePointerUp,
    {
      passive: true
    }
  );


  cloudStage.addEventListener(
    "pointercancel",
    handlePointerUp,
    {
      passive: true
    }
  );

}


function handlePointerDown(event) {

  touchPoint.x =
    event.clientX;

  touchPoint.y =
    event.clientY;

  touchPoint.active =
    true;


  const cloud =
    findCloudAtPoint(
      event.clientX,
      event.clientY
    );


  if (!cloud) return;


  const now =
    performance.now();


  const isDoubleTap =
    lastTapCloud === cloud &&
    now - lastTapTime <
    CONFIG.DOUBLE_TAP_DELAY;


  if (isDoubleTap) {

    lastTapCloud =
      null;

    lastTapTime =
      0;

    selectCloud(cloud);

  } else {

    lastTapCloud =
      cloud;

    lastTapTime =
      now;

      
    scatterFromTap(
      event.clientX,
      event.ClientY
    );

  }

}


function handlePointerMove(event) {

  touchPoint.x =
    event.clientX;

  touchPoint.y =
    event.clientY;

  touchPoint.active =
    true;

}

function scatterFromTap(x, y) {

  clouds.forEach(cloud => {

    if (!cloud.active) {
      return;
    }

    const centerX =
      cloud.x +
      cloud.size / 2;

    const centerY =
      cloud.y +
      cloud.size / 2;

    const dx =
      centerX - x;

    const dy =
      centerY - y;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    const radius =
      220;


    if (
      distance < radius &&
      distance > 1
    ) {

      const strength =
        1 -
        distance / radius;


      const pushDistance =
        80 +
        strength * 180;


      const targetX =
        cloud.x +
        (dx / distance) *
        pushDistance;


      const targetY =
        cloud.y +
        (dy / distance) *
        pushDistance;


      cloud.x =
        targetX;

      cloud.y =
        targetY;


      cloud.element.style.transition =
        "transform 1.4s cubic-bezier(.22,.61,.36,1)";


      cloud.element.style.transform =
        `translate3d(
          ${cloud.x}px,
          ${cloud.y}px,
          0
        )`;


      setTimeout(() => {

        cloud.element.style.transition =
          "transform 2.5s ease-out";

      }, 1400);

    }

  });

}

function handlePointerUp() {

  touchPoint.active =
    false;

}


function findCloudAtPoint(x, y) {

  for (
    let i = clouds.length - 1;
    i >= 0;
    i--
  ) {

    const cloud =
      clouds[i];


    if (!cloud.active) {
      continue;
    }


    const centerX =
      cloud.x +
      cloud.size / 2;


    const centerY =
      cloud.y +
      cloud.size / 2;


    const dx =
      x - centerX;


    const dy =
      y - centerY;


    const distanceSquared =
      dx * dx +
      dy * dy;


    const radius =
      cloud.size / 2;


    if (
      distanceSquared <
      radius * radius
    ) {

      return cloud;

    }

  }


  return null;

}


function selectCloud(cloud) {

  if (!cloud) return;

  if (state !== STATE.IDLE) {
    return;
  }

  state = STATE.SELECTED;

  selectedCloud = cloud;

  cloud.element.classList.add("selected");

  // 선택된 구름 검게 변함
  cloud.element.style.filter =
    "brightness(0)";

  // 선택된 구름의 중심 좌표
  const centerX =
    cloud.x +
    cloud.size / 2;

  const centerY =
    cloud.y +
    cloud.size / 2;


  // ========================================
  // 주변 구름들이 선택된 구름을 에워쌈
  // ========================================

  const surroundingClouds =
    clouds.filter(other => {

      return (
        other !== cloud &&
        other.active
      );

    });


  surroundingClouds.forEach((other, index) => {

    const angle =
      (
        index /
        surroundingClouds.length
      ) *
      Math.PI *
      2;


    const radius =
      120 +
      Math.random() *
      60;


    const targetX =
      centerX +
      Math.cos(angle) *
      radius -
      other.size / 2;


    const targetY =
      centerY +
      Math.sin(angle) *
      radius -
      other.size / 2;


    other.x =
      targetX;


    other.y =
      targetY;


    other.element.style.transition =
      "transform 2s cubic-bezier(.22,.61,.36,1)";


    other.element.style.transform =
      `translate3d(
        ${targetX}px,
        ${targetY}px,
        0
      )`;

  });


  // ========================================
  // 선택된 구름 천천히 확대
  // ========================================

  const selectedSize =
    Math.min(
      CONFIG.MAX_SELECTED_SIZE,
      window.innerWidth * 0.72,
      window.innerHeight * 0.52
    );


  cloud.element.style.transition =
    "width 2s cubic-bezier(.22,.61,.36,1)";


  cloud.element.style.width =
    `${selectedSize}px`;


  cloud.x =
    window.innerWidth / 2 -
    selectedSize / 2;


  cloud.y =
    window.innerHeight / 2 -
    selectedSize / 2;


  cloud.element.style.transform =
    `translate3d(
      ${cloud.x}px,
      ${cloud.y}px,
      0
    )`;


 // ========================================
// 번개 + 천둥
// ========================================

// 천둥은 선택 직후 한 번
playThunder();

// 번개는 0.8초 뒤 시작
setTimeout(() => {

  flashLightning();

}, 800);


  // ========================================
  // 번개 후 팝업
  // ========================================

  setTimeout(() => {

    openWordModal();

  }, 2500);

}


function openWordModal() {

  if (!wordModal) return;


  wordModal.style.display =
    "flex";


  state =
    STATE.MODAL;


  if (wordInput) {

    wordInput.value =
      "";


    setTimeout(
      () => wordInput.focus(),
      100
    );

  }

}


function bindModalEvents() {

  if (exchangeBtn) {

    exchangeBtn.addEventListener(
      "click",
      processExchange
    );

  }


  if (confirmBtn) {

    confirmBtn.addEventListener(
      "click",
      returnToMainScreen
    );

  }

}


function processExchange() {

  if (!selectedCloud) return;


  const word =
    wordInput ?
    wordInput.value.trim() :
    "";


  if (!word) {

    alert(
      "남기실 단어를 입력해주세요."
    );

    return;

  }


  const cloudName =
    `먹구름${selectedCloud.idNum}`;


  archiveData.push({

    word: word,

    cloudImg:
      selectedCloud.element.src,

    cloudName:
      cloudName

  });


  updateRainCounter();


  if (wordModal) {

    wordModal.style.display =
      "none";

  }


  if (wordInput) {

    wordInput.value =
      "";

  }


  if (saveModal) {

    if (saveModalTitle) {

      saveModalTitle.innerText =
        `[${cloudName}]을 채집하셨습니다.`;

    }


    saveModal.style.display =
      "flex";


    state =
      STATE.POPUP;

  } else {

    returnToMainScreen();

  }

}


function returnToMainScreen() {

  if (saveModal) {

    saveModal.style.display =
      "none";

  }


  if (!selectedCloud) {

    state =
      STATE.IDLE;

    return;

  }


  const cloud =
    selectedCloud;


 // 선택된 구름을 단어로 교체
const wordDOM =
document.createElement("div");

wordDOM.className =
"cloud placed-word";

wordDOM.innerText =
archiveData[archiveData.length - 1].word;

wordDOM.style.color =
WORD_COLORS[
  Math.floor(
    Math.random() *
    WORD_COLORS.length
  )
];

wordDOM.style.position =
"absolute";

wordDOM.style.left =
`${cloud.x}px`;

wordDOM.style.top =
`${cloud.y}px`;

wordDOM.style.width =
`${cloud.size}px`;

wordDOM.style.textAlign =
"center";

wordDOM.style.pointerEvents =
"none";

wordDOM.homeX =
cloud.homeX;

wordDOM.homeY =
cloud.homeY;

wordDOM.phase =
Math.random() *
Math.PI *
2;

wordDOM.floatSpeed =
0.0002;

wordDOM.floatRadiusX =
14;

wordDOM.floatRadiusY =
14;

cloudStage.appendChild(wordDOM);


// 기존 구름 제거
cloud.active =
false;

cloud.element.remove();


// clouds 배열에서 기존 구름 제거
const index =
clouds.indexOf(cloud);

if (index !== -1) {

clouds.splice(
  index,
  1
);

}


// 새 단어를 둥둥 떠다니는 객체로 추가
clouds.push({

element: wordDOM,

x: cloud.x,

y: cloud.y,

homeX: cloud.homeX,

homeY: cloud.homeY,

size: cloud.size,

phase: wordDOM.phase,

floatSpeed: wordDOM.floatSpeed,

floatRadiusX: wordDOM.floatRadiusX,

floatRadiusY: wordDOM.floatRadiusY,

active: true

});

  


  clouds.forEach(other => {

    other.element.classList.remove(
      "cloud-fade"
    );

  });


  selectedCloud =
    null;


  state =
    STATE.IDLE;


  renderArchive();

}


function updateRainCounter() {

  if (!rainDays) return;


  const value =
    archiveData.length *
    0.5;


  rainDays.innerText =
    value.toFixed(1);

}


function bindArchiveEvents() {

  if (archiveTrigger) {

    archiveTrigger.addEventListener(
      "click",
      openArchive
    );

  }


  if (closeArchiveBtn) {

    closeArchiveBtn.addEventListener(
      "click",
      closeArchive
    );

  }

}


function openArchive() {

  renderArchive();


  if (archivePage) {

    archivePage.style.display =
      "flex";

  }

}


function closeArchive() {

  if (archivePage) {

    archivePage.style.display =
      "none";

  }

}


function renderArchive() {

  if (!archiveList) return;


  archiveList.innerHTML =
    "";


  if (
    archiveData.length === 0
  ) {

    archiveList.innerHTML =
      `
      <p class="archive-empty">
        아직 교환된 구름이 없습니다.
      </p>
      `;

    return;

  }


  archiveData.forEach(item => {

    const itemDiv =
      document.createElement(
        "div"
      );


    itemDiv.className =
      "archive-item";


    const img =
      document.createElement(
        "img"
      );


    img.src =
      item.cloudImg;


    const tag =
      document.createElement(
        "div"
      );


    tag.className =
      "cloud-tag";


    tag.innerText =
      `[${item.cloudName}]`;


    const text =
      document.createElement(
        "div"
      );


    text.className =
      "word-text";


    text.innerText =
      `“ ${item.word} ”`;


    itemDiv.appendChild(img);

    itemDiv.appendChild(tag);

    itemDiv.appendChild(text);

    archiveList.appendChild(itemDiv);

  });

}


let lastFrameTime =
  performance.now();


function animate(now) {

  const delta =
    Math.min(
      32,
      now - lastFrameTime
    );


  lastFrameTime =
    now;


  if (
    state === STATE.IDLE
  ) {

    const time =
      now;


    clouds.forEach(cloud => {

      if (
        !cloud.active
      ) {

        return;

      }


      // --------------------------------
      // 기본 둥둥 움직임
      // --------------------------------

      const floatX =
        Math.sin(
          time *
          cloud.floatSpeed +
          cloud.phase
        ) *
        cloud.floatRadiusX;


      const floatY =
        Math.cos(
          time *
          cloud.floatSpeed *
          0.82 +
          cloud.phase
        ) *
        cloud.floatRadiusY;


      const targetX =
        cloud.homeX +
        floatX;


      const targetY =
        cloud.homeY +
        floatY;


      cloud.x +=
        (
          targetX -
          cloud.x
        ) *
        0.035;


      cloud.y +=
        (
          targetY -
          cloud.y
        ) *
        0.035;


      // --------------------------------
      // 터치 회피
      // --------------------------------

      if (
        touchPoint.active
      ) {

        const centerX =
          cloud.x +
          cloud.size / 2;


        const centerY =
          cloud.y +
          cloud.size / 2;


        const dx =
          centerX -
          touchPoint.x;


        const dy =
          centerY -
          touchPoint.y;


        const distanceSquared =
          dx * dx +
          dy * dy;


        const radius =
          CONFIG.TOUCH_RADIUS;


        if (
          distanceSquared <
          radius * radius &&
          distanceSquared >
          1
        ) {

          const distance =
            Math.sqrt(
              distanceSquared
            );


          const strength =
            1 -
            distance /
            radius;


          cloud.x +=
            (
              dx /
              distance
            ) *
            strength *
CONFIG.REPULSION_FORCE;


          cloud.y +=
            (
              dy /
              distance
            ) *
            strength *
CONFIG.REPULSION_FORCE;

        }

      }


      cloud.element.style.transform =
        `translate3d(
          ${cloud.x}px,
          ${cloud.y}px,
          0
        )`;

    });

  }


  requestAnimationFrame(
    animate
  );

}


window.addEventListener(
  "resize",
  () => {

    clouds.forEach(cloud => {

      const maxX =
        window.innerWidth -
        cloud.size;


      const maxY =
        window.innerHeight -
        cloud.size;


      cloud.homeX =
        Math.min(
          cloud.homeX,
          Math.max(
            0,
            maxX
          )
        );


      cloud.homeY =
        Math.min(
          cloud.homeY,
          Math.max(
            0,
            maxY
          )
        );

    });

  }
);


init();