# **Automated Geospatial Feature Extraction & Vectorization: A Hybrid AI-Geometric Pipeline**

## **1\. Introduction: The Deterministic Gap in Geospatial AI**

The geospatial industry stands at a critical inflection point, characterized by a paradoxical "data abundance and information scarcity".1 While the acquisition of high-resolution Earth Observation (EO) data has been democratized through the proliferation of UAVs, low-orbit satellite constellations, and airborne LiDAR systems, the downstream processing—specifically the conversion of raw sensor data into engineering-grade vector deliverables—remains a stubborn bottleneck. This report investigates the architecture of an automated, end-to-end pipeline designed to bridge this gap, specifically targeting the extraction of topographic and infrastructure features from GeoTIFF orthomosaics and LAS point clouds. The ultimate objective is the generation of topologically correct DXF geometric primitives—Points, Lines, Arcs, and Polygons—that satisfy the rigorous standards of Civil Engineering and Computer-Aided Design (CAD).

The core technical challenge addressed herein is the "Raster-to-Vector" (R2V) problem. Traditional Deep Learning (DL) approaches in remote sensing primarily function as semantic segmenters, classifying pixels into categories (e.g., "Road," "Building") to produce a probability map.2 However, a pixel mask is not a vector. When these masks are polygonized using standard contours, the results are often geometrically excessively complex ("staircased" edges), topologically invalid (self-intersections), or physically implausible (floating power lines). Engineers do not require pixel masks; they require mathematical primitives: a curb defined by a smooth spline, a building defined by orthogonal corners, and a power line defined by a catenary curve.

To solve this, we propose a **Hybrid Model Architecture** governed by a **Multi-Agentic Self-Correction Loop**. This system moves beyond monolithic "black box" models, employing a tiered strategy:

1. **Foundation Models (SAM 2, Grounding DINO)** provide zero-shot, open-vocabulary detection of discrete assets in 2D imagery.2  
2. **Specialized 3D Networks (PointNeXt, KPConv)** handle the volumetric classification of unstructured LiDAR data, essential for distinguishing vertical strata.4  
3. **Vectorization Engines (FrameField, PolyMapper)** replace pixel-masking with direct geometric prediction to ensure CAD-compliant linearity.6  
4. **Agentic Orchestration** acts as the "Human-in-the-Loop" surrogate, utilizing physics-based "Critic" agents to validate geometries against real-world constraints (e.g., gravity, orthogonality) before final export.7

This report provides an exhaustive technical analysis of these components, evaluating their theoretical underpinnings, computational requirements, and integration strategies into a cohesive, automated pipeline.

## **2\. Hybrid Model Architecture: Fusing Spectral and Structural Intelligence**

A single modality or model architecture is insufficient for the diversity of features found in topographic surveys. Discrete assets like manholes require different detection mechanisms than continuous networks like roads or volumetric structures like trees. Consequently, the proposed pipeline utilizes a hybrid architecture that ensembles 2D Foundation Models with 3D Deep Learning networks.

### **2.1 Foundation Models for 2D Discrete & Continuous Feature Extraction**

The paradigm in computer vision has shifted from training task-specific supervised models (which require retraining for every new object class) to prompting general-purpose "Foundation Models." For geospatial extraction, the synergy between **Grounding DINO** (for detection) and **Segment Anything Model 2 (SAM 2\)** (for segmentation) offers a robust solution for zero-shot extraction.

#### **2.1.1 Grounding DINO: Open-Set Object Detection**

Grounding DINO extends the Transformer-based DINO detection architecture by introducing language grounding, enabling the detection of objects based on arbitrary text prompts rather than fixed class labels.3

* **Mechanism:** The model aligns visual features with text embeddings in a shared semantic space. This allows the user to prompt for specific infrastructure elements—"square manhole," "utility pole," "storm drain"—without providing a single training image.  
* **Geospatial Application:** In this pipeline, Grounding DINO serves as the "Proposer." It scans the GeoTIFF orthomosaic to generate bounding box proposals for discrete assets. This is critical because SAM 2 is class-agnostic; it can "segment anything," but it needs to be told *where* to look.2 Grounding DINO provides the spatial prompt (the bounding box) that initializes the segmentation process.  
* **Performance & Cost:** Grounding DINO sets a new standard for zero-shot transfer on benchmarks like COCO and ODinW.10 However, this performance comes with significant computational cost. Inference on the "Tiny" model variant requires approximately 8.5 GB of VRAM, with larger variants demanding significantly more.10 Optimizations such as FP16 precision and batch processing are essential for analyzing large-scale aerial imagery.12

#### **2.1.2 Segment Anything Model 2 (SAM 2): Temporal and Spatial Continuity**

Meta AI’s SAM 2 represents a leap forward by introducing a "memory" mechanism designed for video, which allows the model to track objects across frames.2

* **The "Video" Metaphor in Geospatial:** While aerial imagery is static, large-scale mapping often involves processing "strips" of data that resemble video sequences. SAM 2’s memory encoder can be exploited here. By treating a flight line as a video sequence, the model can maintain the identity of continuous features—like a long road curb or a transmission line—across multiple image tiles, reducing the "fragmentation" artifacts common in tile-based processing.  
* **Architecture & Memory:** SAM 2 utilizes a hierarchical image encoder (Hiera) and a mask decoder that attends to both the current frame and the memory bank.13 The memory bank stores feature embeddings of past predictions.  
* **The VRAM Bottleneck:** A critical finding in deploying SAM 2 for large scans is the linear growth of memory usage. As the "video" (or flight strip) progresses, the memory bank accumulates features, leading to eventual Out-Of-Memory (OOM) errors even on 24GB+ GPUs.14  
* **Mitigation Strategy:** The pipeline must implement a **sliding window memory reset**. After processing a block of tiles (e.g., 100 frames), the memory bank is flushed or consolidated. This "forgetting" mechanism is acceptable in geospatial contexts where distant features (a road 5km back) rarely influence the segmentation of the current feature, unlike in object tracking where re-identification is key.14

### **2.2 Point Cloud Processing: Volumetric Semantic Segmentation**

While 2D imagery provides high-frequency texture information, it lacks the Z-axis discrimination required to separate "Ground" from "Non-Ground" or "Structure" from "Vegetation." 3D Semantic Segmentation of LAS/LAZ files is the second pillar of the architecture. We evaluate **PointNeXt** and **KPConv** for this task.

#### **2.2.1 PointNeXt: Scaling PointNet++ for Efficiency**

PointNeXt is a modernized evolution of the foundational PointNet++ architecture. It retains the set-abstraction layers (grouping points and extracting features) but introduces modern training strategies (CutMix, MixUp) and architectural scaling (changing channel width and depth).16

* **Efficacy:** PointNeXt achieves state-of-the-art (SOTA) performance on standard benchmarks like S3DIS and ScanObjectNN, outperforming the original PointNet++ by significant margins (up to 9.5% mIoU improvement on S3DIS).16  
* **Strengths:** It is highly efficient for broad-class segmentation. For categorizing "Ground" (to generate DTMs), "Vegetation," and "Buildings," PointNeXt offers an optimal balance of speed and accuracy. Its receptive field scaling allows it to understand the context of large planar surfaces (roofs, roads).  
* **Limitations:** Point-based methods like PointNeXt can struggle with extremely thin, linear features (power lines) where the point density is low and the geometry is strictly linear rather than volumetric.5

#### **2.2.2 KPConv: Deformable Kernels for Linear Infrastructure**

Kernel Point Convolution (KPConv) offers a fundamentally different approach. Instead of operating on discrete points or voxels, it defines a convolution in continuous Euclidean space using "kernel points" that carry weights.19

* **Deformable Convolutions:** The rigid kernel points can be made "deformable," meaning the network learns to shift the kernel positions to fit the local geometry of the input cloud. This is a game-changer for **Power Line Extraction**.  
* **Why KPConv Wins for Utilities:** Power lines are essentially 1D manifolds in 3D space. Standard ball-query neighborhoods (used in PointNet++) often capture too much empty space or background noise around the wire. KPConv's deformable kernels can align themselves *along* the wire, maximizing the signal-to-noise ratio. Research explicitly demonstrates that KPConv-based architectures (like SA-KPConv) achieve higher mIoU (approx. 89-97%) for transmission corridors compared to PointNet++.4  
* **Selection:** For this pipeline, **KPConv** is selected specifically for the "Linear Infrastructure" agent (power lines, fences, guardrails), while **PointNeXt** is utilized for the "Topographic" agent (ground, vegetation, buildings) due to its speed on massive datasets.

### **2.3 Vectorization Engines: Direct Primitive Prediction**

The output of the aforementioned models is typically a raster mask (2D) or a labeled point cloud (3D). Converting these to "clean" CAD vectors is the final hurdle. Naive polygonization (e.g., gdal\_polygonize or Marching Squares) results in jagged, high-vertex-count geometries that require extensive post-smoothing. To avoid this, we investigate Deep Vectorization techniques.

#### **2.3.1 FrameField Learning: Sharpening Building Geometries**

FrameField Learning addresses the "blob" problem in building extraction. Standard CNNs predict a probability $P(pixel \\in building)$, which blurs at corners.

* **Mechanism:** FrameField networks predict two auxiliary fields: one for the tangent direction of the boundary and another for the "cornerness" of the pixel. The loss function penalizes misalignment between the predicted boundary tangent and the true vector direction.6  
* **Result:** This forces the network to learn the *structure* of the building. The output is not just a mask, but a vector field that can be integrated to form sharp, orthogonal polygons. This method significantly outperforms naive segmentation for urban cadastral mapping, producing polygons that respect the right-angles inherent in human architecture.

#### **2.3.2 PolyMapper: Sequence-to-Sequence Vectorization**

PolyMapper treats vectorization as a sequence generation problem, similar to language translation. It uses a Recurrent Neural Network (RNN) combined with a Convolutional Neural Network (CNN).6

* **Mechanism:** The CNN extracts image features, and the RNN sequentially predicts the coordinates of the polygon vertices $(x\_1, y\_1), (x\_2, y\_2),... (x\_n, y\_n)$ until it predicts a "stop" token (closing the polygon).  
* **Trade-offs:** While PolyMapper produces true vectors directly (skipping the raster stage), it can struggle with complex topologies (e.g., a building with a courtyard) or long sequences. It is less robust than FrameField for dense urban clusters but is highly effective for simpler, discrete structures or road network graphs.

### **2.4 Hybrid Model Selection Matrix**

The following matrix summarizes the recommended model assignment based on feature type, balancing accuracy requirements with computational cost.

| Feature Type | Primary Model | Vectorization Strategy | Rationale & Performance |
| :---- | :---- | :---- | :---- |
| **Discrete Assets** (Manholes, Poles, Hydrants) | **Grounded SAM 2** | **Circle/Box Fit** | Zero-shot detection via Grounding DINO allows flexibility; SAM 2 provides pixel-perfect localization.3 |
| **Linear Utilities** (Power Lines, Cables) | **KPConv** (3D) | **Catenary Curve Fit** | Deformable kernels in KPConv excel at thin, linear 3D structures (mIoU \>89%).5 |
| **Road Networks** (Curbs, Centerlines) | **PointNeXt** (3D) \+ **Snakes** (2D) | **Active Contours** | PointNeXt separates road surface from cars/trees; Snakes refine the edge based on intensity gradients.22 |
| **Buildings** (Footprints) | **PointNeXt** (3D) \+ **FrameField** (2D) | **FrameField Integration** | PointNeXt filters roof points; FrameField ensures orthogonal, sharp-cornered 2D footprints.6 |
| **Vegetation/Ground** (DTM Generation) | **PointNeXt** | **Delaunay Triangulation** | High inference speed and scalability of PointNeXt make it ideal for massive point counts.16 |

## **3\. OpenCV & Geometric Refinement: The Mathematical Bridge**

Once the Deep Learning models have produced their initial hypotheses (masks or point clusters), the pipeline employs deterministic Computer Vision (OpenCV) and Computational Geometry algorithms to refine these into valid CAD primitives. This stage is crucial for removing the "organic" noise inherent in neural network predictions.

### **3.1 Probabilistic Hough Transforms (PHT) for Linear Regularization**

Deep learning road masks often exhibit "wobble" or varying widths. To extract a clean centerline or curb line, the Probabilistic Hough Transform is applied.24

* **Theory:** The Hough Transform maps points in the image space $(x,y)$ to the parameter space $(\\rho, \\theta)$ via the equation $\\rho \= x \\cos \\theta \+ y \\sin \\theta$. Collinear points in the image map to intersecting curves in the parameter space.  
* **Probabilistic Optimization:** Standard HT is computationally expensive for large rasters. The Probabilistic HT (implemented as HoughLinesP in OpenCV) randomly subsamples edge points, drastically reducing computation time while maintaining accuracy for strong linear features like road markings.24  
* **Application:** The pipeline uses PHT to convert the "Road Marking" segmentation mask into a set of vector segments. These segments are then clustered based on slope and intercept to merge disjoint detections (caused by occlusion) into a single continuous LWPOLYLINE.

### **3.2 Douglas-Peucker Simplification for Vertex Reduction**

A raw polygon derived from a pixel mask might have thousands of vertices (one for every pixel edge), creating massive DXF files that are slow to render. The Ramer-Douglas-Peucker (RDP) algorithm is the standard for decimation.27

* **Algorithm:** The algorithm defines a "tolerance" ($\\epsilon$). It recursively finds the vertex furthest from the line segment connecting the start and end points. If this distance is less than $\\epsilon$, the vertex is discarded.  
* **Adaptive Tuning:** The pipeline dynamically adjusts $\\epsilon$ based on the feature class.  
  * *Buildings:* High $\\epsilon$ to force straight walls.  
  * *Curbs/Roads:* Low $\\epsilon$ to preserve curvature.  
  * *Natural Features (Water):* Very low $\\epsilon$ to maintain fractal coastlines.

### **3.3 Active Contour Models ("Snakes") for Edge Snapping**

For features where the semantic segmentation is imprecise (e.g., a road gutter covered by shadows), "Snake" models provide a physics-based refinement.22

* **Energy Minimization:** A Snake is a spline curve that minimizes an energy functional $E\_{snake} \= \\int (E\_{int}(v(s)) \+ E\_{ext}(v(s))) ds$.  
  * **$E\_{int}$ (Internal Energy):** Composed of *continuity* (stretching) and *curvature* (bending) terms. This forces the line to be smooth and continuous, preventing jagged artifacts.  
  * **$E\_{ext}$ (External Energy):** Derived from the image data, typically the gradient magnitude ($-\\nabla I$). This acts as a gravitational force, pulling the snake towards edges (high contrast changes).  
* **Workflow:**  
  1. The DL model provides a rough initial mask.  
  2. The boundary of this mask is used as the *initialization* contour for the Snake.  
  3. The Snake iteratively deforms, "snapping" to the true high-gradient edge of the curb in the GeoTIFF.30  
* **Impact:** This results in vectors that align with the visible reality of the image with sub-pixel accuracy, surpassing the resolution of the initial segmentation mask.

## **4\. Multi-Agentic Self-Correction Loop**

The defining innovation of this pipeline is the transition from a linear process to a **recursive, agentic workflow**. Using orchestration frameworks like **LangGraph** or **CrewAI**, we deploy a team of AI agents that mimic the Quality Control (QC) process of a human engineering team.

### **4.1 The Orchestrator Agent**

The Orchestrator manages the data flow and state. It is responsible for **AOI Tiling** using the **Flip-n-Slide** strategy.31

* **Flip-n-Slide Tiling:** Standard non-overlapping tiling creates artifacts where objects are cut at the boundary. Flip-n-Slide creates overlapping tiles (e.g., 50% overlap) with rotational augmentations (0°, 90°, 180°, 270°).  
* **Fusion:** The Orchestrator aggregates the predictions from all overlapping views. A feature is only accepted if it is detected in multiple views, significantly reducing false positives and edge artifacts.

### **4.2 The Specialist Agents**

These agents encapsulate the hybrid models described in Section 2\.

* **Linear Infrastructure Agent:** Invokes KPConv and PHT to extract and vectorize wires and roads.  
* **Point Asset Agent:** Invokes Grounding DINO and SAM 2\. It manages prompt engineering, iterating through synonyms (e.g., prompting "manhole," then "drain cover," then "sewer access") to maximize recall.

### **4.3 The Critic/Judge Agent: Physics-Based Validation**

This agent serves as the ultimate gatekeeper. It does not rely on neural networks; it relies on **physics and geometry**. It evaluates the *validity* of the extracted vectors against real-world constraints.

#### **4.3.1 Catenary Curve Logic for Power Lines**

When the Linear Agent proposes a "Power Line," the Critic performs a geometric regression test.33

* **Math:** A hanging wire follows a catenary curve equation: $y \= a \\cosh(\\frac{x}{a})$.  
* **Validation:** The Critic fits this equation to the Z-coordinates of the proposed LiDAR points.  
* **Decision:** It calculates the Root Mean Square Error (RMSE) of the fit.  
  * If $RMSE \< Threshold$: The feature is physically a hanging wire. **ACCEPTED.**  
  * If $RMSE \> Threshold$: The feature is likely linear vegetation (a hedge) or noise. **REJECTED** or tagged for manual review.

#### **4.3.2 Z-Variance Check for Manholes**

When the Point Asset Agent proposes a "Manhole," the Critic analyzes the underlying LiDAR points.

* **Logic:** A manhole is a flat, planar surface.  
* **Validation:** The Critic calculates the variance of the Z-values ($\\sigma^2\_z$) within the polygon.  
  * If $\\sigma^2\_z \\approx 0$: The surface is flat. **ACCEPTED.**  
  * If $\\sigma^2\_z$ is high: The object has volume (e.g., a bush or car). **REJECTED.**

### **4.4 The Geometric Validator: Topology Enforcement**

Before DXF export, the Geometric Validator ensures the data meets OGC (Open Geospatial Consortium) Simple Feature standards.35

* **Self-Intersection:** Uses shapely.validation.explain\_validity to find bow-tie artifacts. It repairs them using buffer(0) or by splitting the polygon.  
* **Closure:** Ensures all polygons are closed rings (first vertex \= last vertex).  
* **Orientation:** Enforces Counter-Clockwise (CCW) winding order for outer rings and Clockwise (CW) for holes, essential for correct 3D rendering.

## **5\. Practical Implementation & Tech Stack**

The deployment of this pipeline requires a robust integration of geospatial libraries and high-performance computing hardware.

### **5.1 Data Handling Pipeline**

* **PDAL (Point Data Abstraction Library):** Used for the 3D pipeline. A PDAL JSON pipeline is constructed to handle:  
  1. *Denoising:* SOR (Statistical Outlier Removal) filter.  
  2. *Normalization:* SMRF (Simple Morphological Filter) to classify ground, followed by filters.hag\_delaunay to calculate Height Above Ground for every point.37 This normalized height is a critical input feature for PointNeXt.  
* **GDAL:** Manages GeoTIFF tiling, reprojection, and fusion.

### **5.2 CAD Generation with ezdxf**

The final step is the serialization of Shapely geometries into DXF format using the ezdxf library.38

* **Entity Mapping:**  
  * Point \-\> INSERT (Block reference for symbols like manholes).  
  * LineString \-\> LWPOLYLINE (with global width for road markings).  
  * Polygon \-\> HATCH or LWPOLYLINE (closed).  
* **Layering:** The system utilizes a configuration file to map semantic classes to standard engineering layers (e.g., C-ROAD-CNTR, E-POWR-OHW).  
* **Attributes:** Object attributes (e.g., "Confidence Score," "Height") are attached as Extended Entity Data (XDATA) to the DXF entities, preserving the metadata from the AI analysis.

### **5.3 Hardware Requirements & The "VRAM Wall"**

To maintain engineering-grade precision, we must process high-resolution tiles (e.g., 1024x1024 or larger) and dense point clouds.

* **Training Compute:** Training PointNeXt or fine-tuning SAM 2 requires massive memory for gradients and optimizer states. A **24GB VRAM** GPU (NVIDIA A10G, RTX 3090/4090) is the absolute minimum, with 40GB+ (A100) recommended for efficient batching.39  
* **Inference Compute:**  
  * *Grounding DINO:* Tiny model \~8.5GB VRAM.  
  * *SAM 2:* Memory bank growth is the limiting factor. For continuous strip processing, 16GB+ VRAM is required to hold the temporal context before a reset is needed.14  
  * *Strategy:* A distributed "Producer-Consumer" architecture is recommended. A GPU cluster runs the heavy inference (SAM/PointNeXt), while a fleet of CPU workers runs the lightweight Agents (Critics/Validators) and geometric refinement scripts.

## **6\. The "Validation Logic" Workflow**

The following structured workflow illustrates the decision-making process of the Multi-Agent system:

1. **Hypothesis Generation (The "Senses"):**  
   * *Vision Agent:* "I see a rectangular shape at Lat/Lon X,Y." (Source: SAM 2\)  
   * *Lidar Agent:* "I detect a planar surface at X,Y with elevation Z." (Source: PointNeXt)  
2. **Cross-Modality Fusion (The "Brain"):**  
   * *Orchestrator:* Projects 3D points onto the 2D image plane.  
   * *Check:* Calculate Intersection over Union (IoU).  
   * *Logic:* If $IoU \> 0.5$, the modalities agree. The confidence score is boosted. If they disagree (e.g., photo shows a building, Lidar shows ground), the Lidar (geometry) usually overrides the Photo (spectral) for classification, or the feature is flagged for review.  
3. **Physics Verification (The "Laws of Nature"):**  
   * *Scenario:* **Road Curb Extraction.**  
   * *Critic Agent:* Analyzes the slope of the extracted line in 3D.  
   * *Rule:* "Roads cannot exceed 15% grade."  
   * *Action:* If the Z-profile of the curb line shows a sudden 2-meter jump (likely a car parked near the curb included in the segmentation), the Critic smooths the Z-profile using a spline interpolation, effectively "erasing" the car's height influence to recover the true road grade.  
4. **Geometric Regularization (The "Draftsman"):**  
   * *Scenario:* **Building Footprint.**  
   * *Validator Agent:* Checks corner angles.  
   * *Rule:* "Most buildings have $90^\\circ$ corners."  
   * *Action:* Applies an orthogonality constraint. If an angle is $88^\\circ$, it is snapped to $90^\\circ$. If the polygon is not closed, it forces closure.  
5. **Final Export (The "Deliverable"):**  
   * Only features that survive the Gauntlet of Critics are written to the final DXF.  
   * Rejected features are written to a separate QC\_REJECTED DXF layer with text labels explaining the rejection reason (e.g., "REJECT: High Z-Variance").

## **7\. Implementation Roadmap**

### **Phase 1: Data Infrastructure (Months 1-2)**

* **Data Ingestion:** Build PDAL pipelines for LAS cleaning and GDAL scripts for Flip-n-Slide tiling.  
* **Coordinate Systems:** Establish robust EPSG transformation workflows to ensure perfect alignment between Lidar (usually projected) and Imagery (usually geographic).

### **Phase 2: Model Adaptation (Months 3-4)**

* **Fine-Tuning:** Train PointNeXt on diverse aerial datasets (DALES, custom).  
* **Prompt Engineering:** Build a library of Grounding DINO prompts optimized for the specific assets (e.g., "catch basin" vs "storm drain").  
* **Vectorization:** Train FrameField networks on local building footprints to learn regional architectural styles.

### **Phase 3: Agentic Logic (Months 5-6)**

* **Orchestration:** Implement the LangGraph state machine.  
* **Physics Engines:** Code the Python modules for Catenary fitting (scipy.optimize) and Planarity checks.  
* **Integration:** Connect the "Eyes" (Models) to the "Brain" (Agents).

### **Phase 4: Production & QC (Months 7-8)**

* **Optimization:** Implement sliding-window memory management for SAM 2 to prevent OOM.  
* **Golden Testing:** Run the pipeline against a manually digitized "Golden Dataset." Measure Precision, Recall, and, crucially, **Geometric Accuracy** (RMSE of vertices vs ground truth).

## **8\. Technical Architecture Diagram (Conceptual)**

The following text-based diagram outlines the system's data flow:

Code snippet

graph TD  
    A \--\> B(Orchestrator Agent)  
    B \--\>|Tiling & AOI Definition| C{Specialist Agents}  
      
    subgraph "Perception Layer (Hybrid Models)"  
        C \--\>|GeoTIFF Stream| D\[Point Asset Agent\]  
        D \--\>|Text Prompts| E  
        E \--\>|BBox Proposals| F  
        F \--\>|2D Masks| G\[Vectorization Engine\]  
          
        C \--\>|LiDAR Stream| H  
        H \--\>|Normalized Points| I\[PointNeXt / KPConv\]  
        I \--\>|3D Labels| J  
    end  
      
    G \--\> K  
    J \--\> K  
      
    subgraph "Reasoning Layer (Self-Correction)"  
        K \--\> L\[Critic/Judge Agent\]  
        L \--\>|Physics Check: Catenary/Planarity| M{Pass/Fail?}  
        M \-- Fail \--\> N  
        N \--\> C  
        M \-- Pass \--\> O\[Geometric Validator\]  
        O \--\>|Topology Repair: Snapping/Closure| P\[Clean Geometry\]  
    end  
      
    P \--\> Q  
    Q \--\> R

## **9\. Detailed Component Analysis**

### **9.1 The "Video" Mode of SAM 2 in Aerial Mapping**

A unique insight of this research is the repurposing of SAM 2's video capabilities. Aerial photogrammetry is typically acquired in long, overlapping strips. By treating these strips as "video frames," SAM 2's memory mechanism can track a single power line or road curb across dozens of images. This solves a major legacy problem: "feature fragmentation," where a long road is broken into disjoint segments at every tile edge. The memory bank effectively "stitches" the feature semantics before vectorization even begins.13

### **9.2 The Catenary Solver**

The "Catenary Check" is not just a validator; it is a data enrichment tool. By solving for the catenary parameters $a$ and $b$, the system extracts the *tension* and *sag* of the line. This means the output DXF can be enriched with engineering data (e.g., "Max Sag: 2.5m") derived purely from the geometry, adding immense value for utility clients.

## **10\. Conclusion**

This report outlines a transformative approach to geospatial feature extraction. By moving beyond simple "AI detection" to a "Hybrid, Agentic, and Physically-Aware" pipeline, we address the root causes of poor automated vectorization. The integration of **SAM 2** and **Grounding DINO** provides unmatched flexibility; **PointNeXt** and **KPConv** provide 3D structural understanding; and the **Multi-Agentic Loop** ensures that the final output respects the laws of physics and the rules of geometry. While computationally demanding, requiring significant GPU resources (24GB+ VRAM), the resulting reduction in manual drafting time—potentially orders of magnitude—positions this architecture as the future standard for high-fidelity mapping.

## **11\. Appendix: Model Selection Matrix**

| Component | Model/Algorithm | Strengths | Weaknesses | Computational Cost |
| :---- | :---- | :---- | :---- | :---- |
| **2D Discrete Detection** | **Grounding DINO** | Zero-shot, text-promptable, high recall. | Heavy inference, requires prompt tuning. | High (GPU) |
| **2D Segmentation** | **SAM 2** | Perfect boundaries, handles occlusion via memory. | Resource intensive (VRAM), not semantic on its own. | Very High (GPU) |
| **3D Segmentation (General)** | **PointNeXt** | Fast, scalable, SOTA on broad classes. | Can miss thin features (wires) in low density. | Medium (GPU) |
| **3D Segmentation (Linear)** | **KPConv** | Excellent for continuous linear features, deformable kernels. | Slower training/inference than Point-based methods. | High (GPU) |
| **Building Vectorization** | **FrameField Learning** | Sharp corners, orthogonal shapes, handles adjacent buildings. | Complex to train, specific to buildings. | Medium (GPU) |
| **Line Refinement** | **Active Contours (Snakes)** | Sub-pixel accuracy, physically smooth curves. | Sensitive to initialization, can get stuck in local minima. | Low (CPU) |
| **Mask Simplification** | **Douglas-Peucker** | Fast, standard, controllable precision. | Can destroy topology if aggressive. | Negligible (CPU) |

#### **Works cited**

1. Segmenting satellite images using SAM and Grounding DINO | Echo Blog, accessed January 20, 2026, [https://www.echo-analytics.com/blog/segmenting-satellite-images-using-sam-and-grounding-dino](https://www.echo-analytics.com/blog/segmenting-satellite-images-using-sam-and-grounding-dino)  
2. Meta AI: All You Need to Know about DINO and SAM | AI Magazine, accessed January 20, 2026, [https://aimagazine.com/news/meta-ai-dino-and-sam](https://aimagazine.com/news/meta-ai-dino-and-sam)  
3. IDEA-Research/Grounded-Segment-Anything: Grounded SAM: Marrying Grounding DINO with Segment Anything & Stable Diffusion & Recognize Anything \- Automatically Detect , Segment and Generate Anything \- GitHub, accessed January 20, 2026, [https://github.com/IDEA-Research/Grounded-Segment-Anything](https://github.com/IDEA-Research/Grounded-Segment-Anything)  
4. SEMANTIC SEGMENTATION OF POINT CLOUDS WITH POINTNET AND KPCONV ARCHITECTURES APPLIED TO RAILWAY TUNNELS \- ISPRS Annals of the Photogrammetry, Remote Sensing and Spatial Information Sciences, accessed January 20, 2026, [https://isprs-annals.copernicus.org/articles/V-2-2020/281/2020/](https://isprs-annals.copernicus.org/articles/V-2-2020/281/2020/)  
5. Spatial Attention-Based Kernel Point Convolution Network for Semantic Segmentation of Transmission Corridor Scenarios in Airborne Laser Scanning Point Clouds \- MDPI, accessed January 20, 2026, [https://www.mdpi.com/2079-9292/13/22/4501](https://www.mdpi.com/2079-9292/13/22/4501)  
6. Polygonal Building Extraction by Frame Field Learning \- CVF Open Access, accessed January 20, 2026, [https://openaccess.thecvf.com/content/CVPR2021/papers/Girard\_Polygonal\_Building\_Extraction\_by\_Frame\_Field\_Learning\_CVPR\_2021\_paper.pdf](https://openaccess.thecvf.com/content/CVPR2021/papers/Girard_Polygonal_Building_Extraction_by_Frame_Field_Learning_CVPR_2021_paper.pdf)  
7. Geospatial Knowledge-Base Question Answering Using Multi-Agent Systems \- MDPI, accessed January 20, 2026, [https://www.mdpi.com/2220-9964/15/1/35](https://www.mdpi.com/2220-9964/15/1/35)  
8. LangGraph \- LangChain, accessed January 20, 2026, [https://www.langchain.com/langgraph](https://www.langchain.com/langgraph)  
9. Understanding the Differences Between CLIP, Grounding DINO, and SAM: A Deep Dive into Vision-Language Models and Segmentation | by Shawn | Medium, accessed January 20, 2026, [https://medium.com/@xiaxiami/understanding-the-differences-between-clip-grounding-dino-and-sam-a-deep-dive-into-b0724d15d92c](https://medium.com/@xiaxiami/understanding-the-differences-between-clip-grounding-dino-and-sam-a-deep-dive-into-b0724d15d92c)  
10. mmdetection/configs/grounding\_dino/README.md at main \- GitHub, accessed January 20, 2026, [https://github.com/open-mmlab/mmdetection/blob/main/configs/grounding\_dino/README.md](https://github.com/open-mmlab/mmdetection/blob/main/configs/grounding_dino/README.md)  
11. IDEA-Research/grounding-dino-tiny · is there any caching mechanism? \- Hugging Face, accessed January 20, 2026, [https://huggingface.co/IDEA-Research/grounding-dino-tiny/discussions/4](https://huggingface.co/IDEA-Research/grounding-dino-tiny/discussions/4)  
12. How can I run inference on this model optimally with the right instances? : r/aws \- Reddit, accessed January 20, 2026, [https://www.reddit.com/r/aws/comments/14rs6bk/how\_can\_i\_run\_inference\_on\_this\_model\_optimally/](https://www.reddit.com/r/aws/comments/14rs6bk/how_can_i_run_inference_on_this_model_optimally/)  
13. SAM 2: Segment Anything Model 2 \- Ultralytics YOLO Docs, accessed January 20, 2026, [https://docs.ultralytics.com/models/sam-2/](https://docs.ultralytics.com/models/sam-2/)  
14. Improvement of SAM2 Algorithm Based on Kalman Filtering for Long-Term Video Object Segmentation \- MDPI, accessed January 20, 2026, [https://www.mdpi.com/1424-8220/25/13/4199](https://www.mdpi.com/1424-8220/25/13/4199)  
15. SAM2 video streaming – VRAM usage keeps increasing until OOM \- Hugging Face Forums, accessed January 20, 2026, [https://discuss.huggingface.co/t/sam2-video-streaming-vram-usage-keeps-increasing-until-oom/168526](https://discuss.huggingface.co/t/sam2-video-streaming-vram-usage-keeps-increasing-until-oom/168526)  
16. PointNeXt: Revisiting PointNet++ with Improved Training and Scaling Strategies \- NeurIPS, accessed January 20, 2026, [https://proceedings.neurips.cc/paper\_files/paper/2022/file/9318763d049edf9a1f2779b2a59911d3-Paper-Conference.pdf](https://proceedings.neurips.cc/paper_files/paper/2022/file/9318763d049edf9a1f2779b2a59911d3-Paper-Conference.pdf)  
17. PointNeXt architecture for classification. The classification architecture shares the same encoder as the segmentation architecture. \- ResearchGate, accessed January 20, 2026, [https://www.researchgate.net/figure/PointNeXt-architecture-for-classification-The-classification-architecture-shares-the\_fig2\_361206212](https://www.researchgate.net/figure/PointNeXt-architecture-for-classification-The-classification-architecture-shares-the_fig2_361206212)  
18. PointNeXt: Revisiting PointNet++ with Improved Training and Scaling Strategies, accessed January 20, 2026, [https://openreview.net/forum?id=EAcWgk7JM58](https://openreview.net/forum?id=EAcWgk7JM58)  
19. KPConv: Flexible and Deformable Convolution for Point Clouds, accessed January 20, 2026, [https://geometry.stanford.edu/lgl\_2024/papers/tqdmgg-KPconv-iccv19/tqdmgg-KPconv-iccv19.pdf](https://geometry.stanford.edu/lgl_2024/papers/tqdmgg-KPconv-iccv19/tqdmgg-KPconv-iccv19.pdf)  
20. Full article: A classification model for power corridors based on the improved PointNet++ network \- Taylor & Francis Online, accessed January 20, 2026, [https://www.tandfonline.com/doi/full/10.1080/10106049.2023.2297556](https://www.tandfonline.com/doi/full/10.1080/10106049.2023.2297556)  
21. The P 3 dataset: Pixels, Points and Polygons for Multimodal Building Vectorization \- arXiv, accessed January 20, 2026, [https://arxiv.org/html/2505.15379v1](https://arxiv.org/html/2505.15379v1)  
22. The Potential of Active Contour Models in Extracting Road Edges from Mobile Laser Scanning Data \- MDPI, accessed January 20, 2026, [https://www.mdpi.com/2412-3811/2/3/9](https://www.mdpi.com/2412-3811/2/3/9)  
23. A Classification Method of Point Clouds of Transmission Line Corridor Based on Improved Random Forest and Multi-Scale Features \- PMC \- NIH, accessed January 20, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC9919022/](https://pmc.ncbi.nlm.nih.gov/articles/PMC9919022/)  
24. Road Detection by Using a Generalized Hough Transform \- MDPI, accessed January 20, 2026, [https://www.mdpi.com/2072-4292/9/6/590](https://www.mdpi.com/2072-4292/9/6/590)  
25. Hough transform \- Wikipedia, accessed January 20, 2026, [https://en.wikipedia.org/wiki/Hough\_transform](https://en.wikipedia.org/wiki/Hough_transform)  
26. Hough Line Transform \- OpenCV Documentation, accessed January 20, 2026, [https://docs.opencv.org/3.4/d9/db0/tutorial\_hough\_lines.html](https://docs.opencv.org/3.4/d9/db0/tutorial_hough_lines.html)  
27. Simplify Polygon (Cartography)—ArcGIS Pro | Documentation, accessed January 20, 2026, [https://pro.arcgis.com/en/pro-app/latest/tool-reference/cartography/simplify-polygon.htm](https://pro.arcgis.com/en/pro-app/latest/tool-reference/cartography/simplify-polygon.htm)  
28. fhirschmann/rdp: Python/Numpy implementation of the Ramer-Douglas-Peucker algorithm, accessed January 20, 2026, [https://github.com/fhirschmann/rdp](https://github.com/fhirschmann/rdp)  
29. Active Contours: A Method for Image Segmentation in Computer Vision \- Analytics Vidhya, accessed January 20, 2026, [https://www.analyticsvidhya.com/blog/2021/09/active-contours-a-method-for-image-segmentation-in-computer-vision/](https://www.analyticsvidhya.com/blog/2021/09/active-contours-a-method-for-image-segmentation-in-computer-vision/)  
30. End-to-End Trainable Deep Active Contour Models for Automated Image Segmentation: Delineating Buildings in Aerial Imagery, accessed January 20, 2026, [https://www.ecva.net/papers/eccv\_2020/papers\_ECCV/papers/123570715.pdf](https://www.ecva.net/papers/eccv_2020/papers_ECCV/papers/123570715.pdf)  
31. A Concise Tiling Strategy for Preserving Spatial Context in Earth Observation Imagery, accessed January 20, 2026, [https://arxiv.org/html/2404.10927v1](https://arxiv.org/html/2404.10927v1)  
32. Impact of Tile Size and Tile Overlap on the Prediction Performance of Convolutional Neural Networks Trained for Road Classification \- MDPI, accessed January 20, 2026, [https://www.mdpi.com/2072-4292/16/15/2818](https://www.mdpi.com/2072-4292/16/15/2818)  
33. How to use SciPy to curve fit in Python || Python for Engineers \- YouTube, accessed January 20, 2026, [https://www.youtube.com/watch?v=6BRq\_MYMLo4](https://www.youtube.com/watch?v=6BRq_MYMLo4)  
34. Calculating "best fit" line feature based on three height values \- Esri Community, accessed January 20, 2026, [https://community.esri.com/t5/python-questions/calculating-quot-best-fit-quot-line-feature-based/td-p/451057](https://community.esri.com/t5/python-questions/calculating-quot-best-fit-quot-line-feature-based/td-p/451057)  
35. Validate Topology (Data Management)—ArcGIS Pro | Documentation, accessed January 20, 2026, [https://pro.arcgis.com/en/pro-app/3.4/tool-reference/data-management/validate-topology.htm](https://pro.arcgis.com/en/pro-app/3.4/tool-reference/data-management/validate-topology.htm)  
36. Geometry Validator — QGIS Python Plugins Repository, accessed January 20, 2026, [https://plugins.qgis.org/plugins/GeometryValidator/](https://plugins.qgis.org/plugins/GeometryValidator/)  
37. Ground Awareness in Deep Learning for Large Outdoor Point Cloud Segmentation \- arXiv, accessed January 20, 2026, [https://arxiv.org/html/2501.18246v1](https://arxiv.org/html/2501.18246v1)  
38. Quick-Info — ezdxf 1.4.3 documentation, accessed January 20, 2026, [https://ezdxf.readthedocs.io/](https://ezdxf.readthedocs.io/)  
39. How much VRAM should I have for machine learning tasks? \- Milvus, accessed January 20, 2026, [https://milvus.io/ai-quick-reference/how-much-vram-should-i-have-for-machine-learning-tasks](https://milvus.io/ai-quick-reference/how-much-vram-should-i-have-for-machine-learning-tasks)  
40. How much VRAM do I need for LLM model fine-tuning? \- Modal, accessed January 20, 2026, [https://modal.com/blog/how-much-vram-need-fine-tuning](https://modal.com/blog/how-much-vram-need-fine-tuning)
