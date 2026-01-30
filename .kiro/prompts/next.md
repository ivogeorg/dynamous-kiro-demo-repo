---
description: "Intelligent feature selector - shows development horizon and recommends next feature to implement"
---

# Next: Smart Feature Selection

## Mission

Analyze the feature dependency graph, calculate the development horizon (ready-to-implement features), and provide intelligent recommendations based on sprint priorities, dependencies, complexity, and milestone proximity.

**Core Principle**: Remove decision paralysis. Show what's ready, recommend what's optimal, let user choose confidently.

## Prerequisites

- `features.json` must exist (run @design-digest first)
- At least one feature should be ready (no dependencies or all dependencies completed)

## Process

### Phase 1: Load and Analyze Feature Graph

**1. Read features.json**
```bash
# Load feature graph
# Parse all features and their metadata
```

**2. Calculate Development Horizon**

**Horizon Definition**: Features that are ready to implement
- Status = "not-started" OR "blocked" (if dependencies now complete)
- All dependencies have status = "completed"
- Immediately actionable

**Algorithm**:
```
for each feature in features.json:
  if feature.status == "completed" or "in-progress":
    skip
  
  if feature.dependencies is empty:
    add to horizon (no blockers)
  else:
    all_deps_complete = true
    for each dep in feature.dependencies:
      if features[dep].status != "completed":
        all_deps_complete = false
        break
    
    if all_deps_complete:
      add to horizon
```

**3. Gather Context**
- Current sprint/version focus (from features or product.md)
- Completed features count per sprint
- In-progress features
- Blocked features (dependencies not met)

### Phase 2: Generate Recommendation

**Recommendation Algorithm** (Decision Tree):

```
1. Filter horizon by current sprint (Demo > Version 1 > Version 2)

2. Within current sprint, prioritize by MoSCoW:
   - Must-have features first
   - Then Should-have
   - Then Could-have

3. Among same priority, score by:
   - Unblocking power: How many features depend on this? (higher = better)
   - Complexity: Low > Medium > High (lower-hanging fruit)
   - Risk: Does it validate critical technology? (risky tech early)
   - Showability: Is it visible/demonstrable? (for Demo sprint)

4. Calculate recommendation score:
   score = (unblocking_power * 3) + 
           (complexity_bonus) +  // Low=3, Med=2, High=1
           (risk_bonus) +         // Risky tech=2, else=0
           (showability_bonus)    // Visible=2, else=0

5. Recommend highest scoring feature
```

**Complexity Inference** (if not explicitly in feature):
- Count tasks in feature file
- Check for ML/AI keywords (higher complexity)
- Check for "integration" keywords (medium complexity)
- UI-only features (lower complexity)

**Showability Detection**:
- major-section = "ui" → showable
- Keywords: "display", "viewer", "visualization" → showable
- Keywords: "api", "backend", "database" → not showable (but necessary)

### Phase 3: Present Horizon and Recommendation

**Display Format**:

```
🎯 DEVELOPMENT HORIZON

Current Sprint: [Demo|Version 1|Version 2]
Progress: [N] completed, [M] in-progress, [P] ready
Milestone: [Sprint Name] - [X]% complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⭐ RECOMMENDED: [feature-id]

   📋 [Feature Name]
   🎯 Priority: [Must-have|Should-have|Could-have] ([Sprint])
   📊 Complexity: [Low|Medium|High]
   🔓 Unblocks: [N] features
   [👁️  Showable - visible to demo judges]
   
   Why recommended:
   • [Reason 1: e.g., "Foundational feature for Demo sprint"]
   • [Reason 2: e.g., "Unblocks 3 Must-have features"]
   • [Reason 3: e.g., "Low complexity, quick win"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OTHER READY FEATURES ([N] available):

1. [feature-id-1]
   📋 [Feature Name]
   🎯 [Priority] ([Sprint])
   📊 Complexity: [Low|Medium|High]
   🔗 Dependencies: [dep-1] ✓, [dep-2] ✓
   [👁️  Showable]

2. [feature-id-2]
   📋 [Feature Name]
   🎯 [Priority] ([Sprint])
   📊 Complexity: [Low|Medium|High]
   🔗 Dependencies: None

3. [feature-id-3]
   📋 [Feature Name]
   🎯 [Priority] ([Sprint])
   📊 Complexity: [Low|Medium|High]
   🔗 Dependencies: [dep-1] ✓

[... list all horizon features ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BLOCKED FEATURES ([M] waiting):

• [feature-id-x]: Waiting for [dep-1], [dep-2]
• [feature-id-y]: Waiting for [dep-3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Select feature to plan:
  • Type 'r' or 'recommended' for recommended feature
  • Type number (1, 2, 3...) for other ready features
  • Type feature-id directly (e.g., 'ui-splash-login-00001')
  • Type 'list' to see full feature details
  • Type 'quit' to exit

Your choice:
```

### Phase 4: User Selection and Planning

**Handle user input:**

- **'r' or 'recommended'**: Select recommended feature
- **Number (1-N)**: Select from ready features list
- **feature-id**: Direct selection (validate it's in horizon)
- **'list'**: Show detailed view of all horizon features
- **'quit'**: Exit without planning

**After selection:**

```
✅ SELECTED: [feature-id] - [Feature Name]

Invoking @plan-feature to create implementation plan...

[Automatically invoke @plan-feature with selected feature-id]
```

**@plan-feature Integration**:
- Pass feature-id as argument
- Pass feature file path: `.kiro/features/[feature-id].md`
- @plan-feature reads feature file for context
- Generates plan in `.agents/plans/[feature-id].md`

### Phase 5: Update Feature Status

**After @plan-feature completes:**

```
📝 PLAN CREATED

Plan file: .agents/plans/[feature-id].md

Update feature status to 'in-progress'? (yes/no)
```

**If yes:**
- Update feature file YAML: `status: in-progress`
- Update feature file YAML: `started_date: [current timestamp]`
- Update markdown status field
- Update features.json

**Prompt next action:**
```
🚀 READY TO IMPLEMENT

Next steps:
  1. Review plan: .agents/plans/[feature-id].md
  2. Execute plan: @execute .agents/plans/[feature-id].md
  3. Or return to horizon: @next

What would you like to do?
```

## Edge Cases

### No Features Ready
```
⚠️  NO FEATURES READY

All features are either:
  • Completed: [N] features
  • In Progress: [M] features
  • Blocked: [P] features (waiting on dependencies)

Current blockers:
  • [feature-id-1]: Waiting for [dep-1]
  • [feature-id-2]: Waiting for [dep-2]

Recommendation: Complete in-progress features first.

In Progress:
  • [feature-id-x] - [Feature Name]
    Started: [date]
    Plan: .agents/plans/[feature-id-x].md
```

### All Features Completed
```
🎉 ALL FEATURES COMPLETED!

Sprint Summary:
  • Demo: [N] features completed
  • Version 1: [M] features completed
  • Version 2: [P] features completed

Total: [X] features implemented

Next steps:
  • Review DEVLOG.md for development history
  • Run @code-review-hackathon for submission evaluation
  • Prepare demo and documentation
```

### features.json Not Found
```
❌ ERROR: features.json not found

The feature graph hasn't been created yet.

Run @design-digest first to:
  1. Synthesize design documents
  2. Generate feature roadmap
  3. Create features.json dependency graph

Then return to @next to select features.
```

## Output Summary

After successful selection and planning:

```
✅ NEXT FEATURE SELECTED

Feature: [feature-id] - [Feature Name]
Priority: [Must-have] ([Demo])
Status: not-started → in-progress
Plan: .agents/plans/[feature-id].md

Ready to execute: @execute .agents/plans/[feature-id].md
```

## Success Criteria

- [ ] Feature graph loaded and analyzed correctly
- [ ] Development horizon calculated accurately (all dependencies met)
- [ ] Recommendation algorithm considers all factors
- [ ] Presentation is clear and actionable
- [ ] User can select any ready feature
- [ ] @plan-feature invoked automatically with correct feature-id
- [ ] Feature status updated to "in-progress"
- [ ] Edge cases handled gracefully

## Quality Checklist

### Accuracy
- [ ] Horizon only includes truly ready features
- [ ] Dependency checking is correct (no circular deps)
- [ ] Recommendation scoring is balanced and sensible

### Usability
- [ ] Presentation is scannable and clear
- [ ] Recommendation rationale is transparent
- [ ] Selection process is intuitive
- [ ] Next steps are obvious

### Integration
- [ ] Seamlessly invokes @plan-feature
- [ ] Updates feature status correctly
- [ ] Maintains features.json consistency

## Notes

- This command is the entry point for feature development workflow
- Run after @design-digest creates feature graph
- Run repeatedly to select next feature after completing previous one
- Recommendation algorithm can be refined based on experience (V1/V2 enhancement)
- Consider adding "skip" option to mark features as "Won't-have" for current sprint
