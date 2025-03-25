let video;
let handpose;
// 손의 위치를 저장할 변수
let predictions = [];
// 그리기 모드를 위한 변수
let drawMode = false; // 드로잉 모드 온오프
let drawing = []; // 여러 선 묶음
let currentPath = []; // 현재 그리는 선
let isDrawing = false; // 그리는 중인지 여부
let wasDrawing = false; // 이전 프레임에서 그리는 중이었는지 여부
let drawStartTime = 0; // 그리기 시작 시간
let smoothX = 0; // 부드러운 드로잉을 위한 X 좌표
let smoothY = 0; // 부드러운 드로잉을 위한 Y 좌표

// 리액션을 위한 변수
let currentReaction = ""; // 현재 출력 중인 리액션
let reactionTimeout = 0; // 리액션 출력 시작 시간
let lastClickTime = 0; // 버튼 클릭 쿨타임 제어용

// 리액션 출력을 위한 변수
let reactionScale = 1.0; // 리액션 크기
let reactionAlpha = 255; // 리액션 투명도

function setup() {
  createCanvas(640, 480);
  // 웹캠 입력 설정
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  // handpose 모델 로드
  handpose = ml5.handpose(video, () => {
    console.log("✅ Handpose model ready!");
  });
  // 손 예측값 계속 업데이트
  handpose.on("predict", results => {
    predictions = results;
  });
  // 텍스트 기본 스타일
  textAlign(CENTER, CENTER);
  textSize(16);
}

function draw() {
  // 리액션 처리
  if (currentReaction !== "") {
    let elapsed = millis() - reactionTimeout;
    if (elapsed < 1000) {
      // 이모지 크기 및 투명도 애니메이션
      reactionScale = map(elapsed, 0, 400, 2.0, 1.0);
      reactionAlpha = map(elapsed, 0, 1000, 255, 0);
    }
  }
  // 모든 드로잉 전에 좌우 반전처리
  push();
  translate(width, 0);
  scale(-1, 1);
  background(220);
  image(video, 0, 0, width, height);
  pop(); // 반전 끝
  // 버튼 그리기
  drawButtons();
  // 손 인식 및 드로잉 처리
  if (predictions.length > 0) {
    let hand = predictions[0];
    let indexTip = hand.landmarks[8];
    let thumbTip = hand.landmarks[4];

    let x = width - indexTip[0];
    let y = indexTip[1];
    // 부드럽게 보간
    smoothX = lerp(smoothX, x, 0.5);
    smoothY = lerp(smoothY, y, 0.5);
    // 손가락 위치 표시 원
    fill(255, 0, 0);
    noStroke();
    ellipse(smoothX, smoothY, 20, 20);
    // 버튼 클릭 체크
    checkButtons(smoothX, smoothY);
    // 드로잉 모드 on일 때만 그리기
    if (drawMode) {
      let dx = indexTip[0] - thumbTip[0];
      let dy = indexTip[1] - thumbTip[1];
      let distance = sqrt(dx * dx + dy * dy);

      if (distance < 55) {
        if (!wasDrawing) {
          currentPath = [];
        }
        isDrawing = true;
        currentPath.push({ x, y });
      } else {
        isDrawing = false;
      }
      // 그리던 중 멈췄다면 그리던 선을 저장
      if (!isDrawing && wasDrawing && currentPath.length > 0) {
        drawing.push(currentPath);
        currentPath = [];
      }

      wasDrawing = isDrawing;
    }
  }

  // ✨ 드로잉 모드가 꺼졌을 때도 currentPath가 남아있으면 저장
  if (!drawMode && currentPath.length > 0) {
    drawing.push(currentPath);
    currentPath = [];
    isDrawing = false;
    wasDrawing = false;
  }
  // 드로잉 출력
  stroke(0);
  noFill();
  // 모든 선 출력
  for (let path of drawing) {
    for (let i = 1; i < path.length; i++) {
      line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
    }
  }

  if (currentPath.length > 1) {
    for (let i = 1; i < currentPath.length; i++) {
      line(currentPath[i - 1].x, currentPath[i - 1].y, currentPath[i].x, currentPath[i].y);
    }
  }
  // 리액션 출력
  if (currentReaction !== "") {
    if (millis() - reactionTimeout < 1000) {
      fill(0);
      push();
      textSize(100 * reactionScale);
      text(currentReaction, width / 2, height / 2);
      pop();
    } else {
      currentReaction = ""; // 리액션 초기화
    }
  }
}

function drawButtons() {
  // 리액션 버튼 1
  fill(255, 255, 0);
  rect(10, 10, 100, 40);
  fill(0);
  text("😊", 60, 30);
  // 리액션 버튼 2
  fill(255, 150, 0);
  rect(120, 10, 100, 40);
  fill(0);
  text("👏", 170, 30);
  // 그리기 버튼 상태에 따라 색 바뀜
  if (drawMode) {
    fill(isDrawing ? [0, 200, 0] : [180]); // 그리고 있으면 초록, 아니면 회색
    textSize(16);
    text(isDrawing ? "✏️ 그리고 있어요" : "🖐 멈춤 상태", width - 100, height - 20);
  }
  fill(drawMode ? (isDrawing ? [0, 200, 0] : [0, 255, 150]) : [100, 200, 255]);
  rect(230, 10, 100, 40);
  fill(0);
  text("✏️ 그리기", 280, 30);
  // 지우기 버튼
  fill(255, 0, 0);
  rect(340, 10, 100, 40);
  fill(255);
  text("🧹 지우기", 390, 30);
}

function checkButtons(x, y) {
  // 클릭 쿨타임 0.5초
  if (millis() - lastClickTime < 500) return;

  if (y >= 10 && y <= 50) {
    if (x >= 10 && x <= 110) {
      // 리액션 1
      currentReaction = "😊😊😊😊😊";
      reactionTimeout = millis();
      lastClickTime = millis();
    } else if (x >= 120 && x <= 220) {
      // 리액션 2
      currentReaction = "👏👏👏👏👏";
      reactionTimeout = millis();
      lastClickTime = millis();
    } else if (x >= 230 && x <= 330) {
      // 그리기 모드 토글
      drawMode = !drawMode;
      lastClickTime = millis();
    } else if (x >= 340 && x <= 440) {
      // 지우기 : 선 초기화 + 드로잉 모드 OFF
      drawing = [];
      currentPath = [];
      drawMode = false;
      lastClickTime = millis();
    }
  }
}
