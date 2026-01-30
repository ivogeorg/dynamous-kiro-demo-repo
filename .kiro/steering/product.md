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
1. Multi-agentic automatic annotation:
   1. Percentage semantically correct proposals.
   2. Accuracy of proposed feature masks.
   3. Diversity of prosals for user-selected regions.
2. Speed and responsiveness.
3. Accuracy over the whole ortomosaic (Target: >90%).
4. Cumulative time of vectorization, from GeoTFF+LAS upload to DXF download, including automatic and manual phases (Target: 6 hours).
5. Cost efficiency of automatic phase, including training, fine-tuning, and inference.

## Versions and development sprints
The app implementation is complex, so the following staged development will be adopted:
1. Version: Demo sprint. This will be the only functionality that this sprint will implement, leaving most advanced features for Version 1 and Version 2. Components and features:
   1. Frontend. The frontend will be installed locally with a container and will serve to `localhost`.
      1. Only two pages:
         1. Splash screen with login and password.
         2. Main page:
            1. Graphical element: File upload and select. A matching pair of GeoTIFF and LAS files are required. There will be a default file for human judges to evaluate the app.
            2. Graphical element: Orthomosaic visualization (tiled) with pan and zoom with standard mouse actions. Visualization of automatically recognized features (received from backend), using OpenLayers.
            3. Graphical element: DXF artifacts column with editable entries. This is essentially an interactive visualization of the DXF file which will eventually be downloaded. When a feature is selected, its corresponding DXF records a highlighted and editable. Only 2D graphical primitives for this version.
            4. Graphical element: Floating user-tool pallette. Initially, there will be the following buttons: Accept All, Accept, Reject, Edit, Redo All, Redo, RedoRegion. AcceptAll and RedoAll are always active. Accept, Reject, Edit, and Redo are only active if a single feature has been selected in the orthomosaic pane. RedoRegion will be inactive for this version. Only AcceptAll, RedoAll, Accept, and Reject will be implemented for this version.
            5. Graphical element: Download DXF.
      2. Container which will serve to `localhost` only. For the Demo, the judges should be able to download the image from a Docker hub, create the conteainer and run it. The container will connect to the Backend, which will run in the cloud throughout the judging period.
   2. Backend. The backend will run in a container in the cloud and should accept connection from the local frontend container.
      1. Cloud server needs to be rented (AWS):
         1. GPU with VRAM >40GB.
         2. RAM 256/512 GB.
         3. Hard drive >4TB.
         4. Other parameters standard. 
      2. User management. Supabase, if possible, as there is an available subscription.
      3. File management. Supabase for file names. Server storage for uploaded files. For the demo, there will be only one GeoTIFF, LAS pair of about 6 GB. The user files will be supplied by the Frontend, but for the Demo, there will be only the default pair, which will already by on the server.
      4. Automatic feature annotation with GroundingDino and SAM 2.
      5. Geometrization engine which takes the Dino/Sam named masks and converts to engineering-grade CAD artifacts. These are sent to the Frontend and displayed on top of the orthomosaic. Expect to have some problems with proper localization. The orthomosaic world and relative coordinates will have to be matched, as well as the offsets of the generated feature artifacts.
      6. API/protocol for communication with Frontend.
      7. Container.
2. Version: 1. This is just a draft. More detail will be added at a later time.
   1. Frontend.
      1. Main page:
         1. Implement remaining user editing tools:
            1. Edit: Pixel-precision feature editing on top of the orthomosaic. Allow manual addition of features using CAD primitives.
            2. Redo: Ask for several proposals by the backend for the selected feature.
            3. RedoRegion: Ask for several proposals for a selected region (square, parallelepiped, circle). 
         2. Visualize raw SAM 2 masks and allow user to prompt SAM 2 (on the backend) directly when redoing.
   2. Backend.
      1. Fine-tuning of Grounding Dino and SAM 2.
      2. RLHF using human actions from frontend.
      3. Supervised training with a large manually annotated set of orthomosaics.
3. Version: 2. This is just a draft. More detail will be added at a later time.
   1. Frontend.
      1. Improvements will be proposed while Version 1 is being implemented.
   2. Backend.
      1. Multi-agentic auto-improvement of Dino/SAM.
      2. Meticulous assessment and measurement of features affecting the success criteria and reimplementation and/or further training/fine-tuning/self-improvement.
