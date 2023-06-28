//************************************************************************************************
//                           PART : NDVI (NORMALIZED DIFFERENCE VEGETATION INDEX)
//************************************************************************************************

// Define a function to calculate the Normalized Difference Vegetation Index (NDVI)
function calculateNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']); // NDVI = (NIR - Red) / (NIR + Red)
  return ndvi;
}

// Calculate NDVI for each cluster
var ndviPost = calculateNDVI(post_mos);
print('Values in ndviPost:', ndviPost.getInfo());
var postFireClusteredNDVI = post_fire_clustered.addBands(ndviPost.rename('NDVI'));

var ndviMeansPost_unscaled = postFireClusteredNDVI.reduceConnectedComponents({
  reducer: ee.Reducer.mean(),
  labelBand: 'cluster',
  maxSize: 256
});

var ndviMeansPost = ndviMeansPost_unscaled;

// Display the results
Map.addLayer(ndviMeansPost, {min:0, max:1, palette:['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#800080']}, 'NDVI Post-fire Cluster Means',0);

// Get the mean NDVI value for each cluster
var NDVIclusterMeans = ndviMeansPost.addBands(post_fire_clustered)
  .reduceRegion({
    reducer: ee.Reducer.mean().group(1, 'cluster'),
    geometry: area,
    scale: 30,
    maxPixels: 1e9
  });

// Print the cluster means
print('NDVI Cluster means:', NDVIclusterMeans);

//*******************************************************************************************
//                           PART : dNBR (Difference Normalized Burn Ratio)
//*******************************************************************************************

// Calculate NBR value for each image
//PRE FIRE IMAGE NBR
var nbrPre = pre_mos.normalizedDifference(['B8', 'B12']);

//POST FIRE IMAGE NBR
var nbrPost = post_mos.normalizedDifference(['B8', 'B12']);

var dNBR_pixels= nbrPre.subtract(nbrPost);
var dNBR_PP=dNBR_pixels.multiply(1000);
print("DNBR PIXELS",dNBR_PP);
Map.addLayer(dNBR_PP, {min: -20, max: 180, palette: ['006400','147F1D','228B22','16B532','0ae042', 'f6dd29','f0b828','fc8829', 'ff702d','ff4b31','ff4d46','FF0000']}, 'dNBR PIXELATED VISUALIZATION',0);

// Add the clustered layer to the NBR image
var postFireClusterednbrPre = post_fire_clustered.addBands(nbrPre);
var postFireClusterednbrPost = post_fire_clustered.addBands(nbrPost);

var nbrMeansPre = postFireClusterednbrPre
  .reduceConnectedComponents({
    reducer: ee.Reducer.mean(),
    labelBand: 'cluster',
    maxSize: 256
  });

var nbrMeansPost = postFireClusterednbrPost
  .reduceConnectedComponents({
    reducer: ee.Reducer.mean(),
    labelBand: 'cluster',
    maxSize: 256
  });

var dNBR_unscaled = nbrMeansPre.subtract(nbrMeansPost);

var dNBR_MULTIPLIED = dNBR_unscaled.multiply(1000);
// Print the unscaled dNBR for all clusters
print("Unscaled dNBR for all clusters:", dNBR_unscaled);
var dNBR = dNBR_unscaled.multiply(1000);

var palette1 = ['006400','147F1D','228B22','16B532','0ae042', 'fff70b','FFD321','ffaf38', 'ff641b','FF3214','FF0000'];
var colorNames = ['Dark Green', 'Medium Green', 'Light Green', 'Pale Yellow', 'Light Yellow', 'Light Salmon', 'Light Orange', 'Orange', 'Bright Red', 'Dark Red'];

//For Better Visualization the minimum and maximum values should be witin (50) of the minimum and maximum values of dNBR
Map.addLayer(dNBR, {min: -200, max: 200, palette: palette1}, 'dNBR Visualization', 0);

// Display the results
var grey = ['white', 'black'];
Map.addLayer(nbrMeansPre, {min:-1, max:1, palette: grey}, 'NBR pre-fire',0);
Map.addLayer(nbrMeansPost, {min:-1, max:1, palette: grey}, 'NBR post-fire',0);


var clusterMeans = dNBR.addBands(post_fire_clustered.select('cluster'))
  .reduceRegion({
    reducer: ee.Reducer.mean().group(1, 'group'),
    geometry: area,
    scale: 30,
    maxPixels: 1e9
  });

print("Mean dNBR for each cluster:", clusterMeans);
// Convert the clusterMeans dictionary to a feature collection
var features2 = ee.FeatureCollection(
  ee.List(clusterMeans.get('groups')).map(function(cluster){
    var properties = ee.Dictionary(cluster);
    var id = properties.get('group');
    var mean_dNBR = ee.Number(properties.get('mean')).format('%.2f');
    return ee.Feature(null, {id: id, mean_dNBR: mean_dNBR});
  })
);
print('Features 2:', features2);

// Convert the feature collection to a CSV file and export to Google Drive
Export.table.toDrive({
  collection: features2,
  description: 'post_fire_clusters_mean_dNBR',
  fileFormat: 'CSV'
});

//-----------------------------------------------------------------------------------------

// Create a histogram for dNBR
var dNBR_histp = ui.Chart.image.histogram({
  image: dNBR,
  region: area,
  scale: 30,
  maxBuckets: 1000,
  minBucketWidth: 1
});

// Customize the chart
dNBR_hist = dNBR_histp.setOptions({
  title: 'Histogram of dNBR values',
  vAxis: {title: 'Pixel Count'},
  hAxis: {title: 'dNBR'},
  colors: ['blue']
});

// Add the chart to the console
print(dNBR_histp);

//************************************************************************************************
//                           PART : CALCULATING BAIS2 (BURN AREA INDEX FOR SENTINE-2)
//************************************************************************************************

// Define a function to calculate the Burn Area Index (BAI)
function calculateBAI(image) {
  var bai = image.expression(
    '(1 - ((RE2 * RE3 * RE4) / RED)**0.5) * ((SWIR2 - RE4) / ((SWIR2 + RE4)**0.5) + 1)',
    {
      'RED': image.select('B4'), // Red band
      'RE2': image.select('B6'),  // RED EDGE 2 band
      'RE3': image.select('B7'),  // RED EDGE 3 band
      'RE4': image.select('B8A'), // RED EDGE 4 band
      'SWIR2': image.select('B12')  // SWIR 2 band
     
    });
  return bai;
}

// Calculate BAI for each cluster
var baiPost = calculateBAI(post_mos);
print('Values in baiPost:', baiPost.getInfo());
var postFireClusteredBAI = post_fire_clustered.addBands(baiPost.rename('BAI'));
var baiMeansPost_unscaled = postFireClusteredBAI.reduceConnectedComponents({
  reducer: ee.Reducer.mean(),
  labelBand: 'cluster',
  maxSize: 256
});

var baiMeansPost = baiMeansPost_unscaled.multiply(1/100000);

// Display the results
Map.addLayer(baiMeansPost, {min:0, max:2, palette:['red', 'yellow']}, 'BAI Post-fire Cluster Means',0);

// Get the mean BAI value for each cluster
var BAIclusterMeans = baiMeansPost.addBands(post_fire_clustered)
  .reduceRegion({
    reducer: ee.Reducer.mean().group(1, 'cluster'),
    geometry: area,
    scale: 30,
    maxPixels: 1e9
  });

// Print the cluster means
print('BAI Cluster means:', BAIclusterMeans);

//************************************************************************************************
//                           PART : SAVI (SOIL ADJUSTED VEGETATION INDEX)
//************************************************************************************************

// Define a function to calculate the Soil Adjusted Vegetation Index (SAVI)
function calculateSAVI(image) {
var savi = image.expression(
'((NIR - RED) / (NIR + RED + L)) * (1 + L)',
{
'NIR': image.select('B8'), // Near-infrared band
'RED': image.select('B4'), // Red band
'L': 0.5 // Soil adjustment factor
});
return savi;
}

// Calculate SAVI for each cluster
var saviPost = calculateSAVI(post_mos);
print('Values in saviPost:', saviPost.getInfo());
var postFireClusteredSAVI = post_fire_clustered.addBands(saviPost.rename('SAVI'));

var saviMeansPost_unscaled = postFireClusteredSAVI.reduceConnectedComponents({
reducer: ee.Reducer.mean(),
labelBand: 'cluster',
maxSize: 256
});

var saviMeansPost = saviMeansPost_unscaled;

// Display the results
Map.addLayer(saviMeansPost, {min:0.5, max:1.5, palette:['red', 'yellow', 'green']}, 'SAVI Post-fire Cluster Means',0);

// Get the mean SAVI value for each cluster
var SAVIclusterMeans = saviMeansPost.addBands(post_fire_clustered)
.reduceRegion({
reducer: ee.Reducer.mean().group(1, 'cluster'),
geometry: area,
scale: 30,
maxPixels: 1e9
});

// Print the cluster means
print('SAVI Cluster means:', SAVIclusterMeans);

//************************************************************************************************
//                          PART : MSAVI2 (MODIFIED SOIL ADJUSTED VEGETATION INDEX)
//************************************************************************************************

// Define a function to calculate the Modified Soil-Adjusted Vegetation Index (MSAVI2)
function calculateMSAVI2(image) {
var msavi2 = image.expression(
'0.5 * ((2 * NIR + 1 - ((2 * NIR + 1)**2 - 8 * (NIR - RED))**0.5))',
{
'NIR': image.select('B8'), // Near-infrared band
'RED': image.select('B4') // Red band
});
return msavi2;
}

// Calculate MSAVI2 for each cluster
var msavi2Post = calculateMSAVI2(post_mos);
print('Values in msavi2Post:', msavi2Post.getInfo());
var postFireClusteredMSAVI2 = post_fire_clustered.addBands(msavi2Post.rename('MSAVI2'));

var msavi2MeansPost_unscaled = postFireClusteredMSAVI2.reduceConnectedComponents({
reducer: ee.Reducer.mean(),
labelBand: 'cluster',
maxSize: 256
});

var msavi2MeansPost = msavi2MeansPost_unscaled;

// Display the results
Map.addLayer(msavi2MeansPost, {min:0.5, max:1, palette:['red', 'yellow', 'green']}, 'MSAVI2 Post-fire Cluster Means',0);

// Get the mean MSAVI2 value for each cluster
var MSAVI2clusterMeans = msavi2MeansPost.addBands(post_fire_clustered)
.reduceRegion({
reducer: ee.Reducer.mean().group(1, 'cluster'),
geometry: area,
scale: 30,
maxPixels: 1e9
});

// Print the cluster means
print('MSAVI2 Cluster means:', MSAVI2clusterMeans);

//************************************************************************************************
//                           PART : TCW (Tesseled Cap Wetness)
//************************************************************************************************

// Define a function to calculate Tasseled Cap Wetness (TCW) index
function calculateTCW(image) {
  var tcw = image.expression(
    'BLUE * 0.0315 + GREEN * 0.2021 + RED * 0.3102 + NIR * 0.1594 + SWIR1 * (-0.6806) + SWIR2 * (-0.6109)',
    {
      'BLUE': image.select('B2'),  // Blue band
      'GREEN': image.select('B3'), // Green band
      'RED': image.select('B4'),   // Red band
      'NIR': image.select('B8'),   // Near-Infrared band
      'SWIR1': image.select('B11'),// Shortwave Infrared 1 band
      'SWIR2': image.select('B12') // Shortwave Infrared 2 band
    });
  return tcw;
}

// Calculate TCW for each cluster
var tcwPost = calculateTCW(post_mos);
print('Values in tcwPost:', tcwPost.getInfo());
var postFireClusteredTCW = post_fire_clustered.addBands(tcwPost.rename('TCW'));
var postFireClustered_output = post_fire_clustered.addBands(tcwPost.rename('TCW'));

var tcwMeansPost_unscaled = postFireClusteredTCW.reduceConnectedComponents({
  reducer: ee.Reducer.mean(),
  labelBand: 'cluster',
  maxSize: 256
});

var tcwMeansPost = tcwMeansPost_unscaled;

// Display the results
Map.addLayer(tcwMeansPost, {min:-2000, max:2000, palette:['red','brown','yellow']}, 'TCW Post-fire Cluster Means',0);

// Get the mean TCW value for each cluster
var TCWclusterMeans = tcwMeansPost.addBands(post_fire_clustered)
  .reduceRegion({
    reducer: ee.Reducer.mean().group(1, 'cluster'),
    geometry: area,
    scale: 30,
    maxPixels: 1e9
  });

// Print the cluster means
print('TCW Cluster means:', TCWclusterMeans);

//************************************************************************************************
//                           PART : EVI (ENHANCED VEGETATION INDEX)
//************************************************************************************************

// Define a function to calculate the Enhanced Vegetation Index (EVI)
function calculateEVI(image) {
  var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', 
    {
      'NIR': image.select('B8'), // Near-infrared band
      'RED': image.select('B4'), // Red band
      'BLUE': image.select('B2') // Blue band
    }
  );
  return evi;
}

// Calculate EVI for each cluster
var eviPost = calculateEVI(post_mos);
print('Values in eviPost:', eviPost.getInfo());
var postFireClusteredEVI = post_fire_clustered.addBands(eviPost.rename('EVI'));
var postFireClustered_output = post_fire_clustered.addBands(eviPost.rename('EVI'));

var eviMeansPost_unscaled = postFireClusteredEVI.reduceConnectedComponents({
  reducer: ee.Reducer.mean(),
  labelBand: 'cluster',
  maxSize: 256
});

var eviMeansPost = eviMeansPost_unscaled;

// Display the results
Map.addLayer(eviMeansPost, {min:0, max:2, palette:['brown', 'yellow', 'green']}, 'EVI Post-fire Cluster Means',0);

// Get the mean EVI value for each cluster
var EVIclusterMeans = eviMeansPost.addBands(post_fire_clustered)
  .reduceRegion({
    reducer: ee.Reducer.mean().group(1, 'cluster'),
    geometry: area,
    scale: 30,
    maxPixels: 1e9
  });

// Print the cluster means
print('EVI Cluster means:', EVIclusterMeans);

//print('post fire clustered output',postFirelustered_output.getInfo());
var postFireClustered_output = post_fire_clustered
  .addBands(ndviPost.rename('NDVI'))
  .addBands(dNBR_unscaled.rename('dNBR'))
  .addBands(tcwPost.rename('TCW'))
  .addBands(msavi2Post.rename('MSAVI2'))
  .addBands(baiPost.rename('BAIS2'))
  .addBands(saviPost.rename('SAVI'))
  .addBands(eviPost.rename('EVI'));

print("CLUSTERED OUTPUT",postFireClustered_output);
