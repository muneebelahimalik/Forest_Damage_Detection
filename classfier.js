//*******************************************************************************************
//                           PART : SUPERVISED CLASSIFICATION 
//*******************************************************************************************

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  TRAINING
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~

var composite = ee.Image.cat(comp,postFireClustered_output);
//Merge Feature Collections
var newfc = High_severity.merge(Moderate_high_severity).merge(Moderate_low_severity).merge(Low_severity).merge(Unburned).merge(Enhanced_regrowth_low).merge(Enhanced_regrowth_high);

//Define the Sentinel-2A bands to train your data
var bandsS2 = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7','B8A','B11','B12','cluster','EVI','NDVI','dNBR','TCW','MSAVI2','BAIS2','SAVI'];

//Merge the feature collections with the sentinel data
var trainingS2 = composite.select(bandsS2).sampleRegions({
  collection: newfc,
  properties: ['burn_severity'],
  scale: 30
});

// Add a random column to the feature collection
var trainingData = trainingS2.randomColumn('random');

// Split the data into training (70%) and validation (30%) sets
var trainingSet = trainingData.filter(ee.Filter.lessThan('random', 0.75));
var testSet = trainingData.filter(ee.Filter.gte('random', 0.1));

var validationS2 = composite.select(bandsS2).sampleRegions({
  collection: testSet,
  properties: ['burn_severity'],
  scale: 30
});

//Train the classifier
var classifierS2 = ee.Classifier.smileRandomForest(10).train({
  features: trainingSet,
  classProperty: 'burn_severity',
  inputProperties: bandsS2
});


//Run the Classification
var classifiedS2 = composite.classify(classifierS2);

// Create a confusion matrix representing resubstitution accuracy.
print('RF-S2 error matrix: ', classifierS2.confusionMatrix());
print('RF-S2 accuracy: ', classifierS2.confusionMatrix().accuracy());

// Classify the validation samples
var classifiedValidationS2 = validationS2.classify(classifierS2);

var selectedBands = ['classification']; // Specify the bands you want to include

//Mean classified values for all the clusters
var classified_calc = classifiedS2.select(selectedBands)
  .addBands(post_fire_clustered)
  .reduceConnectedComponents({
    reducer: ee.Reducer.mean(),
    labelBand: 'cluster',
    maxSize: 256,
  });

// Visualize the mean values per cluster
var meanVisParams = {min: 1, max: 7, palette:['006400','228B22','0ae042','fff70b','ffaf38','ff641b', 'FF0000']};
Map.addLayer(classifiedcalc, meanVisParams, 'Optical Classification');

