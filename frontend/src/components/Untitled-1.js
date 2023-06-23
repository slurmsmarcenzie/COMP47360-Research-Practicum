
let lastHoveredFeatureId = null;  // We will store the last hovered feature id here

  map.current.on('mousemove', function (e) {
    const features = map.current.queryRenderedFeatures(e.point, { layers: layerIds.current });
    map.current.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
  
    if (!features.length) {
      popup.remove();
      return;
    }
  
    const feature = features[0];
    const correspondingNeighbourhood = neighbourhoods.features.find(n => n.id === feature.layer.id);
  
    map.current.setPaintProperty(feature.layer.id, 'fill-opacity', 0.9);
    map.current.setPaintProperty(feature.layer.id + '-line', 'line-width', 4);
    popup.setLngLat(e.lngLat).setHTML(correspondingNeighbourhood.properties.zone).addTo(map.current);
  
  });
  
  map.current.on('mouseleave', function () {
    if (lastHoveredFeatureId) {
      // Reset the style for the last hovered feature
      map.current.setPaintProperty(lastHoveredFeatureId, 'fill-opacity', 0.6);
      map.current.setPaintProperty(lastHoveredFeatureId + '-line', 'line-width', 0);
    }
  
    map.current.getCanvas().style.cursor = '';
    popup.remove();
  });
