---
id: geom-vectorize-roads-00001
name: Vectorize Road Masks to CAD Primitives
version: Demo
moscow: Must-have
status: not-started
started_date: None
completed_date: None
---

# Vectorize Road Masks to CAD Primitives

**Feature ID**: `geom-vectorize-roads-00001`
**Version**: Demo
**Priority**: Must-have
**Status**: not-started

## Description

When masks are generated, the system shall convert road centerline and curb masks into clean line/polyline CAD primitives

## Dependencies

- [`ml-road-centerline-00001`](ml-road-centerline-00001.md)
- [`ml-road-curb-00001`](ml-road-curb-00001.md)

## Tasks

- **task-001**: Implement mask skeletonization for centerlines (OpenCV) (Must-have)
- **task-002**: Apply Douglas-Peucker simplification to reduce vertices (Must-have)
- **task-003**: Extract curb edges using contour detection (Must-have)
- **task-004**: Convert pixel coordinates to world coordinates (geospatial) (Must-have)
- **task-005**: Create LineString geometries for each feature (Must-have)

## Testable Outcome

Masks converted to clean polylines, vertex count reduced by 80%+, coordinates in proper CRS

## Design Source

A-Hybrid-AI-Geometric-Pipeline (Section 3: OpenCV & Geometric Refinement)

## Implementation Guidance

### Context

This feature is part of the Demo sprint. When masks are generated, the system shall convert road centerline and curb masks into clean line/polyline CAD primitives

### Technical Approach

[To be filled during planning phase with @plan-feature]

### Key Considerations

- Follow project structure conventions in `.kiro/steering/structure.md`
- Use technology stack defined in `.kiro/steering/tech.md`
- Maintain consistency with product vision in `.kiro/steering/product.md`

## Validation Checklist

- [ ] Feature implemented according to specification
- [ ] Code follows project conventions
- [ ] All dependencies satisfied
- [ ] Testable outcome achieved
- [ ] Manual testing completed successfully
- [ ] Documentation updated if needed

## Notes

[Add implementation notes, challenges, or decisions here during development]
