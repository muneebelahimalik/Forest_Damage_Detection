/*


*/

// Print the number of images in the prefireImCol and postfireImCol ImageCollections
var prefire_count = prefireImCol.size();
var postfire_count = postfireImCol.size();

print("Number of images in prefireImCol: ", prefire_count);
print("Number of images in postfireImCol: ", postfire_count);

var prefireInfo = prefireImCol.first().select(0).projection();
var postfireInfo = postfireImCol.first().select(0).projection();

// Print the number of pixels and their resolution for the pre-fire and post-fire images
print('Number of pixels in pre-fire images:', prefireInfo.nominalScale().divide(10).toInt().pow(2).multiply(prefireImCol.size()));
print('Resolution of pre-fire images (m):', prefireInfo.nominalScale().getInfo());
print('Number of pixels in post-fire images:', postfireInfo.nominalScale().divide(10).toInt().pow(2).multiply(postfireImCol.size()));
print('Resolution of post-fire images (m):', postfireInfo.nominalScale().getInfo());
