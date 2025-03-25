// 비디오 및 손 인식 관련 변수들
let video;
let handpose;
let predictions = [];

// 드로잉 관련 변수들
let drawMode = true;    // 그리기 모드
let drawing = [];       // 전체 그려진 선들
let currentPath = [];   // 현재 그리고 있는 선
let isDrawing = false;  // 현재 드로잉 중인지 여부
let wasDrawing = false; // 이전 프레임에서 드로잉 중이었는지 
let smoothX = 0;      
let smoothY = 0;        // 손끝 좌표 부드럽게 처리

// 리액션 관련 변수들
let currentReaction = ""; // 현재 출력 중인 리액션 이모지
let reactionTimeout = 0;  // 리액션 출력 시작 시간
let lastClickTime = 0;    // 리액션 버튼 클릭 쿨타임
let reactionScale = 1.0;  // 리액션 이펙트 크기
let reactionAlpha = 255;  // 리액션 투명도


function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO); // 웹캠 캡쳐 시작
  video.size(width, height);
  video.hide();

  // Handpose 모델 로드
  handpose = ml5.handpose(video, () => {
    console.log("✅ Handpose model ready!");
  });

  handpose.on("predict", results => {
    predictions = results;
  });

  textAlign(CENTER, CENTER);
  textSize(16);
}

function draw() {
  // 리액션 효과
  if (currentReaction !== "") {
    let elapsed = millis() - reactionTimeout;
    if (elapsed < 1000) {
      reactionScale = map(elapsed, 0, 400, 2.0, 1.0);
      reactionAlpha = map(elapsed, 0, 1000, 255, 0);
    }
  }
  // 비디오 화면 좌우 반전해 출력
  push();
  translate(width, 0);
  scale(-1, 1);
  background(220);
  image(video, 0, 0, width, height);
  pop();

  drawButtons(); // 리액션 버튼 UI 그리기

  // 손 예측 결과 있을 때 처리
  if (predictions.length > 0) {
    let hand = predictions[0];
    let indexTip = hand.landmarks[8]; // 엄지 끝
    let thumbTip = hand.landmarks[4]; // 검지 끝
    let middleTip = hand.landmarks[12]; // 중지 끝

    // 좌표 반전 및 부드럽게
    let x = width - indexTip[0];
    let y = indexTip[1];
    smoothX = lerp(smoothX, x, 0.5);
    smoothY = lerp(smoothY, y, 0.5);

    // 손끝 표시
    fill(255, 0, 0);
    noStroke();
    ellipse(smoothX, smoothY, 20, 20);

    checkButtons(smoothX, smoothY); // 버튼 충돌 확인

    // 그리기 제스처 : 엄지와 검지가 가까우면 그리기
    let dxDraw = indexTip[0] - thumbTip[0];
    let dyDraw = indexTip[1] - thumbTip[1];
    let drawdistance = sqrt(dxDraw * dxDraw + dyDraw * dyDraw);

    if (drawdistance < 55) {
      if (!wasDrawing) {
        currentPath = []; // 새로운 선 시작
      }
      isDrawing = true;
      currentPath.push({ x, y });
    } else {
      isDrawing = false;
    }

    // 선 마무리되면 선을 drawing 배열에 추가
    if (!isDrawing && wasDrawing && currentPath.length > 0) {
      drawing.push(currentPath);
      currentPath = [];
    }

    // 지우기 제스처: 검지와 중지가 가까워지면 지우기
    let dxErase = indexTip[0] - middleTip[0];
    let dyErase = indexTip[1] - middleTip[1];
    let eraseDistance = sqrt(dxErase * dxErase + dyErase * dyErase);
    if (eraseDistance < 40) {
      drawing = [];
      currentPath = [];
    }
    wasDrawing = isDrawing;
  }
  // 저장된 선들 모두 그리기
  stroke(0);
  noFill();
  for(let path of drawing) {
    for(let i = 1; i < path.length; i++) {
      line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
    }
  }

  // 현재 그리고 있는 선 미리보기
  if(currentPath.length > 1){
    for(let i = 1; i < currentPath.length; i++) {
      line(currentPath[i - 1].x, currentPath[i - 1].y, currentPath[i].x, currentPath[i].y);
    }
  }
  // 이모지 출력 애니메이션
  if (currentReaction !== "") {
    if (millis() - reactionTimeout < 1000) {
      fill(0);
      push();
      textSize(100 * reactionScale);
      text(currentReaction, width / 2, height / 2);
      pop();
    } else {
      currentReaction = "";
    }
  }
}

// 리액션 버튼 그리기
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
  // 그리기 멈춤, 진행 상태 표시
  if (drawMode) {
    fill(isDrawing ? [0, 200, 0] : [0, 255, 150]);
    textSize(16);
    text(isDrawing ? "✏️ 그리고 있어요" : "🖐 멈춤 상태", width - 100, height - 20);
  }
  fill(drawMode ? (isDrawing ? [0, 200, 0] : [0, 255, 150]) : [100, 200, 255]);

  // 리액션 버튼 3
  fill(0, 200, 255);
  rect(230, 10, 100, 40);
  fill(0);
  text("🔥", 280, 30);
  // 리액션 버튼 4
  fill(255, 0, 0);
  fill(255, 100, 200);
  rect(340, 10, 100, 40);
  fill(255);
  text("💡", 390, 30);
}

function checkButtons(x, y) {
  if (millis() - lastClickTime < 500) return; // 쿨타임 0.5초

  if (y >= 10 && y <= 50) {
    if (x >= 10 && x <= 110) {
      currentReaction = "😊😊😊😊😊";
      reactionTimeout = millis();
      lastClickTime = millis();
    } else if (x >= 120 && x <= 220) {
      currentReaction = "👏👏👏👏👏";
      reactionTimeout = millis();
      lastClickTime = millis();
    } else if (x >= 230 && x <= 330) {
      currentReaction = "🔥🔥🔥🔥🔥";
      reactionTimeout = millis();
      lastClickTime = millis();
    } else if (x >= 340 && x <= 440) {
      currentReaction = "💡💡💡💡💡";
      reactionTimeout = millis();
      lastClickTime = millis();
    }
  }
}
