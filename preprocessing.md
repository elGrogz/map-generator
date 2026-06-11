# Preprocessing Plan

## Goal

Move geodata preprocessing toward JavaScript so the map generator can become a reusable, config-driven tool for different regions, themes, and datasets.

## Short Answer

Yes, most of the current preprocessing can be done in JavaScript.

The main exception is elevation and contour generation, which is possible in JavaScript but is more complex and usually less practical than using R or other GIS tooling.

## What Can Move To JavaScript

These parts are good candidates to move first:

- load GeoJSON and other vector sources
- crop data to a bounding box or region
- clip polygons and lines
- simplify geometry
- filter features by type or tags
- split data into layers
- normalize output filenames and structure
- write a manifest describing bounds and layer paths

This is the work that will make the repo more reusable and configuration-driven.

## What Should Stay In R For Now

These parts should stay in R initially:

- fetching DEM or elevation raster data
- generating contour lines from raster elevation
- heavier raster analysis

Those are the most specialized parts of the current pipeline and not the best first target for migration.

## Recommended Tooling In JavaScript

### Core libraries

- `@turf/turf`
  For clipping, bbox operations, simplify, dissolve, filtering, and general GeoJSON transforms.

- `mapshaper`
  Useful for simplify, dissolve, clip, cleanup, and format conversion.

- `proj4`
  For reprojection when needed.

- `shapefile`
  For reading `.shp` inputs if source data still starts as shapefiles.

### Optional tooling

- Overpass or OSM tooling
  If you want to fetch OSM features directly in JavaScript later.

- `osmtogeojson`
  If you need to convert OSM responses into GeoJSON.

## Recommended Migration Strategy

### Phase 1: Keep R, add a JavaScript vector pipeline

Keep R only for:

- elevation raster work
- contour generation

Move everything else to JavaScript:

- coastline clipping
- lake extraction normalization
- bounds handling
- GeoJSON cleanup
- output organization
- manifest generation

This gives you a cleaner architecture without taking on the hardest GIS work immediately.

### Phase 2: Define a normalized data contract

Every map dataset should eventually produce something like:

```text
data/
  sao-miguel/
    coastline.geojson
    contours.geojson
    lakes.geojson
    multilakes.geojson
    manifest.json
```

Example `manifest.json`:

```json
{
  "name": "sao-miguel",
  "bounds": {
    "topX": -26,
    "topY": 38,
    "bottomX": -25,
    "bottomY": 37.6
  },
  "layers": {
    "coastline": "data/sao-miguel/coastline.geojson",
    "contours": "data/sao-miguel/contours.geojson",
    "waterPolygons": "data/sao-miguel/lakes.geojson",
    "waterMultiPolygons": "data/sao-miguel/multilakes.geojson"
  }
}
```

This is the key step for making the renderer reusable.

### Phase 3: Make preprocessing config-driven

Define a preprocessing config per map:

- map name
- bounding box
- source files
- layer rules
- simplify tolerance
- output directory

That lets you preprocess new regions without rewriting scripts.

### Phase 4: Revisit contours later

Once the vector pipeline is stable, decide whether contour generation should:

- remain in R
- move to another GIS tool
- move to JavaScript

There is no need to force this migration early if R is already working well for terrain data.

## Proposed Responsibilities

### JavaScript preprocessing

- input loading
- clipping
- simplification
- feature filtering
- layer normalization
- manifest creation
- output file structure

### R preprocessing

- elevation acquisition
- raster analysis
- contour generation

## Why This Split Makes Sense

The reusable part of this project is mostly about making vector data and configuration predictable.

That means the highest-value migration is not contour generation. It is:

- standardizing inputs
- standardizing outputs
- making layer generation repeatable
- making the renderer consume manifests and configs instead of hard-coded filenames

JavaScript is a good fit for that work because it can sit close to the renderer and eventually support a single end-to-end toolchain.

## Suggested First Implementation Steps

1. Create a `data/<map-name>/` structure for outputs.
2. Add a `manifest.json` format for layer paths and bounds.
3. Write a JavaScript preprocessing script for clipping and normalizing coastline and water layers.
4. Keep using R to generate contours and place the result into the same normalized output directory.
5. Update the renderer to read the manifest instead of hard-coded paths.
6. Move visual constants into a separate render config.

## Decision

Yes, JavaScript can replace a large part of the current R preprocessing workflow.

The best approach is a hybrid plan:

- move vector preprocessing to JavaScript now
- keep elevation and contour generation in R for the time being
- make both pipelines produce a shared, normalized dataset format
