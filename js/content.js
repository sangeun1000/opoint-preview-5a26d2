/* ============================================================
   O.POINT 회사소개 웹 — 교체용 콘텐츠 파일
   ------------------------------------------------------------
   이 파일만 고치면 사이트의 영상·이미지·포트폴리오가 바뀝니다.
   (코드·문구·순서는 건드릴 필요 없음 — 문구와 순서는 회사소개서 V1.1 원본 고정)

   [갤러리 교체법]  ← 빈 이미지·영상 자리는 스크롤로 움직이는 갤러리입니다
     mode 로 연출을 고릅니다: drum(원통) · stack(카드가 걷힘) · columns(두 단 엇갈림, dir 1/-1)
                           · reveal(틈이 열리며 개봉) · rail(가로로 넘김)
     가장 쉬운 방법: assets/refs/ 폴더의 흰색 임시 이미지를 '같은 파일명'으로 덮어쓰기
       (예: s07_01.jpg ~ s07_05.jpg). 크기는 임시 이미지에 적힌 비율이면 가장 깔끔합니다.
     장수를 늘리거나 영상을 넣으려면 아래 images 배열에 경로를 추가하세요.
       .mp4/.webm 은 자동으로 음소거 반복 재생됩니다.

   [포트폴리오 추가법]
     works.youtube / works.image 배열에 { ... } 한 덩어리를 복사해 붙이고 값만 바꾸세요.
     sample: true 인 줄은 '예시'로 표시됩니다 — 실제 작업으로 바꿀 때 지우세요.
   ============================================================ */

window.OPOINT = {
  slots: {
    // 04장 — 영상 : 텍스트 변형 OPOINT ↓ VISUAL STUDIO  (첫 장 = 소개서 원본 샘플)
    s04_video: { tag: "영상", spec: "텍스트 변형 · OPOINT ↓ VISUAL STUDIO", ratio: "16 / 9", mode: "stack",
      images: ["assets/deck/image3.webp", "assets/refs/s04_02.jpg", "assets/refs/s04_03.jpg", "assets/refs/s04_04.jpg", "assets/refs/s04_05.jpg"] },
    // 05장 — 영상 2개 : 신규 기능
    s05_video_a: { tag: "영상", spec: "신규 기능", ratio: "1 / 1", mode: "columns", dir: 1, images: ["assets/refs/s05a_01.jpg", "assets/refs/s05a_02.jpg", "assets/refs/s05a_03.jpg", "assets/refs/s05a_04.jpg", "assets/refs/s05a_05.jpg"] },
    s05_video_b: { tag: "영상", spec: "신규 기능", ratio: "1 / 1", mode: "columns", dir: -1, images: ["assets/refs/s05b_01.jpg", "assets/refs/s05b_02.jpg", "assets/refs/s05b_03.jpg", "assets/refs/s05b_04.jpg", "assets/refs/s05b_05.jpg"] },
    // 07장 — 브랜드 필름 샘플
    s07_film: { tag: "영상", spec: "브랜드 필름 샘플", ratio: "16 / 9", mode: "drum", images: ["assets/refs/s07_01.jpg", "assets/refs/s07_02.jpg", "assets/refs/s07_03.jpg", "assets/refs/s07_04.jpg", "assets/refs/s07_05.jpg"] },
    // 13장 — 로고 영상 / 크루 4인 이미지
    s13_video: { tag: "영상", spec: "로고 영상 ／ 크루 4인 이미지", ratio: "16 / 9", mode: "stack", images: ["assets/refs/s13_01.jpg", "assets/refs/s13_02.jpg", "assets/refs/s13_03.jpg", "assets/refs/s13_04.jpg", "assets/refs/s13_05.jpg"] },
    // 14장 — 트레일러
    s14_trailer: { tag: "영상", spec: "트레일러", ratio: "16 / 9", mode: "reveal", images: ["assets/refs/s14_01.jpg", "assets/refs/s14_02.jpg", "assets/refs/s14_03.jpg", "assets/refs/s14_04.jpg", "assets/refs/s14_05.jpg"] },
    // 15장 — 12주 편성표 + 교차곡선 / 설정집 문서 스프레드
    s15_doc: { tag: "이미지", spec: "12주 편성표 + 교차곡선 / 설정집 문서 스프레드", ratio: "16 / 9", mode: "rail", images: ["assets/refs/s15_01.jpg", "assets/refs/s15_02.jpg", "assets/refs/s15_03.jpg", "assets/refs/s15_04.jpg", "assets/refs/s15_05.jpg"] },
  },

  // 08장 — AI 모델 브랜드 에셋 (소개서 원본 이미지)
  assets08: {
    phone: "assets/deck/image9.webp",
    phoneScreen: "assets/deck/image11.webp",
    gallery: [
      "assets/deck/image10.webp",
      "assets/deck/image4.webp",
      "assets/deck/image5.webp",
      "assets/deck/image6.webp",
      "assets/deck/image7.webp",
      "assets/deck/image8.webp",
    ],
  },

  // 09장 — 페르소나 인스타 피드 (소개서 원본 이미지)
  feeds09: [
    "assets/deck/image12.webp",
    "assets/deck/image13.webp",
    "assets/deck/image14.webp",
    "assets/deck/image15.webp",
    "assets/deck/image16.webp",
  ],

  works: {
    // 17장 — 유튜브 포폴 : [결과물 대표 비주얼] 하단 바 — 기간 · 산출물 수 · 투입 인원 / 제작 성과 3칸
    youtube: [
      {
        sample: true,
        year: "2026",
        name: "유튜브 채널명 (예시)",
        tags: ["유튜브 콘텐츠"],
        status: "CASE",
        images: ["assets/refs/s17_01.jpg", "assets/refs/s17_02.jpg", "assets/refs/s17_03.jpg", "assets/refs/s17_04.jpg", "assets/refs/s17_05.jpg"],
        link: "",
        period: "기간",
        outputs: "산출물 수",
        crew: "투입 인원",
        results: [
          { title: "제작 성과", body: "· 제작 내용 – 수치 내용 외 비주얼 성과 나열" },
          { title: "제작 성과", body: "· 제작 내용 – 수치 내용 외 비주얼 성과 나열" },
          { title: "제작 성과", body: "· 제작 내용 – 수치 내용 외 비주얼 성과 나열" },
        ],
      },
      {
        sample: true,
        year: "2026",
        name: "유튜브 채널명 (예시)",
        tags: ["유튜브 콘텐츠", "SNS 콘텐츠"],
        status: "CASE",
        images: ["assets/refs/s17_01.jpg", "assets/refs/s17_02.jpg", "assets/refs/s17_03.jpg", "assets/refs/s17_04.jpg", "assets/refs/s17_05.jpg"],
        link: "",
        period: "기간",
        outputs: "산출물 수",
        crew: "투입 인원",
        results: [
          { title: "제작 성과", body: "· 제작 내용 – 수치 내용 외 비주얼 성과 나열" },
          { title: "제작 성과", body: "· 제작 내용 – 수치 내용 외 비주얼 성과 나열" },
          { title: "제작 성과", body: "· 제작 내용 – 수치 내용 외 비주얼 성과 나열" },
        ],
      },
    ],
    // 18장 — 이미지&영상 포폴(브랜드명) : [ 결과물 대표 비주얼 ]   이미지&영상
    image: [
      { sample: true, year: "2026", name: "브랜드명 (예시)", tags: ["AI 이미지 · AI 영상"], status: "LAUNCH", cover: "assets/deck/image4.webp", link: "" },
      { sample: true, year: "2026", name: "브랜드명 (예시)", tags: ["키비주얼 · 그래픽"], status: "LAUNCH", cover: "assets/deck/image10.webp", link: "" },
      { sample: true, year: "2026", name: "브랜드명 (예시)", tags: ["광고영상"], status: "CASE", cover: "assets/deck/image7.webp", link: "" },
      { sample: true, year: "2025", name: "브랜드명 (예시)", tags: ["모션그래픽 · 영상효과"], status: "CASE", cover: "", link: "" },
    ],
  },

  // 소개서에 없는 항목 — 연락처는 확정되면 채워주세요
  contact: { email: "", phone: "", address: "" },
};
