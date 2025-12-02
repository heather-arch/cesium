# Custom Cesium Data Viewer

A powerful, interactive 3D geospatial data visualization tool built with CesiumJS.

## Features

### 🗺️ Data Loading

- **Multiple Format Support**: Load GeoJSON, KML, KMZ, and CZML files
- **Drag & Drop**: Easy file upload interface
- **Sample Data**: Built-in sample data to get started quickly

### 📊 Layer Management

- **Multiple Layers**: Load and manage multiple data layers simultaneously
- **Layer Controls**: Toggle visibility, fly to, and remove individual layers
- **Visual Feedback**: Clear indication of active/inactive layers

### 🎮 Camera Controls

- **Home View**: Return to default camera position
- **Fit to Data**: Automatically frame all loaded data
- **Scene Modes**: Switch between 3D Globe, 2D Map, and Columbus View
- **Smooth Animations**: Fluid camera transitions

### 🌍 Visualization Options

- **Terrain**: Optional high-resolution terrain visualization
- **Atmosphere**: Toggle atmospheric effects
- **Lighting**: Day/night lighting simulation
- **Base Layer Picker**: Choose from multiple base imagery layers

### 🔧 Tools

- **Distance Measurement**: Click two points to measure distance
- **Entity Selection**: Click features to view detailed information
- **Clear All**: Remove all loaded data with one click

### 💎 Modern UI

- **Responsive Design**: Works on desktop and tablet devices
- **Dark Theme**: Eye-friendly dark interface
- **Gradient Styling**: Modern, attractive visual design
- **Status Notifications**: Clear feedback for all actions

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or higher)
- Cesium project built (run `npm run build` from project root)

### Running the Viewer

1. **Start the development server** from the project root:

   ```bash
   npm start
   ```

2. **Open your browser** and navigate to:

   ```text
   http://localhost:8080/Apps/CustomDataViewer/
   ```

### Quick Start Guide

1. **Load Sample Data**: Click "⭐ Load Sample Data" to see example US cities
2. **Upload Your Data**: Click "📁 Choose File" to load your own GeoJSON/KML files
3. **Explore**: Use mouse to pan, zoom, and rotate the globe
   - Left-click + drag: Rotate
   - Right-click + drag: Pan
   - Mouse wheel: Zoom
4. **Manage Layers**: Use the Layers panel to control visibility
5. **Measure**: Click "📏 Measure Distance" and click two points on the globe

## Supported Data Formats

### GeoJSON

Standard GeoJSON format with support for:

- Points
- Lines
- Polygons
- MultiPolygon
- Feature Collections

Example:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Example Location",
        "description": "This is a sample point"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      }
    }
  ]
}
```

### KML/KMZ

Standard KML format including:

- Placemarks
- Paths
- Polygons
- Styles and icons

### CZML

Cesium's time-dynamic geospatial data format

## Customization

### Changing Default View

Edit `app.js` and modify the initial camera view:

```javascript
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
});
```

### Custom Styling

Edit the `<style>` section in `index.html` to customize:

- Colors
- Panel size and position
- Fonts
- Animations

### Adding New Data Sources

To add support for new data formats, extend the `loadDataFile` function in `app.js`:

```javascript
else if (fileExt === 'yourformat') {
    // Your custom loading logic
    dataSource = await loadCustomFormat(content);
    viewer.dataSources.add(dataSource);
}
```

### Cesium Ion Token

Replace the default token in `app.js` with your own:

```javascript
Cesium.Ion.defaultAccessToken = "YOUR_TOKEN_HERE";
```

Get a free token at [https://cesium.com/ion/signup](https://cesium.com/ion/signup)

## API Reference

### Key Functions

#### `loadDataFile(event)`

Loads data from a file upload event.

#### `addLayer(name, dataSource)`

Adds a new layer to the viewer and UI.

#### `toggleLayerVisibility(layerId)`

Shows/hides a specific layer.

#### `flyToLayer(layerId)`

Animates camera to frame a specific layer.

#### `removeLayer(layerId)`

Removes a layer from the viewer.

#### `startMeasurement()`

Initiates distance measurement mode.

#### `toggleTerrain(enabled)`

Enables/disables 3D terrain.

#### `changeSceneMode(mode)`

Switches between 3D, 2D, and Columbus view modes.

## Advanced Usage

### Loading External Data

You can load data from URLs by modifying the code:

```javascript
const dataSource = await Cesium.GeoJsonDataSource.load(
  "https://example.com/data.geojson",
);
viewer.dataSources.add(dataSource);
addLayer("External Data", dataSource);
```

### Custom Entity Styling

Customize how features are displayed:

```javascript
const dataSource = await Cesium.GeoJsonDataSource.load(geoJson, {
  stroke: Cesium.Color.BLUE,
  fill: Cesium.Color.BLUE.withAlpha(0.5),
  strokeWidth: 5,
  markerSize: 48,
  markerColor: Cesium.Color.RED,
});
```

### Time-Dynamic Data

Load CZML with time-varying properties:

```javascript
const czmlData = [...]; // Your CZML data
const dataSource = await Cesium.CzmlDataSource.load(czmlData);
viewer.dataSources.add(dataSource);
viewer.clock.shouldAnimate = true;
```

## Troubleshooting

### Issue: Data not loading

- Check browser console for errors
- Verify file format is supported
- Ensure coordinates are in WGS84 (longitude, latitude)
- Check that GeoJSON is valid using [geojsonlint.com](http://geojsonlint.com/)

### Issue: Terrain not working

- Verify internet connection (terrain loads from Cesium Ion)
- Check that Cesium Ion token is valid
- Try refreshing the page

### Issue: Performance issues

- Reduce the number of entities in your data
- Simplify complex geometries
- Consider using 3D Tiles for large datasets

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

WebGL 2.0 support required.

## Resources

- [CesiumJS Documentation](https://cesium.com/docs/cesiumjs-ref-doc/)
- [CesiumJS Tutorials](https://cesium.com/learn/cesiumjs-learn/)
- [Sandcastle Examples](https://sandcastle.cesium.com/)
- [Cesium Community Forum](https://community.cesium.com/)

## License

This viewer is built on CesiumJS which is licensed under Apache 2.0.

## Contributing

Feel free to extend this viewer with additional features:

- 3D Tiles support
- Custom data analysis tools
- Export functionality
- Annotation tools
- Screenshot capture
- Print layouts

## Version History

### v1.0.0 (Current)

- Initial release
- GeoJSON, KML, KMZ, CZML support
- Layer management
- Distance measurement
- Multiple scene modes
- Terrain support
- Modern UI
