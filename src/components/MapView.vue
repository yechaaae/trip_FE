<template>
  <div ref="mapContainer" class="map-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import * as d3 from "d3";

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

/* =====================
   PIN DATA (임시)
===================== */
const pins = [
  { name: "서울", lat: 37.5665, lng: 126.978, isSaved: true,  isReviewed: false },
  { name: "부산", lat: 35.1796, lng: 129.0756, isSaved: false, isReviewed: true  },
  { name: "제주", lat: 33.4996, lng: 126.5312, isSaved: true,  isReviewed: true  },
];

let markerGroup = null; // 핀 그룹 저장

/* =====================
   FILTER LOGIC
===================== */
const applyFilters = () => {
  if (!markerGroup) return;

  const { saved, reviewed } = props.filters;

  markerGroup
    .selectAll("circle, text")
    .style("display", (d) => {
      if (!saved && !reviewed) return "block";

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
  /* =====================
     LOAD GEOJSON
  ===================== */
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

  const projection = d3
    .geoMercator()
    .center([127.8, 36])
    .scale(5200)
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
     PINS (CIRCLE)
  ===================== */
  markerGroup
    .selectAll("circle")
    .data(pins)
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
    });

  /* =====================
     PINS (LABEL)
  ===================== */
  markerGroup
    .selectAll("text")
    .data(pins)
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
