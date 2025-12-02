/* eslint-env browser */
/* global Cesium */

// Custom Cesium Data Viewer Application
// Initialize Cesium with your access token
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk";

// Initialize the viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: undefined, // Will be set when user enables terrain
  timeline: false,
  animation: false,
  baseLayerPicker: true,
  geocoder: true,
  homeButton: false,
  sceneModePicker: false,
  selectionIndicator: true,
  infoBox: true,
  navigationHelpButton: true,
  navigationInstructionsInitiallyVisible: false,
  scene3DOnly: false,
  skyBox: new Cesium.SkyBox({
    sources: {
      positiveX: "../../Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_px.jpg",
      negativeX: "../../Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg",
      positiveY: "../../Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_py.jpg",
      negativeY: "../../Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_my.jpg",
      positiveZ: "../../Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg",
      negativeZ: "../../Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg",
    },
  }),
});

// Global state
const appState = {
  layers: [],
  measurementActive: false,
  measurementPoints: [],
  measurementEntity: null,
};

// Show status message
function showStatus(message, type = "info") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `show ${type}`;
  setTimeout(() => {
    status.classList.remove("show");
  }, 3000);
}

// Toggle control panel
function togglePanel() {
  const panel = document.getElementById("controlPanel");
  if (panel.style.display === "none") {
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
}

// Load data from file
async function loadDataFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  showStatus("Loading file...", "info");

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const content = e.target.result;
      const fileName = file.name;
      const fileExt = fileName.split(".").pop().toLowerCase();

      let dataSource;

      if (fileExt === "geojson" || fileExt === "json") {
        // Load GeoJSON
        const geoJson = JSON.parse(content);
        dataSource = await Cesium.GeoJsonDataSource.load(geoJson, {
          stroke: Cesium.Color.HOTPINK,
          fill: Cesium.Color.PINK.withAlpha(0.5),
          strokeWidth: 3,
          clampToGround: true,
        });
        viewer.dataSources.add(dataSource);
      } else if (fileExt === "kml" || fileExt === "kmz") {
        // Load KML
        dataSource = await Cesium.KmlDataSource.load(content, {
          camera: viewer.scene.camera,
          canvas: viewer.scene.canvas,
          clampToGround: true,
        });
        viewer.dataSources.add(dataSource);
      } else if (fileExt === "czml") {
        // Load CZML
        const czml = JSON.parse(content);
        dataSource = await Cesium.CzmlDataSource.load(czml);
        viewer.dataSources.add(dataSource);
      } else {
        throw new Error("Unsupported file format");
      }

      // Add to layers list
      addLayer(fileName, dataSource);

      // Fly to data
      viewer.flyTo(dataSource);

      showStatus(`✓ Loaded ${fileName}`, "success");
      event.target.value = ""; // Reset file input
    } catch (error) {
      console.error("Error loading file:", error);
      showStatus(`✗ Error: ${error.message}`, "error");
    }
  };

  reader.readAsText(file);
}

// Add layer to UI
function addLayer(name, dataSource) {
  const layerId = `layer_${Date.now()}`;
  appState.layers.push({ id: layerId, name, dataSource, visible: true });

  updateLayersList();
}

// Update layers list UI
function updateLayersList() {
  const layersList = document.getElementById("layersList");

  if (appState.layers.length === 0) {
    layersList.innerHTML =
      '<div style="color: #a0a0a0; font-size: 12px; text-align: center; padding: 10px;">No layers loaded</div>';
    return;
  }

  layersList.innerHTML = appState.layers
    .map(
      (layer) => `
        <div class="layer-item">
            <div class="layer-name">${layer.name}</div>
            <div class="layer-controls">
                <button class="layer-btn" onclick="toggleLayerVisibility('${layer.id}')">
                    ${layer.visible ? "👁️" : "🚫"}
                </button>
                <button class="layer-btn" onclick="flyToLayer('${layer.id}')">📍</button>
                <button class="layer-btn" onclick="removeLayer('${layer.id}')">✕</button>
            </div>
        </div>
    `,
    )
    .join("");
}

// Toggle layer visibility
function toggleLayerVisibility(layerId) {
  const layer = appState.layers.find((l) => l.id === layerId);
  if (layer) {
    layer.visible = !layer.visible;
    layer.dataSource.show = layer.visible;
    updateLayersList();
  }
}

// Fly to specific layer
function flyToLayer(layerId) {
  const layer = appState.layers.find((l) => l.id === layerId);
  if (layer) {
    viewer.flyTo(layer.dataSource);
  }
}

// Remove layer
function removeLayer(layerId) {
  const layerIndex = appState.layers.findIndex((l) => l.id === layerId);
  if (layerIndex !== -1) {
    const layer = appState.layers[layerIndex];
    viewer.dataSources.remove(layer.dataSource);
    appState.layers.splice(layerIndex, 1);
    updateLayersList();
    showStatus(`Removed layer: ${layer.name}`, "info");
  }
}

// Load sample data
async function loadSampleData() {
  try {
    showStatus("Loading sample data...", "info");

    // Create sample GeoJSON data
    const sampleGeoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "San Francisco",
            description: "The Golden Gate City",
            population: 883305,
          },
          geometry: {
            type: "Point",
            coordinates: [-122.4194, 37.7749],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "New York",
            description: "The Big Apple",
            population: 8336817,
          },
          geometry: {
            type: "Point",
            coordinates: [-74.006, 40.7128],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "Los Angeles",
            description: "City of Angels",
            population: 3979576,
          },
          geometry: {
            type: "Point",
            coordinates: [-118.2437, 34.0522],
          },
        },
        {
          type: "Feature",
          properties: {
            name: "West Coast Route",
            description: "San Francisco to Los Angeles",
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [-122.4194, 37.7749],
              [-121.8863, 36.6002],
              [-120.6625, 35.2828],
              [-119.7462, 34.4208],
              [-118.2437, 34.0522],
            ],
          },
        },
      ],
    };

    const dataSource = await Cesium.GeoJsonDataSource.load(sampleGeoJson, {
      stroke: Cesium.Color.HOTPINK,
      fill: Cesium.Color.PINK.withAlpha(0.5),
      strokeWidth: 3,
      markerSize: 48,
      markerSymbol: "?",
      markerColor: Cesium.Color.ROYALBLUE,
      clampToGround: true,
    });

    viewer.dataSources.add(dataSource);

    // Customize entities
    const entities = dataSource.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.properties && entity.properties.population) {
        entity.billboard = {
          image: "../../Build/Cesium/Assets/Textures/pin.svg",
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 0.5,
        };
        entity.label = {
          text: entity.properties.name,
          font: "14pt sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -30),
        };
      }
    }

    addLayer("Sample US Cities", dataSource);
    viewer.flyTo(dataSource);

    showStatus("✓ Sample data loaded", "success");
  } catch (error) {
    console.error("Error loading sample data:", error);
    showStatus("✗ Error loading sample data", "error");
  }
}

// Fly to home position
function flyToHome() {
  viewer.camera.flyHome(1.5);
}

// Fly to current data
function flyToCurrentData() {
  if (appState.layers.length > 0) {
    const visibleLayers = appState.layers.filter((l) => l.visible);
    if (visibleLayers.length > 0) {
      viewer.flyTo(visibleLayers.map((l) => l.dataSource));
    } else {
      showStatus("No visible layers", "info");
    }
  } else {
    showStatus("No data loaded", "info");
  }
}

// Toggle terrain
async function toggleTerrain(enabled) {
  if (enabled) {
    try {
      viewer.terrainProvider = await Cesium.createWorldTerrainAsync({
        requestWaterMask: true,
        requestVertexNormals: true,
      });
      showStatus("✓ Terrain enabled", "success");
    } catch (error) {
      console.error("Error loading terrain:", error);
      showStatus("✗ Could not load terrain", "error");
      document.getElementById("terrainToggle").checked = false;
    }
  } else {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    showStatus("Terrain disabled", "info");
  }
}

// Change scene mode
function changeSceneMode(mode) {
  if (mode === "3D") {
    viewer.scene.mode = Cesium.SceneMode.SCENE3D;
  } else if (mode === "2D") {
    viewer.scene.mode = Cesium.SceneMode.SCENE2D;
  } else if (mode === "COLUMBUS") {
    viewer.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
  }
}

// Toggle atmosphere
function toggleAtmosphere(enabled) {
  viewer.scene.skyAtmosphere.show = enabled;
}

// Toggle lighting
function toggleLighting(enabled) {
  viewer.scene.globe.enableLighting = enabled;
}

// Start measurement
function startMeasurement() {
  if (appState.measurementActive) {
    endMeasurement();
    return;
  }

  appState.measurementActive = true;
  appState.measurementPoints = [];

  showStatus(
    "Click on the globe to measure distance. Press ESC to cancel.",
    "info",
  );

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction(function (click) {
    const earthPosition = viewer.scene.pickPosition(click.position);

    if (Cesium.defined(earthPosition)) {
      appState.measurementPoints.push(earthPosition);

      // Add point marker
      viewer.entities.add({
        position: earthPosition,
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
      });

      // If we have 2 points, calculate distance
      if (appState.measurementPoints.length === 2) {
        const distance = Cesium.Cartesian3.distance(
          appState.measurementPoints[0],
          appState.measurementPoints[1],
        );

        // Draw line
        appState.measurementEntity = viewer.entities.add({
          polyline: {
            positions: appState.measurementPoints,
            width: 3,
            material: Cesium.Color.RED,
            clampToGround: true,
          },
        });

        // Show distance
        const distanceKm = (distance / 1000).toFixed(2);
        const distanceMiles = (distance / 1609.34).toFixed(2);
        showStatus(
          `Distance: ${distanceKm} km (${distanceMiles} miles)`,
          "success",
        );

        endMeasurement();
        handler.destroy();
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // Cancel on ESC key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && appState.measurementActive) {
      endMeasurement();
      handler.destroy();
    }
  });
}

function endMeasurement() {
  appState.measurementActive = false;
}

// Clear all data
function clearAllData() {
  // eslint-disable-next-line no-alert
  if (confirm("Are you sure you want to clear all data?")) {
    // Remove all data sources
    viewer.dataSources.removeAll();

    // Remove all entities
    viewer.entities.removeAll();

    // Clear layers
    appState.layers = [];
    updateLayersList();

    // Reset measurement
    appState.measurementPoints = [];
    appState.measurementEntity = null;

    showStatus("All data cleared", "info");
  }
}

// Handle entity selection
viewer.selectedEntityChanged.addEventListener(function (entity) {
  if (Cesium.defined(entity)) {
    const infoBox = document.getElementById("infoBox");
    let info = "<div><strong>Selected Feature</strong></div>";

    if (entity.name) {
      info += `<div style="margin-top: 5px;">Name: ${entity.name}</div>`;
    }

    if (entity.properties) {
      const properties = entity.properties;
      const propertyNames = properties.propertyNames;

      if (propertyNames.length > 0) {
        info +=
          '<div style="margin-top: 5px; font-size: 11px; color: #a0a0a0;">Properties:</div>';
        propertyNames.forEach((name) => {
          const value = properties[name];
          if (Cesium.defined(value)) {
            info += `<div style="font-size: 11px;">${name}: ${value}</div>`;
          }
        });
      }
    }

    infoBox.innerHTML = info;
  }
});

// Initialize with default view
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 15000000),
});

// Expose functions to global scope for HTML onclick handlers
window.togglePanel = togglePanel;
window.loadDataFile = loadDataFile;
window.loadSampleData = loadSampleData;
window.toggleLayerVisibility = toggleLayerVisibility;
window.flyToLayer = flyToLayer;
window.removeLayer = removeLayer;
window.flyToHome = flyToHome;
window.flyToCurrentData = flyToCurrentData;
window.toggleTerrain = toggleTerrain;
window.changeSceneMode = changeSceneMode;
window.toggleAtmosphere = toggleAtmosphere;
window.toggleLighting = toggleLighting;
window.startMeasurement = startMeasurement;
window.clearAllData = clearAllData;

console.log("Custom Cesium Data Viewer initialized successfully!");
