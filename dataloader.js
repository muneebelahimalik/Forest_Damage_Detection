/*



*/
//*******************************************************************************************
//                             PART 1: INPUT PARAMETERS  
//*******************************************************************************************
// Load a polygon from a Shapefile
var fc = ee.FeatureCollection('projects/ee-memalikbee19seecs/assets/CPT11AND12');
var geometry = fc.geometry();

// If the geometry is a GeometryCollection, extract each individual polygon
if (geometry.type() === 'GeometryCollection') {
  var geometries = geometry.geometries();
  geometry = ee.Geometry.MultiPolygon(geometries.map(function(geom) {
    return ee.Geometry.Polygon(geom.coordinates());
  }));
}
// Add the polygon to the map
Map.addLayer(geometry, {}, 'Polygon');
// Print the geometry
print('Polygon geometry:', geometry);

//SELECTING SATELLITE PLATFORM
var platform = 'S2B';    

// Print the satellite platform and dates to console
//This identifies which satellite platform you selected with an if/then statement
if (platform == 'S2B' | platform == 's2b') {
  var ImCol = 'COPERNICUS/S2_SR_HARMONIZED';
  var pl = 'Sentinel-2B';
} else {
  var ImCol = 'LANDSAT/LC09/C02/T2_TOA';
  var pl = 'Landsat 8 TIER 2 Top Of Atmosphere';
}
print(ee.String('Data selected for analysis: ').cat(pl));

// Location
//This sets the location where all the analysis will be conducted
var area = ee.FeatureCollection(geometry);
var temp_area=area;
// Set study area as map center.
Map.centerObject(area,14.5);
