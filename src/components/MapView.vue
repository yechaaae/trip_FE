<template>
  <div ref="mapContainer" class="map-wrapper"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as d3 from "d3";

const mapContainer = ref(null);

// 임시 핀 데이터
const pins = [
  { name: "서울", lat: 37.5665, lng: 126.978 },
  { name: "부산", lat: 35.1796, lng: 129.0756 },
  { name: "제주", lat: 33.4996, lng: 126.5312 },
];

onMounted(async () => {
  const res = await fetch("/src/assets/geo/HangJeongDong_ver20250401.geojson");
  const geojson = await res.json();

  const width = mapContainer.value.clientWidth;
  const height = mapContainer.value.clientHeight;

  const svg = d3
    .select(mapContainer.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("shape-rendering", "geometricPrecision"); // 성능 최적화 + 선 보정

  const projection = d3
    .geoMercator()
    .center([127.8, 36])
    .scale(5200)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // 지도 전체 그룹
  const g = svg.append("g");

  // 🔥 지도 Path
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

  // 🔥 마커 그룹 (지도와 함께 움직이게)
  const markerGroup = g.append("g").attr("class", "markers");

  // 핀 생성
  markerGroup
    .selectAll("circle")
    .data(pins)
    .enter()
    .append("circle")
    .attr("cx", (d) => projection([d.lng, d.lat])[0])
    .attr("cy", (d) => projection([d.lng, d.lat])[1])
    .attr("r", 6)
    .attr("fill", "#ff3b30")
    .attr("class", "pin");

  markerGroup
    .selectAll("text")
    .data(pins)
    .enter()
    .append("text")
    .attr("x", (d) => projection([d.lng, d.lat])[0] + 10)
    .attr("y", (d) => projection([d.lng, d.lat])[1] - 5)
    .attr("font-size", 13)
    .attr("font-weight", 600)
    .attr("fill", "#333")
    .attr("class", "pin-label")
    .text((d) => d.name);

  // 🔥 Hover 최적화 (path마다 이벤트 X → svg 한 번만)
  svg.on("mousemove", (event) => {
    const target = event.target;
    if (target.tagName === "path") {
      d3.select(target)
        .attr("fill", "#cddcff")
        .attr("stroke-width", 1.1);
    }
  });

  svg.on("mouseout", (event) => {
    const target = event.target;
    if (target.tagName === "path") {
      d3.select(target)
        .attr("fill", "#e4ebf5")
        .attr("stroke-width", 0.7);
    }
  });

  // 🔥 Zoom + Drag
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(zoom);
});
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 상단에 붙기 */
  overflow: auto;
  background: #fafafa;
}

/* 지도 비율 유지 */
svg {
  width: 90%;
  height: auto;
  overflow: visible;
}

.region {
  transition: 0.2s;
}

.pin {
  cursor: pointer;
}

.pin-label {
  pointer-events: none;
}
</style>
