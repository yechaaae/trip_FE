<template>
  <div ref="mapContainer" class="map-wrapper"></div>
</template>

<script setup>
  import { ref, onMounted, watch } from "vue";
  import axios from "axios"; // ★ axios 추가
  import * as d3 from "d3";
  import { useRouter } from "vue-router";

  const router = useRouter();
  
  /* =====================
     AXIOS INSTANCE
  ===================== */
  const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
  });
  
  /* =====================
     PROPS
  ===================== */
  const props = defineProps({
    filters: {
      type: Object,
      required: true,
    },
  });
  
  const mapContainer = ref(null);
  const pins = ref([]); // ★ 더미 데이터 제거 -> 반응형 변수로 변경
  
  let markerGroup = null; // 핀 그룹 저장
  
  /* =====================
     DATA FETCHING (백엔드 연동)
  ===================== */
  const fetchMapData = async () => {
    try {
      // 1. 내 리뷰 & 저장한 관광지 목록 동시 호출
      const [reviewRes, bookmarkRes] = await Promise.all([
        api.get("/api/mypage/review"),
        api.get("/api/mypage/bookmark")
      ]);
  
      const reviews = reviewRes.data || [];
      const bookmarks = bookmarkRes.data || [];
      
      // 2. 데이터 병합 로직 (contentId 기준)
      // - 같은 장소를 '저장'도 하고 '리뷰'도 썼을 수 있으므로 하나로 합칩니다.
      const mapData = {};
  
      // (1) 북마크(저장) 데이터 처리
      bookmarks.forEach(item => {
        // 좌표(latitude, longitude)가 있는 경우에만 지도에 표시
        if (item.latitude && item.longitude) {
          mapData[item.contentId] = {
            id: item.contentId,
            name: item.title,
            lat: item.latitude,  // DTO 필드명 확인 (latitude)
            lng: item.longitude, // DTO 필드명 확인 (longitude)
            isSaved: true,
            isReviewed: false
          };
        }
      });
  
      // (2) 리뷰 데이터 처리
      reviews.forEach(item => {
       // 좌표가 있는 경우만 처리
       if (item.latitude && item.longitude) {
         
         // ★ [핵심 수정] contentId가 없으면 글 번호(boardId)를 고유키로 사용!
         // 이렇게 하면 contentId가 null이어도 핀이 사라지지 않습니다.
         const uniqueKey = item.contentId ? item.contentId : `review_${item.boardId}`;

         if (mapData[uniqueKey]) {
            // 이미 저장된 곳(북마크)이라면 리뷰 정보만 덮어씌움
            mapData[uniqueKey].isReviewed = true;
            mapData[uniqueKey].boardId = item.boardId;
         } else {
            // 지도에 없는 곳이라면 새로 추가
            mapData[uniqueKey] = {
              id: item.contentId || item.boardId, // ID도 없으면 boardId 사용
              name: item.attractionTitle || item.title,
              lat: item.latitude,
              lng: item.longitude,
              isSaved: false,
              isReviewed: true,
              boardId: item.boardId
            };
         }
       }
    });
  
      // 3. 객체를 배열로 변환하여 pins에 저장
      pins.value = Object.values(mapData);
  
    } catch (error) {
      console.error("맵 데이터 로딩 실패(로그인 필요):", error);
      pins.value = []; // 에러 시 빈 배열
    }
  };
  
  /* =====================
     FILTER LOGIC
  ===================== */
  const applyFilters = () => {
    if (!markerGroup) return;
  
    const { saved, reviewed } = props.filters;
  
    markerGroup
      .selectAll("circle, text")
      .style("display", (d) => {
        // 둘 다 체크 해제면 모두 보여주기
        if (!saved && !reviewed) return "block";
  
        // 조건(저장됨 or 리뷰씀)에 맞으면 보임
        return (saved && d.isSaved) || (reviewed && d.isReviewed) ? "block" : "none";
      });
  };
  
  /* =====================
     WATCH FILTERS
  ===================== */
  watch(
    () => props.filters,
    () => applyFilters(),
    { deep: true }
  );
  
  onMounted(async () => {
    // ★ 1. 지도 그리기 전에 데이터 먼저 가져오기
    await fetchMapData();
  
    /* =====================
       LOAD GEOJSON
    ===================== */
    // GeoJSON 경로가 맞는지 확인해주세요
    const res = await fetch("/src/assets/geo/HangJeongDong_ver20250401.geojson");
    const geojson = await res.json();
  
    const width = mapContainer.value.clientWidth;
    const height = mapContainer.value.clientHeight;
  
    /* =====================
       SVG + PROJECTION
    ===================== */
    const svg = d3
      .select(mapContainer.value)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("shape-rendering", "geometricPrecision");
  
    // 한국 지도 중심 좌표 및 확대 배율 설정
    const projection = d3
      .geoMercator()
      .center([127.8, 35.8]) 
      .scale(5500)
      .translate([width / 2, height / 2]);
  
    const path = d3.geoPath().projection(projection);
  
    const g = svg.append("g");
  
    /* =====================
       MAP PATH
    ===================== */
    g.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#e4ebf5")
      .attr("stroke", "#9aaac1")
      .attr("stroke-width", 0.7)
      .attr("opacity", 0.9)
      .attr("class", "region");
  
    /* =====================
       MARKER GROUP
    ===================== */
    markerGroup = g.append("g").attr("class", "markers");
  
    /* =====================
       PINS (CIRCLE) - pins.value 사용
    ===================== */
    markerGroup
      .selectAll("circle")
      .data(pins.value) // ★ API 데이터 바인딩
      .enter()
      .append("circle")
      .attr("cx", (d) => projection([d.lng, d.lat])[0])
      .attr("cy", (d) => projection([d.lng, d.lat])[1])
      .attr("r", 6)
      .attr("class", (d) => {
        if (d.isSaved && d.isReviewed) return "pin saved reviewed";
        if (d.isSaved) return "pin saved";
        if (d.isReviewed) return "pin reviewed";
        return "pin";
      }).on("click", (event, d) => {
      if (d.isReviewed) {
        // 리뷰가 있으면 -> 리뷰 상세 페이지로 이동
        router.push(`/board/${d.boardId}`);
      } else {
        // 저장만 했으면 -> 관광지 상세 페이지로 이동
        router.push(`/attraction/${d.id}`);
      }
    });
  
    /* =====================
       PINS (LABEL) - pins.value 사용
    ===================== */
    markerGroup
      .selectAll("text")
      .data(pins.value) // ★ API 데이터 바인딩
      .enter()
      .append("text")
      .attr("x", (d) => projection([d.lng, d.lat])[0] + 10)
      .attr("y", (d) => projection([d.lng, d.lat])[1] - 5)
      .attr("class", "pin-label")
      .text((d) => d.name);
  
    /* =====================
       ZOOM + DRAG
    ===================== */
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
  
    svg.call(zoom);
  
    /* =====================
       TOOLTIP
    ===================== */
    const tooltip = d3
      .select(mapContainer.value)
      .append("div")
      .attr("class", "map-tooltip")
      .style("opacity", 0);
  
    markerGroup
      .selectAll("circle")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1).html(d.name);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.offsetX + 12 + "px")
          .style("top", event.offsetY - 8 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  
    /* =====================
       INITIAL FILTER APPLY
    ===================== */
    applyFilters();
  });
  </script>

<style scoped>
/* =====================
   MAP WRAPPER
===================== */
.map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  background: #fafafa;
  position: relative; /* tooltip 기준점 */
}

/* SVG */
svg {
  width: 90%;
  height: auto;
  overflow: visible;
}

/* =====================
   MAP REGION
===================== */
:deep(.region) {
  transition: fill 0.2s ease, stroke-width 0.2s ease;
}

/* =====================
   PIN BASE
===================== */
:deep(.pin) {
  fill: #ff3b30;
  cursor: pointer;

  transform-box: fill-box;
  transform-origin: center;

  transition: transform 0.2s ease, fill 0.2s ease;
}

/* ❤️ 저장 */
:deep(.pin.saved) {
  fill: #ff6b81;
}

/* ⭐ 리뷰 (마름모) */
:deep(.pin.reviewed) {
  fill: #f6c343;
  transform: rotate(45deg);
}

/* ❤️ + ⭐ */
:deep(.pin.saved.reviewed) {
  fill: #ff922b;
  stroke: #333;
  stroke-width: 1.2;
}

/* hover */
:deep(.pin:hover) {
  transform: scale(1.4);
}

:deep(.pin.reviewed:hover) {
  transform: rotate(45deg) scale(1.4);
}

/* =====================
   PIN LABEL
===================== */
:deep(.pin-label) {
  pointer-events: none;
  font-size: 13px;
  font-weight: 600;
  fill: #333;
}

/* =====================
   TOOLTIP
===================== */
:deep(.map-tooltip) {
  position: absolute;
  pointer-events: none;
  z-index: 100;

  background: #fff;
  color: #222;
  padding: 6px 10px;
  border-radius: 8px;

  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;

  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.15s ease;
}
</style>
