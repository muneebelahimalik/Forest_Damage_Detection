# Forest-Fire-Sight: Forest Damage Detection using Unsupervised Learning 
This repository contains the shape files and code used to develop the Forest-Fire-Sight framework for Forest Damage Detection using Unsupervised Learning.

The code performs cascaded K-Means clustering on Sentinel-2B imagery and classifies the clusters using a Random Forest Classifier into 7 burn severity classes. The analysis is specific to the North Punjab forest fire incidence CPT regions, provided by [Punjab Forest department North Zone](https://fwf.punjab.gov.pk/)

# Description
Our innovative approach combines unsupervised machine learning and remote sensing to overcome the challenge of limited ground truth data in forest fire detection and burn severity classification. By leveraging satellite remote sensing imagery (Sentinel 2-B) and avoiding costly sensor or drone deployment, we extract valuable insights from complex datasets without predefined labels. Using a supervised machine learning model trained with spectral indices, we classify the clusters into 7 burn severity classes. The burnt area is then calculated and compared to ground truth data for validation purposes.

![Picture](https://github.com/muneebelahimalik/Forest_Damage_Detection/assets/59524535/7dce221c-b4fe-4293-8851-b17ac75b5750)
 

## Requirements

To successfully use this forest damage detection system, you will need the following:

- **Google Earth Engine Account**: Sign up for a Google Earth Engine account at https://earthengine.google.com/. This account is necessary to access and download the required satellite imagery.

- **Satellite Imagery**: Obtain the satellite imagery data necessary for the analysis. You can use Google Earth Engine API or other data sources to download the imagery. Convert the downloaded imagery to compatible formats (e.g., GeoTIFF) for further processing.

- **Input Polygons (Shapefiles)**: Acquire shapefiles representing the forest areas of interest. Ensure that the shapefiles are in the proper coordinate system (e.g., WGS84).


## Folder Structure
The repository consists of the following files and directories:

- `area_calculations/`: Directory containing scripts for area calculations.
- `dnbr_classification/`: Directory containing scripts for DNBR (differenced normalized burn ratio) classification.
- The main scripts for the project are:
  - `classifier.js`: Script for classification tasks.
  - `dataloader.js`: Script for loading and preprocessing data.
  - `image_analysis.js`: Script for analyzing satellite imagery.
  - `pre_processor.js`: Script for pre-processing steps.
  - `spectral_indices.js`: Script for calculating spectral indices.
  - `training.js`: Script for model training.
  - clusterer.js: Script for applying Cascaded K-Means Clustering
- `README.md`: This file, providing an overview of the project and instructions for usage.

## Getting Started

To get started with the forest damage detection system, follow these steps:

1. Clone the repository:
   
   git clone https://github.com/your-username/your-repo.git
   Navigate to the desired directory, such as src/, to access the main project scripts.

2. Install any necessary dependencies like Google Earth Pro for analyzing the kmz/shape files before importing them to the GEE.

3. Obtain satellite imagery data:
   Access the required satellite imagery using Google Earth Engine.
   Import the imagery dataset to your project.
  
4. Obtain input polygons (shapefiles):

   Acquire shapefiles representing the forest areas of interest.
   Ensure the shapefiles are in the proper coordinate system (e.g., WGS84).

## Usage
Here are some general usage guidelines:

- Load and preprocess the satellite imagery data using the dataloader.js script.
- Analyze the satellite imagery using the image_analysis.js script.
- Preprocess the data before clustering using the pre_processor.js script.
- Calculate spectral indices using the spectral_indices.js script.
- Perform the classification tasks using the classifier.js script, utilizing Random Forest Classifier.
- Please refer to the individual scripts for more detailed instructions and options for customization.
