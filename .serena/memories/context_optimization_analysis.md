# Context Optimization Analysis & Recommendations

Comparison of matherlynet-talos-cluster (reference) vs metorial (current) project context optimization.

## Executive Summary

The reference project demonstrates **enterprise-grade context optimization** with:

- 94% token reduction through strategic loading
- Multi-layer documentation architecture
- Auto-activating path-specific rules
- Custom agents and skills
- Visual architecture diagrams
- Progressive context loading strategies

The Metorial project currently has **basic context setup** requiring significant enhancement.

---

## Comparison Matrix

| Feature | Reference Project | Metorial | Gap |
| --------- | ------------------ | ---------- | ----- |
| CLAUDE.md entry point | ✅ Comprehensive | ❌ Missing | **Critical** |
| AGENTS.md universal | ✅ Standards-based | ❌ Missing | **Critical** |
| PROJECT_INDEX | ✅ JSON + MD | ✅ MD only | Minor |
| Serena memories | ✅ 10 detailed | ✅ 4 basic | **High** |
| .claude/agents/ | ✅ 6 agents | ❌ None | **High** |
| .claude/skills/ | ✅ 10 skills | ❌ None | Medium |
| .claude/rules/ | ✅ 5 path rules | ❌ None | **High** |
| .claude/commands/ | ✅ 5 commands | ❌ None | Medium |
| docs/ai-context/ | ✅ 13 domain docs | ❌ None | **High** |
| Context loading guide | ✅ Comprehensive | ❌ None | **High** |
| Custom hooks | ✅ Safety hooks | ❌ None | Medium |
| Visual diagrams | ✅ ASCII art | ❌ None | Medium |

---

## Reference Project Architecture

### Multi-Layer Documentation

```
Layer 1: CLAUDE.md / AGENTS.md (~2-3K tokens)
    │     Quick reference, always auto-loaded
    │
    v
Layer 2: PROJECT_INDEX.md (~3K tokens)
    │     Complete project understanding
    │
    v
Layer 3: docs/ai-context/*.md (~5-10K each)
    │     Domain-specific deep dives
    │     Load on-demand based on task
    │
    v
Layer 4: .serena/memories/*.md
    │     Detailed patterns, architecture
    │     Load for complex implementations
    │
    v
Layer 5: .claude/rules/*.md
          Path-specific rules (auto-activate)
```

### Key Innovations

1. **Context Loading Strategy Document**
   - Token cost reference tables
   - Decision trees for loading
   - Task-based loading patterns
   - Anti-patterns to avoid

2. **Path-Specific Rules**
   - Auto-activate based on file patterns
   - Contain comprehensive patterns
   - Reduce manual context loading

3. **Custom Agents**
   - Domain experts (flux, talos, network, etc.)
   - MCP tool permissions
   - Specialized knowledge

4. **Skills with Assets**
   - SKILL.md with workflow steps
   - references/ for patterns
   - assets/ for templates

---

## Recommended Enhancements for Metorial

### Priority 1: Critical (Immediate)

#### 1.1 Create CLAUDE.md

```
Purpose: Entry point for Claude Code sessions
Content:
- Quick start commands
- Stack overview
- Serena memory references
- Skill/agent references
- Context optimization tips
```

#### 1.2 Create AGENTS.md

```
Purpose: Universal AI agent instructions
Content:
- Project overview (MCP servers platform)
- Critical DO/DON'T rules
- Essential commands (bun add-server, bun run build)
- Project structure
- Server implementation pattern
- Quick troubleshooting
```

#### 1.3 Enhance Serena Memories

Add these memories:

- `codebase_architecture.md` (with diagrams)
- `server_implementation_patterns.md`
- `sdk_api_reference.md`
- `catalog_structure.md`
- `mcp_protocol_patterns.md`

### Priority 2: High (Week 1)

#### 2.1 Create docs/ai-context/

```
docs/ai-context/
├── README.md                    # Index with "when to load"
├── context-loading-strategy.md  # Token budget guide
├── mcp-server-development.md    # Server dev deep dive
├── sdk-usage.md                 # SDK patterns
├── catalog-management.md        # Catalog operations
├── build-system.md              # Nixpacks/Docker
└── oauth-patterns.md            # OAuth implementation
```

#### 2.2 Create .claude/rules/

```
.claude/rules/
├── servers.md                   # Glob: **/servers/**/*.ts
├── packages.md                  # Glob: **/packages/**/*.ts
├── catalog.md                   # Glob: **/catalog/**
└── scripts.md                   # Glob: **/scripts/**/*.ts
```

#### 2.3 Create .claude/agents/

```
.claude/agents/
├── mcp-server-expert.md         # Server development
├── sdk-expert.md                # SDK usage
├── build-expert.md              # Build system
└── catalog-expert.md            # Catalog management
```

### Priority 3: Medium (Week 2)

#### 3.1 Create .claude/skills/

```
.claude/skills/
├── add-server/SKILL.md          # Add new MCP server
├── debug-server/SKILL.md        # Debug server issues
└── lookup-chart/SKILL.md        # Find OCI charts
```

#### 3.2 Create .claude/commands/

```
.claude/commands/
├── server-status.md             # Check server health
├── build-status.md              # Build progress
└── catalog-stats.md             # Catalog statistics
```

#### 3.3 Add Custom Hooks

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [/* Safety checks */],
    "PostToolUse": [/* Run reminders */],
    "Stop": [/* Uncommitted changes check */]
  }
}
```

### Priority 4: Low (Week 3+)

- Create PROJECT_INDEX.json (machine-readable)
- Add visual diagrams to memories
- Create output-styles for different contexts
- Add instructions/ directory

---

## Implementation Checklist

**STATUS: ALL COMPLETE (January 21, 2026)**

### Phase 1: Foundation

- [x] Create CLAUDE.md
- [x] Create AGENTS.md
- [x] Enhance existing Serena memories
- [x] Add codebase_architecture.md memory

### Phase 2: Structure

- [x] Create docs/ai-context/ directory
- [x] Add context-loading-strategy.md
- [x] Add domain-specific docs (sdk-usage, build-system, catalog)
- [x] Create .claude/rules/ with path patterns (servers, packages, catalog, scripts)

### Phase 3: Automation

- [x] Create .claude/agents/ with experts (mcp-server, sdk, build, catalog)
- [x] Create .claude/skills/ with workflows (add-server, debug-server, build-server)
- [x] Create .claude/commands/ for quick ops (status, build-check, server-list)
- [x] Add custom hooks to settings.json

### Phase 4: Polish

- [x] Add visual diagrams throughout
- [x] Create PROJECT_INDEX.json
- [x] Document token costs
- [x] Create quick reference cards (in CLAUDE.md)

---

## Token Budget Targets

| Context Set | Target Tokens |
| ---------- | -------------- |
| Quick tasks | < 5K |
| Standard ops | < 15K |
| Server dev | < 25K |
| Architecture | < 40K |
| Deep debugging | < 50K |

---

## Success Metrics

1. **Token Efficiency**: < 25% of budget on context loading
2. **Task Completion**: Correct implementation on first attempt
3. **Context Relevance**: Load only what's needed for task
4. **Developer Experience**: New AI sessions productive in < 30 seconds

---

---

## Validation Results (January 21, 2026)

### Issues Found and Fixed

1. **settings.json schema errors**: Hook event names were incorrect
   - `PreToolCall` → `PreToolUse` (fixed)
   - `PostToolCall` → `PostToolUse` (fixed)
   - `NotificationReceived` → removed (not needed)
   - Removed invalid `name` property from hook objects
   - Removed invalid `preferences` property

2. **Empty skill directory**: `lookup-chart` skill had no SKILL.md (removed)

### Final Verification

| Component | Status | Files |
|-----------|--------|-------|
| Entry points | ✅ Valid | CLAUDE.md, AGENTS.md, PROJECT_INDEX.md |
| Rules | ✅ Valid | 4 files with proper globs |
| Agents | ✅ Valid | 4 agents with proper frontmatter |
| Skills | ✅ Valid | 3 skills with SKILL.md |
| Commands | ✅ Valid | 3 command files |
| AI Context | ✅ Valid | 5 documentation files |
| JSON Index | ✅ Valid | PROJECT_INDEX.json (valid JSON) |
| Settings | ✅ Fixed | Correct hook event names |

### Cross-Reference Validation

All references in CLAUDE.md verified to match actual files:

- ✅ Rules: servers.md, packages.md, catalog.md, scripts.md
- ✅ Agents: mcp-server-expert, sdk-expert, build-expert, catalog-expert
- ✅ Skills: add-server, debug-server, build-server
- ✅ Serena memories: all 6 exist and are accessible

---

## Second Validation Pass (January 21, 2026)

Compared against reference project (matherlynet-talos-cluster).

### Issues Found and Fixed

1. **settings.json environment variables**: Wrong env vars
   - `$TOOL_INPUT` → `$CLAUDE_TOOL_INPUT` (fixed)
   - `$FILE_PATH` → `$CLAUDE_FILE_PATH` (fixed)

2. **settings.json missing hooks**:
   - Added `Stop` hook (uncommitted changes reminder)
   - Added `SessionStart` hook
   - Added `Notification` hook (macOS notifications)
   - Added file change logging in PostToolUse
   - Enhanced safety checks (force push, etc.)

3. **Missing directories created**:
   - `.claude/instructions/` with context-optimization-guide.md, documentation-standards.md
   - `.claude/output-styles/` with debugging.md, minimal.md

4. **Missing configuration**:
   - Created `.markdownlint-cli2.yaml` with project-appropriate rules

5. **CLAUDE.md updated**:
   - Added Instructions and Output Styles to On-Demand Context table

### Final Structure

```
.claude/
├── settings.json            ✅ Fixed - correct env vars, all hooks
├── instructions/            ✅ New
│   ├── context-optimization-guide.md
│   └── documentation-standards.md
├── output-styles/           ✅ New
│   ├── debugging.md
│   └── minimal.md
├── rules/                   ✅ Valid
├── agents/                  ✅ Valid
├── skills/                  ✅ Valid
└── commands/                ✅ Valid

.markdownlint-cli2.yaml      ✅ New - markdown linting config
```

---

## Final Validation (January 21, 2026)

### Comprehensive Structure Verification

| Component | Reference | Metorial | Status |
|-----------|-----------|----------|--------|
| **Directory Structure** | 10 items | 10 items | ✅ Match |
| **agents/** | 6 files | 4 files | ✅ Domain-appropriate |
| **commands/** | 5 files | 3 files | ✅ Domain-appropriate |
| **instructions/** | 3 files | 2 files | ✅ Created |
| **output-styles/** | 3 files | 2 files | ✅ Created |
| **rules/** | 5 files | 4 files | ✅ Domain-appropriate |
| **skills/** | 9 skills | 3 skills | ✅ Domain-appropriate |
| **settings.json** | Valid hooks | Valid hooks | ✅ Fixed |
| **settings.local.json** | Exists | Exists | ✅ |

### Frontmatter Format Verification

| Type | Format | Status |
|------|--------|--------|
| Agents | name, description, tools, allowedMcpServers, model | ✅ |
| Rules | globs, description | ✅ |
| Skills | name, description | ✅ |
| Output-styles | name, description, keep-coding-instructions | ✅ |

### Skills Structure Verification

| Skill | SKILL.md | references/ | assets/ |
|-------|----------|-------------|---------|
| add-server | ✅ | ✅ server-patterns.md | ✅ 4 templates |
| debug-server | ✅ | ✅ common-errors.md | - |
| build-server | ✅ | ✅ build-configs.md | - |

### Additional Files Created

- `.markdownlint-cli2.yaml` - Markdown linting configuration
- `docs/ai-context/` - 5 AI context documents
- `PROJECT_INDEX.json` - Machine-readable project index

### Settings.json Fixes Applied

1. Event names: PreToolCall→PreToolUse, PostToolCall→PostToolUse
2. Environment variables: $TOOL_INPUT→$CLAUDE_TOOL_INPUT
3. Added hooks: Stop, SessionStart, Notification
4. Added file change logging
5. Enhanced safety checks

**Implementation Status**: COMPLETE
**Analysis Date**: 2026-01-21
**Based on**: matherlynet-talos-cluster reference implementation
