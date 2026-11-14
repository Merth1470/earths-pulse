# Graph Report - earths-pulse  (2026-11-14)

## Corpus Check
- 56 files · ~187,168 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .woff2 3, (none) 1, .css 1)

## Summary
- 343 nodes · 536 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 84 edges (avg confidence: 0.88)
- Token cost: 4,200 input · 6,100 output (partial — only 1 of 6 semantic subagents exposed usage)

## Community Hubs (Navigation)
- Application Pages & Player
- Product & Data Provenance
- Package & Build Config
- Scientific & Audio Types
- Explore UI Screenshots
- About & Data Sources Screenshots
- Ocean Data Pipeline
- Mobile Explore Screenshots
- TypeScript Config
- Site Layout & Navigation
- Design System Rules
- NASA Visual Assets
- NASA SVS Client
- Provenance UI Screenshots
- Not Found Page
- Project Stack Rules

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `next` - 13 edges
3. `Explore View — Mobile Capture (Iteration 2)` - 10 edges
4. `Explore View — Desktop with Skip-to-Content Link Focused` - 10 edges
5. `StatusTag()` - 9 edges
6. `Data Sources and Provenance — Desktop Review Screenshot` - 9 edges
7. `Explore Page - Desktop Rendered Plate (Stage 01)` - 9 edges
8. `ECCO2 Global Currents + SST Still (2048x1024)` - 9 edges
9. `The Calibrated Plate (Design North Star)` - 8 edges
10. `Signal Path (4-stage acquisition → audio pipeline)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Rule: Never Sample Rendered Pixels as Measurements` --semantically_similar_to--> `Rule: Color Picking Is Not Data Extraction`  [INFERRED] [semantically similar]
  DESIGN.md → docs/DATA_SOURCE_REPORT.md
- `Explore Surface Direction Contract` --semantically_similar_to--> `Brand Commitments (Earth's Pulse, NASA attribution)`  [INFERRED] [semantically similar]
  .impeccable/surfaces/src-app-page-tsx.md → PRODUCT.md
- `Single-Meridian Globe Grid Motif` --semantically_similar_to--> `Flat Equirectangular Global Map Render`  [INFERRED] [semantically similar]
  src/app/icon.svg → public/assets/nasa/ecco2-global-currents-sst-2048.jpg
- `Jagged Waveform Mark (Pulse Line)` --semantically_similar_to--> `Surface Current Filament / Particle-Trace Field`  [INFERRED] [semantically similar]
  src/app/icon.svg → public/assets/nasa/ecco2-global-currents-sst-2048.jpg
- `Deep Navy + Cyan Accent Palette` --semantically_similar_to--> `Sea Surface Temperature Color Encoding`  [INFERRED] [semantically similar]
  src/app/icon.svg → public/assets/nasa/ecco2-global-currents-sst-2048.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design System Named Rules Discipline** — design_one_signal_rule, design_hairline_rule, design_measurement_mono_rule, design_quiet_heading_rule, design_single_lift_rule [EXTRACTED 1.00]
- **Provenance Layer Model Across Product, Docs, and Code Contracts** — product_provenance_is_part_of_the_interface, docs_data_source_report_three_layers, docs_architecture_provenance_layer, docs_architecture_data_status, docs_data_source_report_rules_for_future_data_work [INFERRED 0.95]
- **Stage 1 Offline Audio Boundary** — docs_data_source_report_numerical_access_blockers, docs_architecture_audio_boundary, design_sonification_transport, product_never_fake_measurement, readme_stage_1_status [INFERRED 0.85]
- **Signal Path Stage Sequence (numerical field → normalize → map → audio graph)** — _impeccable_review_about_desktop_2_numerical_field, _impeccable_review_about_desktop_2_normalize, _impeccable_review_about_desktop_2_map, _impeccable_review_about_desktop_2_audio_graph [EXTRACTED 1.00]
- **Three Layers of Evidence (a single scientific claim travelling from data to pixels)** — _impeccable_review_data_sources_desktop_2_three_layers, _impeccable_review_data_sources_desktop_2_ecco2_model, _impeccable_review_data_sources_desktop_2_nasa_svs_record_3912, _impeccable_review_data_sources_desktop_2_image_limits [INFERRED 0.85]
- **Provenance Disclosure Panels across About and Data Sources routes** — _impeccable_review_about_desktop_2_signal_path, _impeccable_review_about_desktop_2_stage1_scope, _impeccable_review_data_sources_desktop_2_source_record, _impeccable_review_data_sources_desktop_2_stage1_visual_only [INFERRED 0.75]
- **Explore Page View States Sharing One Layout** — _impeccable_review_explore_desktop_2, _impeccable_review_explore_loading, _impeccable_review_explore_image_error, _impeccable_review_explore_loading_plate_frame_skeleton [INFERRED 0.95]
- **Provenance and Honesty Disclosure Layers Across Review Captures** — _impeccable_review_data_sources_mobile_2_three_layers_of_evidence, _impeccable_review_data_sources_mobile_2_image_can_and_cannot_show, _impeccable_review_explore_desktop_2_read_plate_as_rendering, _impeccable_review_explore_desktop_2_not_live_disclaimer, _impeccable_review_explore_desktop_2_signal_path_panel [INFERRED 0.85]
- **Explore Responsive Layout Set (Mobile / Tablet / Desktop)** — impeccable_review_explore_mobile_2, impeccable_review_explore_tablet_2, impeccable_review_focus_skip, impeccable_review_explore_mobile_2_single_column_stack, impeccable_review_explore_tablet_2_two_column_layout, impeccable_review_focus_skip_desktop_split [INFERRED 0.85]
- **Liveness-Disclaimer Cluster — Every Surface Says What It Is Not** — impeccable_review_explore_mobile_2_historical_model_output_badge, impeccable_review_explore_tablet_2_stage_indicator, impeccable_review_focus_skip_read_plate_as_rendering, impeccable_review_final_explore_mobile_not_live_period_footer, impeccable_review_explore_mobile_2_sonification_transport, impeccable_review_focus_skip_liveness_honesty_principle [INFERRED 0.85]
- **Plate Provenance Chain — Image, Source Record, Signal Path, Provenance Link** — impeccable_review_focus_skip_plate_01_global, impeccable_review_focus_skip_source_record, impeccable_review_explore_tablet_2_signal_path, impeccable_review_final_explore_mobile_data_sources_provenance [INFERRED 0.85]
- **Provenance Disclosure UI Surface** — _impeccable_review_rail_desktop_evidence_rail, _impeccable_review_source_record_mobile_source_record_card, _impeccable_review_table_mobile_provenance_table, _impeccable_review_source_record_mobile_verification_status_token [INFERRED 0.85]
- **Honest Staged Sonification Status Model** — _impeccable_review_rail_desktop_signal_path, _impeccable_review_skip_target_focus_unsynchronized_audio_transport, _impeccable_review_skip_target_focus_stage_01_visual_only, _impeccable_review_rail_desktop_rendered_plate_caveat [INFERRED 0.85]
- **ECCO2 Still Visual Encoding System** — public_assets_nasa_ecco2_global_currents_sst_2048_flat_equirectangular_render, public_assets_nasa_ecco2_global_currents_sst_2048_current_filament_field, public_assets_nasa_ecco2_global_currents_sst_2048_sea_surface_temperature_coloring, public_assets_nasa_ecco2_global_currents_sst_2048_gray_bathymetry_backdrop [EXTRACTED 1.00]
- **Ocean Features Visible in the Frame** — public_assets_nasa_ecco2_global_currents_sst_2048_equatorial_warm_band, public_assets_nasa_ecco2_global_currents_sst_2048_western_boundary_currents, public_assets_nasa_ecco2_global_currents_sst_2048_antarctic_circumpolar_current, public_assets_nasa_ecco2_global_currents_sst_2048_mesoscale_eddy_swirls [INFERRED 0.85]
- **Globe-Plus-Signal Identity Mark** — src_app_icon_svg_globe_grid_motif, src_app_icon_svg_signal_waveform_mark, src_app_icon_svg_deep_navy_accent_palette [EXTRACTED 1.00]

## Communities (16 total, 2 thin omitted)

### Community 0 - "Application Pages & Player"
Cohesion: 0.08
Nodes (36): nextConfig, lucide-react, next, react, AboutPage(), contents, metadata, assets (+28 more)

### Community 1 - "Product & Data Provenance"
Cohesion: 0.07
Nodes (26): Disabled Sonification Transport (surface placement), Source / Availability / Signal-Path Evidence Rail, Two-Column Instrument Bay, Sonification Transport Component, Source Record Panel, Visualization Plate Component, Audio Boundary (SonificationEngine interfaces), DataStatus Type (+18 more)

### Community 2 - "Package & Build Config"
Cohesion: 0.06
Nodes (32): eslintConfig, dependencies, lucide-react, next, react, react-dom, devDependencies, eslint (+24 more)

### Community 3 - "Scientific & Audio Types"
Cohesion: 0.08
Nodes (22): AUDIO_STATUS, AudioEngineState, AudioParameter, AudioStatus, MappingCurve, SonificationEngine, SonificationMapping, SonificationScene (+14 more)

### Community 4 - "Explore UI Screenshots"
Cohesion: 0.13
Nodes (16): Data Sources and Provenance Page (Mobile), Citation Block, ECCO2 - MITgcm Model, Sea Surface Currents (u, v), Sea Surface Temperature Dataset, NASA SVS 3912 Source Record, Three Layers of Evidence, Explore Page - Desktop Rendered Plate (Stage 01) (+8 more)

### Community 5 - "About & Data Sources Screenshots"
Cohesion: 0.17
Nodes (20): Stage 4 — Audio graph (Web Audio synthesis) — NOT IMPLEMENTED, Credits and Independence (NASA attribution, non-endorsement), Stage 3 — Map (value → pitch, timbre, pan) — PENDING, Stage 2 — Normalize (physical units → verified [0,1] range) — PENDING, Stage 1 — Numerical Fields (ECCO2 variables u, v, SST) — NOT CONNECTED, About Earth's Pulse — Desktop Review Screenshot, Signal Path (4-stage acquisition → audio pipeline), What Stage 1 Is (working vs not-yet-connected inventory) (+12 more)

### Community 6 - "Ocean Data Pipeline"
Cohesion: 0.16
Nodes (18): bilinear(), fetchCsv(), GRID, lowerIndex(), lowerIndexWrapped(), main(), MONTH_LABELS, MONTHS (+10 more)

### Community 7 - "Mobile Explore Screenshots"
Cohesion: 0.26
Nodes (18): Explore View — Mobile Capture (Iteration 2), HISTORICAL MODEL OUTPUT · 26 MAR 2007 — 03 MAR 2008 · NOT LIVE Badge, Masthead Nav — Explore / About / Data Sources (Active Underline), Mobile Layout — Single-Column Stack with Full-Width Plates, Sonification Transport — OFFLINE Panel (Web Audio API / Engine: Not implemented), Explore View — Tablet Capture (Iteration 2), Signal Path — 04 Stages (Numerical field → Normalize → Map → Audio graph), STAGE 01 / VISUAL ONLY — Masthead Build-Stage Indicator (+10 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Site Layout & Navigation"
Cohesion: 0.18
Nodes (11): inter, metadata, plexMono, RootLayout(), viewport, LogoMark(), SiteFooter(), SiteHeader() (+3 more)

### Community 10 - "Design System Rules"
Cohesion: 0.14
Nodes (9): Explore Surface Direction Contract, Instrument Cyan (#42c7d9), Plate Lift Shadow, Status Marks (dot plus word), Accessibility Implementation, CSS Design Tokens (globals.css), Licensing and Attribution (NASA public domain, ECCO citation, OFL, ISC), Brand Commitments (Earth's Pulse, NASA attribution) (+1 more)

### Community 11 - "NASA Visual Assets"
Cohesion: 0.24
Nodes (15): ECCO2 Global Currents + SST Still (2048x1024), Southern Ocean / Antarctic Circumpolar Band, Surface Current Filament / Particle-Trace Field, ECCO2 High Resolution Ocean and Sea Ice Model (MITgcm), Equatorial Warm-Water Band, Flat Equirectangular Global Map Render, Dark Gray Continent / Bathymetry Backdrop, Mesoscale Eddies and Agulhas Rings (+7 more)

### Community 12 - "NASA SVS Client"
Cohesion: 0.18
Nodes (11): assertSvsVisualization(), fetchSvsVisualization(), isRecord(), NasaSvsError, SvsCreditRole, SvsDataset, SvsMediaGroup, SvsMediaInstance (+3 more)

### Community 13 - "Provenance UI Screenshots"
Cohesion: 0.24
Nodes (10): Desktop Evidence Rail (Source Record + Signal Path), Signal Path — 04 Staged Pipeline (G1–G4), Earth's Pulse Explore View — Desktop Screenshot, Sonification Transport — Offline / Not Synchronized, Source Record Card — Mobile, Verification Status Token Pattern (VERIFIED / BUNDLED / NOT OBTAINED / NOT USED), ECCO2 Numerical Fields — Not Obtained, ECCO V4r4 at PO.DAAC — Not Used (Different Release) (+2 more)

## Ambiguous Edges - Review These
- `Sea Surface Currents (u, v)` → `NOT LIVE Disclaimer (Historical Model Output)`  [AMBIGUOUS]
  .impeccable/review/explore-desktop-2.png · relation: rationale_for
- `Plate 01 / Global — Rendered Visualization Panel (2048x1024)` → `'Cache disabled' Dev Toast (Bottom-Left)`  [AMBIGUOUS]
  .impeccable/review/focus-skip.png · relation: conceptually_related_to

## Knowledge Gaps
- **102 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 120 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Sea Surface Currents (u, v)` and `NOT LIVE Disclaimer (Historical Model Output)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **What is the exact relationship between `Plate 01 / Global — Rendered Visualization Panel (2048x1024)` and `'Cache disabled' Dev Toast (Bottom-Left)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `next` connect `Application Pages & Player` to `Site Layout & Navigation`, `Package & Build Config`, `Not Found Page`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Application Pages & Player` to `Package & Build Config`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Explore View — Mobile Capture (Iteration 2)` (e.g. with `Explore View — Tablet Capture (Iteration 2)` and `Explore View — Final Mobile Capture`) actually correct?**
  _`Explore View — Mobile Capture (Iteration 2)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Pages & Player` be split into smaller, more focused modules?**
  _Cohesion score 0.08313725490196078 - nodes in this community are weakly interconnected._