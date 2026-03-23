import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: "english", name: "영어", icon: "🅰", category: "main" },
  { id: "coding", name: "코딩", icon: "⌨", category: "main" },
  { id: "music", name: "음악", icon: "♪", category: "arts", parent: "예체능" },
  { id: "senses", name: "오감", icon: "✋", category: "arts", parent: "예체능" },
  { id: "piano", name: "피아노", icon: "🎹", category: "arts", parent: "예체능" },
  { id: "science", name: "과학", icon: "⚗", category: "etc", parent: "그 외" },
  { id: "art", name: "미술", icon: "🖌", category: "etc", parent: "그 외" },
  { id: "reading", name: "독서", icon: "📖", category: "etc", parent: "그 외" },
  { id: "math", name: "수학", icon: "∑", category: "etc", parent: "그 외" },
  { id: "hangul", name: "한글", icon: "ㄱ", category: "etc", parent: "그 외" },
];

// Programs per subject (subjects with only one program skip the selection step)
const PROGRAMS = {
  english: [
    { id: "readyset", name: "레디셋", icon: "🚀", desc: "Ready, Set 영어 프로그램" },
    { id: "tikitogi", name: "티키토기", icon: "🐣", desc: "Tiki Togi 영어 프로그램" },
  ],
  coding: [
    { id: "jemplay", name: "잼플레이", icon: "🎮", desc: "잼플레이 코딩 프로그램" },
    { id: "ai-enter", name: "AI엔터코딩", icon: "🤖", desc: "AI엔터코딩 프로그램" },
    { id: "metakinder", name: "메타킨더", icon: "🌐", desc: "메타킨더 코딩 프로그램" },
    { id: "ai-thinking", name: "AI 씽킹메이커", icon: "🧠", desc: "AI 씽킹메이커 프로그램" },
  ],
  music: [
    { id: "play-melody", name: "플레이 멜로디", icon: "🎵", desc: "플레이 멜로디 음악 프로그램" },
    { id: "world-music", name: "세상의 모든음악", icon: "🌍", desc: "세상의 모든음악 프로그램" },
    { id: "with-muse", name: "위드뮤즈", icon: "🎼", desc: "위드뮤즈 음악 프로그램" },
  ],
  senses: [
    { id: "scandi", name: "스칸디오감", icon: "🧩", desc: "스칸디오감 프로그램" },
  ],
  piano: [
    { id: "fianse", name: "피앙세", icon: "🎹", desc: "피앙세 피아노 프로그램" },
    { id: "singfiang", name: "씽피앙", icon: "🎶", desc: "씽피앙 피아노 프로그램" },
  ],
  science: [
    { id: "dodaeche", name: "도대체과학연구소", icon: "🔬", desc: "도대체과학연구소 프로그램" },
    { id: "anda", name: "안다과학", icon: "🧪", desc: "안다과학 프로그램" },
    { id: "magic", name: "매직사이언스", icon: "✨", desc: "매직사이언스 프로그램" },
    { id: "tamgu", name: "탐구교실", icon: "🔎", desc: "탐구교실 프로그램" },
    { id: "norience", name: "놀이언스", icon: "🎈", desc: "놀이언스 프로그램" },
  ],
};

const SAMPLE_NOTICES = [
  { id: 1, title: "3월 4주차 수업 안내", date: "2026-03-16", content: "3월 4주차 수업 계획안이 업데이트 되었습니다. 각 과목별 계획안을 확인해주세요.", pinned: true },
  { id: 2, title: "봄 행사 안내", date: "2026-03-14", content: "4월 봄맞이 특별 행사가 예정되어 있습니다. 과목별 행사 메뉴에서 확인해주세요.", pinned: false },
  { id: 3, title: "신규 음원 업데이트", date: "2026-03-12", content: "영어, 음악 과목 신규 음원이 추가되었습니다.", pinned: false },
  { id: 4, title: "강사 미팅 일정", date: "2026-03-10", content: "3월 정기 강사 미팅은 3/28(금) 오후 2시입니다.", pinned: false },
];

// Tracks structured: for subjects with programs: program -> issue -> step -> tracks
// For subjects without programs: issue -> step -> tracks
const SAMPLE_TRACKS = {
  english: {
    readyset: {
      1: {
        step2: [{ id: "rs-1-2a", title: "Ready Set Hello", duration: "2:15" }, { id: "rs-1-2b", title: "Ready Set Greeting", duration: "1:50" }],
        step3: [{ id: "rs-1-3a", title: "Ready Set Hello", duration: "2:15" }, { id: "rs-1-3b", title: "Ready Set ABC", duration: "3:02" }],
        step4: [{ id: "rs-1-4a", title: "Ready Set Hello", duration: "2:20" }, { id: "rs-1-4b", title: "Ready Set Phonics", duration: "3:10" }],
        step5: [{ id: "rs-1-5a", title: "Ready Set Hello", duration: "2:25" }, { id: "rs-1-5b", title: "Ready Set Story", duration: "4:00" }],
      },
      2: {
        step3: [{ id: "rs-2-3a", title: "Ready Set Weather", duration: "2:10" }],
        step4: [{ id: "rs-2-4a", title: "Ready Set Weather", duration: "2:15" }, { id: "rs-2-4b", title: "Ready Set Days", duration: "2:35" }],
      },
    },
    tikitogi: {
      1: {
        step2: [{ id: "tt-1-2a", title: "Tiki Hello Song", duration: "2:00" }, { id: "tt-1-2b", title: "Tiki Dance", duration: "1:45" }],
        step3: [{ id: "tt-1-3a", title: "Tiki Hello Song", duration: "2:10" }, { id: "tt-1-3b", title: "Togi Phonics", duration: "2:50" }],
        step4: [{ id: "tt-1-4a", title: "Tiki Colors", duration: "2:30" }, { id: "tt-1-4b", title: "Togi Shapes", duration: "2:45" }],
      },
      2: {
        step2: [{ id: "tt-2-2a", title: "Tiki Animals", duration: "2:20" }],
        step3: [{ id: "tt-2-3a", title: "Tiki Animals", duration: "2:25" }, { id: "tt-2-3b", title: "Togi Zoo", duration: "3:00" }],
      },
      3: {
        step3: [{ id: "tt-3-3a", title: "Tiki Numbers", duration: "2:15" }],
        step4: [{ id: "tt-3-4a", title: "Tiki Counting", duration: "2:40" }],
      },
    },
  },
  coding: {
    jemplay: {
      1: { step3: [{ id: "jp-1-3a", title: "잼플레이 시작음악", duration: "1:30" }], step4: [{ id: "jp-1-4a", title: "잼플레이 코딩송", duration: "2:10" }] },
    },
    "ai-enter": {
      1: { step4: [{ id: "ae-1-4a", title: "AI엔터 시작음악", duration: "1:30" }, { id: "ae-1-4b", title: "알고리즘 챈트", duration: "2:10" }], step5: [{ id: "ae-1-5a", title: "AI엔터 코딩송", duration: "2:45" }] },
    },
    metakinder: {
      1: { step3: [{ id: "mk-1-3a", title: "메타킨더 인트로", duration: "1:20" }], step4: [{ id: "mk-1-4a", title: "메타킨더 코딩송", duration: "2:00" }] },
    },
    "ai-thinking": {
      1: { step4: [{ id: "at-1-4a", title: "씽킹메이커 시작", duration: "1:45" }], step5: [{ id: "at-1-5a", title: "씽킹메이커 챈트", duration: "2:30" }] },
    },
  },
  music: {
    "play-melody": {
      1: { step2: [{ id: "pm-1-2a", title: "봄바람", duration: "3:15" }, { id: "pm-1-2b", title: "리듬 놀이", duration: "2:40" }], step3: [{ id: "pm-1-3a", title: "봄바람", duration: "3:15" }, { id: "pm-1-3b", title: "동물 소리", duration: "2:00" }], step4: [{ id: "pm-1-4a", title: "봄바람", duration: "3:20" }, { id: "pm-1-4b", title: "악기 탐험", duration: "3:30" }] },
    },
    "world-music": {
      1: { step3: [{ id: "wm-1-3a", title: "세계의 인사", duration: "2:45" }], step4: [{ id: "wm-1-4a", title: "아프리카 리듬", duration: "3:10" }], step5: [{ id: "wm-1-5a", title: "오케스트라 탐험", duration: "4:00" }] },
    },
    "with-muse": {
      1: { step2: [{ id: "wmu-1-2a", title: "뮤즈의 노래", duration: "2:30" }], step3: [{ id: "wmu-1-3a", title: "뮤즈와 함께", duration: "2:50" }] },
    },
  },
  senses: {
    scandi: {
      1: { step2: [{ id: "sc-1-2a", title: "오감 체조", duration: "2:20" }, { id: "sc-1-2b", title: "촉감 놀이 음악", duration: "1:55" }], step3: [{ id: "sc-1-3a", title: "스칸디 오감놀이", duration: "2:20" }] },
    },
  },
  piano: {
    fianse: {
      1: { step3: [{ id: "fi-1-3a", title: "피앙세 도레미", duration: "3:00" }], step4: [{ id: "fi-1-4a", title: "피앙세 작은 별", duration: "2:10" }], step5: [{ id: "fi-1-5a", title: "피앙세 워밍업", duration: "1:45" }] },
    },
    singfiang: {
      1: { step3: [{ id: "sf-1-3a", title: "씽피앙 도레미송", duration: "2:40" }], step4: [{ id: "sf-1-4a", title: "씽피앙 멜로디", duration: "3:20" }] },
    },
  },
  science: {
    dodaeche: {
      1: { step4: [{ id: "dd-1-4a", title: "도대체 실험음악", duration: "1:30" }], step5: [{ id: "dd-1-5a", title: "도대체 탐구송", duration: "2:00" }] },
    },
    anda: {
      1: { step4: [{ id: "an-1-4a", title: "안다과학 시작", duration: "1:40" }] },
    },
    magic: {
      1: { step3: [{ id: "mg-1-3a", title: "매직 실험음악", duration: "1:50" }], step4: [{ id: "mg-1-4a", title: "매직 사이언스송", duration: "2:10" }] },
    },
    tamgu: {
      1: { step4: [{ id: "tg-1-4a", title: "탐구 시작음악", duration: "1:30" }], step5: [{ id: "tg-1-5a", title: "탐구 실험송", duration: "2:20" }] },
    },
    norience: {
      1: { step3: [{ id: "nr-1-3a", title: "놀이언스 시작", duration: "1:45" }], step4: [{ id: "nr-1-4a", title: "놀이언스 챈트", duration: "2:00" }] },
    },
  },
  art: {
    1: {
      step2: [{ id: "a-1-2a", title: "그리기 시간 BGM", duration: "4:00" }],
      step3: [{ id: "a-1-3a", title: "그리기 시간 BGM", duration: "4:00" }],
      step4: [{ id: "a-1-4a", title: "그리기 시간 BGM", duration: "4:00" }],
    },
  },
  reading: {
    1: {
      step3: [{ id: "r-1-3a", title: "이야기 시간", duration: "2:30" }],
      step4: [{ id: "r-1-4a", title: "이야기 시간", duration: "2:30" }],
    },
  },
  math: {
    1: {
      step3: [{ id: "mt-1-3a", title: "숫자 노래", duration: "2:15" }],
      step4: [{ id: "mt-1-4a", title: "숫자 노래", duration: "2:15" }],
    },
  },
  hangul: {
    1: {
      step3: [{ id: "h-1-3a", title: "한글 놀이", duration: "2:40" }],
      step4: [{ id: "h-1-4a", title: "자음 노래", duration: "2:10" }],
      step5: [{ id: "h-1-5a", title: "받침 노래", duration: "2:50" }],
    },
  },
};

// Videos structured: same as tracks
const SAMPLE_VIDEOS = {
  english: {
    readyset: {
      1: {
        step3: [{ id: "rsv-1-3a", title: "Ready Set Phonics Guide", duration: "15:00", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
        step4: [{ id: "rsv-1-4a", title: "Ready Set Lesson Demo", duration: "12:00", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
      },
    },
    tikitogi: {
      1: {
        step3: [{ id: "ttv-1-3a", title: "Tiki Togi 수업 시연", duration: "10:00", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
        step4: [{ id: "ttv-1-4a", title: "Tiki Togi Activity Guide", duration: "8:00" }],
      },
    },
  },
  coding: {
    jemplay: { 1: { step4: [{ id: "jpv-1-4a", title: "잼플레이 수업 시연", duration: "12:00", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }] } },
    "ai-enter": { 1: { step5: [{ id: "aev-1-5a", title: "AI엔터 코딩 시연", duration: "14:00" }] } },
  },
  music: {
    "play-melody": { 1: { step3: [{ id: "pmv-1-3a", title: "플레이멜로디 수업 시연", duration: "8:00", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }], step4: [{ id: "pmv-1-4a", title: "플레이멜로디 악기 가이드", duration: "10:00" }] } },
    "world-music": { 1: { step4: [{ id: "wmv-1-4a", title: "세상의모든음악 시연", duration: "9:00" }] } },
  },
};

const STEPS = [
  { id: "step2", label: "STEP 2", age: "만2세" },
  { id: "step3", label: "STEP 3", age: "만3세" },
  { id: "step4", label: "STEP 4", age: "만4세" },
  { id: "step5", label: "STEP 5", age: "만5세" },
];

const ISSUES = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, label: `${i + 1}호` }));

// Plans are structured: type(monthly/yearly) -> issue -> step
const SAMPLE_PLANS = {
  english: {
    readyset: {
      monthly: {
        1: { step2: { id: "rsp-m-1-2", title: "레디셋 1호 월간계획안 (STEP2)" }, step3: { id: "rsp-m-1-3", title: "레디셋 1호 월간계획안 (STEP3)" }, step4: { id: "rsp-m-1-4", title: "레디셋 1호 월간계획안 (STEP4)" }, step5: { id: "rsp-m-1-5", title: "레디셋 1호 월간계획안 (STEP5)" } },
        2: { step3: { id: "rsp-m-2-3", title: "레디셋 2호 월간계획안 (STEP3)" }, step4: { id: "rsp-m-2-4", title: "레디셋 2호 월간계획안 (STEP4)" } },
      },
      yearly: {
        step2: { id: "rsp-y-2", title: "레디셋 연간계획안 (STEP2)" },
        step3: { id: "rsp-y-3", title: "레디셋 연간계획안 (STEP3)" },
        step4: { id: "rsp-y-4", title: "레디셋 연간계획안 (STEP4)" },
        step5: { id: "rsp-y-5", title: "레디셋 연간계획안 (STEP5)" },
      },
    },
    tikitogi: {
      monthly: {
        1: { step2: { id: "ttp-m-1-2", title: "티키토기 1호 월간계획안 (STEP2)" }, step3: { id: "ttp-m-1-3", title: "티키토기 1호 월간계획안 (STEP3)" }, step4: { id: "ttp-m-1-4", title: "티키토기 1호 월간계획안 (STEP4)" } },
        2: { step2: { id: "ttp-m-2-2", title: "티키토기 2호 월간계획안 (STEP2)" }, step3: { id: "ttp-m-2-3", title: "티키토기 2호 월간계획안 (STEP3)" } },
      },
      yearly: {
        step2: { id: "ttp-y-2", title: "티키토기 연간계획안 (STEP2)" },
        step3: { id: "ttp-y-3", title: "티키토기 연간계획안 (STEP3)" },
        step4: { id: "ttp-y-4", title: "티키토기 연간계획안 (STEP4)" },
      },
    },
  },
  coding: {
    jemplay: { monthly: { 1: { step3: { id: "jpp-m-1-3", title: "잼플레이 1호 계획안 (STEP3)" }, step4: { id: "jpp-m-1-4", title: "잼플레이 1호 계획안 (STEP4)" } } }, yearly: { step3: { id: "jpp-y-3", title: "잼플레이 연간계획안 (STEP3)" }, step4: { id: "jpp-y-4", title: "잼플레이 연간계획안 (STEP4)" } } },
    "ai-enter": { monthly: { 1: { step4: { id: "aep-m-1-4", title: "AI엔터 1호 계획안 (STEP4)" }, step5: { id: "aep-m-1-5", title: "AI엔터 1호 계획안 (STEP5)" } } }, yearly: { step4: { id: "aep-y-4", title: "AI엔터 연간계획안 (STEP4)" }, step5: { id: "aep-y-5", title: "AI엔터 연간계획안 (STEP5)" } } },
    metakinder: { monthly: { 1: { step3: { id: "mkp-m-1-3", title: "메타킨더 1호 계획안 (STEP3)" } } }, yearly: { step3: { id: "mkp-y-3", title: "메타킨더 연간계획안 (STEP3)" } } },
    "ai-thinking": { monthly: { 1: { step4: { id: "atp-m-1-4", title: "씽킹메이커 1호 계획안 (STEP4)" }, step5: { id: "atp-m-1-5", title: "씽킹메이커 1호 계획안 (STEP5)" } } }, yearly: { step4: { id: "atp-y-4", title: "씽킹메이커 연간계획안 (STEP4)" }, step5: { id: "atp-y-5", title: "씽킹메이커 연간계획안 (STEP5)" } } },
  },
  music: {
    "play-melody": { monthly: { 1: { step2: { id: "pmp-m-1-2", title: "플레이멜로디 1호 계획안 (STEP2)" }, step3: { id: "pmp-m-1-3", title: "플레이멜로디 1호 계획안 (STEP3)" }, step4: { id: "pmp-m-1-4", title: "플레이멜로디 1호 계획안 (STEP4)" } } }, yearly: { step2: { id: "pmp-y-2", title: "플레이멜로디 연간계획안 (STEP2)" }, step3: { id: "pmp-y-3", title: "플레이멜로디 연간계획안 (STEP3)" }, step4: { id: "pmp-y-4", title: "플레이멜로디 연간계획안 (STEP4)" } } },
    "world-music": { monthly: { 1: { step3: { id: "wmp-m-1-3", title: "세상의모든음악 1호 계획안 (STEP3)" }, step4: { id: "wmp-m-1-4", title: "세상의모든음악 1호 계획안 (STEP4)" } } }, yearly: { step3: { id: "wmp-y-3", title: "세상의모든음악 연간계획안 (STEP3)" }, step4: { id: "wmp-y-4", title: "세상의모든음악 연간계획안 (STEP4)" } } },
    "with-muse": { monthly: { 1: { step2: { id: "wmup-m-1-2", title: "위드뮤즈 1호 계획안 (STEP2)" }, step3: { id: "wmup-m-1-3", title: "위드뮤즈 1호 계획안 (STEP3)" } } }, yearly: { step2: { id: "wmup-y-2", title: "위드뮤즈 연간계획안 (STEP2)" }, step3: { id: "wmup-y-3", title: "위드뮤즈 연간계획안 (STEP3)" } } },
  },
  senses: {
    scandi: { monthly: { 1: { step2: { id: "scp-m-1-2", title: "스칸디오감 1호 계획안 (STEP2)" }, step3: { id: "scp-m-1-3", title: "스칸디오감 1호 계획안 (STEP3)" } } }, yearly: { step2: { id: "scp-y-2", title: "스칸디오감 연간계획안 (STEP2)" }, step3: { id: "scp-y-3", title: "스칸디오감 연간계획안 (STEP3)" } } },
  },
  piano: {
    fianse: { monthly: { 1: { step3: { id: "fip-m-1-3", title: "피앙세 1호 계획안 (STEP3)" }, step4: { id: "fip-m-1-4", title: "피앙세 1호 계획안 (STEP4)" }, step5: { id: "fip-m-1-5", title: "피앙세 1호 계획안 (STEP5)" } } }, yearly: { step3: { id: "fip-y-3", title: "피앙세 연간계획안 (STEP3)" }, step4: { id: "fip-y-4", title: "피앙세 연간계획안 (STEP4)" }, step5: { id: "fip-y-5", title: "피앙세 연간계획안 (STEP5)" } } },
    singfiang: { monthly: { 1: { step3: { id: "sfp-m-1-3", title: "씽피앙 1호 계획안 (STEP3)" }, step4: { id: "sfp-m-1-4", title: "씽피앙 1호 계획안 (STEP4)" } } }, yearly: { step3: { id: "sfp-y-3", title: "씽피앙 연간계획안 (STEP3)" }, step4: { id: "sfp-y-4", title: "씽피앙 연간계획안 (STEP4)" } } },
  },
  science: {
    dodaeche: { monthly: { 1: { step4: { id: "ddp-m-1-4", title: "도대체 1호 계획안 (STEP4)" }, step5: { id: "ddp-m-1-5", title: "도대체 1호 계획안 (STEP5)" } } }, yearly: { step4: { id: "ddp-y-4", title: "도대체 연간계획안 (STEP4)" }, step5: { id: "ddp-y-5", title: "도대체 연간계획안 (STEP5)" } } },
    anda: { monthly: { 1: { step4: { id: "anp-m-1-4", title: "안다과학 1호 계획안 (STEP4)" } } }, yearly: { step4: { id: "anp-y-4", title: "안다과학 연간계획안 (STEP4)" } } },
    magic: { monthly: { 1: { step3: { id: "mgp-m-1-3", title: "매직사이언스 1호 계획안 (STEP3)" }, step4: { id: "mgp-m-1-4", title: "매직사이언스 1호 계획안 (STEP4)" } } }, yearly: { step3: { id: "mgp-y-3", title: "매직사이언스 연간계획안 (STEP3)" }, step4: { id: "mgp-y-4", title: "매직사이언스 연간계획안 (STEP4)" } } },
    tamgu: { monthly: { 1: { step4: { id: "tgp-m-1-4", title: "탐구교실 1호 계획안 (STEP4)" }, step5: { id: "tgp-m-1-5", title: "탐구교실 1호 계획안 (STEP5)" } } }, yearly: { step4: { id: "tgp-y-4", title: "탐구교실 연간계획안 (STEP4)" }, step5: { id: "tgp-y-5", title: "탐구교실 연간계획안 (STEP5)" } } },
    norience: { monthly: { 1: { step3: { id: "nrp-m-1-3", title: "놀이언스 1호 계획안 (STEP3)" }, step4: { id: "nrp-m-1-4", title: "놀이언스 1호 계획안 (STEP4)" } } }, yearly: { step3: { id: "nrp-y-3", title: "놀이언스 연간계획안 (STEP3)" }, step4: { id: "nrp-y-4", title: "놀이언스 연간계획안 (STEP4)" } } },
  },
  art: {
    monthly: {
      1: { step2: { id: "pa-m-1-2", title: "1호 월간계획안 (STEP2)" }, step3: { id: "pa-m-1-3", title: "1호 월간계획안 (STEP3)" }, step4: { id: "pa-m-1-4", title: "1호 월간계획안 (STEP4)" } },
      2: { step2: { id: "pa-m-2-2", title: "2호 월간계획안 (STEP2)" }, step3: { id: "pa-m-2-3", title: "2호 월간계획안 (STEP3)" }, step4: { id: "pa-m-2-4", title: "2호 월간계획안 (STEP4)" } },
    },
    yearly: {
      step2: { id: "pa-y-2", title: "미술 연간계획안 (STEP2)" },
      step3: { id: "pa-y-3", title: "미술 연간계획안 (STEP3)" },
      step4: { id: "pa-y-4", title: "미술 연간계획안 (STEP4)" },
    },
  },
  reading: {
    monthly: {
      1: { step3: { id: "pr-m-1-3", title: "1호 월간계획안 (STEP3)" }, step4: { id: "pr-m-1-4", title: "1호 월간계획안 (STEP4)" }, step5: { id: "pr-m-1-5", title: "1호 월간계획안 (STEP5)" } },
      2: { step3: { id: "pr-m-2-3", title: "2호 월간계획안 (STEP3)" }, step4: { id: "pr-m-2-4", title: "2호 월간계획안 (STEP4)" } },
    },
    yearly: {
      step3: { id: "pr-y-3", title: "독서 연간계획안 (STEP3)" },
      step4: { id: "pr-y-4", title: "독서 연간계획안 (STEP4)" },
      step5: { id: "pr-y-5", title: "독서 연간계획안 (STEP5)" },
    },
  },
  math: {
    monthly: {
      1: { step3: { id: "pmt-m-1-3", title: "1호 월간계획안 (STEP3)" }, step4: { id: "pmt-m-1-4", title: "1호 월간계획안 (STEP4)" }, step5: { id: "pmt-m-1-5", title: "1호 월간계획안 (STEP5)" } },
      2: { step3: { id: "pmt-m-2-3", title: "2호 월간계획안 (STEP3)" }, step4: { id: "pmt-m-2-4", title: "2호 월간계획안 (STEP4)" } },
    },
    yearly: {
      step3: { id: "pmt-y-3", title: "수학 연간계획안 (STEP3)" },
      step4: { id: "pmt-y-4", title: "수학 연간계획안 (STEP4)" },
      step5: { id: "pmt-y-5", title: "수학 연간계획안 (STEP5)" },
    },
  },
  hangul: {
    monthly: {
      1: { step3: { id: "ph-m-1-3", title: "1호 월간계획안 (STEP3)" }, step4: { id: "ph-m-1-4", title: "1호 월간계획안 (STEP4)" }, step5: { id: "ph-m-1-5", title: "1호 월간계획안 (STEP5)" } },
      2: { step3: { id: "ph-m-2-3", title: "2호 월간계획안 (STEP3)" }, step4: { id: "ph-m-2-4", title: "2호 월간계획안 (STEP4)" }, step5: { id: "ph-m-2-5", title: "2호 월간계획안 (STEP5)" } },
    },
    yearly: {
      step3: { id: "ph-y-3", title: "한글 연간계획안 (STEP3)" },
      step4: { id: "ph-y-4", title: "한글 연간계획안 (STEP4)" },
      step5: { id: "ph-y-5", title: "한글 연간계획안 (STEP5)" },
    },
  },
};

const SAMPLE_EVENTS = {
  english: [
    {
      id: "ev1", title: "Let's Go America", date: "2026-04-01 ~ 06-30", desc: "12개 주를 하나씩 돌아보는 영어 체험 행사",
      themeEmoji: "🇺🇸", themeColor: "#3b82f6", themeBg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #1e3a5f 60%, #3b82f6 100%)",
      subEvents: [
        { id: "ev1-1", title: "California", emoji: "🌴", desc: "캘리포니아 해변 & 할리우드",
          tracks: [{ id: "evt-1-1a", title: "California Dreamin'", duration: "2:30" }, { id: "evt-1-1b", title: "Beach Song", duration: "2:00" }],
          videos: [{ id: "evv-1-1a", title: "California 체험 가이드", duration: "8:00" }],
          plans: [{ id: "evp-1-1a", title: "California 수업 계획안" }] },
        { id: "ev1-2", title: "New York", emoji: "🗽", desc: "자유의 여신상 & 타임스퀘어",
          tracks: [{ id: "evt-1-2a", title: "New York New York", duration: "2:45" }],
          videos: [{ id: "evv-1-2a", title: "New York 체험 가이드", duration: "7:00" }],
          plans: [{ id: "evp-1-2a", title: "New York 수업 계획안" }] },
        { id: "ev1-3", title: "Texas", emoji: "🤠", desc: "카우보이 & BBQ 문화",
          tracks: [{ id: "evt-1-3a", title: "Cowboy Song", duration: "2:20" }],
          videos: [],
          plans: [{ id: "evp-1-3a", title: "Texas 수업 계획안" }] },
        { id: "ev1-4", title: "Hawaii", emoji: "🌺", desc: "하와이 훌라 & 화산",
          tracks: [{ id: "evt-1-4a", title: "Aloha Song", duration: "3:00" }, { id: "evt-1-4b", title: "Hula Dance", duration: "2:30" }],
          videos: [{ id: "evv-1-4a", title: "Hawaii 체험 가이드", duration: "6:00" }],
          plans: [{ id: "evp-1-4a", title: "Hawaii 수업 계획안" }] },
        { id: "ev1-5", title: "Florida", emoji: "🐊", desc: "디즈니월드 & 에버글레이즈",
          tracks: [{ id: "evt-1-5a", title: "Florida Fun", duration: "2:10" }],
          videos: [],
          plans: [{ id: "evp-1-5a", title: "Florida 수업 계획안" }] },
        { id: "ev1-6", title: "Alaska", emoji: "🏔", desc: "오로라 & 북극곰",
          tracks: [{ id: "evt-1-6a", title: "Northern Lights", duration: "3:15" }],
          videos: [{ id: "evv-1-6a", title: "Alaska 체험 가이드", duration: "5:00" }],
          plans: [{ id: "evp-1-6a", title: "Alaska 수업 계획안" }] },
        { id: "ev1-7", title: "Illinois", emoji: "🏙", desc: "시카고 재즈 & 건축",
          tracks: [{ id: "evt-1-7a", title: "Chicago Jazz", duration: "2:50" }],
          videos: [],
          plans: [{ id: "evp-1-7a", title: "Illinois 수업 계획안" }] },
        { id: "ev1-8", title: "Colorado", emoji: "⛰", desc: "로키산맥 & 스키",
          tracks: [{ id: "evt-1-8a", title: "Mountain Song", duration: "2:35" }],
          videos: [],
          plans: [{ id: "evp-1-8a", title: "Colorado 수업 계획안" }] },
        { id: "ev1-9", title: "Louisiana", emoji: "🎺", desc: "뉴올리언스 재즈 & 마르디 그라",
          tracks: [{ id: "evt-1-9a", title: "Jazz Parade", duration: "3:00" }],
          videos: [{ id: "evv-1-9a", title: "Louisiana 체험 가이드", duration: "7:00" }],
          plans: [{ id: "evp-1-9a", title: "Louisiana 수업 계획안" }] },
        { id: "ev1-10", title: "Washington", emoji: "🏛", desc: "백악관 & 링컨 기념관",
          tracks: [{ id: "evt-1-10a", title: "Capital March", duration: "2:15" }],
          videos: [],
          plans: [{ id: "evp-1-10a", title: "Washington 수업 계획안" }] },
        { id: "ev1-11", title: "Arizona", emoji: "🏜", desc: "그랜드캐년 & 사막",
          tracks: [{ id: "evt-1-11a", title: "Canyon Echo", duration: "2:40" }],
          videos: [],
          plans: [{ id: "evp-1-11a", title: "Arizona 수업 계획안" }] },
        { id: "ev1-12", title: "Massachusetts", emoji: "📚", desc: "하버드 & 보스턴 티파티",
          tracks: [{ id: "evt-1-12a", title: "Study Song", duration: "2:00" }],
          videos: [],
          plans: [{ id: "evp-1-12a", title: "Massachusetts 수업 계획안" }] },
      ],
    },
    {
      id: "ev2", title: "Phonics Day", date: "2026-05-10", desc: "파닉스 특별 수업 행사",
      themeEmoji: "🔤", themeColor: "#8b5cf6", themeBg: "linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #c4b5fd 100%)",
      tracks: [{ id: "evt-2a", title: "Phonics Chant", duration: "2:15" }],
      videos: [{ id: "evv-2a", title: "파닉스 데이 시연 영상", duration: "12:00" }],
      plans: [{ id: "evp-2a", title: "Phonics Day 계획안" }],
    },
  ],
  coding: [
    {
      id: "ev3", title: "코딩 로봇 체험", date: "2026-04-20", desc: "로봇 코딩 체험 행사",
      themeEmoji: "🤖", themeColor: "#10b981", themeBg: "linear-gradient(135deg, #064e3b 0%, #10b981 50%, #6ee7b7 100%)",
      tracks: [{ id: "evt-3a", title: "로봇 댄스 음악", duration: "2:45" }],
      videos: [{ id: "evv-3a", title: "로봇 코딩 체험 가이드", duration: "8:00" }],
      plans: [{ id: "evp-3a", title: "코딩 로봇 체험 계획안" }],
    },
  ],
  music: [
    {
      id: "ev4", title: "봄 음악회", date: "2026-04-25", desc: "봄맞이 유아 음악 발표회",
      themeEmoji: "🌸", themeColor: "#ec4899", themeBg: "linear-gradient(135deg, #831843 0%, #ec4899 50%, #fbcfe8 100%)",
      tracks: [{ id: "evt-4a", title: "음악회 오프닝", duration: "3:00" }, { id: "evt-4b", title: "봄의 왈츠", duration: "4:15" }, { id: "evt-4c", title: "음악회 피날레", duration: "2:50" }],
      videos: [{ id: "evv-4a", title: "음악회 무대 세팅 가이드", duration: "6:00" }],
      plans: [{ id: "evp-4a", title: "봄 음악회 운영 계획안" }, { id: "evp-4b", title: "봄 음악회 프로그램 순서" }],
    },
  ],
  piano: [
    {
      id: "ev5", title: "피아노 미니 콘서트", date: "2026-05-20", desc: "학부모 참관 피아노 발표",
      themeEmoji: "🎹", themeColor: "#f59e0b", themeBg: "linear-gradient(135deg, #78350f 0%, #f59e0b 50%, #fde68a 100%)",
      tracks: [{ id: "evt-5a", title: "콘서트 인트로", duration: "1:30" }],
      videos: [],
      plans: [{ id: "evp-5a", title: "미니 콘서트 계획안" }],
    },
  ],
  senses: [],
  science: [
    {
      id: "ev6", title: "과학의 날 행사", date: "2026-04-21", desc: "과학 실험 페스티벌",
      themeEmoji: "🔬", themeColor: "#06b6d4", themeBg: "linear-gradient(135deg, #164e63 0%, #06b6d4 50%, #a5f3fc 100%)",
      tracks: [{ id: "evt-6a", title: "실험 시작 음악", duration: "1:30" }],
      videos: [{ id: "evv-6a", title: "과학 실험 시연", duration: "15:00" }],
      plans: [{ id: "evp-6a", title: "과학의 날 운영 계획안" }],
    },
  ],
  art: [],
  reading: [],
  math: [],
  hangul: [],
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const font = `'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

const S = {
  app: { fontFamily: font, background: "#fff", color: "#111", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", overflow: "hidden" },
  // Header
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid #e5e5e5", background: "#fff", position: "sticky", top: 0, zIndex: 100 },
  logoWrap: { display: "flex", alignItems: "center", gap: 10 },
  logoText: { fontSize: 18, fontWeight: 800, letterSpacing: -0.5 },
  logoSub: { fontSize: 9, fontWeight: 500, color: "#888", letterSpacing: 2, textTransform: "uppercase" },
  // Bottom Nav
  nav: { display: "flex", position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #e5e5e5", zIndex: 100, padding: "6px 0 env(safe-area-inset-bottom, 8px)" },
  navItem: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 0 6px", minHeight: 48, background: "none", border: "none", cursor: "pointer", color: active ? "#111" : "#999", fontSize: 10, fontWeight: active ? 700 : 500, fontFamily: font, transition: "all 0.15s" }),
  navIcon: (active) => ({ fontSize: 20, lineHeight: 1, opacity: active ? 1 : 0.5 }),
  // Section
  section: { padding: "20px 20px 100px" },
  sectionTitle: { fontSize: 20, fontWeight: 800, marginBottom: 16, letterSpacing: -0.5 },
  sectionSub: { fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  // Cards
  card: { background: "#fafafa", border: "1px solid #eee", borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "all 0.15s" },
  cardTitle: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  cardMeta: { fontSize: 11, color: "#999", fontWeight: 500 },
  cardContent: { fontSize: 13, color: "#555", marginTop: 8, lineHeight: 1.6 },
  // Buttons
  btn: (variant = "default") => ({
    padding: variant === "sm" ? "6px 14px" : "10px 20px",
    background: variant === "primary" ? "#111" : variant === "outline" ? "transparent" : "#f5f5f5",
    color: variant === "primary" ? "#fff" : "#111",
    border: variant === "outline" ? "1.5px solid #ddd" : "none",
    borderRadius: 8,
    fontSize: variant === "sm" ? 12 : 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: font,
    transition: "all 0.15s",
  }),
  // Subject grid
  subjectGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 },
  subjectBtn: (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "14px 4px 10px", background: active ? "#111" : "#fafafa",
    color: active ? "#fff" : "#111", border: active ? "none" : "1px solid #eee",
    borderRadius: 14, cursor: "pointer", fontFamily: font, transition: "all 0.2s",
  }),
  subjectIcon: { fontSize: 22, lineHeight: 1 },
  subjectName: { fontSize: 11, fontWeight: 700, letterSpacing: -0.3 },
  // Badge
  badge: (color = "#111") => ({ display: "inline-block", padding: "2px 8px", background: color, color: color === "#111" ? "#fff" : "#111", borderRadius: 20, fontSize: 10, fontWeight: 700, marginRight: 6 }),
  // Track item
  trackItem: (isPlaying) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
    background: isPlaying ? "#111" : "#fafafa", color: isPlaying ? "#fff" : "#111",
    border: isPlaying ? "none" : "1px solid #eee", borderRadius: 12,
    marginBottom: 8, cursor: "pointer", transition: "all 0.2s",
  }),
  trackPlay: (isPlaying) => ({ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isPlaying ? "#fff" : "#111", color: isPlaying ? "#111" : "#fff", fontSize: 14, flexShrink: 0, border: "none", cursor: "pointer", fontFamily: font }),
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  trackDuration: (isPlaying) => ({ fontSize: 11, color: isPlaying ? "rgba(255,255,255,0.6)" : "#999", marginTop: 2 }),
  favBtn: (fav, isPlaying) => ({ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: fav ? "#f43f5e" : (isPlaying ? "rgba(255,255,255,0.4)" : "#ccc"), padding: 12, lineHeight: 1, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }),
  // Pill tabs
  pillWrap: { display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 },
  pill: (active) => ({ padding: "8px 16px", minHeight: 36, borderRadius: 20, border: active ? "none" : "1px solid #ddd", background: active ? "#111" : "transparent", color: active ? "#fff" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: font }),
  // Textarea
  textarea: { width: "100%", padding: "12px 14px", border: "1.5px solid #ddd", borderRadius: 10, fontSize: 13, fontFamily: font, resize: "vertical", minHeight: 80, outline: "none", boxSizing: "border-box" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 10, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box", marginBottom: 8 },
  // Pin
  pinBadge: { display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", background: "#fee2e2", color: "#dc2626", borderRadius: 20, fontSize: 10, fontWeight: 700 },
  // Empty
  empty: { textAlign: "center", padding: "40px 20px", color: "#bbb", fontSize: 13, fontWeight: 500 },
  // Mini player
  miniPlayer: { position: "fixed", bottom: 58, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448, background: "#111", color: "#fff", borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, zIndex: 99, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  // Back button
  backBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px 8px 4px 0", color: "#111", fontFamily: font, display: "flex", alignItems: "center", gap: 4 },
  backText: { fontSize: 13, fontWeight: 600 },
  // Floating action button
  fab: { position: "fixed", bottom: 76, right: "calc(50% - 220px)", width: 48, height: 48, borderRadius: "50%", background: "#111", color: "#fff", border: "none", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 98 },
  // Tag
  tag: { display: "inline-block", padding: "3px 10px", background: "#f5f5f5", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#555", marginRight: 6, marginBottom: 4 },
  // Divider
  divider: { height: 1, background: "#eee", margin: "20px 0" },
  // Modal overlay
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal: { background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" },
  modalTitle: { fontSize: 17, fontWeight: 800, marginBottom: 16 },
};

// Touch target wrapper: ensures minimum 44x44 hit area
const touch44 = { minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" };

// ─── Icons (simple text) ────────────────────────────────────────────────────
const Icons = {
  home: "⌂",
  subjects: "▤",
  favorites: "★",
  events: "🎪",
  recent: "🕐",
  play: "▶",
  pause: "❚❚",
  heart: "♥",
  heartEmpty: "♡",
  back: "←",
  pin: "📌",
  add: "+",
  admin: "⚙",
  send: "↗",
  music: "♫",
  video: "▶",
  plan: "📋",
  close: "✕",
  search: "⌕",
  repeat: "↻",
  repeatOne: "↻¹",
  download: "↓",
  downloaded: "✓",
  searchLg: "🔍",
  volumeHigh: "🔊",
  volumeLow: "🔉",
  volumeMute: "🔇",
};

// ─── Logo Component ──────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
    {[20, 30, 40, 50].map((r, i) => (
      <path key={i} d={`M ${50 - r} 60 A ${r} ${r} 0 0 1 ${50 + r} 60`} stroke="#111" strokeWidth="4" fill="none" />
    ))}
    <text x="10" y="88" fontSize="20" fontWeight="900" fill="#111" fontFamily="sans-serif">Wollim</text>
  </svg>
);

// ─── Main App ────────────────────────────────────────────────────────────────
export default function UllimApp() {
  // ─── Auth states ────────────────────────────────────────────────────────────
  const [authState, setAuthState] = useState(() => {
    try { const s = JSON.parse(window._ullimAuth || "null"); return s; } catch { return null; }
  }); // null = not logged in, { name, status: "pending"|"approved"|"rejected" }
  const [authScreen, setAuthScreen] = useState("login"); // "login" | "signup"
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupSubject, setSignupSubject] = useState("");
  // Admin: user management
  const [registeredUsers, setRegisteredUsers] = useState([
    { id: 1, name: "김민지", phone: "010-1234-5678", subject: "영어", status: "approved", date: "2026-03-01" },
    { id: 2, name: "이수현", phone: "010-2345-6789", subject: "코딩", status: "approved", date: "2026-03-05" },
    { id: 3, name: "박서연", phone: "010-3456-7890", subject: "피아노", status: "pending", date: "2026-03-18" },
  ]);

  useEffect(() => {
    window._ullimAuth = JSON.stringify(authState);
  }, [authState]);

  // ─── App states ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState("home");
  const [subPage, setSubPage] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(window._ullimFavs || "[]"); } catch { return []; }
  });
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false); // true = 한곡 반복
  const [notices, setNotices] = useState(SAMPLE_NOTICES);
  const [showNotice, setShowNotice] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [adminContentSubject, setAdminContentSubject] = useState("english");
  const [adminContentProgram, setAdminContentProgram] = useState(null);
  const [adminContentType, setAdminContentType] = useState("track");
  const [adminContentIssue, setAdminContentIssue] = useState(null);
  const [adminContentStep, setAdminContentStep] = useState(null);
  const [adminEditItem, setAdminEditItem] = useState(null);
  const [adminUploadedFiles, setAdminUploadedFiles] = useState({});
  // Play count tracking
  const [playCounts, setPlayCounts] = useState({});
  // Recent play history: [{ track, timestamp }]
  const [recentHistory, setRecentHistory] = useState([]);
  // Bulk upload staging
  const [bulkFiles, setBulkFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false); // { itemId: { name, size, url, type } }
  const [adminEventSubject, setAdminEventSubject] = useState("english");
  const [adminNewTitle, setAdminNewTitle] = useState("");
  const [adminNewDuration, setAdminNewDuration] = useState("");
  const [adminNewEventTitle, setAdminNewEventTitle] = useState("");
  const [adminNewEventDate, setAdminNewEventDate] = useState("");
  const [adminNewEventDesc, setAdminNewEventDesc] = useState("");
  const [adminConfirmDelete, setAdminConfirmDelete] = useState(null);
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [tracks, setTracks] = useState(SAMPLE_TRACKS);
  const [videos, setVideos] = useState(SAMPLE_VIDEOS);
  const [plans, setPlans] = useState(SAMPLE_PLANS);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", pinned: false });
  const [subjectTab, setSubjectTab] = useState("tracks");
  const [contentIssue, setContentIssue] = useState(null);
  const [contentStep, setContentStep] = useState(null);
  const [planType, setPlanType] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  // Player progress
  const [playerProgress, setPlayerProgress] = useState(0); // 0~100
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(80); // 0~100
  const [showVolume, setShowVolume] = useState(false);
  const volumeRef = useRef(null);
  // Playlists: { subjectId: [trackId, trackId, ...] }
  const [playlists, setPlaylists] = useState(() => {
    try { return JSON.parse(window._ullimPL || "{}"); } catch { return {}; }
  });
  const [favSubjectFilter, setFavSubjectFilter] = useState("all");
  const [reorderMode, setReorderMode] = useState(false);
  // Event detail
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [eventTab, setEventTab] = useState("tracks");
  // Video player
  const [playingVideo, setPlayingVideo] = useState(null);
  // Document viewer
  const [viewingDoc, setViewingDoc] = useState(null); // { title, fileUrl, fileType }
  // Global search
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  // Offline downloads
  const [downloadedFiles, setDownloadedFiles] = useState(() => {
    try { return JSON.parse(window._ullimDL || "[]"); } catch { return []; }
  });
  const [downloadingFiles, setDownloadingFiles] = useState([]);
  const progressRef = useRef(null);
  const searchInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    window._ullimFavs = JSON.stringify(favorites);
  }, [favorites]);

  useEffect(() => {
    window._ullimPL = JSON.stringify(playlists);
  }, [playlists]);

  useEffect(() => {
    window._ullimDL = JSON.stringify(downloadedFiles);
  }, [downloadedFiles]);

  useEffect(() => {
    if (showGlobalSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showGlobalSearch]);

  const toggleFav = (trackId, subjectId) => {
    setFavorites(f => {
      if (f.includes(trackId)) return f.filter(x => x !== trackId);
      return [...f, trackId];
    });
    // Also manage playlist
    if (subjectId) {
      setPlaylists(pl => {
        const list = pl[subjectId] || [];
        if (list.includes(trackId)) {
          const newList = list.filter(x => x !== trackId);
          const newPl = { ...pl, [subjectId]: newList };
          if (newList.length === 0) delete newPl[subjectId];
          return newPl;
        }
        return { ...pl, [subjectId]: [...list, trackId] };
      });
    } else {
      // Find subject from allTracksFlat
      const trk = allTracksFlat.find(t => t.id === trackId);
      if (trk) {
        setPlaylists(pl => {
          const list = pl[trk.subject] || [];
          if (list.includes(trackId)) {
            const newList = list.filter(x => x !== trackId);
            const newPl = { ...pl, [trk.subject]: newList };
            if (newList.length === 0) delete newPl[trk.subject];
            return newPl;
          }
          return { ...pl, [trk.subject]: [...list, trackId] };
        });
      }
    }
  };

  // Flatten all tracks from nested structure for favorites
  const getAllTracksFlat = () => {
    const result = [];
    Object.entries(tracks).forEach(([subj, subjData]) => {
      if (!subjData) return;
      const hasPrograms = PROGRAMS[subj];
      if (hasPrograms) {
        // program -> issue -> step -> tracks
        Object.entries(subjData).forEach(([prog, issues]) => {
          if (!issues || typeof issues !== "object") return;
          Object.entries(issues).forEach(([issue, steps]) => {
            if (!steps || typeof steps !== "object") return;
            Object.entries(steps).forEach(([step, trks]) => {
              if (!Array.isArray(trks)) return;
              trks.forEach(t => result.push({ ...t, subject: subj, program: prog, issue: Number(issue), step }));
            });
          });
        });
      } else {
        // issue -> step -> tracks
        Object.entries(subjData).forEach(([issue, steps]) => {
          if (!steps || typeof steps !== "object") return;
          Object.entries(steps).forEach(([step, trks]) => {
            if (!Array.isArray(trks)) return;
            trks.forEach(t => result.push({ ...t, subject: subj, issue: Number(issue), step }));
          });
        });
      }
    });
    return result;
  };

  const allTracksFlat = getAllTracksFlat();

  const favTracks = allTracksFlat.filter(t => favorites.includes(t.id));

  const audioRef = useRef(null);

  const playTrack = (track) => {
    if (playingTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
      if (audioRef.current) {
        isPlaying ? audioRef.current.pause() : audioRef.current.play();
      }
    } else {
      // Stop current audio
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setPlayingTrack(track);
      setIsPlaying(true);
      setPlayerProgress(0);
      // Track play count
      setPlayCounts(pc => ({ ...pc, [track.id]: (pc[track.id] || 0) + 1 }));
      // Record to recent history
      setRecentHistory(h => {
        const filtered = h.filter(item => item.track.id !== track.id);
        return [{ track, timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) }, ...filtered].slice(0, 50);
      });
      // If track has a real file URL, play it
      const url = track.fileUrl || adminUploadedFiles[track.id]?.url;
      if (url) {
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          if (repeatMode) { audio.currentTime = 0; audio.play(); }
          else { setIsPlaying(false); setPlayerProgress(100); }
        };
      }
    }
  };

  // Sync audio with progress bar seek
  useEffect(() => {
    if (isDragging && audioRef.current && playingTrack) {
      const totalSec = parseDuration(playingTrack.duration);
      audioRef.current.currentTime = (playerProgress / 100) * totalSec;
    }
  }, [playerProgress, isDragging]);

  // Sync volume with audio
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setVolume(Math.round(pct));
  };

  // Stop audio when closing player
  const stopPlayer = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingTrack(null);
    setIsPlaying(false);
    setPlayerProgress(0);
  };

  // Playlist reorder
  const moveTrackInPlaylist = (subjectId, trackId, direction) => {
    setPlaylists(pl => {
      const list = [...(pl[subjectId] || [])];
      const idx = list.indexOf(trackId);
      if (idx < 0) return pl;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= list.length) return pl;
      [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
      return { ...pl, [subjectId]: list };
    });
  };

  // Parse duration string to seconds
  const parseDuration = (dur) => {
    if (!dur) return 0;
    const parts = dur.split(":").map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
  };
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || !playingTrack) return;
    const totalSec = parseDuration(playingTrack.duration);
    if (totalSec === 0) return;
    const interval = setInterval(() => {
      if (!isDragging) {
        setPlayerProgress(p => {
          const next = p + (100 / totalSec);
          if (next >= 100) {
            if (repeatMode) return 0;
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playingTrack, isDragging, repeatMode]);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setPlayerProgress(pct);
  };

  // ─── Download handler ───────────────────────────────────────────────────────
  const handleDownload = (fileId) => {
    if (downloadedFiles.includes(fileId)) return;
    if (downloadingFiles.includes(fileId)) return;
    setDownloadingFiles(df => [...df, fileId]);
    // Simulate download (1.5s)
    setTimeout(() => {
      setDownloadingFiles(df => df.filter(x => x !== fileId));
      setDownloadedFiles(df => [...df, fileId]);
    }, 1500);
  };

  const isDownloaded = (fileId) => downloadedFiles.includes(fileId);
  const isDownloading = (fileId) => downloadingFiles.includes(fileId);

  // ─── Global search ──────────────────────────────────────────────────────────
  const getGlobalSearchResults = () => {
    const q = globalSearchTerm.trim().toLowerCase();
    if (!q) return { tracks: [], videos: [], plans: [] };

    const trackResults = [];
    const videoResults = [];
    const planResults = [];

    // Helper to iterate tracks/videos (handles program-nested and flat)
    const iterateContent = (src, callback) => {
      Object.entries(src).forEach(([subj, subjData]) => {
        if (!subjData) return;
        const hasProgs = PROGRAMS[subj];
        if (hasProgs) {
          Object.entries(subjData).forEach(([prog, issues]) => {
            if (!issues || typeof issues !== "object") return;
            Object.entries(issues).forEach(([issue, steps]) => {
              if (!steps || typeof steps !== "object") return;
              Object.entries(steps).forEach(([step, items]) => {
                if (!Array.isArray(items)) return;
                items.forEach(item => callback(item, subj, prog, Number(issue), step));
              });
            });
          });
        } else {
          Object.entries(subjData).forEach(([issue, steps]) => {
            if (!steps || typeof steps !== "object") return;
            Object.entries(steps).forEach(([step, items]) => {
              if (!Array.isArray(items)) return;
              items.forEach(item => callback(item, subj, null, Number(issue), step));
            });
          });
        }
      });
    };

    // Search tracks
    iterateContent(SAMPLE_TRACKS, (t, subj, prog, issue, step) => {
      if (t.title.toLowerCase().includes(q)) {
        trackResults.push({ ...t, subject: subj, program: prog, issue, step, type: "track" });
      }
    });

    // Search videos
    iterateContent(SAMPLE_VIDEOS, (v, subj, prog, issue, step) => {
      if (v.title.toLowerCase().includes(q)) {
        videoResults.push({ ...v, subject: subj, program: prog, issue, step, type: "video" });
      }
    });

    // Search plans
    Object.entries(SAMPLE_PLANS).forEach(([subj, subjData]) => {
      if (!subjData) return;
      const hasProgs = PROGRAMS[subj];
      const iteratePlans = (planData, prog) => {
        if (planData?.monthly) {
          Object.entries(planData.monthly).forEach(([issue, steps]) => {
            Object.entries(steps).forEach(([step, plan]) => {
              if (plan.title?.toLowerCase().includes(q)) {
                planResults.push({ ...plan, subject: subj, program: prog, issue: Number(issue), step, type: "plan" });
              }
            });
          });
        }
        if (planData?.yearly) {
          Object.entries(planData.yearly).forEach(([step, plan]) => {
            if (plan.title?.toLowerCase().includes(q)) {
              planResults.push({ ...plan, subject: subj, program: prog, step, type: "plan", yearly: true });
            }
          });
        }
      };
      if (hasProgs) {
        Object.entries(subjData).forEach(([prog, planData]) => iteratePlans(planData, prog));
      } else {
        iteratePlans(subjData, null);
      }
    });

    return { tracks: trackResults, videos: videoResults, plans: planResults };
  };

  const goToSubject = (subj) => {
    setSelectedSubject(subj);
    setSelectedProgram(null);
    setSubjectTab("tracks");
    setContentIssue(null);
    setContentStep(null);
    setPlanType("monthly");
    setSearchTerm("");
    setPage("subjectDetail");
  };

  const goBack = () => {
    if (page === "subjectDetail") { setPage("subjects"); setSelectedSubject(null); }
    else if (subPage) { setSubPage(null); }
    else { setPage("home"); }
  };

  // ─── Renderers ──────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <div style={S.header}>
      {(page === "subjectDetail" || selectedEvent || (showAdmin && adminLoggedIn)) ? (
        <button style={S.backBtn} onClick={() => {
          if (showAdmin && adminLoggedIn) { setShowAdmin(false); setAdminTab("dashboard"); setAdminContentIssue(null); setAdminContentStep(null); setAdminContentProgram(null); }
          else if (selectedSubEvent) { setSelectedSubEvent(null); setEventTab("tracks"); }
          else if (selectedEvent) { setSelectedEvent(null); setEventTab("tracks"); }
          else if (selectedProgram) { setSelectedProgram(null); setContentIssue(null); setContentStep(null); }
          else goBack();
        }}>
          {Icons.back} <span style={S.backText}>{showAdmin ? "관리자 모드" : selectedSubEvent ? selectedEvent?.title : selectedEvent ? "행사" : selectedProgram ? PROGRAMS[selectedSubject]?.find(p => p.id === selectedProgram)?.name || "뒤로" : "뒤로"}</span>
        </button>
      ) : showAdmin && !adminLoggedIn ? (
        <button style={S.backBtn} onClick={() => setShowAdmin(false)}>
          {Icons.back} <span style={S.backText}>돌아가기</span>
        </button>
      ) : (
        <div style={{ ...S.logoWrap, cursor: "pointer" }} onClick={() => { setPage("home"); setSelectedSubject(null); setSelectedProgram(null); setSubPage(null); setSelectedEvent(null); setSelectedSubEvent(null); }}>
          <Logo />
          <div>
            <div style={S.logoText}>울림교육</div>
            <div style={S.logoSub}>Education Lab</div>
          </div>
        </div>
      )}
      {!showAdmin && (
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <button style={{ ...touch44, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#111" }} onClick={() => { setShowGlobalSearch(true); setGlobalSearchTerm(""); }}>
            {Icons.searchLg}
          </button>
          <button style={{ ...touch44, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#111" }} onClick={() => setShowAdmin(!showAdmin)}>
            {Icons.admin}
          </button>
        </div>
      )}
      {showAdmin && adminLoggedIn && (
        <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11 }} onClick={() => { setAdminLoggedIn(false); setShowAdmin(false); setAdminPw(""); }}>
          로그아웃
        </button>
      )}
      {!showAdmin && authState && (
        <span style={{ fontSize: 10, color: "#999", position: "absolute", bottom: 4, right: 20 }}>{authState.name}</span>
      )}
    </div>
  );

  const renderNav = () => (
    <div style={S.nav}>
      {[
        { id: "home", icon: Icons.home, label: "홈" },
        { id: "subjects", icon: Icons.subjects, label: "과목" },
        { id: "favorites", icon: Icons.favorites, label: "즐겨찾기" },
        { id: "recent", icon: Icons.recent, label: "최근" },
        { id: "events", icon: Icons.events, label: "행사" },
      ].map(nav => (
        <button key={nav.id} style={S.navItem(page === nav.id)} onClick={() => { setPage(nav.id); setSelectedSubject(null); setSelectedProgram(null); setSubPage(null); }}>
          <span style={S.navIcon(page === nav.id)}>{nav.icon}</span>
          {nav.label}
        </button>
      ))}
    </div>
  );

  const toggleRepeat = () => {
    setRepeatMode(m => !m);
  };

  const renderMiniPlayer = () => {
    if (!playingTrack) return null;
    const totalSec = parseDuration(playingTrack.duration);
    const currentSec = (playerProgress / 100) * totalSec;
    return (
      <div style={{ ...S.miniPlayer, flexDirection: "column", gap: 8, padding: "12px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          {/* Large play/pause button */}
          <button style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#111", fontSize: 18, flexShrink: 0, border: "none", cursor: "pointer", fontFamily: font }} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? Icons.pause : Icons.play}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playingTrack.title}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              {playingTrack.subject && <span>{SUBJECTS.find(s => s.id === playingTrack.subject)?.name} · </span>}
              {repeatMode && <span>한곡 반복 · </span>}
              {formatTime(currentSec)} / {playingTrack.duration}
            </div>
          </div>
          {/* Large repeat button */}
          <button
            style={{ ...touch44, background: repeatMode ? "rgba(255,255,255,0.15)" : "none", border: repeatMode ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid transparent", borderRadius: 12, fontSize: 18, cursor: "pointer", color: repeatMode ? "#fff" : "rgba(255,255,255,0.35)", position: "relative", lineHeight: 1, flexShrink: 0 }}
            onClick={toggleRepeat}
          >
            {Icons.repeat}
            {repeatMode && <span style={{ position: "absolute", top: 2, right: 2, fontSize: 9, fontWeight: 900, background: "#fff", color: "#111", borderRadius: 10, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>}
          </button>
          {/* Fav button */}
          <button style={{ ...S.favBtn(favorites.includes(playingTrack.id), true), flexShrink: 0 }} onClick={() => toggleFav(playingTrack.id)}>
            {favorites.includes(playingTrack.id) ? Icons.heart : Icons.heartEmpty}
          </button>
          {/* Close button */}
          <button style={{ ...touch44, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 18, cursor: "pointer", flexShrink: 0 }} onClick={stopPlayer}>
            {Icons.close}
          </button>
        </div>
        {/* Progress bar */}
        <div
          ref={progressRef}
          style={{ width: "100%", height: 28, cursor: "pointer", display: "flex", alignItems: "center", padding: "6px 0" }}
          onClick={handleProgressClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={(e) => { if (isDragging) handleProgressClick(e); }}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={(e) => {
            if (isDragging && progressRef.current) {
              const rect = progressRef.current.getBoundingClientRect();
              const touch = e.touches[0];
              const pct = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
              setPlayerProgress(pct);
            }
          }}
        >
          <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 3, position: "relative" }}>
            <div style={{ width: `${playerProgress}%`, height: "100%", background: "#fff", borderRadius: 3, transition: isDragging ? "none" : "width 0.3s linear" }} />
            <div style={{
              position: "absolute", top: "50%", left: `${playerProgress}%`, transform: "translate(-50%, -50%)",
              width: 18, height: 18, borderRadius: "50%", background: "#fff",
              boxShadow: "0 0 6px rgba(0,0,0,0.3)", transition: isDragging ? "none" : "left 0.3s linear"
            }} />
          </div>
        </div>
        {/* Volume bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
            {volume === 0 ? Icons.volumeMute : volume < 50 ? Icons.volumeLow : Icons.volumeHigh}
          </span>
          <div
            ref={volumeRef}
            style={{ flex: 1, height: 24, cursor: "pointer", display: "flex", alignItems: "center", padding: "4px 0" }}
            onClick={handleVolumeClick}
            onMouseMove={(e) => { if (e.buttons === 1) handleVolumeClick(e); }}
            onTouchMove={(e) => {
              if (volumeRef.current) {
                const rect = volumeRef.current.getBoundingClientRect();
                const touch = e.touches[0];
                const pct = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
                setVolume(Math.round(pct));
              }
            }}
          >
            <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, position: "relative" }}>
              <div style={{ width: `${volume}%`, height: "100%", background: "rgba(255,255,255,0.6)", borderRadius: 2 }} />
              <div style={{
                position: "absolute", top: "50%", left: `${volume}%`, transform: "translate(-50%, -50%)",
                width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.8)",
                boxShadow: "0 0 4px rgba(0,0,0,0.2)"
              }} />
            </div>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", width: 28, textAlign: "center", flexShrink: 0 }}>{volume}%</span>
        </div>
      </div>
    );
  };

  const renderTrackItem = (track, showSubject = false) => {
    const playing = playingTrack?.id === track.id && isPlaying;
    const active = playingTrack?.id === track.id;
    const dlState = isDownloaded(track.id) ? "done" : isDownloading(track.id) ? "loading" : "none";
    return (
      <div key={track.id} style={S.trackItem(active)}>
        <button style={S.trackPlay(active)} onClick={() => playTrack(track)}>
          {playing ? Icons.pause : Icons.play}
        </button>
        <div style={S.trackInfo} onClick={() => playTrack(track)}>
          <div style={S.trackTitle}>{track.title}</div>
          <div style={S.trackDuration(active)}>
            {showSubject && track.subject && <span>{SUBJECTS.find(s => s.id === track.subject)?.name} · </span>}
            {track.duration}
            {dlState === "done" && <span> · 오프라인</span>}
          </div>
        </div>
        <button
          style={{ ...touch44, background: "none", border: "none", fontSize: 16, cursor: dlState === "done" ? "default" : "pointer", color: dlState === "done" ? (active ? "rgba(255,255,255,0.8)" : "#22c55e") : dlState === "loading" ? (active ? "rgba(255,255,255,0.5)" : "#f59e0b") : (active ? "rgba(255,255,255,0.3)" : "#ccc"), flexShrink: 0 }}
          onClick={(e) => { e.stopPropagation(); handleDownload(track.id); }}
        >
          {dlState === "done" ? "✓" : dlState === "loading" ? (
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>⟳</span>
          ) : "↓"}
        </button>
        <button style={{ ...S.favBtn(favorites.includes(track.id), active), flexShrink: 0 }} onClick={() => toggleFav(track.id, track.subject || selectedSubject)}>
          {favorites.includes(track.id) ? Icons.heart : Icons.heartEmpty}
        </button>
      </div>
    );
  };

  // ─── Pages ──────────────────────────────────────────────────────────────────

  const renderHome = () => (
    <div style={S.section} ref={scrollRef}>
      {/* Quick notice banner */}
      {notices.filter(n => n.pinned).map(n => (
        <div key={n.id} style={{ ...S.card, background: "#111", color: "#fff", border: "none", marginBottom: 16, cursor: "pointer" }} onClick={() => setShowNotice(n)}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={S.pinBadge}>{Icons.pin} 공지</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{n.title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{n.date}</div>
        </div>
      ))}

      {/* Quick Access Subjects */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>과목 바로가기</div>
          <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 12px" }} onClick={() => setPage("subjects")}>전체보기</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {SUBJECTS.slice(0, 5).map(s => (
            <button key={s.id} style={{ ...S.subjectBtn(false), padding: "12px 4px 8px" }} onClick={() => goToSubject(s.id)}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent notices */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>최신 공지사항</div>
        {notices.slice(0, 3).map(n => (
          <div key={n.id} style={S.card} onClick={() => setShowNotice(n)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={S.cardTitle}>{n.title}</div>
              <div style={S.cardMeta}>{n.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick favorites */}
      {favTracks.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>이번 주 즐겨찾기</div>
            <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 12px" }} onClick={() => setPage("favorites")}>전체보기</button>
          </div>
          {favTracks.slice(0, 3).map(t => renderTrackItem(t, true))}
        </div>
      )}

      {/* Recent plays */}
      {recentHistory.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>최근 재생</div>
            <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 12px" }} onClick={() => setPage("recent")}>전체보기</button>
          </div>
          {recentHistory.slice(0, 3).map((item, idx) => {
            const t = item.track;
            const playing = playingTrack?.id === t.id && isPlaying;
            const active = playingTrack?.id === t.id;
            return (
              <div key={t.id + "-home-" + idx} style={S.trackItem(active)}>
                <button style={S.trackPlay(active)} onClick={() => playTrack(t)}>
                  {playing ? Icons.pause : Icons.play}
                </button>
                <div style={S.trackInfo} onClick={() => playTrack(t)}>
                  <div style={S.trackTitle}>{t.title}</div>
                  <div style={S.trackDuration(active)}>
                    {t.subject && <span>{SUBJECTS.find(s => s.id === t.subject)?.name} · </span>}
                    {item.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderSubjects = () => (
    <div style={S.section}>
      <div style={S.sectionTitle}>과목</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {SUBJECTS.map(s => (
          <button key={s.id} style={S.subjectBtn(false)} onClick={() => goToSubject(s.id)}>
            <span style={S.subjectIcon}>{s.icon}</span>
            <span style={S.subjectName}>{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSubjectDetail = () => {
    const subj = SUBJECTS.find(s => s.id === selectedSubject);
    if (!subj) return null;
    const hasPrograms = PROGRAMS[selectedSubject];

    // If subject has programs and none selected
    if (hasPrograms && !selectedProgram) {
      // If only one program, auto-select it
      if (hasPrograms.length === 1) {
        setSelectedProgram(hasPrograms[0].id);
        return null;
      }
      return (
        <div style={S.section}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 32 }}>{subj.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{subj.name}</div>
              <div style={{ fontSize: 11, color: "#999" }}>프로그램을 선택하세요</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: hasPrograms.length <= 2 ? "1fr 1fr" : hasPrograms.length <= 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)", gap: 12 }}>
            {hasPrograms.map(prog => (
              <button key={prog.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "24px 16px 20px", background: "#fafafa", border: "1.5px solid #eee",
                borderRadius: 16, cursor: "pointer", fontFamily: font, transition: "all 0.2s",
              }} onClick={() => { setSelectedProgram(prog.id); setSubjectTab("tracks"); setContentIssue(null); setContentStep(null); }}>
                <span style={{ fontSize: 36 }}>{prog.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{prog.name}</span>
                <span style={{ fontSize: 11, color: "#999", textAlign: "center", lineHeight: 1.4 }}>{prog.desc}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Get data scoped to program (if applicable)
    const getSubjectData = (dataSource) => {
      const subjData = dataSource[selectedSubject];
      if (!subjData) return null;
      if (hasPrograms && selectedProgram) return subjData[selectedProgram] || null;
      return subjData;
    };

    const tracksData = getSubjectData(tracks);
    const videosData = getSubjectData(videos);
    const rawPlansData = getSubjectData(plans);
    // Plans might have monthly/yearly structure directly, or be nested under program
    const plansData = rawPlansData;

    const programInfo = hasPrograms ? hasPrograms.find(p => p.id === selectedProgram) : null;

    // Get the current data source based on active tab
    const getCurrentData = () => {
      if (subjectTab === "tracks") return tracksData;
      if (subjectTab === "videos") return videosData;
      return null; // plans handled separately
    };

    const currentData = getCurrentData();

    // Check which issues have data for current tab
    const issueHasData = (issueId) => {
      if (subjectTab === "plans") return plansData?.monthly?.[issueId];
      return currentData?.[issueId];
    };

    // Check which steps have data for current issue
    const stepHasData = (stepId) => {
      if (subjectTab === "plans") return plansData?.monthly?.[contentIssue]?.[stepId];
      return currentData?.[contentIssue]?.[stepId];
    };

    // Render issue grid (shared by tracks, videos, plans-monthly)
    const renderIssueGrid = () => (
      <>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>호수 선택</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {ISSUES.map(issue => {
            const has = issueHasData(issue.id);
            return (
              <button key={issue.id} style={{ ...S.subjectBtn(false), opacity: has ? 1 : 0.35, cursor: has ? "pointer" : "default" }} onClick={() => has && setContentIssue(issue.id)} disabled={!has}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{issue.id}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#888" }}>{issue.label}</span>
              </button>
            );
          })}
        </div>
      </>
    );

    // Render step grid (shared)
    const renderStepGrid = () => (
      <>
        <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => { setContentIssue(null); setContentStep(null); }}>
          {Icons.back} <span style={S.backText}>{contentIssue}호</span>
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>연령 선택</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {STEPS.map(step => {
            const has = stepHasData(step.id);
            return (
              <button key={step.id} style={{ ...S.subjectBtn(false), opacity: has ? 1 : 0.35, cursor: has ? "pointer" : "default" }} onClick={() => has && setContentStep(step.id)} disabled={!has}>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{step.label}</span>
                <span style={{ fontSize: 9, color: "#999" }}>{step.age}</span>
              </button>
            );
          })}
        </div>
      </>
    );

    // Render content list after issue + step selected
    const renderContentList = () => {
      const stepLabel = STEPS.find(s => s.id === contentStep);

      if (subjectTab === "tracks") {
        const tracks = currentData?.[contentIssue]?.[contentStep] || [];
        const filtered = searchTerm ? tracks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())) : tracks;
        return (
          <>
            <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setContentStep(null)}>
              {Icons.back} <span style={S.backText}>{contentIssue}호 · {stepLabel?.label}</span>
            </button>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input style={S.input} placeholder="음원 검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <div style={S.empty}>등록된 음원이 없습니다</div>
            ) : (
              filtered.map(t => renderTrackItem(t))
            )}
          </>
        );
      }

      if (subjectTab === "videos") {
        const videos = currentData?.[contentIssue]?.[contentStep] || [];
        return (
          <>
            <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setContentStep(null)}>
              {Icons.back} <span style={S.backText}>{contentIssue}호 · {stepLabel?.label}</span>
            </button>
            {videos.length === 0 ? (
              <div style={S.empty}>등록된 영상이 없습니다</div>
            ) : (
              videos.map(v => renderVideoCard(v, "#111"))
            )}
          </>
        );
      }

      if (subjectTab === "plans") {
        const plan = plansData?.monthly?.[contentIssue]?.[contentStep];
        return (
          <>
            <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setContentStep(null)}>
              {Icons.back} <span style={S.backText}>{contentIssue}호 · {stepLabel?.label}</span>
            </button>
            {plan ? (
              renderPlanCard(plan, `${contentIssue}호 · ${stepLabel?.label} · ${stepLabel?.age}`)
            ) : (
              <div style={S.empty}>등록된 계획안이 없습니다</div>
            )}
          </>
        );
      }
    };

    // Render plans tab with monthly/yearly toggle
    const renderPlansTab = () => {
      if (!plansData) return <div style={S.empty}>등록된 계획안이 없습니다</div>;

      return (
        <>
          <div style={S.pillWrap}>
            <button style={S.pill(planType === "monthly")} onClick={() => { setPlanType("monthly"); setContentIssue(null); setContentStep(null); }}>월간계획안</button>
            <button style={S.pill(planType === "yearly")} onClick={() => { setPlanType("yearly"); setContentIssue(null); setContentStep(null); }}>연간계획안</button>
          </div>

          {planType === "yearly" && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>연령 선택</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                {STEPS.map(step => {
                  const plan = plansData.yearly?.[step.id];
                  return (
                    <button key={step.id} style={{ ...S.subjectBtn(false), opacity: plan ? 1 : 0.35, cursor: plan ? "pointer" : "default" }} onClick={() => plan && setContentStep(step.id)} disabled={!plan}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>{step.label}</span>
                      <span style={{ fontSize: 9, color: "#999" }}>{step.age}</span>
                    </button>
                  );
                })}
              </div>
              {contentStep && plansData.yearly?.[contentStep] && (
                renderPlanCard(plansData.yearly[contentStep], `${STEPS.find(s => s.id === contentStep)?.label} · ${STEPS.find(s => s.id === contentStep)?.age}`)
              )}
            </>
          )}

          {planType === "monthly" && !contentIssue && renderIssueGrid()}
          {planType === "monthly" && contentIssue && !contentStep && renderStepGrid()}
          {planType === "monthly" && contentIssue && contentStep && renderContentList()}
        </>
      );
    };

    // Determine what to show for tracks/videos tabs
    const renderContentTab = () => {
      if (!currentData) return <div style={S.empty}>{subjectTab === "tracks" ? "등록된 음원이 없습니다" : "등록된 영상이 없습니다"}</div>;
      if (!contentIssue) return renderIssueGrid();
      if (!contentStep) return renderStepGrid();
      return renderContentList();
    };

    return (
      <div style={S.section}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 32 }}>{programInfo?.icon || subj.icon}</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{programInfo ? programInfo.name : subj.name}</div>
            {programInfo && <div style={{ fontSize: 11, color: "#999" }}>{subj.name}</div>}
            {!programInfo && subj.parent && <div style={{ fontSize: 11, color: "#999" }}>{subj.parent}</div>}
          </div>
        </div>

        {/* Tabs */}
        <div style={S.pillWrap}>
          {["tracks", "videos", "plans"].map(tab => (
            <button key={tab} style={S.pill(subjectTab === tab)} onClick={() => { setSubjectTab(tab); setContentIssue(null); setContentStep(null); setPlanType("monthly"); setSearchTerm(""); }}>
              {tab === "tracks" ? "음원" : tab === "videos" ? "영상" : "계획안"}
            </button>
          ))}
        </div>

        {subjectTab === "plans" ? renderPlansTab() : renderContentTab()}
      </div>
    );
  };

  const renderFavorites = () => {
    // Get subjects that have playlists
    const playlistSubjects = Object.entries(playlists).filter(([_, ids]) => ids.length > 0);
    const allFavIds = Object.values(playlists).flat();

    // Get tracks for current filter
    const getFilteredTracks = () => {
      if (favSubjectFilter === "all") {
        // Show all, grouped by subject order in playlists
        const result = [];
        playlistSubjects.forEach(([subj, ids]) => {
          ids.forEach(id => {
            const trk = allTracksFlat.find(t => t.id === id);
            if (trk) result.push({ ...trk, playlistSubject: subj });
          });
        });
        return result;
      }
      const ids = playlists[favSubjectFilter] || [];
      return ids.map(id => allTracksFlat.find(t => t.id === id)).filter(Boolean).map(t => ({ ...t, playlistSubject: favSubjectFilter }));
    };

    const filteredTracks = getFilteredTracks();

    return (
      <div style={S.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={S.sectionTitle}>즐겨찾기</div>
          {filteredTracks.length > 0 && (
            <button
              style={{ ...S.btn(reorderMode ? "primary" : "outline"), fontSize: 11, padding: "5px 12px" }}
              onClick={() => setReorderMode(!reorderMode)}
            >
              {reorderMode ? "완료" : "순서 편집"}
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 16, fontWeight: 500 }}>
          과목별 플레이리스트로 수업 음원을 관리하세요
        </div>

        {allFavIds.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>★</div>
            즐겨찾기한 음원이 없습니다<br/>
            <span style={{ fontSize: 12 }}>음원 목록에서 ♡ 를 눌러 추가하세요</span>
          </div>
        ) : (
          <>
            {/* Subject filter pills */}
            <div style={{ ...S.pillWrap, marginBottom: 16 }}>
              <button style={S.pill(favSubjectFilter === "all")} onClick={() => setFavSubjectFilter("all")}>
                전체 ({allFavIds.length})
              </button>
              {playlistSubjects.map(([subj, ids]) => {
                const s = SUBJECTS.find(x => x.id === subj);
                return (
                  <button key={subj} style={S.pill(favSubjectFilter === subj)} onClick={() => setFavSubjectFilter(subj)}>
                    {s?.icon} {s?.name} ({ids.length})
                  </button>
                );
              })}
            </div>

            {/* Play all */}
            {filteredTracks.length > 0 && !reorderMode && (
              <button style={{ ...S.btn("primary"), width: "100%", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0" }} onClick={() => playTrack(filteredTracks[0])}>
                {Icons.play} 전체 재생 ({filteredTracks.length}곡)
              </button>
            )}

            {/* Track list with reorder */}
            {favSubjectFilter !== "all" && reorderMode ? (
              // Reorder mode for specific subject
              (playlists[favSubjectFilter] || []).map((trackId, idx) => {
                const track = allTracksFlat.find(t => t.id === trackId);
                if (!track) return null;
                const isFirst = idx === 0;
                const isLast = idx === (playlists[favSubjectFilter]?.length || 0) - 1;
                return (
                  <div key={track.id} style={{ ...S.trackItem(false), justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#999", width: 20, textAlign: "center", flexShrink: 0 }}>{idx + 1}</span>
                      <div style={S.trackInfo}>
                        <div style={S.trackTitle}>{track.title}</div>
                        <div style={S.trackDuration(false)}>{track.duration}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                      <button
                        style={{ ...S.btn("sm"), padding: "6px 8px", fontSize: 14, opacity: isFirst ? 0.3 : 1, background: "transparent", lineHeight: 1 }}
                        onClick={() => !isFirst && moveTrackInPlaylist(favSubjectFilter, trackId, -1)}
                        disabled={isFirst}
                      >↑</button>
                      <button
                        style={{ ...S.btn("sm"), padding: "6px 8px", fontSize: 14, opacity: isLast ? 0.3 : 1, background: "transparent", lineHeight: 1 }}
                        onClick={() => !isLast && moveTrackInPlaylist(favSubjectFilter, trackId, 1)}
                        disabled={isLast}
                      >↓</button>
                      <button
                        style={{ ...S.btn("sm"), padding: "6px 8px", fontSize: 12, background: "#fee2e2", color: "#dc2626", lineHeight: 1 }}
                        onClick={() => toggleFav(trackId, favSubjectFilter)}
                      >{Icons.close}</button>
                    </div>
                  </div>
                );
              })
            ) : reorderMode && favSubjectFilter === "all" ? (
              <div style={{ ...S.empty, padding: "20px" }}>
                순서를 편집하려면 과목을 선택해주세요
              </div>
            ) : (
              // Normal play mode
              filteredTracks.map((t, idx) => {
                const playing = playingTrack?.id === t.id && isPlaying;
                const active = playingTrack?.id === t.id;
                const showHeader = favSubjectFilter === "all" && (idx === 0 || t.playlistSubject !== filteredTracks[idx - 1]?.playlistSubject);
                const subjInfo = SUBJECTS.find(s => s.id === t.playlistSubject);
                return (
                  <div key={t.id + "-" + idx}>
                    {showHeader && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: idx > 0 ? 16 : 0, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{subjInfo?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{subjInfo?.name}</span>
                        <span style={{ fontSize: 11, color: "#999" }}>({(playlists[t.playlistSubject] || []).length}곡)</span>
                      </div>
                    )}
                    <div style={S.trackItem(active)}>
                      <button style={S.trackPlay(active)} onClick={() => playTrack(t)}>
                        {playing ? Icons.pause : Icons.play}
                      </button>
                      <div style={S.trackInfo} onClick={() => playTrack(t)}>
                        <div style={S.trackTitle}>{t.title}</div>
                        <div style={S.trackDuration(active)}>{t.duration}</div>
                      </div>
                      <button style={S.favBtn(true, active)} onClick={() => toggleFav(t.id)}>
                        {Icons.heart}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    );
  };

  // Shared content renderer for events/sub-events
  const renderEventContent = (source, color) => (
    <>
      <div style={{ ...S.pillWrap, marginTop: 4 }}>
        {["tracks", "videos", "plans"].map(tab => (
          <button key={tab} style={S.pill(eventTab === tab)} onClick={() => setEventTab(tab)}>
            {tab === "tracks" ? `음원 (${source.tracks?.length || 0})` : tab === "videos" ? `영상 (${source.videos?.length || 0})` : `계획안 (${source.plans?.length || 0})`}
          </button>
        ))}
      </div>

      {eventTab === "tracks" && (
        !(source.tracks?.length) ? <div style={S.empty}>등록된 음원이 없습니다</div> :
        source.tracks.map(t => {
          const playing = playingTrack?.id === t.id && isPlaying;
          const active = playingTrack?.id === t.id;
          const dlState = isDownloaded(t.id) ? "done" : isDownloading(t.id) ? "loading" : "none";
          return (
            <div key={t.id} style={S.trackItem(active)}>
              <button style={S.trackPlay(active)} onClick={() => playTrack(t)}>{playing ? Icons.pause : Icons.play}</button>
              <div style={S.trackInfo} onClick={() => playTrack(t)}>
                <div style={S.trackTitle}>{t.title}</div>
                <div style={S.trackDuration(active)}>{t.duration}{dlState === "done" && " · 오프라인"}</div>
              </div>
              <button style={{ ...touch44, background: "none", border: "none", fontSize: 16, cursor: dlState === "done" ? "default" : "pointer", color: dlState === "done" ? (active ? "rgba(255,255,255,0.8)" : "#22c55e") : dlState === "loading" ? (active ? "rgba(255,255,255,0.5)" : "#f59e0b") : (active ? "rgba(255,255,255,0.3)" : "#ccc"), flexShrink: 0 }} onClick={() => handleDownload(t.id)}>
                {dlState === "done" ? "✓" : dlState === "loading" ? <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 14 }}>⟳</span> : "↓"}
              </button>
              <button style={{ ...S.favBtn(favorites.includes(t.id), active), flexShrink: 0 }} onClick={() => toggleFav(t.id)}>
                {favorites.includes(t.id) ? Icons.heart : Icons.heartEmpty}
              </button>
            </div>
          );
        })
      )}

      {eventTab === "videos" && (
        !(source.videos?.length) ? <div style={S.empty}>등록된 영상이 없습니다</div> :
        source.videos.map(v => renderVideoCard(v, color))
      )}

      {eventTab === "plans" && (
        !(source.plans?.length) ? <div style={S.empty}>등록된 계획안이 없습니다</div> :
        source.plans.map(p => renderPlanCard(p, ""))
      )}
    </>
  );

  const renderRecent = () => (
    <div style={S.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={S.sectionTitle}>최근 재생</div>
        {recentHistory.length > 0 && (
          <button style={{ ...S.btn("sm"), fontSize: 11, background: "#fee2e2", color: "#dc2626" }} onClick={() => setRecentHistory([])}>기록 삭제</button>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 16, fontWeight: 500 }}>
        최근 재생한 음원이 시간순으로 표시됩니다
      </div>
      {recentHistory.length === 0 ? (
        <div style={S.empty}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🕐</div>
          재생 기록이 없습니다<br/>
          <span style={{ fontSize: 12 }}>음원을 재생하면 여기에 기록됩니다</span>
        </div>
      ) : (
        recentHistory.map((item, idx) => {
          const t = item.track;
          const playing = playingTrack?.id === t.id && isPlaying;
          const active = playingTrack?.id === t.id;
          return (
            <div key={t.id + "-" + idx} style={{ ...S.trackItem(active), position: "relative" }}>
              <button style={S.trackPlay(active)} onClick={() => playTrack(t)}>
                {playing ? Icons.pause : Icons.play}
              </button>
              <div style={S.trackInfo} onClick={() => playTrack(t)}>
                <div style={S.trackTitle}>{t.title}</div>
                <div style={S.trackDuration(active)}>
                  {t.subject && <span>{SUBJECTS.find(s => s.id === t.subject)?.name} · </span>}
                  {t.duration} · {item.timestamp}
                </div>
              </div>
              <button style={{ ...S.favBtn(favorites.includes(t.id), active), flexShrink: 0 }} onClick={() => toggleFav(t.id, t.subject)}>
                {favorites.includes(t.id) ? Icons.heart : Icons.heartEmpty}
              </button>
            </div>
          );
        })
      )}
    </div>
  );

  const renderEvents = () => {
    // Level 3: Sub-event content view
    if (selectedEvent && selectedSubEvent) {
      const ev = selectedEvent;
      const sub = selectedSubEvent;
      return (
        <div style={{ ...S.section, padding: 0, paddingBottom: 100 }}>
          <div style={{
            background: ev.themeBg || "#111", padding: "28px 24px 22px", position: "relative",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 44, filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.2))" }}>{sub.emoji}</span>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{ev.title}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>{sub.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{sub.desc}</div>
            </div>
          </div>
          <div style={{ padding: "16px 20px 0" }}>
            {renderEventContent(sub, ev.themeColor)}
          </div>
        </div>
      );
    }

    // Level 2: Event detail view (sub-events list OR direct content)
    if (selectedEvent) {
      const ev = selectedEvent;
      const hasSubEvents = ev.subEvents && ev.subEvents.length > 0;

      return (
        <div style={{ ...S.section, padding: 0, paddingBottom: 100 }}>
          {/* Theme banner */}
          <div style={{
            background: ev.themeBg || "#111", padding: "40px 24px 28px", position: "relative",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          }}>
            <div style={{ fontSize: 56, marginBottom: 12, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>{ev.themeEmoji}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{ev.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>{ev.date}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, maxWidth: 300 }}>{ev.desc}</div>
            {hasSubEvents && (
              <div style={{ marginTop: 10, padding: "4px 14px", background: "rgba(255,255,255,0.15)", borderRadius: 20, fontSize: 11, color: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)" }}>
                {ev.subEvents.length}개 세부 행사
              </div>
            )}
          </div>

          <div style={{ padding: "16px 20px 0" }}>
            {hasSubEvents ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>세부 행사</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {ev.subEvents.map((sub, idx) => {
                    const totalContent = (sub.tracks?.length || 0) + (sub.videos?.length || 0) + (sub.plans?.length || 0);
                    return (
                      <button key={sub.id} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        padding: "16px 8px 12px", background: "#fafafa", border: "1px solid #eee",
                        borderRadius: 14, cursor: "pointer", fontFamily: font, transition: "all 0.2s",
                      }} onClick={() => { setSelectedSubEvent(sub); setEventTab("tracks"); }}>
                        <span style={{ fontSize: 28 }}>{sub.emoji}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, textAlign: "center", lineHeight: 1.3 }}>{sub.title}</span>
                        <span style={{ fontSize: 9, color: "#999" }}>{totalContent}개 자료</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              renderEventContent(ev, ev.themeColor)
            )}
          </div>
        </div>
      );
    }

    // Level 1: Event list view
    return (
      <div style={S.section}>
        <div style={S.sectionTitle}>과목별 행사</div>
        {SUBJECTS.map(subj => {
          const evts = events[subj.id] || [];
          if (evts.length === 0) return null;
          return (
            <div key={subj.id} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{subj.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{subj.name}</span>
              </div>
              {evts.map(ev => {
                const hasSubEvents = ev.subEvents && ev.subEvents.length > 0;
                const contentCount = hasSubEvents
                  ? ev.subEvents.length + "개 세부 행사"
                  : [(ev.tracks?.length || 0) + "곡", (ev.videos?.length || 0) + "영상", (ev.plans?.length || 0) + "계획안"].filter(x => !x.startsWith("0")).join(" · ");
                return (
                  <div key={ev.id} style={{ ...S.card, overflow: "hidden", padding: 0, cursor: "pointer" }} onClick={() => { setSelectedEvent(ev); setSelectedSubEvent(null); setEventTab("tracks"); }}>
                    <div style={{ background: ev.themeBg || "#111", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 32, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" }}>{ev.themeEmoji}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{ev.date}</div>
                      </div>
                    </div>
                    <div style={{ padding: "10px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, color: "#666" }}>{ev.desc}</div>
                      <div style={{ fontSize: 10, color: "#999", flexShrink: 0, marginLeft: 10 }}>{contentCount}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const ADMIN_PASSWORD = "wollim2026";

  const handleAdminLogin = () => {
    if (adminPw === ADMIN_PASSWORD) {
      setAdminLoggedIn(true);
      setAdminPwError(false);
      setAdminTab("dashboard");
    } else {
      setAdminPwError(true);
    }
  };

  // Admin: get content list for current filters
  const getAdminContentList = () => {
    const src = adminContentType === "track" ? SAMPLE_TRACKS : adminContentType === "video" ? SAMPLE_VIDEOS : null;
    if (!src || !src[adminContentSubject]) return [];
    if (!adminContentIssue) return [];
    if (!adminContentStep) return [];
    const subjData = src[adminContentSubject];
    const hasPrograms = PROGRAMS[adminContentSubject];
    if (hasPrograms && adminContentProgram) {
      const items = subjData?.[adminContentProgram]?.[adminContentIssue]?.[adminContentStep];
      return Array.isArray(items) ? items : [];
    } else if (!hasPrograms) {
      const items = subjData?.[adminContentIssue]?.[adminContentStep];
      return Array.isArray(items) ? items : [];
    }
    return [];
  };

  // Admin: get events for subject
  const getAdminEvents = () => SAMPLE_EVENTS[adminEventSubject] || [];

  // Admin: count all content for a subject (handles program-nested structure)
  const countSubjectContent = (subjId) => {
    let count = 0;
    const hasPrograms = PROGRAMS[subjId];

    [SAMPLE_TRACKS, SAMPLE_VIDEOS].forEach(src => {
      const subjData = src[subjId];
      if (!subjData) return;
      if (hasPrograms) {
        // program -> issue -> step -> array
        Object.values(subjData).forEach(progData => {
          if (!progData || typeof progData !== "object") return;
          Object.values(progData).forEach(issue => {
            if (!issue || typeof issue !== "object") return;
            Object.values(issue).forEach(stepArr => {
              count += Array.isArray(stepArr) ? stepArr.length : 0;
            });
          });
        });
      } else {
        // issue -> step -> array
        Object.values(subjData).forEach(issue => {
          if (!issue || typeof issue !== "object") return;
          Object.values(issue).forEach(stepArr => {
            count += Array.isArray(stepArr) ? stepArr.length : 0;
          });
        });
      }
    });

    const plansSubj = SAMPLE_PLANS[subjId];
    if (plansSubj) {
      if (hasPrograms) {
        // program -> monthly/yearly
        Object.values(plansSubj).forEach(progPlans => {
          if (progPlans?.monthly) Object.values(progPlans.monthly).forEach(issue => { count += Object.keys(issue).length; });
          if (progPlans?.yearly) count += Object.keys(progPlans.yearly).length;
        });
      } else {
        if (plansSubj?.monthly) Object.values(plansSubj.monthly).forEach(issue => { count += Object.keys(issue).length; });
        if (plansSubj?.yearly) count += Object.keys(plansSubj.yearly).length;
      }
    }

    return count;
  };

  const renderAdminLogin = () => (
    <div style={{ ...S.section, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, background: "#111", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#fff", fontSize: 28 }}>
          {Icons.admin}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>관리자 로그인</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 28 }}>관리자 비밀번호를 입력해주세요</div>
        <input
          style={{ ...S.input, textAlign: "center", fontSize: 16, padding: "14px", letterSpacing: 4, border: adminPwError ? "1.5px solid #dc2626" : "1.5px solid #ddd" }}
          type="password"
          placeholder="••••••••"
          value={adminPw}
          onChange={e => { setAdminPw(e.target.value); setAdminPwError(false); }}
          onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
        />
        {adminPwError && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4, marginBottom: 8 }}>비밀번호가 올바르지 않습니다</div>}
        <button style={{ ...S.btn("primary"), width: "100%", padding: "14px 0", marginTop: 8, fontSize: 14 }} onClick={handleAdminLogin}>로그인</button>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (!adminLoggedIn) return renderAdminLogin();

    return (
      <div style={S.section}>
        {/* Admin nav tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { id: "dashboard", label: "대시보드" },
            { id: "notice", label: "공지사항" },
            { id: "content", label: "콘텐츠" },
            { id: "event", label: "행사" },
            { id: "users", label: "사용자" },
            { id: "stats", label: "통계" },
          ].map(tab => (
            <button key={tab.id} style={S.pill(adminTab === tab.id)} onClick={() => { setAdminTab(tab.id); setAdminContentIssue(null); setAdminContentStep(null); setAdminContentProgram(null); }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Dashboard ── */}
        {adminTab === "dashboard" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>관리자 대시보드</div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>울림교육 앱 콘텐츠를 관리합니다</div>

            {/* Stats cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "공지사항", value: notices.length, icon: "📢" },
                { label: "과목 수", value: SUBJECTS.length, icon: "📚" },
                { label: "승인 사용자", value: registeredUsers.filter(u => u.status === "approved").length, icon: "👤" },
                { label: "승인 대기", value: registeredUsers.filter(u => u.status === "pending").length, icon: "⏳" },
              ].map((stat, i) => (
                <div key={i} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{stat.icon}</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content overview per subject */}
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>과목별 콘텐츠 현황</div>
            {SUBJECTS.map(subj => (
              <div key={subj.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{subj.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{subj.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#999" }}>{countSubjectContent(subj.id)}개</span>
                  <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }} onClick={() => { setAdminTab("content"); setAdminContentSubject(subj.id); }}>관리</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Notice Management ── */}
        {adminTab === "notice" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>공지사항 관리</div>
              <span style={{ fontSize: 12, color: "#999" }}>{notices.length}건</span>
            </div>

            <div style={{ ...S.card, background: "#fff", border: "1.5px solid #111", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>새 공지사항 등록</div>
              <input style={S.input} placeholder="제목" value={newNotice.title} onChange={e => setNewNotice(n => ({ ...n, title: e.target.value }))} />
              <textarea style={S.textarea} placeholder="내용을 입력하세요" value={newNotice.content} onChange={e => setNewNotice(n => ({ ...n, content: e.target.value }))} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <input type="checkbox" checked={newNotice.pinned} onChange={e => setNewNotice(n => ({ ...n, pinned: e.target.checked }))} />
                  상단 고정
                </label>
                <button style={S.btn("primary")} onClick={() => {
                  if (newNotice.title && newNotice.content) {
                    setNotices(ns => [{ id: Date.now(), title: newNotice.title, content: newNotice.content, date: new Date().toISOString().split("T")[0], pinned: newNotice.pinned }, ...ns]);
                    setNewNotice({ title: "", content: "", pinned: false });
                  }
                }}>등록</button>
              </div>
            </div>

            {notices.map(n => (
              <div key={n.id} style={{ ...S.card, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {n.pinned && <span style={S.pinBadge}>고정</span>}
                      <span style={S.cardTitle}>{n.title}</span>
                    </div>
                    <div style={S.cardMeta}>{n.date}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.content}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 10, flexShrink: 0 }}>
                    <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }} onClick={() => {
                      setNotices(ns => ns.map(x => x.id === n.id ? { ...x, pinned: !x.pinned } : x));
                    }}>{n.pinned ? "고정해제" : "고정"}</button>
                    <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }} onClick={() => setNotices(ns => ns.filter(x => x.id !== n.id))}>삭제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Content Management ── */}
        {adminTab === "content" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>콘텐츠 관리</div>

            {/* Subject selector */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>과목</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {SUBJECTS.map(s => (
                  <button key={s.id} style={S.pill(adminContentSubject === s.id)} onClick={() => { setAdminContentSubject(s.id); setAdminContentProgram(null); setAdminContentIssue(null); setAdminContentStep(null); }}>
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Program selector (if subject has programs) */}
            {PROGRAMS[adminContentSubject] && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>프로그램</div>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                  {PROGRAMS[adminContentSubject].map(prog => (
                    <button key={prog.id} style={S.pill(adminContentProgram === prog.id)} onClick={() => { setAdminContentProgram(prog.id); setAdminContentIssue(null); setAdminContentStep(null); }}>
                      {prog.icon} {prog.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type selector */}
            {(!PROGRAMS[adminContentSubject] || adminContentProgram) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>유형</div>
                <div style={S.pillWrap}>
                  {[{ id: "track", label: "음원" }, { id: "video", label: "영상" }, { id: "plan", label: "계획안" }].map(t => (
                    <button key={t.id} style={S.pill(adminContentType === t.id)} onClick={() => { setAdminContentType(t.id); setAdminContentIssue(null); setAdminContentStep(null); }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show "select program" message if needed */}
            {PROGRAMS[adminContentSubject] && !adminContentProgram && (
              <div style={S.empty}>프로그램을 선택해주세요</div>
            )}

            {(!PROGRAMS[adminContentSubject] || adminContentProgram) && (
              <>
                <div style={S.divider} />

                {/* Issue grid */}
                {!adminContentIssue && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>호수 선택</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {ISSUES.map(issue => {
                        const hasProgs = PROGRAMS[adminContentSubject];
                        const progKey = adminContentProgram;
                        let has = false;
                        if (adminContentType === "plan") {
                          const p = SAMPLE_PLANS[adminContentSubject];
                          if (hasProgs && progKey) { has = !!p?.[progKey]?.monthly?.[issue.id]; }
                          else { has = !!p?.monthly?.[issue.id]; }
                        } else {
                          const d = adminContentType === "track" ? SAMPLE_TRACKS : SAMPLE_VIDEOS;
                          const subjData = d[adminContentSubject];
                          if (hasProgs && progKey) { has = !!subjData?.[progKey]?.[issue.id]; }
                          else { has = !!subjData?.[issue.id]; }
                        }
                        return (
                          <button key={issue.id} style={{ ...S.subjectBtn(adminContentIssue === issue.id), position: "relative" }} onClick={() => setAdminContentIssue(issue.id)}>
                            <span style={{ fontSize: 14, fontWeight: 800 }}>{issue.id}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: adminContentIssue === issue.id ? "#fff" : "#888" }}>{issue.label}</span>
                            {has && <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Step grid */}
                {adminContentIssue && !adminContentStep && (
                  <>
                    <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setAdminContentIssue(null)}>
                      {Icons.back} <span style={S.backText}>{adminContentIssue}호</span>
                    </button>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>연령 선택</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {STEPS.map(step => {
                        const hasProgs = PROGRAMS[adminContentSubject];
                        const progKey = adminContentProgram;
                        let has = false;
                        if (adminContentType === "plan") {
                          const p = SAMPLE_PLANS[adminContentSubject];
                          if (hasProgs && progKey) { has = !!p?.[progKey]?.monthly?.[adminContentIssue]?.[step.id]; }
                          else { has = !!p?.monthly?.[adminContentIssue]?.[step.id]; }
                        } else {
                          const d = adminContentType === "track" ? SAMPLE_TRACKS : SAMPLE_VIDEOS;
                          const subjData = d[adminContentSubject];
                          if (hasProgs && progKey) { has = !!(subjData?.[progKey]?.[adminContentIssue]?.[step.id]?.length); }
                          else { has = !!(subjData?.[adminContentIssue]?.[step.id]?.length); }
                        }
                        return (
                          <button key={step.id} style={{ ...S.subjectBtn(false), position: "relative" }} onClick={() => setAdminContentStep(step.id)}>
                            <span style={{ fontSize: 12, fontWeight: 800 }}>{step.label}</span>
                            <span style={{ fontSize: 9, color: "#999" }}>{step.age}</span>
                            {has && <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />}
                          </button>
                        );
                  })}
                </div>
              </>
            )}

            {/* Content list with CRUD */}
            {adminContentIssue && adminContentStep && (
              <>
                <button style={{ ...S.backBtn, marginBottom: 12 }} onClick={() => setAdminContentStep(null)}>
                  {Icons.back} <span style={S.backText}>{adminContentIssue}호 · {STEPS.find(s => s.id === adminContentStep)?.label}</span>
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {adminContentType === "track" ? "음원" : adminContentType === "video" ? "영상" : "계획안"} 목록
                  </div>
                  <button style={S.btn("primary")} onClick={() => setAdminEditItem({ id: `new_${Date.now()}`, title: "", duration: "", isNew: true, file: null })}>
                    {Icons.add} 개별 추가
                  </button>
                </div>

                {/* Bulk drag-and-drop upload zone */}
                <div
                  style={{
                    padding: dragOver ? "28px 16px" : "24px 16px", background: dragOver ? "#f0fdf4" : "#fafafa",
                    border: dragOver ? "2px dashed #22c55e" : "2px dashed #ddd", borderRadius: 14,
                    textAlign: "center", marginBottom: 16, transition: "all 0.2s", cursor: "pointer",
                  }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const files = Array.from(e.dataTransfer.files);
                    const newBulk = files.map((f, i) => ({
                      id: `bulk_${Date.now()}_${i}`,
                      file: { name: f.name, size: f.size, type: f.type },
                      fileUrl: URL.createObjectURL(f),
                      title: f.name.replace(/\.[^/.]+$/, ""),
                      duration: "",
                    }));
                    setBulkFiles(prev => [...prev, ...newBulk]);
                  }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = adminContentType === "track" ? "audio/*" : adminContentType === "video" ? "video/*" : ".pdf,.hwp,.doc,.docx";
                    input.onchange = (e) => {
                      const files = Array.from(e.target.files);
                      const newBulk = files.map((f, i) => ({
                        id: `bulk_${Date.now()}_${i}`,
                        file: { name: f.name, size: f.size, type: f.type },
                        fileUrl: URL.createObjectURL(f),
                        title: f.name.replace(/\.[^/.]+$/, ""),
                        duration: "",
                      }));
                      setBulkFiles(prev => [...prev, ...newBulk]);
                    };
                    input.click();
                  }}
                >
                  <span style={{ fontSize: 32, color: dragOver ? "#22c55e" : "#ccc" }}>↑</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: dragOver ? "#22c55e" : "#888", marginTop: 6 }}>
                    파일을 여기에 드래그하거나 터치하세요
                  </div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>여러 파일을 한번에 올릴 수 있습니다</div>
                </div>

                {/* Bulk file staging list */}
                {bulkFiles.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>대기 중인 파일 ({bulkFiles.length}개)</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11 }} onClick={() => setBulkFiles([])}>전체 삭제</button>
                        <button style={S.btn("primary")} onClick={() => {
                          const prog = adminContentProgram;
                          const hasProgs = PROGRAMS[adminContentSubject];
                          bulkFiles.forEach((bf, idx) => {
                            const itemId = bf.id;
                            const subj = adminContentSubject;
                            const issue = adminContentIssue;
                            const step = adminContentStep;
                            setAdminUploadedFiles(uf => ({ ...uf, [itemId]: { ...bf.file, url: bf.fileUrl, title: bf.title, duration: bf.duration, contentType: adminContentType, subject: subj, program: prog, issue, step, uploadDate: new Date().toISOString().split("T")[0] } }));
                            if (adminContentType === "track") {
                              setTracks(prev => {
                                const u = JSON.parse(JSON.stringify(prev));
                                if (hasProgs && prog) {
                                  if (!u[subj]) u[subj] = {}; if (!u[subj][prog]) u[subj][prog] = {}; if (!u[subj][prog][issue]) u[subj][prog][issue] = {}; if (!u[subj][prog][issue][step]) u[subj][prog][issue][step] = [];
                                  u[subj][prog][issue][step] = [...u[subj][prog][issue][step], { id: itemId, title: bf.title, duration: bf.duration || "0:00", fileUrl: bf.fileUrl }];
                                } else {
                                  if (!u[subj]) u[subj] = {}; if (!u[subj][issue]) u[subj][issue] = {}; if (!u[subj][issue][step]) u[subj][issue][step] = [];
                                  u[subj][issue][step] = [...u[subj][issue][step], { id: itemId, title: bf.title, duration: bf.duration || "0:00", fileUrl: bf.fileUrl }];
                                }
                                return u;
                              });
                            } else if (adminContentType === "video") {
                              setVideos(prev => {
                                const u = JSON.parse(JSON.stringify(prev));
                                if (hasProgs && prog) {
                                  if (!u[subj]) u[subj] = {}; if (!u[subj][prog]) u[subj][prog] = {}; if (!u[subj][prog][issue]) u[subj][prog][issue] = {}; if (!u[subj][prog][issue][step]) u[subj][prog][issue][step] = [];
                                  u[subj][prog][issue][step] = [...u[subj][prog][issue][step], { id: itemId, title: bf.title, duration: bf.duration || "0:00", fileUrl: bf.fileUrl }];
                                } else {
                                  if (!u[subj]) u[subj] = {}; if (!u[subj][issue]) u[subj][issue] = {}; if (!u[subj][issue][step]) u[subj][issue][step] = [];
                                  u[subj][issue][step] = [...u[subj][issue][step], { id: itemId, title: bf.title, duration: bf.duration || "0:00", fileUrl: bf.fileUrl }];
                                }
                                return u;
                              });
                            } else if (adminContentType === "plan") {
                              setPlans(prev => {
                                const u = JSON.parse(JSON.stringify(prev));
                                if (hasProgs && prog) {
                                  if (!u[subj]) u[subj] = {}; if (!u[subj][prog]) u[subj][prog] = {}; if (!u[subj][prog].monthly) u[subj][prog].monthly = {}; if (!u[subj][prog].monthly[issue]) u[subj][prog].monthly[issue] = {};
                                  u[subj][prog].monthly[issue][step] = { id: itemId, title: bf.title, fileUrl: bf.fileUrl };
                                } else {
                                  if (!u[subj]) u[subj] = {}; if (!u[subj].monthly) u[subj].monthly = {}; if (!u[subj].monthly[issue]) u[subj].monthly[issue] = {};
                                  u[subj].monthly[issue][step] = { id: itemId, title: bf.title, fileUrl: bf.fileUrl };
                                }
                                return u;
                              });
                            }
                          });
                          setBulkFiles([]);
                        }}>전체 업로드</button>
                      </div>
                    </div>
                    {bulkFiles.map((bf, idx) => (
                      <div key={bf.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, marginBottom: 6, padding: "10px 14px" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#999", width: 20, textAlign: "center" }}>{idx + 1}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <input style={{ ...S.input, marginBottom: 0, padding: "6px 10px", fontSize: 12 }} value={bf.title} onChange={e => { const v = e.target.value; setBulkFiles(bfs => bfs.map(b => b.id === bf.id ? { ...b, title: v } : b)); }} />
                          <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{bf.file.name} · {(bf.file.size / 1024 / 1024).toFixed(1)}MB</div>
                        </div>
                        {(adminContentType === "track" || adminContentType === "video") && (
                          <input style={{ ...S.input, width: 70, marginBottom: 0, padding: "6px 8px", fontSize: 11, textAlign: "center" }} placeholder="0:00" value={bf.duration} onChange={e => { const v = e.target.value; setBulkFiles(bfs => bfs.map(b => b.id === bf.id ? { ...b, duration: v } : b)); }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <button style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", padding: 2, opacity: idx === 0 ? 0.3 : 1 }} disabled={idx === 0} onClick={() => setBulkFiles(bfs => { const n = [...bfs]; [n[idx], n[idx - 1]] = [n[idx - 1], n[idx]]; return n; })}>↑</button>
                          <button style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", padding: 2, opacity: idx === bulkFiles.length - 1 ? 0.3 : 1 }} disabled={idx === bulkFiles.length - 1} onClick={() => setBulkFiles(bfs => { const n = [...bfs]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; })}>↓</button>
                        </div>
                        <button style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "#dc2626", padding: 4 }} onClick={() => setBulkFiles(bfs => bfs.filter(b => b.id !== bf.id))}>{Icons.close}</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add/Edit form with file upload */}
                {adminEditItem && (
                  <div style={{ ...S.card, border: "1.5px solid #111", marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{adminEditItem.isNew ? "새 항목 추가" : "항목 수정"}</div>
                    <input style={S.input} placeholder="제목" value={adminEditItem.title} onChange={e => setAdminEditItem(ei => ({ ...ei, title: e.target.value }))} />
                    {(adminContentType === "track" || adminContentType === "video") && (
                      <input style={S.input} placeholder="재생시간 (예: 2:30)" value={adminEditItem.duration || ""} onChange={e => setAdminEditItem(ei => ({ ...ei, duration: e.target.value }))} />
                    )}

                    {/* YouTube URL input for videos */}
                    {adminContentType === "video" && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>YouTube 링크 (선택사항)</div>
                        <input style={S.input} placeholder="https://www.youtube.com/watch?v=..." value={adminEditItem.youtubeUrl || ""} onChange={e => setAdminEditItem(ei => ({ ...ei, youtubeUrl: e.target.value }))} />
                        {adminEditItem.youtubeUrl && getYoutubeId(adminEditItem.youtubeUrl) && (
                          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                            <img src={`https://img.youtube.com/vi/${getYoutubeId(adminEditItem.youtubeUrl)}/mqdefault.jpg`} alt="미리보기" style={{ width: "100%", height: "auto", display: "block" }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* File upload area */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>
                        {adminContentType === "track" ? "음원 파일 (MP3, WAV)" : adminContentType === "video" ? "영상 파일 (MP4, MOV)" : "계획안 파일 (PDF, HWP, DOCX)"}
                      </div>
                      {adminEditItem.file ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#f0fdf4", border: "1.5px solid #22c55e", borderRadius: 10 }}>
                          <span style={{ fontSize: 20 }}>✓</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adminEditItem.file.name}</div>
                            <div style={{ fontSize: 10, color: "#999" }}>{(adminEditItem.file.size / 1024 / 1024).toFixed(1)}MB</div>
                          </div>
                          <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }} onClick={() => setAdminEditItem(ei => ({ ...ei, file: null, fileUrl: null }))}>삭제</button>
                        </div>
                      ) : (
                        <label style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                          padding: "24px 16px", background: "#fafafa", border: "2px dashed #ddd",
                          borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                        }}>
                          <span style={{ fontSize: 28, color: "#ccc" }}>↑</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#999" }}>파일을 선택하세요</span>
                          <span style={{ fontSize: 10, color: "#bbb" }}>
                            {adminContentType === "track" ? "MP3, WAV (최대 50MB)" : adminContentType === "video" ? "MP4, MOV (최대 500MB)" : "PDF, HWP, DOCX (최대 20MB)"}
                          </span>
                          <input
                            type="file"
                            style={{ display: "none" }}
                            accept={adminContentType === "track" ? "audio/*" : adminContentType === "video" ? "video/*" : ".pdf,.hwp,.doc,.docx"}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setAdminEditItem(ei => ({ ...ei, file: { name: file.name, size: file.size, type: file.type }, fileUrl: url }));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button style={S.btn("outline")} onClick={() => setAdminEditItem(null)}>취소</button>
                      <button style={S.btn("primary")} onClick={() => {
                        if (adminEditItem.title) {
                          const itemId = adminEditItem.id;
                          const subj = adminContentSubject;
                          const issue = adminContentIssue;
                          const step = adminContentStep;
                          const fileUrl = adminEditItem.fileUrl || null;

                          // Save uploaded file reference
                          if (adminEditItem.file) {
                            setAdminUploadedFiles(uf => ({
                              ...uf,
                              [itemId]: {
                                ...adminEditItem.file,
                                url: fileUrl,
                                title: adminEditItem.title,
                                duration: adminEditItem.duration,
                                contentType: adminContentType,
                                subject: subj,
                                issue: issue,
                                step: step,
                                uploadDate: new Date().toISOString().split("T")[0],
                              }
                            }));
                          }

                          // Inject into tracks/videos/plans so instructor view can see it
                          const prog = adminContentProgram;
                          const hasProgs = PROGRAMS[subj];

                          if (adminContentType === "track") {
                            setTracks(prev => {
                              const updated = JSON.parse(JSON.stringify(prev));
                              if (hasProgs && prog) {
                                if (!updated[subj]) updated[subj] = {};
                                if (!updated[subj][prog]) updated[subj][prog] = {};
                                if (!updated[subj][prog][issue]) updated[subj][prog][issue] = {};
                                if (!updated[subj][prog][issue][step]) updated[subj][prog][issue][step] = [];
                                updated[subj][prog][issue][step] = [...updated[subj][prog][issue][step], { id: itemId, title: adminEditItem.title, duration: adminEditItem.duration || "0:00", fileUrl }];
                              } else {
                                if (!updated[subj]) updated[subj] = {};
                                if (!updated[subj][issue]) updated[subj][issue] = {};
                                if (!updated[subj][issue][step]) updated[subj][issue][step] = [];
                                updated[subj][issue][step] = [...updated[subj][issue][step], { id: itemId, title: adminEditItem.title, duration: adminEditItem.duration || "0:00", fileUrl }];
                              }
                              return updated;
                            });
                          } else if (adminContentType === "video") {
                            setVideos(prev => {
                              const updated = JSON.parse(JSON.stringify(prev));
                              if (hasProgs && prog) {
                                if (!updated[subj]) updated[subj] = {};
                                if (!updated[subj][prog]) updated[subj][prog] = {};
                                if (!updated[subj][prog][issue]) updated[subj][prog][issue] = {};
                                if (!updated[subj][prog][issue][step]) updated[subj][prog][issue][step] = [];
                                updated[subj][prog][issue][step] = [...updated[subj][prog][issue][step], { id: itemId, title: adminEditItem.title, duration: adminEditItem.duration || "0:00", fileUrl, youtubeUrl: adminEditItem.youtubeUrl || "" }];
                              } else {
                                if (!updated[subj]) updated[subj] = {};
                                if (!updated[subj][issue]) updated[subj][issue] = {};
                                if (!updated[subj][issue][step]) updated[subj][issue][step] = [];
                                updated[subj][issue][step] = [...updated[subj][issue][step], { id: itemId, title: adminEditItem.title, duration: adminEditItem.duration || "0:00", fileUrl, youtubeUrl: adminEditItem.youtubeUrl || "" }];
                              }
                              return updated;
                            });
                          } else if (adminContentType === "plan") {
                            setPlans(prev => {
                              const updated = JSON.parse(JSON.stringify(prev));
                              if (hasProgs && prog) {
                                if (!updated[subj]) updated[subj] = {};
                                if (!updated[subj][prog]) updated[subj][prog] = {};
                                if (!updated[subj][prog].monthly) updated[subj][prog].monthly = {};
                                if (!updated[subj][prog].monthly[issue]) updated[subj][prog].monthly[issue] = {};
                                updated[subj][prog].monthly[issue][step] = { id: itemId, title: adminEditItem.title, fileUrl };
                              } else {
                                if (!updated[subj]) updated[subj] = {};
                                if (!updated[subj].monthly) updated[subj].monthly = {};
                                if (!updated[subj].monthly[issue]) updated[subj].monthly[issue] = {};
                                updated[subj].monthly[issue][step] = { id: itemId, title: adminEditItem.title, fileUrl };
                              }
                              return updated;
                            });
                          }

                          setAdminEditItem(null);
                        }
                      }}>{adminEditItem.isNew ? "업로드" : "저장"}</button>
                    </div>
                  </div>
                )}

                {/* Uploaded items for this location */}
                {(() => {
                  const uploadedHere = Object.entries(adminUploadedFiles).filter(([_, f]) =>
                    f.subject === adminContentSubject && f.issue === adminContentIssue && f.step === adminContentStep && f.contentType === adminContentType
                  );
                  if (uploadedHere.length > 0) return (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>업로드된 파일</div>
                      {uploadedHere.map(([id, f]) => (
                        <div key={id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "3px solid #22c55e" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={S.cardTitle}>{f.title}</div>
                            <div style={S.cardMeta}>
                              {f.name} · {(f.size / 1024 / 1024).toFixed(1)}MB
                              {f.duration && ` · ${f.duration}`}
                              {` · ${f.uploadDate}`}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            {f.url && adminContentType === "track" && (
                              <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }} onClick={() => {
                                const audio = new Audio(f.url);
                                audio.play();
                              }}>미리듣기</button>
                            )}
                            <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }} onClick={() => {
                              setAdminUploadedFiles(uf => { const n = { ...uf }; delete n[id]; return n; });
                            }}>삭제</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  return null;
                })()}

                {/* Existing sample items */}
                {adminContentType !== "plan" ? (
                  getAdminContentList().length === 0 && Object.entries(adminUploadedFiles).filter(([_, f]) => f.subject === adminContentSubject && f.issue === adminContentIssue && f.step === adminContentStep && f.contentType === adminContentType).length === 0 ? (
                    <div style={S.empty}>등록된 항목이 없습니다</div>
                  ) : (
                    getAdminContentList().map(item => (
                      <div key={item.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={S.cardTitle}>{item.title}</div>
                          {item.duration && <div style={S.cardMeta}>{item.duration}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }} onClick={() => setAdminEditItem({ ...item, isNew: false, file: null })}>수정</button>
                          <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }}>삭제</button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  (() => {
                    const plansSubj = SAMPLE_PLANS[adminContentSubject];
                    const hasProgs = PROGRAMS[adminContentSubject];
                    let plan = null;
                    if (hasProgs && adminContentProgram) {
                      plan = plansSubj?.[adminContentProgram]?.monthly?.[adminContentIssue]?.[adminContentStep];
                    } else if (!hasProgs) {
                      plan = plansSubj?.monthly?.[adminContentIssue]?.[adminContentStep];
                    }
                    const hasUploaded = Object.entries(adminUploadedFiles).filter(([_, f]) => f.subject === adminContentSubject && f.issue === adminContentIssue && f.step === adminContentStep && f.contentType === "plan").length > 0;
                    return plan ? (
                      <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={S.cardTitle}>{plan.title}</div>
                          <div style={S.cardMeta}>{adminContentIssue}호 · {STEPS.find(s => s.id === adminContentStep)?.label}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }}>수정</button>
                          <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }}>삭제</button>
                        </div>
                      </div>
                    ) : !hasUploaded ? (
                      <div style={S.empty}>등록된 계획안이 없습니다</div>
                    ) : null;
                  })()
                )}
              </>
            )}
            </>
            )}
          </div>
        )}

        {/* ── Event Management ── */}
        {adminTab === "event" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>행사 관리</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>과목</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {SUBJECTS.map(s => (
                  <button key={s.id} style={S.pill(adminEventSubject === s.id)} onClick={() => setAdminEventSubject(s.id)}>
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>등록된 행사</div>
              <button style={S.btn("primary")} onClick={() => setAdminEditItem({ id: null, title: "", date: "", desc: "", isNew: true })}>
                {Icons.add} 행사 추가
              </button>
            </div>

            {adminEditItem && (
              <div style={{ ...S.card, border: "1.5px solid #111", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{adminEditItem.isNew ? "새 행사 등록" : "행사 수정"}</div>
                <input style={S.input} placeholder="행사명" value={adminEditItem.title} onChange={e => setAdminEditItem(ei => ({ ...ei, title: e.target.value }))} />
                <input style={S.input} type="date" value={adminEditItem.date} onChange={e => setAdminEditItem(ei => ({ ...ei, date: e.target.value }))} />
                <textarea style={S.textarea} placeholder="행사 설명" value={adminEditItem.desc || ""} onChange={e => setAdminEditItem(ei => ({ ...ei, desc: e.target.value }))} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                  <button style={S.btn("outline")} onClick={() => setAdminEditItem(null)}>취소</button>
                  <button style={S.btn("primary")} onClick={() => { if (adminEditItem.title) setAdminEditItem(null); }}>{adminEditItem.isNew ? "등록" : "저장"}</button>
                </div>
              </div>
            )}

            {getAdminEvents().length === 0 ? (
              <div style={S.empty}>등록된 행사가 없습니다</div>
            ) : (
              getAdminEvents().map(ev => (
                <div key={ev.id} style={{ ...S.card, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={S.cardTitle}>{ev.title}</div>
                      <div style={S.cardMeta}>{ev.date}</div>
                      {ev.desc && <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{ev.desc}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10 }}>
                      <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }} onClick={() => setAdminEditItem({ ...ev, isNew: false })}>수정</button>
                      <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }}>삭제</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── User Management ── */}
        {adminTab === "users" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>사용자 관리</div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>강사 가입 승인 및 관리</div>

            {/* Pending approvals */}
            {(() => {
              const pending = registeredUsers.filter(u => u.status === "pending");
              if (pending.length === 0) return null;
              return (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    승인 대기 <span style={{ ...S.badge("#fee2e2"), color: "#dc2626" }}>{pending.length}</span>
                  </div>
                  {pending.map(user => (
                    <div key={user.id} style={{ ...S.card, borderLeft: "3px solid #f59e0b" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={S.cardTitle}>{user.name}</div>
                          <div style={S.cardMeta}>{user.phone} · {user.subject} · {user.date}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button style={{ ...S.btn("primary"), fontSize: 11, padding: "6px 14px" }} onClick={() => setRegisteredUsers(us => us.map(u => u.id === user.id ? { ...u, status: "approved" } : u))}>승인</button>
                          <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "6px 10px" }} onClick={() => setRegisteredUsers(us => us.map(u => u.id === user.id ? { ...u, status: "rejected" } : u))}>거절</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Approved users */}
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>승인된 사용자 ({registeredUsers.filter(u => u.status === "approved").length})</div>
            {registeredUsers.filter(u => u.status === "approved").map(user => (
              <div key={user.id} style={{ ...S.card, borderLeft: "3px solid #22c55e" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={S.cardTitle}>{user.name}</div>
                    <div style={S.cardMeta}>{user.phone} · {user.subject} · {user.date}</div>
                  </div>
                  <button style={{ ...S.btn("sm"), background: "#fee2e2", color: "#dc2626", fontSize: 11, padding: "4px 10px" }} onClick={() => setRegisteredUsers(us => us.map(u => u.id === user.id ? { ...u, status: "rejected" } : u))}>차단</button>
                </div>
              </div>
            ))}

            {/* Rejected/blocked users */}
            {registeredUsers.filter(u => u.status === "rejected").length > 0 && (
              <>
                <div style={{ ...S.divider }} />
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: "#999" }}>차단/거절된 사용자</div>
                {registeredUsers.filter(u => u.status === "rejected").map(user => (
                  <div key={user.id} style={{ ...S.card, opacity: 0.6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={S.cardTitle}>{user.name}</div>
                        <div style={S.cardMeta}>{user.phone} · {user.subject}</div>
                      </div>
                      <button style={{ ...S.btn("sm"), fontSize: 11, padding: "4px 10px" }} onClick={() => setRegisteredUsers(us => us.map(u => u.id === user.id ? { ...u, status: "approved" } : u))}>복구</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Statistics ── */}
        {adminTab === "stats" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>콘텐츠 활용 통계</div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>강사들의 콘텐츠 사용 현황을 확인합니다</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {[
                { label: "총 재생 수", value: Object.values(playCounts).reduce((a, b) => a + b, 0), icon: "▶" },
                { label: "재생된 곡", value: Object.keys(playCounts).length, icon: "♫" },
                { label: "다운로드", value: downloadedFiles.length, icon: "↓" },
              ].map((stat, i) => (
                <div key={i} style={{ ...S.card, textAlign: "center", padding: "16px 8px" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>인기 음원 TOP 10</div>
            {(() => {
              const sorted = Object.entries(playCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
              if (sorted.length === 0) return <div style={S.empty}>아직 재생 기록이 없습니다<br/><span style={{ fontSize: 11 }}>강사가 음원을 재생하면 여기에 기록됩니다</span></div>;
              const maxCount = sorted[0][1];
              return sorted.map(([trackId, count], idx) => {
                const track = allTracksFlat.find(t => t.id === trackId);
                const title = track?.title || adminUploadedFiles[trackId]?.title || trackId;
                const subj = track?.subject || adminUploadedFiles[trackId]?.subject;
                const subjName = SUBJECTS.find(s => s.id === subj)?.name || "";
                const pct = (count / maxCount) * 100;
                return (
                  <div key={trackId} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: idx < 3 ? "#111" : "#999", width: 24, textAlign: "center" }}>{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
                        <div style={{ fontSize: 10, color: "#999" }}>{subjName}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{count}회</span>
                    </div>
                    <div style={{ marginLeft: 34, height: 6, background: "#f5f5f5", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: idx === 0 ? "#111" : idx === 1 ? "#555" : idx === 2 ? "#999" : "#ccc", borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              });
            })()}

            <div style={S.divider} />
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>과목별 재생 현황</div>
            {(() => {
              const subjCounts = {};
              Object.entries(playCounts).forEach(([trackId, count]) => {
                const track = allTracksFlat.find(t => t.id === trackId);
                const subj = track?.subject || adminUploadedFiles[trackId]?.subject || "unknown";
                subjCounts[subj] = (subjCounts[subj] || 0) + count;
              });
              const totalPlays = Object.values(subjCounts).reduce((a, b) => a + b, 0) || 1;
              const sorted = Object.entries(subjCounts).sort((a, b) => b[1] - a[1]);
              if (sorted.length === 0) return <div style={S.empty}>아직 재생 기록이 없습니다</div>;
              return sorted.map(([subjId, count]) => {
                const subj = SUBJECTS.find(s => s.id === subjId);
                const pct = (count / totalPlays) * 100;
                return (
                  <div key={subjId} style={{ ...S.card, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{subj?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{subj?.name || subjId}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{count}회 ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ height: 8, background: "#f5f5f5", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#111", borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              });
            })()}

            <div style={S.divider} />
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>최근 다운로드된 파일</div>
            {downloadedFiles.length === 0 ? (
              <div style={S.empty}>다운로드된 파일이 없습니다</div>
            ) : (
              downloadedFiles.slice(-10).reverse().map(fileId => {
                const track = allTracksFlat.find(t => t.id === fileId);
                const uploaded = adminUploadedFiles[fileId];
                const title = track?.title || uploaded?.title || fileId;
                const subj = track?.subject || uploaded?.subject;
                return (
                  <div key={fileId} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
                    <span style={{ fontSize: 14, color: "#22c55e" }}>✓</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
                      <div style={{ fontSize: 10, color: "#999" }}>{SUBJECTS.find(s => s.id === subj)?.name || ""}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Modals ─────────────────────────────────────────────────────────────────

  // ─── YouTube Helper ────────────────────────────────────────────────────────
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Reusable video card component
  const renderVideoCard = (v, color) => {
    const ytId = getYoutubeId(v.youtubeUrl);
    return (
      <div key={v.id} style={{ ...S.card, cursor: v.youtubeUrl ? "pointer" : "default", overflow: "hidden", padding: 0 }} onClick={() => v.youtubeUrl && setPlayingVideo(v)}>
        {ytId && (
          <div style={{ width: "100%", height: 0, paddingBottom: "56.25%", position: "relative", background: "#000" }}>
            <img
              src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
              alt={v.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>▶</div>
            </div>
          </div>
        )}
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          {!ytId && (
            <div style={{ width: 48, height: 48, background: color || "#111", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, flexShrink: 0 }}>{Icons.video}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={S.cardTitle}>{v.title}</div>
            <div style={S.cardMeta}>
              {v.duration}
              {v.youtubeUrl && <span> · YouTube</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Video player modal
  const renderVideoPlayer = () => {
    if (!playingVideo) return null;
    const ytId = getYoutubeId(playingVideo.youtubeUrl);
    if (!ytId) return null;
    return (
      <div style={S.overlay} onClick={() => setPlayingVideo(null)}>
        <div style={{ background: "#000", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 480, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#111" }}>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playingVideo.title}</div>
            <button style={{ ...touch44, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", flexShrink: 0 }} onClick={() => setPlayingVideo(null)}>{Icons.close}</button>
          </div>
          <div style={{ width: "100%", height: 0, paddingBottom: "56.25%", position: "relative" }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title={playingVideo.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  };

  // ─── Plan/Document helpers ──────────────────────────────────────────────────
  const getFileType = (plan) => {
    if (!plan?.fileUrl) return "pdf"; // default
    const url = plan.fileUrl.toLowerCase();
    if (url.endsWith(".pptx") || url.endsWith(".ppt")) return "ppt";
    if (url.endsWith(".hwp")) return "hwp";
    if (url.endsWith(".docx") || url.endsWith(".doc")) return "docx";
    return "pdf";
  };

  const fileTypeLabel = { pdf: "PDF", ppt: "PPT", hwp: "HWP", docx: "DOCX" };
  const fileTypeColor = { pdf: "#dc2626", ppt: "#f59e0b", hwp: "#3b82f6", docx: "#6366f1" };

  const renderPlanCard = (plan, meta) => {
    const ftype = getFileType(plan);
    const hasFile = !!plan.fileUrl;
    const uploaded = adminUploadedFiles[plan.id];
    const fileUrl = plan.fileUrl || uploaded?.url;

    return (
      <div key={plan.id} style={{ ...S.card, cursor: hasFile ? "pointer" : "default" }} onClick={() => {
        if (fileUrl) setViewingDoc({ title: plan.title, fileUrl, fileType: ftype });
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, background: fileTypeColor[ftype] || "#111", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>{fileTypeLabel[ftype]}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={S.cardTitle}>{plan.title}</div>
            <div style={S.cardMeta}>
              {meta || ""}
              {hasFile && <span> · 터치하여 열기</span>}
            </div>
          </div>
          {hasFile && <span style={{ fontSize: 16, color: "#999" }}>→</span>}
        </div>
      </div>
    );
  };

  // Document viewer modal
  const renderDocViewer = () => {
    if (!viewingDoc) return null;
    const { title, fileUrl, fileType } = viewingDoc;

    let viewerContent;
    if (fileType === "pdf") {
      // PDF: native browser viewer
      viewerContent = (
        <iframe src={fileUrl} title={title} style={{ width: "100%", height: "100%", border: "none" }} />
      );
    } else if (fileType === "ppt" || fileType === "docx") {
      // PPT/DOCX: use Microsoft Office Online viewer
      viewerContent = (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
          title={title}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      );
    } else {
      // HWP or unsupported: show download prompt
      viewerContent = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, padding: 40 }}>
          <div style={{ fontSize: 48 }}>📄</div>
          <div style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>{title}</div>
          <div style={{ fontSize: 13, color: "#999", textAlign: "center", lineHeight: 1.6 }}>
            이 파일 형식은 앱 내 미리보기를 지원하지 않습니다.<br/>
            다운로드하여 확인해주세요.
          </div>
          <a href={fileUrl} download style={{ ...S.btn("primary"), textDecoration: "none", padding: "12px 28px", fontSize: 14 }}>파일 다운로드</a>
        </div>
      );
    }

    return (
      <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 300, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #eee", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{ width: 28, height: 28, background: fileTypeColor[fileType] || "#111", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>{fileTypeLabel[fileType]}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
          </div>
          <button style={{ ...touch44, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#111", flexShrink: 0 }} onClick={() => setViewingDoc(null)}>
            {Icons.close}
          </button>
        </div>
        {/* Viewer */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {viewerContent}
        </div>
      </div>
    );
  };

  const renderNoticeModal = () => {
    if (!showNotice) return null;
    return (
      <div style={S.overlay} onClick={() => setShowNotice(null)}>
        <div style={S.modal} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div style={S.modalTitle}>{showNotice.title}</div>
            <button style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999", padding: 4 }} onClick={() => setShowNotice(null)}>{Icons.close}</button>
          </div>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 16 }}>{showNotice.date}</div>
          <div style={{ fontSize: 14, lineHeight: 1.8, color: "#333" }}>{showNotice.content}</div>
        </div>
      </div>
    );
  };

  // ─── Global Search Overlay ──────────────────────────────────────────────────
  const renderGlobalSearch = () => {
    if (!showGlobalSearch) return null;
    const results = getGlobalSearchResults();
    const totalResults = results.tracks.length + results.videos.length + results.plans.length;
    const hasQuery = globalSearchTerm.trim().length > 0;

    return (
      <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 300, display: "flex", flexDirection: "column" }}>
        {/* Search header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #eee" }}>
          <button style={{ ...touch44, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#111", flexShrink: 0 }} onClick={() => setShowGlobalSearch(false)}>
            {Icons.back}
          </button>
          <input
            ref={searchInputRef}
            style={{ flex: 1, padding: "12px 16px", border: "1.5px solid #111", borderRadius: 12, fontSize: 14, fontFamily: font, outline: "none" }}
            placeholder="음원, 영상, 계획안 검색..."
            value={globalSearchTerm}
            onChange={e => setGlobalSearchTerm(e.target.value)}
          />
          {globalSearchTerm && (
            <button style={{ ...touch44, background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#999", flexShrink: 0 }} onClick={() => setGlobalSearchTerm("")}>
              {Icons.close}
            </button>
          )}
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
          {!hasQuery ? (
            <div style={S.empty}>검색어를 입력해주세요</div>
          ) : totalResults === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{Icons.searchLg}</div>
              '{globalSearchTerm}' 에 대한 결과가 없습니다
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "#999", marginBottom: 16, fontWeight: 500 }}>총 {totalResults}개 결과</div>

              {results.tracks.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>♫</span> 음원 ({results.tracks.length})
                  </div>
                  {results.tracks.map(t => renderTrackItem(t, true))}
                </div>
              )}

              {results.videos.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>▶</span> 영상 ({results.videos.length})
                  </div>
                  {results.videos.map(v => renderVideoCard(v, "#111"))}
                </div>
              )}

              {results.plans.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>📋</span> 계획안 ({results.plans.length})
                  </div>
                  {results.plans.map(p => renderPlanCard(p, `${SUBJECTS.find(s => s.id === p.subject)?.name}${p.yearly ? " · 연간" : ` · ${p.issue}호`} · ${STEPS.find(s => s.id === p.step)?.label}`))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ─── Auth Screens ──────────────────────────────────────────────────────────
  const renderAuthScreen = () => (
    <div style={S.app}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet" />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <Logo />
        <div style={{ fontSize: 24, fontWeight: 900, marginTop: 12, marginBottom: 4 }}>울림교육</div>
        <div style={{ fontSize: 11, color: "#999", letterSpacing: 2, marginBottom: 40 }}>EDUCATION LAB</div>

        {authScreen === "login" ? (
          <div style={{ width: "100%", maxWidth: 320 }}>
            {/* Kakao login button */}
            <button style={{
              width: "100%", padding: "16px 0", background: "#FEE500", color: "#111", border: "none",
              borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12,
            }} onClick={() => {
              // 카카오 로그인 시뮬레이션 - 실제로는 카카오 SDK 연동
              const existing = registeredUsers.find(u => u.status === "approved");
              if (existing) {
                setAuthState({ name: existing.name, status: "approved", id: existing.id });
              } else {
                setAuthScreen("signup");
              }
            }}>
              <span style={{ fontSize: 20 }}>💬</span>
              카카오로 시작하기
            </button>

            <div style={{ textAlign: "center", margin: "20px 0", fontSize: 12, color: "#ccc" }}>또는</div>

            {/* Quick demo login */}
            <button style={{
              width: "100%", padding: "14px 0", background: "#111", color: "#fff", border: "none",
              borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 12,
            }} onClick={() => setAuthState({ name: "김민지", status: "approved", id: 1 })}>
              체험하기 (테스트 계정)
            </button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 12, color: "#999" }}>아직 계정이 없으신가요? </span>
              <button style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "#111", cursor: "pointer", fontFamily: font, textDecoration: "underline" }} onClick={() => setAuthScreen("signup")}>회원가입</button>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 320 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>회원가입</div>
            <div style={{ fontSize: 12, color: "#999", marginBottom: 24, textAlign: "center" }}>가입 후 관리자 승인이 필요합니다</div>

            <input style={S.input} placeholder="이름" value={signupName} onChange={e => setSignupName(e.target.value)} />
            <input style={S.input} placeholder="연락처 (예: 010-1234-5678)" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} />
            <select style={{ ...S.input, appearance: "auto" }} value={signupSubject} onChange={e => setSignupSubject(e.target.value)}>
              <option value="">담당 과목 선택</option>
              {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            <button style={{
              width: "100%", padding: "14px 0", background: "#111", color: "#fff", border: "none",
              borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font, marginTop: 8,
              opacity: (signupName && signupPhone && signupSubject) ? 1 : 0.4,
            }} onClick={() => {
              if (signupName && signupPhone && signupSubject) {
                const newUser = { id: Date.now(), name: signupName, phone: signupPhone, subject: signupSubject, status: "pending", date: new Date().toISOString().split("T")[0] };
                setRegisteredUsers(us => [...us, newUser]);
                setAuthState({ name: signupName, status: "pending", id: newUser.id });
                setSignupName(""); setSignupPhone(""); setSignupSubject("");
              }
            }}>가입 신청</button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#999", cursor: "pointer", fontFamily: font }} onClick={() => setAuthScreen("login")}>← 로그인으로 돌아가기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPendingScreen = () => (
    <div style={S.app}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet" />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#f5f5f5", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20 }}>⏳</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>승인 대기 중</div>
        <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7, maxWidth: 280, marginBottom: 32 }}>
          {authState?.name}님의 가입 신청이 접수되었습니다.<br/>
          관리자 승인 후 앱을 이용하실 수 있습니다.
        </div>
        <button style={{ ...S.btn("outline"), fontSize: 13 }} onClick={() => {
          // Check if status was updated
          const user = registeredUsers.find(u => u.id === authState?.id);
          if (user?.status === "approved") setAuthState(a => ({ ...a, status: "approved" }));
          else if (user?.status === "rejected") setAuthState(null);
        }}>승인 상태 확인</button>
        <button style={{ background: "none", border: "none", fontSize: 12, color: "#999", cursor: "pointer", fontFamily: font, marginTop: 16 }} onClick={() => setAuthState(null)}>로그아웃</button>
      </div>
    </div>
  );

  const renderRejectedScreen = () => (
    <div style={S.app}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet" />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, background: "#fee2e2", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20 }}>⚠</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>접근이 제한되었습니다</div>
        <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7, maxWidth: 280, marginBottom: 32 }}>
          승인이 거절되었거나 계정이 차단되었습니다.<br/>
          문의사항은 관리자에게 연락해주세요.
        </div>
        <button style={{ ...S.btn("outline"), fontSize: 13 }} onClick={() => setAuthState(null)}>로그인 화면으로</button>
      </div>
    </div>
  );

  // ─── Auth Gate ─────────────────────────────────────────────────────────────
  if (!authState) return renderAuthScreen();
  if (authState.status === "pending") return renderPendingScreen();
  if (authState.status === "rejected") return renderRejectedScreen();

  // ─── Main Render (authenticated) ──────────────────────────────────────────
  return (
    <div style={S.app}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {renderHeader()}

      <div style={{ paddingBottom: playingTrack ? 60 : 0 }}>
        {showAdmin ? renderAdmin() :
          page === "home" ? renderHome() :
          page === "subjects" ? renderSubjects() :
          page === "subjectDetail" ? renderSubjectDetail() :
          page === "favorites" ? renderFavorites() :
          page === "recent" ? renderRecent() :
          page === "events" ? renderEvents() :
          null
        }
      </div>

      {renderMiniPlayer()}
      {renderNav()}
      {renderNoticeModal()}
      {renderVideoPlayer()}
      {renderDocViewer()}
      {renderGlobalSearch()}
    </div>
  );
}
