# ✋ Hand Gesture Interactive Reactions with P5.js & ml5.js

본 프로젝트는 p5.js와 ml5.js의 `handpose` 모델을 사용하여  
손가락 제스처로 이모지 리액션 및 드로잉 기능을 실시간으로 제어할 수 있는 인터랙티브 시스템입니다.

OBS Virtual Camera를 활용해 Zoom, Google Meet 등의 화상 회의 플랫폼에서도 실시간 반응을 보여줄 수 있습니다.

---

## 🧠 주요 기능

### ✅ 제스처 기반 인터랙션
- 손가락 인식(엄지/검지/중지)
- 제스처로 그림을 그리고 지울 수 있음

### ✅ 반응 버튼
- 😊, 👏, 🔥, 💡  ** 이모지 리액션** 구현
- 화면 상단의 반응버튼 검지로 직접 갖다댈 시, 중앙에 애니메이션 효과로 출력

### ✅ 칠판 기능
- 손으로 선을 자유롭게 그림
- 엄지와 검지의 거리가 좁아지면 그리기 기능이 활성화 되어 드로잉 가능
- 검지와 중지의 거리가 좁아지면 지우기 기능이 활성화 되어 그린 선이 지워짐

### ✅ 실시간 Zoom 연동
- OBS Virtual Camera를 사용해 영상 회의 플랫폼에서도 활용 가능

---

## 🖥️ 사용 기술

| 기술 스택 | 설명 |
|-----------|------|
| `p5.js`   | 인터페이스, 드로잉, 버튼 등 시각 구현 |
| `ml5.js`  | 손가락 위치 인식 (handpose 모델) |
| `OBS` + Virtual Camera | 화면을 Zoom으로 송출 |


---

## 📦 실행 방법

1. `index.html` 또는 `Live Server`로 실행  
2. **웹캠 권한 허용**
3. 손가락을 카메라에 인식시키고 제스처로 반응 확인

---

## 🎥 구현 시연 영상

👉 [https://youtu.be/AqR8T0_01lE]()

---

## 💡 환경 세팅 (Mac 기준)

1. `OBS` 설치: [https://obsproject.com/](https://obsproject.com/)
2. `Start Virtual Camera` 클릭
3. Zoom 실행 → 카메라 목록에서 `OBS Virtual Camera` 선택
4. ✅ 실시간 반응이 Zoom에 출력됨

