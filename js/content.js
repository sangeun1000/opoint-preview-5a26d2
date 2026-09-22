/* ============================================================
   O.POINT 회사소개 웹 — 교체용 콘텐츠 파일
   ------------------------------------------------------------
   이 파일만 고치면 사이트의 영상·이미지·포트폴리오가 바뀝니다.
   (코드·문구·순서는 건드릴 필요 없음 — 문구와 순서는 회사소개서 V1.1 원본 고정)

   [원본 자료]  원드라이브 @오포인트/02_회사소개서  →  python tools/import_portfolio.py "<폴더>"
     실행하면 assets/film · assets/persona · assets/works 와 js/portfolio-data.js(D)가 다시 만들어집니다.
     아래는 그 데이터에서 '어느 장에 무엇을 쓸지'만 고릅니다.

   [갤러리 교체법]
     mode 로 연출을 고릅니다: drum(원통) · stack(카드가 걷힘) · columns(두 단 엇갈림, dir 1/-1)
                           · reveal(틈이 열리며 개봉) · rail(가로로 넘김)
     images 배열에 경로를 넣습니다. .mp4/.webm 은 자동으로 음소거 반복 재생됩니다.
     caption 이 있으면 실제 자료 캡션, 없으면 '[ 교체 ] 자리 지시문'이 표시됩니다.

   [자리 지시문 — 회사소개서 V1.1 원문(노출 카피 아님)]
     04장  영상 : 텍스트 변형 · OPOINT ↓ VISUAL STUDIO
     05장  영상 2개 : 신규 기능
     07장  영상 : 브랜드 필름 샘플
     13장  영상 : 로고 영상 ／ 크루 4인 이미지
     14장  영상 : 트레일러
     15장  이미지 : 12주 편성표 + 교차곡선 / 설정집 문서 스프레드
     17장  유튜브 포폴 : [ 결과물 대표 비주얼 ]   하단 바 — 기간 · 산출물 수 · 투입 인원
           카드 3칸 : 제작 성과 — · 제작 내용 – 수치 내용 외 비주얼 성과 나열
     18장  이미지&영상 포폴(브랜드명) : [ 결과물 대표 비주얼 ]   이미지&영상
   ============================================================ */

(() => {
  const D = window.OPOINT_DATA || { loops: [], profiles: [], lifestyle: [], cases: [], brands: [] };
  const L = (i) => D.loops[i - 1];                                   // 브랜드필름 무음 루프 01~09
  const caseOf = (slide) => D.cases.find((c) => c.slide === slide);  // 영상 포트폴리오 PPT 의 장 번호
  const usmef = caseOf(16);
  const img = (c, i) => (c && c.images[i] ? c.images[i].src : '');
  const FILM = 'AI 브랜드필름 (회사소개서 ver.) — AI 영상';

  // 17장 — 유튜브 포폴 (PPT 7~15장 · 설명은 PPT 원문 그대로)
  const YT = [7, 8, 9, 10, 11, 12, 13, 14, 15];
  // 18장 — 영상 (PPT 2~6·16·17장) + 이미지(브랜드 폴더)
  const VIDEO = [2, 3, 4, 5, 6, 16, 17];

  window.OPOINT = {
    slots: {
      // 04장 — 영상 : 텍스트 변형 OPOINT ↓ VISUAL STUDIO  (첫 장 = 소개서 원본 샘플)
      s04_video: { tag: '영상', spec: '텍스트 변형 · OPOINT ↓ VISUAL STUDIO', ratio: '16 / 9', mode: 'stack', driver: 's04', sound: true,
        caption: 'O.POINT → VISUAL STUDIO',
        images: ['https://www.youtube.com/watch?v=EBLdmsJK37U|assets/vs/visualstudio.mp4'] },  // 0922 최종: 유튜브 무음 자동재생 (원본 02_회사소개서/z_visualstudio/final.mp4)
      // 05장 — 영상 2개 : 신규 기능
      s05_video_a: { tag: '영상', spec: '신규 기능', ratio: '1 / 1', mode: 'columns', dir: 1,
        caption: FILM, images: [L(1), L(3), L(5), L(7), L(9)].filter(Boolean) },
      s05_video_b: { tag: '영상', spec: '신규 기능', ratio: '1 / 1', mode: 'columns', dir: -1,
        caption: 'AI 영상 — USMEF A.I. Creative Campaign · AI 브랜드필름', images: [img(usmef, 0), img(usmef, 1), L(2), L(4), L(8)].filter(Boolean) },
      // 07장 — 브랜드 필름 샘플
      s07_film: { tag: '영상', spec: '브랜드 필름 샘플', ratio: '16 / 9', mode: 'drum',
        caption: FILM, images: [L(1), L(4), L(5), L(6), L(8)].filter(Boolean) },
      // 13장 — 로고 영상 / 크루 4인 이미지   (02_회사소개서/3. OPOINT IP/13_로고영상_크루4인)
      s13_video: { tag: '영상', spec: '로고 영상 ／ 크루 4인 이미지', ratio: '16 / 9', mode: 'reveal',
        caption: 'OPOINT IP — CREW 4 · RAM · CHLOE · ILYR · YEON', hold: 0.25,
        // v7: 로고 영상은 04장으로 이동 · 캐릭터 소개 이미지(02_회사소개서/3. OPOINT IP/13_로고영상_크루4인) 4인 → 람 → 클로이 → 일리르 → 연
        images: ['assets/ip/char/char_01.webp', 'assets/ip/char/char_02.webp', 'assets/ip/char/char_03.webp', 'assets/ip/char/char_04.webp', 'assets/ip/char/char_05.webp'] },
      // 14장 — 트레일러   (02_회사소개서/3. OPOINT IP/14_트레일러 · 전체 재생은 PLAY TRAILER)
      s14_trailer: { tag: '영상', spec: '트레일러', ratio: '16 / 9', mode: 'single', fit: 'contain', sound: true,
        caption: 'OPOINT IP — TRAILER', images: ['assets/ip/ip_trailer.mp4'] },   // v8: 트레일러 전체를 화면에 꽉 차게(무음 반복) · 소리는 PLAY TRAILER
      // 15장 — POV 캐릭터 영상 (Opoint 유튜브 · 상은님 지정 순서 그대로 · 썸네일: 02_회사소개서/3. OPOINT IP/15_편성표_설정집 01~08)
      s15_doc: { tag: '영상', spec: '12주 편성표 + 교차곡선 / 설정집 문서 스프레드', ratio: '16 / 9', mode: 'yt',
        caption: 'OPOINT IP — POV · YOUTUBE',
        videos: [
          { id: '4DSAp-jV5_4', thumb: 'assets/ip/pov/pov_01.webp', title: '[O.1] Introduction Q&A - 람 | 오포인트 인터뷰 질의응답', dur: '2:10' },
          { id: 'DUAJUSFGfFw', thumb: 'assets/ip/pov/pov_02.webp', title: '[O.1] Introduction Q&A - 클로이 | 오포인트 인터뷰 질의응답', dur: '2:20' },
          { id: 'GXMi8-mUNRI', thumb: 'assets/ip/pov/pov_03.webp', title: '[O.1] Introduction Q&A - 일리르 | 오포인트 인터뷰 질의응답', dur: '1:44' },
          { id: 'Y5wSYvNN2VU', thumb: 'assets/ip/pov/pov_04.webp', title: '[O.1] Introduction Q&A - 류연 | 오포인트 인터뷰 질의응답', dur: '2:07' },
          { id: 'k_XjmGLglRk', thumb: 'assets/ip/pov/pov_05.webp', title: '[O.2] 외계인 사이보그 청년 작업실 최초 공개...인데 왜 광고판이 12개야', dur: '2:49' },
          { id: 'p8D8yvix0kk', thumb: 'assets/ip/pov/pov_06.webp', title: '[O.2] 아기토끼가 울지도 않고 하울을 잘하네요', dur: '2:20' },
          { id: 'rKzVcRiDbtY', thumb: 'assets/ip/pov/pov_07.webp', title: '[O.2] 왔다, 내 수면제. 천체조율관이 말하는 지구 발견기!', dur: '2:21' },
          { id: 'Eew4Z9Z4tmM', thumb: 'assets/ip/pov/pov_08.webp', title: '[O.2] 말 안 듣는 연구관을 감당하라…연구실 공개!', dur: '1:47' },
        ],
        poster: 'assets/ip/ip_trailer.jpg' },
    },

    // 07장 — 전체 재생용 원본(소리 포함)
    film: { src: 'assets/film/brand_film.mp4', poster: 'assets/film/brand_poster.jpg', title: 'AI 브랜드필름 (회사소개서 ver.)' },
    // 14장 — 트레일러 전체 재생(소리 포함)
    trailer: { src: 'assets/ip/ip_trailer.mp4', poster: 'assets/ip/ip_trailer.jpg', title: 'OPOINT IP — 트레일러' },

    // 08장 — AI 모델 브랜드 에셋 (소개서 원본 이미지) + 페르소나별 라이프스타일 컷
    assets08: {
      phone: 'assets/deck/image9.webp',
      phoneScreen: 'assets/deck/image11.webp',
      gallery: [   // 0921 교체 — 원본: 바탕화면/download 화보 (단체 · 윤서 · 소민 · 지아 · 지우 · 하늘)
        'assets/nm08/asset_01.webp',
        'assets/nm08/asset_02.webp',
        'assets/nm08/asset_03.webp',
        'assets/nm08/asset_04.webp',
        'assets/nm08/asset_05.webp',
        'assets/nm08/asset_06.webp',
      ],
      personas: D.lifestyle,
    },

    // 09장 — 페르소나 인스타 피드 (제안용 프로필 화면)
    feeds09: D.profiles.length ? D.profiles.map((p) => p.src) : [
      'assets/deck/image12.webp', 'assets/deck/image13.webp', 'assets/deck/image14.webp', 'assets/deck/image15.webp', 'assets/deck/image16.webp',
    ],
    feedNames09: D.profiles.map((p) => p.name),

    works: {
      // 17장 — 유튜브 포폴
      //   period · outputs · crew 는 원본에 없으면 비워 둡니다(빈 칸은 화면에 나오지 않음).
      youtube: YT.map(caseOf).filter(Boolean).map((c) => ({
        client: c.client, name: c.title, format: c.kind, year: '',
        tags: ['유튜브 콘텐츠'].concat(/instagram|blog/i.test(c.kind) ? ['SNS 콘텐츠'] : []),
        status: /채널/.test(c.title) ? 'CHANNEL' : 'SERIES',
        images: c.images.map((x) => x.src), clips: c.images, links: c.links,
        period: '', outputs: '', crew: '',
        lines: c.lines,
      })),
      // 18장 — 이미지&영상 포폴(브랜드명)
      image: [
        ...VIDEO.map(caseOf).filter(Boolean).map((c) => ({
          kind: 'video', client: c.client, name: c.title, year: '',
          tags: c.slide === 16 ? ['AI 이미지 · AI 영상', '광고영상'] : c.slide === 17 ? ['브랜드필름'] : ['광고영상'],
          status: 'VIDEO', cover: img(c, 0), clips: c.images, links: c.links, lines: c.lines, format: c.kind,
        })),
        ...D.brands.map((b) => ({
          kind: 'image', client: b.name, name: b.name, year: b.year,
          tags: ['키비주얼 · 그래픽', 'SNS 콘텐츠'],
          status: 'IMAGE', cover: b.images[0] && b.images[0].src, clips: b.images, links: [], lines: [],
        })),
      ],
    },

    // 연락처 — 헤더 CONTACT · 푸터에서 메일 쓰기로 연결 (0917 상은님)
    contact: { email: 'lyj@hahmshoutg.com', phone: '', address: '' },
  };

  /* ── 관리자 페이지(/admin/)가 저장한 값 덮어쓰기 — js/overrides.js ── */
  const O = window.OPOINT_OVERRIDES || {};
  const C = window.OPOINT;
  if (O.contact && O.contact.email) C.contact.email = O.contact.email;
  if (O.trailer && O.trailer.watch) C.trailer.watch = O.trailer.watch;
  if (Array.isArray(O.pov) && O.pov.length) C.slots.s15_doc.videos = O.pov;
  if (Array.isArray(O.hidden) && O.hidden.length) {
    const off = new Set(O.hidden);
    const key = (w) => `${w.client || ''}｜${w.name || ''}`;
    C.works.youtube = C.works.youtube.filter((w) => !off.has(key(w)));
    C.works.image = C.works.image.filter((w) => !off.has(key(w)));
  }
})();
