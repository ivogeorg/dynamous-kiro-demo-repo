---
description: "Synthesize design documents into actionable feature roadmap with priority graph"
argument-hint: "[design-doc-filenames] (optional, defaults to all files in .kiro/design/)"
---

# Design Digest: Research to Roadmap

## Mission

Transform research documents and design papers into a comprehensive, prioritized feature roadmap with dependency graph, individual feature specifications, and validated technology choices.

**Core Principle**: Synthesize disparate research into a coherent, implementable plan that prioritizes demonstrable value and stable incremental progress.

## Input Sources

### Primary Sources
- **Product Overview**: `.kiro/steering/product.md` (authoritative product vision)
- **Design Documents**: All `.md` files in `.kiro/design/` (or specified arguments)

### Validation Sources
- **State-of-the-art research**: Web search for technology validation
- **Alternative technologies**: Open-source and open-weight model alternatives

## Process

### Phase 1: Document Analysis & Synthesis

**1. Read All Design Documents**
```bash
# Read product.md for authoritative context
# Read all design documents in .kiro/design/ (or specified files)
```

**2. Extract Core Components & Features**
- Identify major system components (frontend, backend, API, ML pipeline, etc.)
- Extract proposed features from each document
- Map features to product vision and development versions (Demo, Version 1, Version 2)
- Note technology recommendations and architectural decisions

**3. Identify Conflicts & Inconsistencies**
When design documents conflict on:
- Technology choices (e.g., different ML models proposed)
- Architecture patterns (e.g., monolith vs microservices)
- Feature scope or implementation approach
- Data flow or API design

**STOP and present conflicts interactively:**

```
🔴 CONFLICT DETECTED

Feature: [feature-name]
Conflict Type: [technology/architecture/scope/approach]

Document A (.kiro/design/doc1.md):
  Recommendation: [specific recommendation]
  Rationale: [reasoning from document]

Document B (.kiro/design/doc2.md):
  Recommendation: [different recommendation]
  Rationale: [reasoning from document]

Product.md guidance: [relevant context if any]

Please choose:
1. Use Document A recommendation
2. Use Document B recommendation
3. Use hybrid approach (please specify)
4. Defer decision (mark as [TBD] in feature)

Your decision:
```

Continue only after user resolves each conflict.

### Phase 2: Technology Validation & Alternatives

**For each core technology mentioned in design documents:**

1. **Validate Currency**: Use web_search to verify technology is current/maintained
2. **Check Maturity**: Assess production-readiness and community support
3. **Find Alternatives**: Search for open-source or open-weight alternatives
4. **Prioritize**: Favor mature, well-documented, actively maintained options

**Present findings:**
```
🔍 TECHNOLOGY VALIDATION

Technology: [e.g., Grounding DINO]
Status: [Current/Outdated/Deprecated]
Maturity: [Production-ready/Beta/Experimental]
License: [Open-source/Open-weights/Proprietary]

Alternatives Found:
1. [Alternative 1]: [brief description, maturity, pros/cons]
2. [Alternative 2]: [brief description, maturity, pros/cons]

Recommendation: [Stick with original / Switch to alternative X]
Rationale: [reasoning]

Approve? (yes/no/discuss)
```

### Phase 3: Feature Extraction & Structuring

**Extract features with this structure:**

**Feature Naming Convention**: `[major-section]-[detail]-[ddddd]`
- `major-section`: api, auth, ui, backend, ml, data, infra, etc.
- `detail`: descriptive kebab-case (e.g., user-auth, ortho-viewer, sam2-integration)
- `ddddd`: 5-digit counter per `[major-section]-[detail]` combination (00001, 00002, etc.)

**Feature Scope Guidelines**:
- Each feature should be a **stable, testable addition** to the codebase
- Should be **independently validatable** with clear success criteria
- Should **not be too granular** (avoid single-function features)
- Should **not be too broad** (avoid multi-week epics)

**Feature Fields**:
```json
{
  "feature-id": {
    "name": "Human-readable feature name",
    "version": "Demo|Version 1|Version 2",
    "moscow": "Must-have|Should-have|Could-have|Won't-have",
    "description": "EARS-formatted requirement (When/While/If [trigger], the [system] shall [response])",
    "dependencies": ["feature-id-1", "feature-id-2"],
    "tasks": [
      {
        "id": "task-001",
        "description": "Specific implementation task",
        "moscow": "Must-have|Should-have|Could-have"
      }
    ],
    "status": "not-started|in-progress|completed|blocked",
    "started_date": "ISO-8601 timestamp or null",
    "completed_date": "ISO-8601 timestamp or null",
    "testable_outcome": "Clear validation criteria",
    "design_source": "filename.md (section/page reference)"
  }
}
```

### Phase 4: Dependency Graph Construction

**Build flat dependency graph:**

1. **Identify foundational features** (no dependencies) - these are potential roots
2. **Map dependencies** based on:
   - Technical dependencies (Feature B requires Feature A's API)
   - Logical dependencies (Feature B builds on Feature A's functionality)
   - Data dependencies (Feature B needs Feature A's data structures)
3. **Validate graph** for circular dependencies
4. **Prioritize within version** using:
   - **Demo sprint**: Prioritize "showable" features (UI, visible functionality)
   - **Lower-hanging fruit**: Simpler features that unblock others
   - **Risk mitigation**: Validate risky technologies early

**Graph Structure** (flat with dependencies):
```json
{
  "features": {
    "feature-id-1": { ... },
    "feature-id-2": { "dependencies": ["feature-id-1"], ... }
  },
  "metadata": {
    "generated": "ISO-8601 timestamp",
    "design_docs_processed": ["file1.md", "file2.md"],
    "conflicts_resolved": 5,
    "technologies_validated": ["tech1", "tech2"]
  }
}
```

### Phase 5: Individual Feature Files

**For each feature, create `.kiro/features/[feature-id].md`:**

```markdown
---
id: [feature-id]
name: [Feature Name]
version: Demo|Version 1|Version 2
moscow: Must-have|Should-have|Could-have|Won't-have
status: not-started
started_date: null
completed_date: null
---

# [Feature Name]

**ID**: [feature-id]
**Version**: [Demo|Version 1|Version 2]
**Priority**: [Must-have|Should-have|Could-have]
**Status**: [not-started|in-progress|completed|blocked]

## Description (EARS Format)

[When/While/If [trigger], the [system] shall [response]]

## Context

[Relevant background from design documents]
[Why this feature is important]
[How it fits into the overall system]

## Dependencies

- `[feature-id-1]`: [Why this is needed]
- `[feature-id-2]`: [Why this is needed]

## Implementation Guidance

### Architecture
[High-level architectural approach]
[Key components and their interactions]

### Technology Stack
[Specific technologies/libraries to use]
[Validated alternatives if applicable]

### Key Considerations
- [Important design decision 1]
- [Important design decision 2]
- [Potential pitfalls to avoid]

## Tasks Breakdown

### Must-Have Tasks
- [ ] **task-001**: [Description]
- [ ] **task-002**: [Description]

### Should-Have Tasks
- [ ] **task-003**: [Description]

### Could-Have Tasks
- [ ] **task-004**: [Description]

## Validation Checklist

### Automated Validation
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Linting/formatting passes
- [ ] Type checking passes (if applicable)
- [ ] [Feature-specific automated checks]

### Manual Validation
- [ ] [Specific manual test 1]
- [ ] [Specific manual test 2]
- [ ] [User acceptance criteria met]

## Testable Outcome

[Clear, measurable success criteria]
[What "done" looks like for this feature]

## Design Source

**Document**: [filename.md]
**Section**: [specific section or page reference]
**Related Research**: [links to relevant papers/docs]

---

## Notes

[Any additional context, decisions made, or future considerations]
```

### Phase 6: Steering Document Updates

**Generate draft updates for:**

**`.kiro/steering/tech-draft.md`**:
- Technology stack based on validated choices
- Architecture overview from synthesized features
- Development environment requirements
- Testing strategy

**`.kiro/steering/structure-draft.md`**:
- Directory layout based on major-sections
- File naming conventions
- Module organization

**Present drafts interactively:**
```
📝 STEERING DOCUMENT UPDATES

Generated draft updates:
- .kiro/steering/tech-draft.md
- .kiro/steering/structure-draft.md

Review these drafts. Options:
1. Apply updates (replace tech.md and structure.md)
2. Keep as drafts for manual review
3. Regenerate with modifications

Your choice:
```

### Phase 6.5: Enrich Product Document

**After steering documents updated, enrich product.md with synthesized knowledge:**

**Rationale**: product.md was used as authoritative input at the start, but now we have much richer context from:
- Design document synthesis
- Technology validation
- Feature extraction
- Dependency analysis
- Scope decisions

**Generate enriched product.md:**

1. **Read current product.md** - Preserve all original content
2. **Identify gaps** - What's missing that we now know?
3. **Generate enrichments** - Add sections without destroying original intent

**Enrichment Areas:**

**Add/Enhance:**
- **Technology Stack Section**: Validated technologies with versions
- **Architecture Overview**: High-level system design from synthesis
- **Feature Types Detail**: Expanded descriptions of 11 feature types
- **Development Phases**: Demo/V1/V2 breakdown with features
- **Success Metrics**: Quantitative targets from design docs
- **Technical Constraints**: VRAM, processing time, accuracy targets
- **Integration Points**: How components connect (COG→ML→DXF→UI)

**Preserve Original:**
- Product purpose and vision
- Target users and business objectives
- User journey and workflow
- Version scope definitions
- Any specific requirements or constraints

**Generate draft:**
```markdown
# Product Overview (Enhanced)

[Original product.md content preserved]

---

## Technology Architecture (Added from Design Synthesis)

### Validated Technology Stack
[Technologies validated in Phase 2]

### System Components
[Architecture from design documents]

### Data Flow
[COG → Grounding DINO → SAM 2 → Vectorization → DXF]

---

## Feature Types (Detailed)

[Expanded descriptions of 11 feature types with detection strategies]

1. Road Centerline
   - Detection: Grounding DINO prompt + SAM 2 segmentation
   - Vectorization: Skeletonization + Douglas-Peucker
   - CAD Primitive: LWPOLYLINE
   - Accuracy Target: >85%

[... for each feature type ...]

---

## Development Roadmap (From Feature Graph)

### Demo Sprint ([N] features)
[List of Demo features with IDs]

### Version 1 ([M] features)
[Deferred features]

### Version 2 ([P] features)
[Future enhancements]

---

## Performance Targets (From Design Documents)

- Model Loading: <3 minutes
- Grounding DINO Inference: <10 seconds per tile
- SAM 2 Segmentation: <5 seconds per region
- Vectorization: <2 seconds per feature
- Total Pipeline: <10 minutes for 6GB orthomosaic

---

## Technical Constraints

- VRAM: 40GB+ for SAM 2 (24GB with aggressive memory management)
- RAM: 64GB+ recommended
- GPU: CUDA-capable (NVIDIA)
- Storage: 4TB+ for model cache and datasets

---
```

**Present draft:**
```
📝 PRODUCT.MD ENRICHMENT

Generated: .kiro/steering/product-enhanced.md

Enrichments added:
  • Technology architecture (validated stack)
  • Detailed feature type descriptions
  • Development roadmap (from .kiro/features.json)
  • Performance targets (from design docs)
  • Technical constraints (VRAM, GPU, etc.)

Original content preserved:
  • Product purpose and vision
  • Target users and business objectives
  • User journey
  • Version scope definitions

Review enriched product.md. Options:
1. Apply updates (replace product.md)
2. Keep as product-enhanced.md for manual merge
3. Regenerate with modifications

Your choice:
```

**Merge Strategy:**
- **Non-destructive**: Original sections preserved verbatim
- **Additive**: New sections appended or inserted logically
- **Consistent**: Maintain original tone and structure
- **Traceable**: Mark enriched sections with "Added from Design Synthesis"

### Phase 7: PRD Generation

**After all features are extracted and validated:**

```
✅ FEATURE ROADMAP COMPLETE

Generated:
- .kiro/features.json (priority graph with [N] features)
- .kiro/features/ ([N] individual feature files)
- Draft steering document updates
- Enriched product.md

Would you like to generate a comprehensive PRD using @create-prd?

This will create a Product Requirements Document with:
- MoSCoW prioritized requirements
- EARS-formatted specifications
- Feature dependencies and roadmap

Generate PRD? (yes/no/later)
```

If yes, invoke `@create-prd` with context from .kiro/features.json.

## Output Artifacts

### 1. Priority Graph: `.kiro/features.json`
Flat dependency graph with all features, tasks, and metadata.

### 2. Feature Files: `.kiro/features/[feature-id].md`
Individual feature specifications with context, guidance, and validation checklists.

### 3. Draft Steering Updates: `.kiro/steering/*-draft.md`
Updated technology and structure documentation.

### 4. Enriched Product Document: `.kiro/steering/product-enhanced.md` or `product.md`
Enhanced product overview with synthesized knowledge from design documents (non-destructive merge).

### 5. Optional PRD: `.kiro/PRD.md`
Comprehensive Product Requirements Document (if requested).

## Success Criteria

- [ ] All design documents processed and synthesized
- [ ] All conflicts identified and resolved interactively
- [ ] Core technologies validated with state-of-the-art research
- [ ] Features extracted with clear scope and dependencies
- [ ] Dependency graph is acyclic and prioritized
- [ ] Individual feature files are complete and actionable
- [ ] Steering documents updated with validated decisions
- [ ] Roadmap prioritizes Demo sprint showable features
- [ ] Lower-hanging fruit identified and prioritized

## Quality Checklist

### Feature Quality
- [ ] Each feature has clear, testable outcome
- [ ] EARS format used for unambiguous requirements
- [ ] Dependencies are explicit and justified
- [ ] Tasks are broken down with MoSCoW priorities
- [ ] Validation checklists are comprehensive

### Graph Quality
- [ ] No circular dependencies
- [ ] Foundational features identified
- [ ] Demo sprint features prioritize "showable" value
- [ ] Lower-hanging fruit prioritized within constraints

### Documentation Quality
- [ ] Technology choices are validated and justified
- [ ] Alternatives documented where applicable
- [ ] Design sources clearly referenced
- [ ] Implementation guidance is actionable

## Notes

- This command is typically run **once at project start**
- Can be re-run when new design documents are added
- Interactive conflict resolution ensures architectural coherence
- Technology validation prevents outdated or unmaintained dependencies
- Flat graph structure enables easy reshuffling during development
- Feature files serve as input to `@plan-feature` for detailed implementation planning
