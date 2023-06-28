/*



*/


//*******************************************************************************************
//                             PART 2: DATA CLEANING AND PRE-PROCESSING  
//*******************************************************************************************

//Optimum Time for Sentinel 2 Analysis in Pakistan is 10 days according to UN-Spider
//The results vary significantly otherwise

//1 Year difference between post fire and pre fire timeframes is set to minimize seasonal noise

//Set the pre-fire dates
var prefire_start = '2021-03-31';  
var prefire_end = '2021-04-10';

// Now set the same parameters for AFTER the fire.
var postfire_start = '2022-03-31';
var postfire_end = '2022-04-10';

print(ee.String('Fire incident occurred between ').cat(prefire_end).cat(' and ').cat(postfire_start));

// Select imagery by time and location
var imagery = ee.ImageCollection(ImCol);

// In the following lines imagery will be collected in an ImageCollection, depending on the
// location of our study area and a given time frame.
var prefireImCol = ee.ImageCollection(imagery
    // Filter by dates.
    .filterDate(prefire_start, prefire_end)
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 5)
    // Filter by location.
    .filterBounds(area));
   
// Select all images that overlap with the study area from a given time frame
var postfireImCol = ee.ImageCollection(imagery
    // Filter by dates.
    .filterDate(postfire_start, postfire_end)
    .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than', 5)
    // Filter by location.
    .filterBounds(area));

//(typeof prefireImCol)
print('Satellite Imagery Dataset Band Names:', prefireImCol.first().bandNames());
print('Satellite Imagery Dataset Band Names:', postfireImCol.first().bandNames());
// Add the clipped images to the console on the right
print("Pre-fire Image Collection: ", prefireImCol);
print("Post-fire Image Collection: ", postfireImCol);

//Visualizing the RAW images
var visParamsTrue1 = {bands: ['B4','B3','B2'], min: 0, max: 3000, gamma: 1.0}
Map.addLayer(prefireImCol,visParamsTrue1, "Pre Fire Raw Imagery")
var visParamsTrue2 = {bands: ['B4','B3','B2'], min: 0, max: 3000, gamma: 1.0}
Map.addLayer(postfireImCol,visParamsTrue2, "Post Fire Raw Imagery")


// Function to mask clouds from the pixel quality band of Sentinel-2 SR data.
function maskS2sr(image) {
  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = ee.Number(2).pow(10).int();
  var cirrusBitMask = ee.Number(2).pow(11).int();
  // Get the pixel QA band.
  var qa = image.select('QA60');
  // All flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  // Return the masked image, scaled to TOA reflectance, without the QA bands.
  return image.updateMask(mask)
      .copyProperties(image, ["system:time_start"]);
}


// Function to mask clouds from the pixel quality band of Landsat 8 SR data.
function maskL8sr(image)
{
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = 1 << 3;
  var cloudsBitMask = 1 << 5;
  var snowBitMask = 1 << 4;
  // Get the pixel QA band.
  var qa = image.select('QA_PIXEL');
  // All flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0))
      .and(qa.bitwiseAnd(snowBitMask).eq(0))
      .and(qa.bitwiseAnd(1 << 6).neq(0));
  // Select the appropriate bands to apply the mask to
  var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'B11'];
  // Return the masked image, scaled to TOA reflectance, without the QA bands.
  return image.updateMask(mask)
      .select(bands)
      .copyProperties(image, ["system:time_start"]);
}

// Apply platform-specific cloud mask
if (platform == 'S2B' | platform == 's2b') {
  var prefire_CM_ImCol = prefireImCol.map(maskS2sr);
  var postfire_CM_ImCol = postfireImCol.map(maskS2sr);
} else {
  var prefire_CM_ImCol = prefireImCol.map(maskL8sr);
  var postfire_CM_ImCol = postfireImCol.map(maskL8sr);
}


var comp= post_cm_mos;


// This is especially important, if the collections created above contain more than one image
// (if it is only one, the mosaic() does not affect the imagery).

var pre_mos = prefireImCol.mosaic().clip(area);
var post_mos = postfireImCol.mosaic().clip(area);

var pre_cm_mos = prefire_CM_ImCol.mosaic().clip(area);
var post_cm_mos = postfire_CM_ImCol.mosaic().clip(area);
