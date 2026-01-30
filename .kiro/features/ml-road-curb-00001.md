---
id: ml-road-curb-00001
name: Road Curb Detection
version: Demo
moscow: Must-have
status: not-started
started_date: None
completed_date: None
---

# Road Curb Detection

**Feature ID**: `ml-road-curb-00001`
**Version**: Demo
**Priority**: Must-have
**Status**: not-started

## Description

When processing the orthomosaic, the system shall detect road curbs using Grounding DINO prompts and SAM 2 segmentation

## Dependencies

- [`ml-dino-sam2-setup-00001`](ml-dino-sam2-setup-00001.md)

## Tasks

- **task-001**: Create text prompt for Grounding DINO: 'road curb, curb edge, road edge' (Must-have)
- **task-002**: Run Grounding DINO to get bounding boxes for curb regions (Must-have)
- **task-003**: Use bounding boxes as prompts for SAM 2 segmentation (Must-have)
- **task-004**: Post-process masks: filter by confidence, remove noise (Must-have)
- **task-005**: Store masks with metadata (confidence, bbox, class) (Must-have)

## Testable Outcome

Road curbs detected in test image, masks saved, confidence >0.7

## Design Source

A-Hybrid-AI-Geometric-Pipeline (Section 2.1.1: Grounding DINO, 2.1.2: SAM 2)

## Implementation Guidance

### Context

This feature is part of the Demo sprint. When processing the orthomosaic, the system shall detect road curbs using Grounding DINO prompts and SAM 2 segmentation

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
