# **Architectural Design and Implementation Strategy for High-Precision Web-Based Geospatial Editors: A Human-in-the-Loop Framework for AI-Generated CAD Correction**

## **1\. Introduction to the Convergence of Automated Intelligence and Engineering Precision**

The geospatial industry stands at a precipice of transformation, driven by the collision of two powerful forces: the commoditization of generative artificial intelligence (AI) and the migration of high-fidelity engineering workflows to the cloud. Historically, the domains of Geographic Information Systems (GIS) and Computer-Aided Design (CAD) operated in parallel but distinct universes. GIS provided the macroscopic context—the "world as it is"—through massive raster datasets and geodetic coordinate systems. CAD provided the microscopic precision—the "world as designed"—through infinite Cartesian planes and parametric vector entities.1

The emergence of AI models capable of segmenting satellite imagery into vector features has bridged these worlds, yet it has introduced a critical "last mile" problem. AI models, while efficient, act probabilistically. They generate geometries that are statistically likely but often engineering-imprecise—curved lines where straight ones are required, unconnected nodes where topological closure is mandatory, and noisy vertices where smooth arcs are expected. For applications in civil engineering, urban planning, and construction, these probabilistic outputs are insufficient. They require deterministic validity.

This necessity gave rise to the "Human-in-the-Loop" (HITL) paradigm. In this workflow, AI serves as a force multiplier, generating the initial 80% of the geometry, while human experts perform the critical final 20% of validation and correction. To be effective, this validation must occur in an environment that seamlessly integrates the source truth (GeoTIFFs, Point Clouds) with the derived vectors (DXF CAD).

This report details the comprehensive architectural design and technical implementation of a web-based, pixel-perfect geospatial editor. It addresses the unique challenges of rendering terabytes of data in a browser, managing the mathematical dissonance between geodetic and Cartesian coordinate systems, and providing a user experience that enables rapid, high-confidence correction of AI-generated artifacts.

### **1.1 The Shift to the Browser: A Thick Client Philosophy**

The traditional approach to this problem involved downloading massive datasets to a desktop workstation running heavy software like AutoCAD or ArcGIS Pro. This model is incompatible with modern, scalable AI workflows where data resides in the cloud and workforces are distributed globally. The browser, empowered by WebGL, WebAssembly (WASM), and the modern JavaScript ecosystem, has matured into a viable platform for engineering-grade applications.

However, replicating desktop performance in a browser requires a "Thick Client" architecture. Unlike traditional web mapping, which relies on server-side rendering of tiles, a CAD editor must perform complex geometric calculations—snapping, topology correction, affine transformations—directly on the client. This demands an architecture that leverages the GPU for visualization while utilizing Web Workers to keep the main thread responsive for user interaction, effectively treating the browser tab as a high-performance operating system container.3

### **1.2 The Triad of Data: Raster, Vector, and Reality Capture**

The proposed system is built upon the synthesis of three distinct data types, each requiring specialized handling:

1. **Cloud-Optimized GeoTIFF (COG):** The visual context. These are multi-gigabyte raster files that must be streamed intelligently, decoding only the pixels required for the current viewport.5  
2. **Cloud-Optimized Point Cloud (COPC):** The vertical truth. LiDAR data compressed into octree structures that allow for the progressive loading of 3D points, enabling users to verify the height and structure of features.4  
3. **DXF/CAD Vectors:** The editable payload. Unlike simple GeoJSON, CAD files contain complex entities (blocks, splines, layers) and strict styling rules that must be preserved during the edit cycle to ensure interoperability with downstream engineering tools.8

## **2\. Architectural Foundations and Library Selection**

The selection of the foundational software stack is the single most consequential decision in the system design. It dictates the limits of performance, the ease of implementing complex interactions, and the long-term maintainability of the platform.

### **2.1 The Mapping Engine: The Case for OpenLayers**

In the modern web mapping landscape, the primary contenders are OpenLayers, Mapbox GL JS (and its fork MapLibre), Leaflet, and Deck.gl. For a general-purpose viewing application, Mapbox/MapLibre or Deck.gl often win due to their superior GPU-driven rendering of massive vector datasets. However, for a *CAD editing* application, the requirements shift drastically from "display" to "manipulation."

#### **2.1.1 Analysis of Editing Capabilities**

Mapbox GL JS and MapLibre operate by converting vector data into "vector tiles"—essentially rasterizing the geometry into a proprietary buffer format optimized for the GPU. While efficient for rendering millions of static buildings, this process makes interactive editing mathematically difficult. To edit a vertex, the system must "un-project" it from the tile buffer, handle the fact that features are clipped at tile boundaries, and re-tessellate the geometry. This introduces latency and complexity that degrades the "pixel-perfect" feel required for CAD.10

Deck.gl, while powerful for visualization, relies on layers like nebula.gl for editing. These are often less mature than the core library and lack the deep integration with geospatial projection libraries required for engineering-grade coordinate transformation.12

OpenLayers, conversely, treats vector features as first-class objects in the browser's memory. Its VectorLayer renders geometries to an HTML5 Canvas or WebGL context but retains the mathematical representation of the feature (the coordinates) in a way that is instantly accessible to the CPU. This architecture is crucial for implementing advanced snapping, topology enforcement, and modification tools. OpenLayers provides the most robust set of interaction primitives (ol/interaction/Draw, ol/interaction/Modify, ol/interaction/Snap) out of the box, all of which are designed to work harmoniously.13

#### **2.1.2 Projection Support**

A fatal flaw in many web mapping libraries (like Leaflet and standard Mapbox) is the assumption of the Web Mercator projection (EPSG:3857). CAD drawings, however, often exist in local engineering grids or specific State Plane coordinate systems that do not align with Web Mercator. OpenLayers has deep integration with proj4js, allowing for the definition of arbitrary coordinate reference systems (CRS) and the precise reprojection of raster and vector content on the client side. This capability is non-negotiable for an application that claims "engineering precision".15

**Architectural Decision:** **OpenLayers** is selected as the kernel for the editor. Its superior handling of arbitrary projections, robust vector interaction APIs, and maturity in "Edit" workflows outweigh the raw visualization performance advantages of vector-tile-based libraries.17

### **2.2 State Management and Application Framework**

The application wrapper must manage a complex state: the list of active layers, the history stack (undo/redo), the currently selected tool, snapping thresholds, and AI confidence filters.

#### **2.2.1 React and the Virtual DOM**

React is the industry standard for building complex user interfaces. However, integrating React with an imperative library like OpenLayers requires a careful "Bridge" pattern. React's Virtual DOM attempts to control the entire page, while OpenLayers demands control over its specific DOM container (the map div).  
The architecture uses a MapContext to instantiate the OpenLayers map once. React components (e.g., \<LayerManager\>, \<Toolbar\>) consume this context. Crucially, the map's internal state (e.g., "which feature is hovered") is synchronized to the React state store using OpenLayers event listeners (select, change), but high-frequency events (like mouse movement for snapping) are handled directly within OpenLayers interactions to avoid React render cycle overhead.19

#### **2.2.2 Immutable State for Undo/Redo**

For a HITL workflow, the ability to undo complex operations is vital. We utilize a state management library like **Zustand** or **Redux Toolkit** combined with **Immer**.

* **The Command Pattern:** Every user action (e.g., "Move Node," "Trim Line," "Accept Prediction") is encapsulated as a Command object containing do() and undo() logic.  
* **History Stack:** These command objects are pushed to a stack in the state store. The "Undo" operation pops the stack and executes undo(). Because OpenLayers features are mutable objects, the state store must track the *serialized* version of the geometry (e.g., GeoJSON) before and after the edit to restore it accurately.21

### **2.3 The Library Ecosystem: A Comparative Overview**

The following table summarizes the selected technology stack and the rationale against alternatives.

| Component | Selected Technology | Primary Reason for Selection | Rejected Alternatives |
| :---- | :---- | :---- | :---- |
| **Map Engine** | **OpenLayers (v10+)** | Best-in-class vector editing, projection support (proj4js), and direct feature access. | **Mapbox/MapLibre:** Vector tiles complicate editing. **Leaflet:** Poor performance with large datasets. |
| **Raster Engine** | **geotiff.js** | Native parsing of COG headers, tile decoding, and flexible integration with OpenLayers sources. | **Server-side Rendering:** High latency and bandwidth costs. |
| **Point Cloud** | **copc.js** | Streaming of LAZ/COPC data via HTTP Range Requests; EPT hierarchy traversal. | **Potree:** Harder to integrate into a 2D-first editor. **Three.js:** Too generic, lacks geospatial context. |
| **CAD Parser** | **dxf-parser / dxf-writer** | Isomorphic JavaScript solution for reading/writing DXF text/binary. | **Backend Conversion:** Slow round-trip; prevents offline capability. |
| **UI Framework** | **React 18+** | Component modularity, ecosystem for complex state management. | **Vue/Angular:** Valid choices, but React has stronger GIS library bindings. |
| **UI Components** | **Radix UI \+ Floating UI** | Unstyled, accessible primitives perfect for custom floating CAD palettes. | **Material UI:** Too opinionated/heavy. **Bootstrap:** Outdated. |
| **State** | **Zustand** | Minimalist boilerplate compared to Redux; optimized for transient updates. | **Context API (Raw):** Performance issues with frequent updates. |

## **3\. The Raster Context: High-Fidelity COG Implementation**

In a HITL workflow, the human operator relies entirely on the visual context provided by aerial imagery to validate AI predictions. If the imagery is blurry, slow to load, or poorly contrasted, the operator's judgment is compromised. The implementation of Cloud-Optimized GeoTIFFs (COGs) is therefore not just a data loading task, but a visualization engineering challenge.

### **3.1 The Cloud-Optimized Paradigm**

A COG is a standard TIFF file with a specific internal organization. It is tiled (usually $256 \\times 256$ or $512 \\times 512$ blocks) and contains "Overviews" (downsampled versions of the full image) in the header.  
The web client utilizes HTTP Range Requests to fetch specific byte ranges. When the map is zoomed out, the client requests bytes corresponding to the low-resolution overviews. As the user zooms in, the client calculates the byte offsets for the high-resolution tiles intersecting the viewport and fetches only those chunks. This allows a browser to "open" a 100GB satellite image instantly without downloading the file.5

### **3.2 Deep Dive: geotiff.js Integration**

We utilize the geotiff.js library to handle the low-level parsing of the TIFF binary format. The integration into OpenLayers is achieved through the ol/source/GeoTIFF.

1. **Decoder Pool:** TIFF tiles are often compressed using LZW, Deflate, or JPEG. Decompressing these on the main thread causes UI freezes. We configure geotiff.js to spawn a pool of **Web Workers**. The main thread requests a tile; the worker fetches the bytes, decompresses them, and transfers the raw ArrayBuffer back to the main thread.  
2. **Source Configuration:**  
   JavaScript  
   const source \= new GeoTIFF({  
     sources: \[  
       { url: 'https://bucket/path/to/image.tif' }  
     \],  
     convertToRGB: false, // Vital for accessing raw values  
     interpolation: 'nearest', // Preserves pixel grid for precise editing  
   });

   Setting convertToRGB: false is critical. It ensures that the source passes the raw sensor data (which might be 16-bit integers or multispectral bands) to the rendering pipeline, rather than a pre-processed 8-bit RGB image.6

### **3.3 The WebGL Rendering Pipeline and Custom Shaders**

Standard canvas rendering is insufficient for professional analysis because raw satellite data often has poor visual contrast (e.g., 12-bit data displayed on an 8-bit screen appears black) or requires band recombination (e.g., displaying Near-Infrared to see vegetation).

We employ the ol/layer/WebGLTile layer, which utilizes a WebGL fragment shader to process pixels.

#### **3.3.1 Dynamic Histogram Stretching**

To maximize the visual information, we implement "Dynamic Range Adjustment" (DRA).

1. **Statistics Calculation:** As tiles load, a background process (or a simplified sampling of the overview) calculates the histogram of the pixel values in the current view. We determine the minimum ($v\_{min}$) and maximum ($v\_{max}$) values that capture 98% of the data (clipping outliers).  
2. Shader Logic: The fragment shader applies a linear stretch:

   $$Color\_{out} \= \\frac{Color\_{in} \- v\_{min}}{v\_{max} \- v\_{min}}$$

   This operation is performed purely on the GPU, allowing the user to adjust contrast sliders in the UI and see the result instantly at 60 FPS.6

#### **3.3.2 False Color Composites**

For validation tasks involving vegetation management or impervious surfaces, true color (RGB) is often misleading. The editor UI provides a "Band Combination" menu.

* **Mechanism:** The COG might contain 4 bands: Red, Green, Blue, Near-Infrared (NIR).  
* **Implementation:** We pass a style object to the WebGL layer. For a "Color Infrared" view, we map the channels:  
  * Red Channel $\\leftarrow$ Band 4 (NIR)  
  * Green Channel $\\leftarrow$ Band 1 (Red)  
  * Blue Channel $\\leftarrow$ Band 2 (Green)  
* **OpenLayers Expression:**  
  JavaScript  
  style: {  
    color: \[  
      'array',  
      \['band', 4\], // Red output gets NIR input  
      \['band', 1\], // Green output gets Red input  
      \['band', 2\], // Blue output gets Green input  
      1 // Alpha  
    \]  
  }

  This flexibility allows the human operator to "see" features that are otherwise invisible, improving the accuracy of the CAD correction.6

## **4\. The 3D Reality Layer: COPC and Point Cloud Integration**

While GeoTIFFs provide horizontal context, they lack verticality. A CAD technician needs to know if a line represents the base of a wall or the eave of a roof. This requires the integration of LiDAR data via Cloud-Optimized Point Clouds (COPC).

### **4.1 The COPC Specification and copc.js**

COPC is a valid LAZ 1.4 file that stores points in a clustered octree. The file header points to the root of the hierarchy. Each node in the tree contains a chunk of points and pointers to its children.4  
We use copc.js to traverse this hierarchy. The library abstracts the complexity of fetching the specific 64kb chunks of the LAZ file and decompressing them using laz-perf (a WASM module).7

### **4.2 Rendering Millions of Points in 2D**

Since the primary interface is a 2D map (OpenLayers), we must project the 3D points onto the 2D canvas. We create a custom Layer subclass, let's call it COPCLayer.

#### **4.2.1 The Render Loop**

1. **View Frustum Culling:** On every frame (or view change), the renderer calculates the world extent of the camera.  
2. **Tree Traversal:** It queries the copc.js instance to find which octree nodes intersect this extent.  
3. **LOD Selection:** Based on a target "Point Budget" (e.g., 2 million points), the system decides how deep to traverse. It prioritizes nodes closer to the camera center or at higher zoom levels.  
4. **Projection:** The points ($x, y, z$) are projected to screen coordinates ($u, v$). The $z$ value is retained for styling.  
5. **Drawing:** We use WebGLPointsLayer logic. Points are drawn as GL\_POINTS. Their color is determined by a shader that maps the $z$ value (or the intensity/classification attribute) to a color ramp (e.g., Viridis or Jet). This creates a "Heatmap" effect where taller structures appear red and the ground appears blue, giving immediate visual cues about height.25

### **4.3 Algorithms for Z-Extraction**

A critical requirement is assigning accurate height to the CAD features being edited. When a user draws a building footprint, it should ideally "snap" to the roof elevation, not the ground (or 0).

#### **4.3.1 Raycasting and Spatial Querying**

When the user clicks a coordinate $(x\_{click}, y\_{click})$, we cannot simply look up the height because point clouds are sparse; there is likely no point exactly at that float coordinate.

1. **Neighborhood Search:** We implement a query that searches the currently loaded COPC nodes for points within a radius $r$ (e.g., 0.5 meters) of the click.  
2. **Statistical Filtering:**  
   * **Roof Snapping:** We calculate the $90^{th}$ percentile of the Z-values in the radius. This avoids snapping to a chimney (outlier max) or a point that penetrated the tree canopy (outlier min), giving a reliable roof surface height.  
   * **Ground Snapping:** We calculate the median or the minimum (depending on noise characteristics) to find the terrain height.  
3. **Implementation Detail:** This search is computationally expensive if done linearly. We maintain a client-side **Quadtree** of the loaded points. The query becomes an $O(\\log N)$ operation, ensuring the UI remains responsive even when querying millions of points.7

## **5\. The Vector Core: CAD Engineering and DXF Interoperability**

The heart of the application is the vector editing capability. The system must handle the complexities of the DXF format while providing a user experience that feels like a modern drawing tool.

### **5.1 DXF Parsing and Entity Normalization**

DXF is a complex, text-based format. We use dxf-parser running inside a Web Worker to parse the file into a JSON object model without blocking the UI thread.29

#### **5.1.1 Entity Mapping**

We must map CAD entities to OpenLayers geometries:

* **LINE / LWPOLYLINE:** Mapped to ol/geom/LineString. The bulge parameter in Polylines (used for arcs) is critical. OpenLayers does not support "arc segments" natively in LineStrings. We must tessellate these arcs into short line segments during parsing. The tessellation density (step size) determines the visual smoothness.9  
* **INSERT (Block References):** Mapped to ol/geom/Point. The styling engine renders the block's geometry at this point, applying the scale and rotation defined in the INSERT entity.  
* **SPLINE:** Mapped to ol/geom/LineString via adaptive sampling.  
* **HATCH:** Mapped to ol/geom/Polygon.

#### **5.1.2 Layer Preservation**

CAD users organize data by Layers (e.g., "V-BLDG", "C-ROAD"). The parser extracts the layer table. We implement a \<LayerManager\> UI component that allows users to toggle visibility and lock/unlock specific CAD layers. Crucially, when saving back to DXF, features must remain on their original layers.

### **5.2 The Coordinate System Abyss: Affine Transformations**

Perhaps the most difficult technical challenge is aligning the CAD file with the GIS world.

* **The Problem:** A DXF might be drawn in a local grid where $(0,0)$ is a survey stake. The GeoTIFF is in UTM Zone 10N. If we load the DXF directly, it will render in the Atlantic Ocean (or null island).  
* The Solution: Affine Transformation.  
  We require a transformation matrix that scales, rotates, and translates the CAD coordinates to the GIS projection.

#### **5.2.1 Mathematical Implementation**

The transformation is defined by:

$$\\begin{bmatrix} x\_{gis} \\\\ y\_{gis} \\end{bmatrix} \= \\begin{bmatrix} s \\cdot \\cos(\\theta) & \-s \\cdot \\sin(\\theta) \\\\ s \\cdot \\sin(\\theta) & s \\cdot \\cos(\\theta) \\end{bmatrix} \\begin{bmatrix} x\_{cad} \\\\ y\_{cad} \\end{bmatrix} \+ \\begin{bmatrix} T\_x \\\\ T\_y \\end{bmatrix}$$  
Where $s$ is scale, $\\theta$ is rotation, and $T$ is translation.

**Workflow:**

1. **Control Points:** The user enters "Georeference Mode." They click a point on the CAD vectors (Point A) and the corresponding location on the satellite map (Point B). They repeat this for 2-3 locations.  
2. **Solver:** We use a least-squares solver (e.g., via numeric.js or math.js) to calculate the best-fit Affine Matrix parameters.30  
3. **Pipeline Integration:** We create a custom loader for the OpenLayers Vector Source. As features are parsed from the DXF, their coordinates are piped through this matrix *before* being instantiated as OpenLayers geometries. This places them correctly on the map.  
4. **PROJ4 Definitions:** For advanced users, we allow the input of a custom PROJ4 string using the \+nadgrids or affine pipeline syntax supported by proj4js. This allows the definition to be saved and reused.30

### **5.3 Pixel-Perfect Editing Tools**

Standard GIS editing is often "loose." CAD editing must be precise.

#### **5.3.1 Advanced Snapping**

We implement a custom Snapping engine that surpasses the default ol/interaction/Snap.

* **Performance:** We use rbush (a spatial index) to index all segment endpoints.  
* **Constraints:** We implement "Orthogonal Mode" (holding Shift constrains lines to 90 degrees) and "Extension Snapping" (showing a dashed line when the cursor aligns with an existing segment).  
* **Visual Feedback:** When snapping, a marker appears (Square for Endpoint, Triangle for Midpoint, Hourglass for Nearest) to give the user confidence in the connection.14

#### **5.3.2 Topology Enforcement with Topolis**

To prevent "dangles" and "slivers" (common AI errors), we integrate topolis.

* **The Mesh:** Topolis converts the "Spaghetti" of lines into a topological mesh (Nodes, Edges, Faces).  
* **Shared Editing:** When a user moves a vertex shared by two polygons, Topolis updates both boundaries simultaneously. This ensures that no gaps are created during correction, maintaining the topological validity required for GIS databases.14

## **6\. Human-in-the-Loop User Experience (UX) Design**

The UI must minimize cognitive load to maximize the "Validations Per Minute" (VPM) metric.

### **6.1 Layout and Chrome**

We adopt a "Floating Palette" design rather than a sidebar-heavy GIS layout.

* **Radix UI & Floating UI:** We use these libraries to create unstyled, accessible panels (Layers, Properties, History) that float over the map. This maximizes the screen real estate for the map itself.32  
* **Responsive Context:** The panels can be collapsed or moved to a second monitor (if the browser window spans screens), mimicking the flexibility of desktop CAD tools.

### **6.2 The Review Workflow**

The AI validation process is streamlined:

1. **Auto-Pan:** The system maintains a queue of "Low Confidence" AI detections. Clicking "Next" animates the camera to the next feature.  
2. **Color Coded Confidence:** Features are styled based on the AI's confidence score (Red \< 60%, Yellow \< 80%, Green \> 90%).  
3. **Quick Actions:**  
   * **Spacebar:** Mark as Verified (changes style to solid line).  
   * **X Key:** Delete feature.  
   * **C Key:** Cut/Split feature at cursor.  
   * **J Key:** Join selected lines.

### **6.3 Handling Ambiguity: The Clarification Menu**

In dense urban areas, lines often overlap (e.g., a fence line on top of a parcel boundary).

* **Problem:** Standard forEachFeatureAtPixel simply returns the top feature.  
* **Solution:** We implement a recursive hit-detection. If multiple features are found within the pixel tolerance, we do not select immediately. Instead, we render a small **Clarification Menu** (using Radix Context Menu) listing the features: "Line (Layer: Fence)", "Polygon (Layer: Parcel)". The user clicks the specific item they intended to select.34

## **7\. Performance Optimization and Implementation Strategy**

### **7.1 Memory Management**

Browser tabs have a hard memory limit (often \~2-4GB). Loading a 500MB DXF can crash the tab.

* **Spatial Loading:** We do not instantiate ol.Feature objects for the entire DXF at once. We keep the lightweight JSON model in the Web Worker. The main thread only requests features that intersect the current map extent. As the user pans, we fetch and hydrate features, and destroy those that leave the view. This "Virtual Scrolling" for the map ensures the DOM/Memory footprint remains constant regardless of dataset size.

### **7.2 Web Worker Architecture**

To maintain a consistent 60 FPS, the main thread must handle only UI rendering and user interaction. All data processing occurs in workers.

| Task | Thread | Implementation |
| :---- | :---- | :---- |
| **UI Rendering** | Main | React / DOM |
| **Map Interaction** | Main | OpenLayers / Canvas Events |
| **GeoTIFF Decoding** | Worker Pool | geotiff.js (Parallel decoding) |
| **DXF Parsing** | Worker | dxf-parser (Text processing) |
| **Geometry Math** | Worker | Affine transforms, tessellation |
| **Point Cloud Fetching** | Worker | copc.js (Network I/O) |

### **7.3 Garbage Collection Mitigation**

Frequent object creation (e.g., creating a new Coordinate array on every mouse move) triggers the Garbage Collector, causing frame stutters.

* **Object Pooling:** We implement a pool for the temporary geometry objects used during snapping calculations. Instead of new Point(), we borrow from the pool and reset it.

## **8\. Conclusion and Future Outlook**

The architecture detailed in this report represents a rigorous, engineering-first approach to web mapping. By carefully selecting OpenLayers for its vector precision, geotiff.js and copc.js for their cloud-native streaming capabilities, and a React-based "Thick Client" architecture, we can deliver a Human-in-the-Loop editor that rivals desktop CAD software.

This system solves the "last mile" problem of AI in geospatial engineering. It allows the probabilistic outputs of deep learning models to be validated, corrected, and hardened into the deterministic data required for the physical world, all within the accessible, scalable environment of the modern web browser. As WebGPU matures, this architecture is poised to evolve further, potentially moving the entire rendering pipeline to the GPU for even greater performance with massive city-scale datasets.

#### **Works cited**

1. CAD vs GIS \- A Comparative Analysis \- Ellipsis Drive, accessed January 21, 2026, [https://ellipsis-drive.com/blog/cad-and-gis-are-two-types-of-spatial-software.-geographical/](https://ellipsis-drive.com/blog/cad-and-gis-are-two-types-of-spatial-software.-geographical/)  
2. What's the Difference Between CAD and GIS?, accessed January 21, 2026, [https://gisgeography.com/cad-gis-differences/](https://gisgeography.com/cad-gis-differences/)  
3. CAD-Viewer: A High-Performance, Browser-Only DWG/DXF Viewer for the Future of Web CAD | by mlightcad | Medium, accessed January 21, 2026, [https://medium.com/@mlightcad/cad-viewer-a-high-performance-browser-only-dwg-dxf-viewer-for-the-future-of-web-cad-fc31dda3ed53](https://medium.com/@mlightcad/cad-viewer-a-high-performance-browser-only-dwg-dxf-viewer-for-the-future-of-web-cad-fc31dda3ed53)  
4. Advanced Caching and Streaming for Large Scale Point Cloud Data Visualization on the Web \- DigitalCommons@USU, accessed January 21, 2026, [https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1002\&context=etd2023](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1002&context=etd2023)  
5. geotiff.js, accessed January 21, 2026, [https://geotiffjs.github.io/](https://geotiffjs.github.io/)  
6. GeoTIFF Rendering · HonKit \- OpenLayers, accessed January 21, 2026, [https://openlayers.org/workshop/en/cog/](https://openlayers.org/workshop/en/cog/)  
7. connormanning/copc.js \- GitHub, accessed January 21, 2026, [https://github.com/connormanning/copc.js/](https://github.com/connormanning/copc.js/)  
8. mlightcad/cad-viewer \- NPM, accessed January 21, 2026, [https://www.npmjs.com/package/@mlightcad/cad-viewer](https://www.npmjs.com/package/@mlightcad/cad-viewer)  
9. dxf-writer CDN by jsDelivr \- A CDN for npm and GitHub, accessed January 21, 2026, [https://www.jsdelivr.com/package/npm/dxf-writer](https://www.jsdelivr.com/package/npm/dxf-writer)  
10. Mapbox.js (or GL) with OpenLayers \- Geographic Information Systems Stack Exchange, accessed January 21, 2026, [https://gis.stackexchange.com/questions/299253/mapbox-js-or-gl-with-openlayers](https://gis.stackexchange.com/questions/299253/mapbox-js-or-gl-with-openlayers)  
11. As a developer I want to decide which map library we want to use in UI \#26 \- GitHub, accessed January 21, 2026, [https://github.com/HSLdevcom/jore4/issues/26](https://github.com/HSLdevcom/jore4/issues/26)  
12. Base Maps | deck.gl, accessed January 21, 2026, [https://deck.gl/docs/get-started/using-with-map](https://deck.gl/docs/get-started/using-with-map)  
13. Mapping libraries: a practical comparison \- GISCARTA, accessed January 21, 2026, [https://giscarta.com/blog/mapping-libraries-a-practical-comparison](https://giscarta.com/blog/mapping-libraries-a-practical-comparison)  
14. topolis integration \- OpenLayers, accessed January 21, 2026, [https://openlayers.org/en/latest/examples/topolis.html](https://openlayers.org/en/latest/examples/topolis.html)  
15. PROJ4JS | Proj4js, accessed January 21, 2026, [http://proj4js.org/](http://proj4js.org/)  
16. Using proj4 and EPSG code to transform into different coordinate system \- Stack Overflow, accessed January 21, 2026, [https://stackoverflow.com/questions/56617254/using-proj4-and-epsg-code-to-transform-into-different-coordinate-system](https://stackoverflow.com/questions/56617254/using-proj4-and-epsg-code-to-transform-into-different-coordinate-system)  
17. Map libraries popularity: Leaflet vs MapLibre GL vs OpenLayers \- Geoapify, accessed January 21, 2026, [https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/](https://www.geoapify.com/map-libraries-comparison-leaflet-vs-maplibre-gl-vs-openlayers-trends-and-statistics/)  
18. What Mapping Library Would You Choose If Building a New GIS Solution Today? \- Reddit, accessed January 21, 2026, [https://www.reddit.com/r/gis/comments/1kyjnt4/what\_mapping\_library\_would\_you\_choose\_if\_building/](https://www.reddit.com/r/gis/comments/1kyjnt4/what_mapping_library_would_you_choose_if_building/)  
19. allenhwkim/react-openlayers: OpenLayer React Components \- GitHub, accessed January 21, 2026, [https://github.com/allenhwkim/react-openlayers](https://github.com/allenhwkim/react-openlayers)  
20. Introducing React-OpenLayers. Minimal React component for OpenLayers… | by Allen Kim | Digital-Heart | Medium, accessed January 21, 2026, [https://medium.com/allenhwkim/introducing-react-openlayers-f61810eae3c0](https://medium.com/allenhwkim/introducing-react-openlayers-f61810eae3c0)  
21. ol-ext: Undo/redo, accessed January 21, 2026, [https://viglino.github.io/ol-ext/examples/interaction/map.interaction.undoredo.html](https://viglino.github.io/ol-ext/examples/interaction/map.interaction.undoredo.html)  
22. Openlayers implement undo feature modify \- Stack Overflow, accessed January 21, 2026, [https://stackoverflow.com/questions/74762347/openlayers-implement-undo-feature-modify](https://stackoverflow.com/questions/74762347/openlayers-implement-undo-feature-modify)  
23. Cloud-Optimized Geospatial Formats Guide, accessed January 21, 2026, [https://guide.cloudnativegeo.org/](https://guide.cloudnativegeo.org/)  
24. Cloud Optimized GeoTIFF (COG) \- OpenLayers, accessed January 21, 2026, [https://openlayers.org/en/latest/examples/cog.html](https://openlayers.org/en/latest/examples/cog.html)  
25. WebGL points layer \- OpenLayers, accessed January 21, 2026, [https://openlayers.org/en/latest/examples/webgl-points-layer.html](https://openlayers.org/en/latest/examples/webgl-points-layer.html)  
26. COPC \- Giro3D, accessed January 21, 2026, [https://giro3d.org/next/examples/copc.html](https://giro3d.org/next/examples/copc.html)  
27. How to get X,Y,Z coordinate values from a point? \- Stack Overflow, accessed January 21, 2026, [https://stackoverflow.com/questions/77850144/how-to-get-x-y-z-coordinate-values-from-a-point](https://stackoverflow.com/questions/77850144/how-to-get-x-y-z-coordinate-values-from-a-point)  
28. Select points with highest Z value per (X, Y) coordinate \- Grasshopper \- McNeel Forum, accessed January 21, 2026, [https://discourse.mcneel.com/t/select-points-with-highest-z-value-per-x-y-coordinate/205282](https://discourse.mcneel.com/t/select-points-with-highest-z-value-per-x-y-coordinate/205282)  
29. DXF parser in vanilla JS \- javascript \- Stack Overflow, accessed January 21, 2026, [https://stackoverflow.com/questions/72908551/dxf-parser-in-vanilla-js](https://stackoverflow.com/questions/72908551/dxf-parser-in-vanilla-js)  
30. How to create proj4 definition of local coordinatesystem \- GIS StackExchange, accessed January 21, 2026, [https://gis.stackexchange.com/questions/298992/how-to-create-proj4-definition-of-local-coordinatesystem](https://gis.stackexchange.com/questions/298992/how-to-create-proj4-definition-of-local-coordinatesystem)  
31. How to use affine transform parameters in a PROJ or WKT2 string \- GIS StackExchange, accessed January 21, 2026, [https://gis.stackexchange.com/questions/387189/how-to-use-affine-transform-parameters-in-a-proj-or-wkt2-string](https://gis.stackexchange.com/questions/387189/how-to-use-affine-transform-parameters-in-a-proj-or-wkt2-string)  
32. floating-ui/floating-ui: A JavaScript library to position floating elements and create interactions for them. \- GitHub, accessed January 21, 2026, [https://github.com/floating-ui/floating-ui](https://github.com/floating-ui/floating-ui)  
33. React | Floating UI, accessed January 21, 2026, [https://floating-ui.com/docs/react](https://floating-ui.com/docs/react)  
34. Select \- OpenLayers v10.7.0 API \- Class, accessed January 21, 2026, [https://openlayers.org/en/latest/apidoc/module-ol\_interaction\_Select-Select.html](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Select-Select.html)  
35. How to select which feature overlay in case of overlapping or same geometry in OpenLayers, accessed January 21, 2026, [https://stackoverflow.com/questions/66037242/how-to-select-which-feature-overlay-in-case-of-overlapping-or-same-geometry-in-o](https://stackoverflow.com/questions/66037242/how-to-select-which-feature-overlay-in-case-of-overlapping-or-same-geometry-in-o)  
36. Context Menu – Radix Primitives, accessed January 21, 2026, [https://www.radix-ui.com/primitives/docs/components/context-menu](https://www.radix-ui.com/primitives/docs/components/context-menu)