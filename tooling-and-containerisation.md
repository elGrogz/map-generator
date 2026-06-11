# Tooling And Containerisation Ideas

## Goal

Turn this repository from a one-off map composition into a reusable tool that can:

- accept coordinates or a bounding box
- preprocess the required geodata
- apply a chosen visual configuration
- render a finished map
- run consistently on any machine

## Desired User Experience

The end state should feel more like a CLI tool than a manually edited HTML page.

Examples:

```bash
map-generator build \
  --name sao-miguel \
  --bbox -26,38,-25,37.6 \
  --theme classic \
  --layout print-30cm
```

or

```bash
map-generator build \
  --name ile-de-re \
  --center -1.35,46.18 \
  --width-km 40 \
  --height-km 25 \
  --theme atlantic
```

Expected outputs:

- normalized geodata in `data/<map-name>/`
- a manifest describing the dataset
- rendered output in `output/<map-name>/`
- eventually PNG, SVG, and print-oriented exports

## High-Level Architecture

The tool should be split into four stages.

### 1. Input definition

The user passes:

- a map name
- either a bounding box or center plus dimensions
- a theme
- a layout or output preset
- optional layer toggles

Example internal request model:

```json
{
  "name": "sao-miguel",
  "bounds": {
    "topX": -26,
    "topY": 38,
    "bottomX": -25,
    "bottomY": 37.6
  },
  "theme": "classic",
  "layout": "print-30cm"
}
```

### 2. Data preprocessing

This stage:

- fetches or reads raw data
- clips to the requested area
- simplifies and normalizes vector layers
- generates or imports contours
- writes a dataset manifest

Output:

```text
data/
  sao-miguel/
    coastline.geojson
    contours.geojson
    lakes.geojson
    multilakes.geojson
    manifest.json
```

### 3. Rendering

This stage:

- loads the dataset manifest
- loads a render config
- composes layers in order
- writes final map output

### 4. Export

This stage should eventually support:

- browser preview
- PNG export
- SVG export where possible
- print-friendly output sizes and DPI

## Suggested Tool Shape

## Option A: Node.js CLI

This is the most natural fit if the renderer is staying in JavaScript.

Possible commands:

```bash
map-generator preprocess --config maps/sao-miguel.json
map-generator render --config maps/sao-miguel.json
map-generator build --config maps/sao-miguel.json
```

Pros:

- one language for renderer and most preprocessing
- easy to package
- easy to run in Docker
- easy to extend with config files

Cons:

- raster/elevation processing may still need R or another GIS tool

## Option B: Hybrid CLI

Use a Node.js CLI as the main entry point, but call:

- JavaScript for vector preprocessing and rendering
- R only for contours

Pros:

- practical transition path from the current repo
- no need to replace working contour logic immediately

Cons:

- container image and dependency chain become more complex

## Option C: Full pipeline with external GIS tooling

Use a higher-level script tool that shells out to:

- Node.js
- R
- GDAL or related GIS tools

Pros:

- strongest geospatial capabilities

Cons:

- more operational complexity
- less lightweight for iterative design work

## Recommendation

The best near-term approach is Option B.

Use Node.js as the main tool interface, then keep R behind a thin contour-generation step until the rest of the pipeline is stable.

## Configuration Model

To make the tool reusable, define three config layers.

### 1. Map request config

Describes the geography to render.

Example:

```json
{
  "name": "sao-miguel",
  "bounds": {
    "topX": -26,
    "topY": 38,
    "bottomX": -25,
    "bottomY": 37.6
  }
}
```

### 2. Theme config

Describes visual style.

Example:

```json
{
  "name": "classic",
  "colors": {
    "margin": "#293743",
    "sea": "#3a4f5f",
    "land": "#bed9e2",
    "graticule": "#867070"
  },
  "fonts": {
    "city": "Gill Sans",
    "island": "Big Caslon"
  }
}
```

### 3. Layout config

Describes framing and output size.

Example:

```json
{
  "name": "print-30cm",
  "frame": {
    "widthPx": 3543,
    "heightPx": 2338,
    "marginPx": 177
  },
  "projection": {
    "type": "mercator",
    "scale": 210000
  },
  "graticule": {
    "step": [0.2, 0.1]
  }
}
```

## Suggested Project Structure

```text
bin/
  map-generator.js

configs/
  themes/
    classic.json
    atlantic.json
  layouts/
    print-30cm.json

maps/
  sao-miguel.json

data/
  sao-miguel/
    manifest.json
    coastline.geojson
    contours.geojson
    lakes.geojson
    multilakes.geojson

output/
  sao-miguel/
    preview.png
    final.png

src/
  cli/
  preprocess/
  render/
  config/
  exporters/

r/
  contours.R
```

## Containerisation Strategy

## Why containerise

Containerisation would solve several current problems:

- R package setup becomes repeatable
- GIS dependencies become consistent
- local file path assumptions go away
- the tool can run the same way on different machines
- future CI automation becomes possible

## Initial Docker approach

The simplest first container is a build container that includes:

- Node.js
- R
- the required R packages

That lets one command run preprocessing and rendering in a clean environment.

### Example responsibilities of the container

- install JS dependencies
- install R dependencies
- mount the repo as a working directory
- run the preprocessing and render commands

### Example command shape

```bash
docker build -t map-generator .
docker run --rm -v "$PWD:/app" map-generator build --config maps/sao-miguel.json
```

## Container layers to think about

### Base runtime

- Node.js LTS
- R runtime

### Geospatial dependencies

Depending on the final pipeline, you may also need system libraries commonly required by geospatial packages. This is one of the main advantages of containerising early: those dependencies stop being machine-specific.

### App code

- CLI code
- render code
- preprocessing code
- R scripts

## Two viable container models

### Model 1: Single all-in-one container

Contains everything:

- Node
- R
- preprocessing
- rendering

Pros:

- easiest to operate
- easiest for local use

Cons:

- larger image

### Model 2: Separate preprocess and render containers

One container for geodata preparation, another for rendering.

Pros:

- cleaner separation
- smaller render image if needed

Cons:

- more orchestration complexity

## Recommendation

Start with a single all-in-one container. Split later only if startup time, image size, or deployment constraints make it necessary.

## Script And CLI Evolution Plan

### Phase 1: Config-driven script

Add one script that takes a JSON config and produces output.

Example:

```bash
node bin/map-generator.js build maps/sao-miguel.json
```

That script should:

1. read the map request config
2. prepare or validate required data
3. call R if contours are missing
4. generate a dataset manifest
5. render the final output

### Phase 2: Real CLI flags

Add support for flags such as:

- `--name`
- `--bbox`
- `--center`
- `--width-km`
- `--height-km`
- `--theme`
- `--layout`
- `--output`

### Phase 3: Presets and reusable map definitions

Support both:

- direct coordinate-driven runs
- saved named map configs

This gives flexibility:

- ad hoc map generation from coordinates
- repeatable outputs from committed configs

### Phase 4: Export targets

Support:

- preview render
- final high-resolution render
- optional transparent overlays

## Coordinate Input Design

You asked specifically about passing in coordinates. There are two useful input modes.

### Mode 1: Bounding box

Example:

```bash
map-generator build --bbox -26,38,-25,37.6
```

Pros:

- explicit
- easy for clipping
- easy to reproduce

Cons:

- less friendly if you think in terms of a map center

### Mode 2: Center plus size

Example:

```bash
map-generator build --center -25.5,37.8 --width-km 80 --height-km 50
```

Pros:

- nicer user experience
- easier for exploratory map generation

Cons:

- requires conversion into bounds internally

## Recommendation

Support both. Use center-plus-size for user ergonomics, then convert it into a normalized bounding box inside the tool.

## Important Technical Questions

Before building too much, it is worth deciding:

- Should rendering stay browser-based, or move to a headless render path?
- Do you want PNG only at first, or vector export too?
- Will contours remain required for every map?
- Will the tool fetch source data automatically, or expect prepared inputs?
- How much preprocessing should happen on demand versus be cached?

## Caching And Repeatability

If this becomes a real tool, caching will matter.

Useful cache boundaries:

- raw downloaded source data
- cropped intermediate datasets
- generated contours
- final normalized GeoJSON layers
- final rendered outputs

This will make repeated runs much faster when only the theme or layout changes.

## Recommended Near-Term Build Order

1. Introduce a config file for one map build request.
2. Normalize output into `data/<map-name>/manifest.json`.
3. Build a Node.js script that reads that config and validates inputs.
4. Keep R as a subprocess only for contours.
5. Refactor the renderer so it consumes manifest, theme, and layout configs.
6. Add Docker once the CLI contract is stable enough to package.

## Practical Recommendation

Do not start with Docker first.

Start by defining the CLI contract and the config/data contracts:

- what inputs the tool accepts
- what files preprocessing produces
- what the renderer consumes

Then containerise that workflow once the boundaries are clear. Otherwise you risk packaging a prototype shape that you will soon replace.

## Summary

This can become a clean tool with:

- a Node.js CLI as the main entry point
- JavaScript for vector preprocessing and rendering
- R retained temporarily for contour generation
- config files for bounds, theme, and layout
- Docker for reproducible execution once the CLI shape is established

The key step is to make the pipeline contract explicit: coordinates in, normalized dataset plus config resolution in the middle, rendered maps out.
