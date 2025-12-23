<template>
  <div ref="mapContainer" class="map-wrapper">
    <!-- 🧭 컨트롤 패널 -->
    <div class="map-controls">

      <!-- 초기화 버튼 -->
      <button class="reset-btn" @click="resetZoom">
        ⟳ 지도 초기화
      </button>

      <!-- 범례 -->
      <div class="map-legend">
        <div class="legend-item">
          <img :src="savedIcon" />
          <span>저장한 관광지</span>
        </div>
        <div class="legend-item">
          <img :src="reviewIcon" />
          <span>리뷰 작성한 관광지</span>
        </div>
      </div>

    </div>
  </div>

</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import * as d3 from "d3";
import { useRouter } from "vue-router";
import savedIcon from "@/assets/icons/saved-flag.png";
import reviewIcon from "@/assets/icons/review-flag.png";

const router = useRouter();

/* =====================
   REFS
===================== */
const mapContainer = ref(null);
const svgRef = ref(null);
const gRef = ref(null);
const zoomRef = ref(null);
const pins = ref([]);

/* =====================
   AXIOS
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

/* =====================
   DATA FETCH
===================== */
const fetchMapData = async () => {
  try {
    const [reviewRes, bookmarkRes] = await Promise.all([
      api.get("/api/mypage/review"),
      api.get("/api/mypage/bookmark"),
    ]);

    const mapData = {};

    bookmarkRes.data?.forEach((item) => {
      if (item.latitude && item.longitude) {
        mapData[item.contentId] = {
          id: item.contentId,
          name: item.title,
          lat: item.latitude,
          lng: item.longitude,
          isSaved: true,
          isReviewed: false,
        };
      }
    });

    reviewRes.data?.forEach((item) => {
      if (item.latitude && item.longitude) {
        const key = item.contentId ?? `review_${item.boardId}`;
        if (mapData[key]) {
          mapData[key].isReviewed = true;
          mapData[key].boardId = item.boardId;
        } else {
          mapData[key] = {
            id: item.contentId || item.boardId,
            name: item.attractionTitle || item.title,
            lat: item.latitude,
            lng: item.longitude,
            isSaved: false,
            isReviewed: true,
            boardId: item.boardId,
          };
        }
      }
    });

    pins.value = Object.values(mapData);
  } catch (e) {
    console.error("지도 데이터 로딩 실패:", e);
    pins.value = [];
  }
};

/* =====================
   FILTER
===================== */
const applyFilters = () => {
  if (!gRef.value) return;
  const { saved, reviewed } = props.filters;

  gRef.value
    .selectAll("image")
    .style("display", (d) => {
      if (!saved && !reviewed) return "block";
      return (saved && d.isSaved) || (reviewed && d.isReviewed)
        ? "block"
        : "none";
    });
};

watch(() => props.filters, applyFilters, { deep: true });

/* =====================
   RESET MAP (버튼)
===================== */
const resetZoom = () => {
  if (!svgRef.value || !zoomRef.value) return;

  svgRef.value
    .transition()
    .duration(400)
    .call(zoomRef.value.transform, d3.zoomIdentity);
};

/* =====================
   MOUNT
===================== */
onMounted(async () => {
  await fetchMapData();

  const width = mapContainer.value.clientWidth;
  const height = mapContainer.value.clientHeight;

  /* SVG */
  const svg = d3
    .select(mapContainer.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("shape-rendering", "geometricPrecision");

  svgRef.value = svg;

  /* PROJECTION */
  const projection = d3
    .geoMercator()
    .center([127.8, 35.8])
    .scale(5500)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const g = svg.append("g");
  gRef.value = g;

  /* GEOJSON */
  const geo = await fetch(
    "/src/assets/geo/HangJeongDong_ver20250401.geojson"
  ).then((r) => r.json());

  g.selectAll("path")
    .data(geo.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "#e4ebf5")
    .attr("stroke", "#9aaac1")
    .attr("stroke-width", 0.7);

  /* =====================
     TOOLTIP (복구 핵심)
  ===================== */
  const tooltip = d3
    .select(mapContainer.value)
    .append("div")
    .attr("class", "map-tooltip")
    .style("opacity", 0);

  /* =====================
     PINS
  ===================== */
  g.selectAll("image")
    .data(pins.value)
    .enter()
    .append("image")
    .attr("href", (d) => (d.isReviewed ? reviewIcon : savedIcon))
    .attr("width", 26)
    .attr("height", 26)
    .attr("x", (d) => projection([d.lng, d.lat])[0] - 13)
    .attr("y", (d) => projection([d.lng, d.lat])[1] - 26)
    .style("cursor", "pointer")
    .on("click", (_, d) => {
      d.isReviewed
        ? router.push(`/board/${d.boardId}`)
        : router.push(`/attraction/${d.id}`);
    })
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(d.name);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.offsetX + 14 + "px")
        .style("top", event.offsetY - 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  /* =====================
     ZOOM
  ===================== */
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  zoomRef.value = zoom;
  svg.call(zoom);

  applyFilters();
});
</script>


<style scoped>

.map-controls {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 50;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}


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

:deep(.pin-icon) {
  transition: transform 0.2s ease;
  transform-origin: center;
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

/* =====================
   MAP LEGEND
===================== */
.map-legend {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);

  border-radius: 14px;
  padding: 12px 14px;

  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);

  display: flex;
  flex-direction: column;
  gap: 10px;

  font-size: 13px;
  font-weight: 600;
  color: #333;
}


.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.reset-btn {
  padding: 8px 14px;
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);

  font-size: 13px;
  font-weight: 600;
  color: #333;

  border: none;
  cursor: pointer;

  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.reset-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

</style>