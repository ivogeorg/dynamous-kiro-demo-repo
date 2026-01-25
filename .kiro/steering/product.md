# Product Overview

## Name
Kaldic

## Product Purpose
A SaaS Web application which speeds up the feature annotation in orthomosaics and 3D point clouds resulting in drone mapping and the creationg of engineering-grade 2D and 3D CAD objects for these features. It offers an automatic pre-annotation phase powered by AI and a manual phase where the user can accept, correct, delete, or add the proposed annotations and CAD conversions. These phases can be iterated until the user is satisfied. The input to the app are a GeoTIFF or Cloud Optimized GeoTIFF (COG) file with an orthomosaic and a corresponding point cloud file which contains the photogrammetrically calculated vertical dimension or LIDAR data in LAS or LAZ format. The input files are usually generated from drone-mapping imagery by a program like Agisoft Metashape. The output of the app is a DXF file, containing all the accepted CAD-converted raster features, which can be opened by any CAD program for downstream tasks.

## Target Users
Any industry which works with CAD files generated from aerial imagery: construction, infrastructure monitoring, architecture, engineering, etc.

## Key Features
The manual or semi-manual vectorization of raster features into CAD primitives is a lengthy and laborious process. Kaldic is meant to reduce the turnaround time by using AI and manual post-processing, using industry standard input and output files. It acts as a rapid but lightweight bridge between the raster images of photogrammetric application and the vector-based images of CAD applications.

## Business Objectives
1. Reduce the time of vectorizing an orthomosaic by 10-20 times.
2. Increase the accuracy of existing auto-annotation applications from 50-60% to over 90%.
3. Reduce the cost of having orthomosaics converted to engineering-grade CAD files by 2 or more times.

## User Journey
The typical workflow consists of the following steps:
1. A user logs in, registering if using for the first time.
2. The user uploads an orthomosaic (GeoTIFF file) and corresponding 3D point cloud (LAS file). It's important that the two files are generated at the same time by the same program, so that the height data corresponds to the 2D coordinates of the orthomosaic pixels.
3. The orthomosaic (or a small window of it, if too big) is displayed on the page along with an empty DXF column pane. The files are downloaded to the backend server.
4. The server performs a multi-agentic auto-annotation of orthomosaic features and populates a DXF file with the corresponding CAD objects, using 2D or 3D CAD primitives, depending on the kind of job. The first itearation of the application will default to 2D primitives for 2.5D DXF output.
5. When the server is done, it displays the DXF column pane and visualizes the CAD objects on top of the orthomosaic. The first iteration of the application will only annotate the following features:
   1. Road centerline.
   2. Road curb.
   3. Road gutter.
   4. Manhole.
   5. Tree.
   6. Building (roof).
   7. Fence.
   8. Light or eletric pole.
   9. Overhead power line.
   10. Parking lot.
   11. Parking lot stripe.
6. A floating pallette with user editing commands also appears.
7. The user can now select any of the annotated features on the orthomosaic view (which also causes the corresponding DXF entry to be highlighted) and do one of the following:
   1. Accept as is.
   2. Reject and delete.
   3. Edit. The editing can be done either with the mouse in the orthomosaic view or directly in the DXF entry. NOTE: This feature is advanced and not for the first iteration of the application.
   4. Add a missing feature annotation. NOTE: This is also an advanced feature not for the first iteration of the application.
   5. Select a region, which might or might not have one or more annotated features, and submit for iteration to the automatic phase on the backend server. The agentic server generates a series of proposals, which are shown to the user in a floating pane for acceptance or rejection (no editting). The user can reject all proposals or pick one and accept it. The DXF file is edited accordingly.
8. Step (7) can be iterated until the user is satisfied. At this time, a downloadable DXF file is generated.

## Success Criteria
1. 
