---
description: "Add a new feature to existing roadmap with proper dependency management"
argument-hint: "[feature-name-or-description]"
---

# Add Feature: Integrate New Feature into Roadmap

## Mission

Add a new feature to an existing feature roadmap (.kiro/features.json), create its specification file, update dependencies, and ensure @next can discover it properly.

**Core Principle**: Maintain graph integrity. New features must fit cleanly into dependency structure without breaking existing features or creating cycles.

## Prerequisites

- `.kiro/features.json` must exist (run @design-digest first if not)
- `.kiro/features/` directory must exist
- Feature name or description provided as argument

## Process

### Phase 1: Feature Definition

**1. Understand the Feature Request**

From `$ARGUMENTS`, extract:
- Feature name/description
- Intended purpose
- Rough scope

**If argument is vague, ask clarifying questions:**
```
📋 FEATURE DETAILS NEEDED

Feature: [user's input]

Please provide:
1. Feature name (brief, descriptive)
2. What should this feature do? (1-2 sentences)
3. Which version? (Demo/Version 1/Version 2)
4. Priority? (Must-have/Should-have/Could-have)
5. Dependencies? (Which existing features must be complete first?)

Your answers:
```

**2. Generate Feature ID**

Follow naming convention: `[major-section]-[detail]-[ddddd]`

**Major sections:**
- `infra`: Infrastructure, setup, deployment
- `auth`: Authentication, authorization
- `ui`: User interface, frontend components
- `api`: Backend API endpoints
- `ml`: Machine learning, AI models
- `geom`: Geometrization, vectorization
- `file`: File management, upload
- `test`: Testing, validation
- `data`: Data processing, storage

**Counter logic:**
1. Read .kiro/features.json
2. Find all features matching `[major-section]-[detail]-*`
3. Increment highest counter by 1
4. Format as 5 digits (e.g., 00001, 00002)

**Example:**
- Existing: `ui-map-init-00001`
- New map feature: `ui-map-controls-00001`
- Another map feature: `ui-map-init-00002`

### Phase 2: Dependency Analysis

**1. Analyze Existing Features**

Read .kiro/features.json and identify:
- Features this new feature depends on (prerequisites)
- Features that might depend on this new feature (if inserted mid-graph)

**2. Check for Dependency Conflicts**

Validate:
- No circular dependencies
- All dependencies exist in .kiro/features.json
- Dependencies are in same or earlier version

**3. Determine Graph Position**

Calculate:
- **Depth**: Longest path from root features
- **Unblocking power**: How many features could depend on this
- **Critical path impact**: Does this block Must-haves?

**Present analysis:**
```
🔍 DEPENDENCY ANALYSIS

New Feature: [feature-id] - [feature-name]

Dependencies (prerequisites):
  ✅ [dep-1]: [name] (status: completed/in-progress/not-started)
  ✅ [dep-2]: [name] (status: completed/in-progress/not-started)

Potential dependents (features that might need this):
  • [feature-x]: [name] (could benefit from this)
  • [feature-y]: [name] (might depend on this)

Graph position:
  • Depth: [N] (N features must complete before this)
  • Unblocking power: [M] (M features could depend on this)
  • Critical path: [Yes/No]

Recommendation: [Insert after feature-X, before feature-Y]

Approve dependency structure? (yes/edit)
```

### Phase 3: Feature Specification Generation

**Generate complete feature specification using template:**

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
**Version**: [version]
**Priority**: [moscow]
**Status**: not-started

## Description (EARS Format)

[When/While/If [trigger], the system shall [response]]

## Context

[Why this feature is needed]
[How it fits into the system]
[What problem it solves]

## Dependencies

[For each dependency:]
- `[dep-id]`: [Why this is needed]

## Implementation Guidance

### Architecture
[High-level approach]
[Key components]

### Technology Stack
[Specific technologies/libraries]
[Alternatives considered]

### Key Considerations
- [Important decision 1]
- [Potential pitfall 1]

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
- [ ] Linting passes
- [ ] Type checking passes
- [ ] [Feature-specific checks]

### Manual Validation
- [ ] [Manual test 1]
- [ ] [Manual test 2]
- [ ] [Acceptance criteria met]

## Testable Outcome

[Clear, measurable success criteria]

## Design Source

**Document**: [source-file.md or "User request"]
**Section**: [section reference or "N/A"]
**Related Research**: [links if applicable]

---

## Notes

[Additional context, decisions, future considerations]
```

**Present draft:**
```
📝 FEATURE SPECIFICATION DRAFT

Generated: .kiro/features/[feature-id].md

[Show key sections: Description, Dependencies, Tasks]

Review and approve? (yes/edit/regenerate)
```

### Phase 4: Update .kiro/features.json

**1. Add Feature Entry**

Insert new feature into .kiro/features.json:
```json
{
  "features": {
    ...existing features...,
    "[feature-id]": {
      "name": "[Feature Name]",
      "version": "[version]",
      "moscow": "[priority]",
      "description": "[EARS description]",
      "dependencies": ["[dep-1]", "[dep-2]"],
      "tasks": [
        {
          "id": "task-001",
          "description": "[task description]",
          "moscow": "Must-have"
        }
      ],
      "status": "not-started",
      "started_date": null,
      "completed_date": null,
      "testable_outcome": "[outcome]",
      "design_source": "[source]"
    }
  },
  "metadata": {
    ...update counts...
  }
}
```

**2. Update Metadata**

Increment:
- `total_features`
- `demo_features` / `v1_features` / `v2_features` (based on version)

Update:
- `generated` timestamp

**3. Validate JSON**

Check:
- Valid JSON syntax
- No duplicate feature IDs
- All dependencies exist
- No circular dependencies

### Phase 5: Integration Verification

**1. Test @next Compatibility**

Simulate @next logic:
- Calculate development horizon
- Check if new feature appears when dependencies met
- Verify recommendation scoring works

**2. Update Related Features (if needed)**

If new feature should be a dependency of existing features:
```
🔗 UPDATE EXISTING FEATURES?

The following features might benefit from depending on [new-feature-id]:
  • [feature-x]: [reason]
  • [feature-y]: [reason]

Add [new-feature-id] as dependency to these features? (yes/no/select)
```

**3. Regenerate Dependency Graph Visualization (optional)**

If requested, generate ASCII art or mermaid diagram of updated graph.

### Phase 6: Confirmation

**Present summary:**
```
✅ FEATURE ADDED SUCCESSFULLY

Feature: [feature-id] - [Feature Name]
Version: [version]
Priority: [moscow]
Dependencies: [N dependencies]
Tasks: [M tasks]

Files updated:
  • .kiro/features.json (feature added, metadata updated)
  • .kiro/features/[feature-id].md (specification created)

Graph integrity: ✅ Validated (no cycles, all deps exist)
@next compatibility: ✅ Verified (will appear when ready)

Next steps:
  1. Review feature specification: .kiro/features/[feature-id].md
  2. Run @next to see updated horizon
  3. Use @plan-feature [feature-id] when ready to implement

Feature successfully integrated into roadmap!
```

## Edge Cases

### Feature Already Exists
```
⚠️  FEATURE ID CONFLICT

Feature [feature-id] already exists in .kiro/features.json.

Options:
1. Generate new ID with incremented counter
2. Edit existing feature instead
3. Cancel operation

Your choice:
```

### Circular Dependency Detected
```
❌ CIRCULAR DEPENDENCY DETECTED

Adding [new-feature] with dependencies [dep-1, dep-2] creates a cycle:
  [new-feature] → [dep-1] → [dep-2] → [new-feature]

Please revise dependencies to break the cycle.

Suggested fix: Remove [dep-X] from dependencies

Retry with corrected dependencies? (yes/no)
```

### Orphaned Feature (No Dependencies)
```
⚠️  ORPHANED FEATURE WARNING

Feature [new-feature] has no dependencies.

This means it could be implemented immediately, but:
  • Is it truly independent?
  • Should it depend on infrastructure features?
  • Is it a new root feature?

Confirm this is intentional? (yes/add-deps/cancel)
```

## Success Criteria

- [ ] Feature ID generated following naming convention
- [ ] Feature specification file created in .kiro/features/
- [ ] .kiro/features.json updated with new feature
- [ ] Metadata counts updated correctly
- [ ] No circular dependencies introduced
- [ ] All dependencies exist and are valid
- [ ] @next can discover feature when dependencies met
- [ ] JSON syntax is valid

## Quality Checklist

### Feature Specification Quality
- [ ] EARS-formatted description (unambiguous)
- [ ] Dependencies explicitly justified
- [ ] Tasks broken down with MoSCoW priorities
- [ ] Validation checklist is comprehensive
- [ ] Testable outcome is measurable

### Graph Integrity
- [ ] No circular dependencies
- [ ] All dependencies exist
- [ ] Version constraints respected (no Demo depending on V1)
- [ ] Critical path not unnecessarily lengthened

### Integration Quality
- [ ] @next will discover feature correctly
- [ ] Recommendation scoring will work
- [ ] Feature fits logically into existing structure

## Notes

- This command maintains the integrity of the feature graph
- Always validate dependencies before adding
- Consider impact on critical path (Demo Must-haves)
- New features default to "not-started" status
- Use @plan-feature after adding to create implementation plan
- Use @next to see when feature becomes available for implementation
