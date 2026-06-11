# Map Generator

This repository is an early-stage map rendering tool for generating stylized maps from geospatial source data. The current implementation is a small static browser app backed by hand-prepared GeoJSON files and R scripts for data extraction.

The longer-term direction is to make the renderer data-driven and configurable so that you can swap in:

- different regions or islands
- different source datasets
- different visual themes
- different output sizes and print settings

## Current State

Today the repo contains:

- a static HTML entry point: `map.html`
- three browser-side JavaScript files for rendering
- two R scripts for generating map data
- a small JSON config file that is not yet wired into rendering

It does not currently contain:

- a checked-in `data/` directory
- a build system
- a CLI
- a reusable configuration model
- a fully modular rendering pipeline

The current map target is Sao Miguel in the Azores, with some older Ile de Re work still present in comments and the older R script.

## Repository Layout

- `map.html`
  The main browser entry point. Sets up the canvas, SVG overlay, projection, constants, and render order.

- `mapShapeRenderer.js`
  Draws the main visual layers such as sea, coastline, contours, and inland water.

- `graticuleRenderer.js`
  Draws latitude/longitude grid lines and some of the grid labels.

- `mapUtils.js`
  Shared low-level helpers for clipping and polygon path drawing.

- `mapConfig.json`
  A placeholder configuration file. It is fetched by the app, but its values are not yet used to drive rendering.

- `mapdata.R`
  The current R workflow for generating coastline, elevation contour, and lake GeoJSON for Sao Miguel.

- `src/mapdata.R`
  An older R script for the earlier Ile de Re workflow.

## How It Works

The rendering path is currently:

1. Open `map.html` in a browser.
2. Load D3 from the CDN.
3. Create a `canvas` for the map artwork.
4. Create an `svg` overlay for labels.
5. Set up a hard-coded Mercator projection.
6. Fetch GeoJSON files from `./data/`.
7. Draw layers in sequence:
   - sea
   - graticules
   - coastline
   - elevation contours
   - inland water polygons

The browser-side code is written in a global-script style rather than ES modules. Most values are shared through globals defined in `map.html`.

## Required Data

The renderer currently expects these files under `data/`:

- `data/sao-miguel-coastline.geojson`
- `data/sao-miguel-elevation.geojson`
- `data/sao-miguel-multillakes.geojson`
- `data/sao-miguel-lakes.geojson`

Those files are referenced by `fetchGeoData()` in `map.html`, but `data/` is not checked into the repo right now.

## Setup

### 1. Generate or provide map data

You need GeoJSON inputs before the browser renderer can work.

The current R workflow uses packages including:

- `ggplot2`
- `sf`
- `geodata`
- `elevatr`
- `raster`
- `geojsonio`
- `osmdata`
- `mapview`

The script in `mapdata.R` also assumes access to local shapefiles outside this repo, for example:

- `~/dev/projects/r-maps/land-polygons-complete-4326/land_polygons.shp`
- `/Users/gregor.gilchrist/Downloads/ne_10m_coastline/ne_10m_coastline.shp`

That means the current data-generation workflow is not portable yet. Before this becomes a reusable tool, the input data sources and output conventions should be standardized inside the repo.

### 2. Create the `data/` directory

Place the generated GeoJSON files in:

```text
data/
```

with the filenames expected by `map.html`, or update the fetch paths there.

### 3. Serve the files locally

Because the page fetches JSON, it should be run through a local HTTP server rather than opened directly as a `file://` page.

Examples:

```bash
python3 -m http.server 8000
```

or

```bash
npx serve .
```

Then open:

```text
http://localhost:8000/map.html
```

## Architecture Notes

### Rendering split

The app uses two drawing layers:

- `canvas` for the actual cartographic artwork
- `svg` for labels and overlay elements

This is a reasonable split for a stylized print-oriented map generator:

- canvas is efficient for filled shapes, shadows, and layered raster-style drawing
- SVG is easier for text placement and later export-friendly overlays

### Projection and framing

Projection setup currently lives directly in `map.html` and is controlled by hard-coded constants:

- frame width and height
- margin
- map scale
- graticule step
- bounding coordinates
- color palette
- font choices

This works for a single composition, but not yet for a reusable generator.

### Data model

Right now the implicit data model is:

- one coastline GeoJSON
- one contour GeoJSON
- one water polygon GeoJSON
- one water multipolygon GeoJSON

That is enough for a first rendering pipeline, but the code already hints at additional layers that are not implemented yet:

- roads
- cities
- forests
- island labels

### Draw order

The current draw order is baked into `drawMap()`:

1. clip
2. sea
3. graticules
4. coastline
5. contours
6. water multipolygons
7. water polygons

That order matters visually. Any future generalized version should keep the render pipeline explicit and configurable.

## Known Gaps

- `mapConfig.json` is fetched but not actually used to drive rendering.
- There is no checked-in sample `data/` directory.
- The renderer is tightly coupled to one hard-coded map extent.
- The browser code depends on globals rather than modules.
- The R workflow depends on absolute local file paths.
- Latitude graticule labels are not fully rendered yet.
- There is no export pipeline for final PNG, SVG, or print-ready output.

## Direction For A Reusable Tool

To make this into a system where you can plug in different map data and configurations, I would steer it toward three clear layers.

### 1. Data preparation

Input:

- raw geospatial sources
- bounding box or named region
- layer selection rules

Output:

- normalized GeoJSON files
- a single map manifest describing available layers

For example:

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

### 2. Rendering configuration

Move all visual constants into a proper theme/config file:

- page size
- DPI
- margins
- projection type
- map center or fit mode
- contour styling
- palette
- fonts
- graticule intervals
- label rules

For example:

```json
{
  "frame": {
    "widthPx": 3543,
    "heightPx": 2338,
    "marginPx": 177
  },
  "projection": {
    "type": "mercator",
    "scale": 210000
  },
  "theme": {
    "margin": "#293743",
    "sea": "#3a4f5f",
    "land": "#bed9e2",
    "graticule": "#867070"
  }
}
```

### 3. Renderer

The renderer should take:

- one map manifest
- one visual config

and produce:

- a browser preview
- eventually an exportable image

At that point the code becomes a reusable engine instead of a single hard-coded composition.

## Recommended Next Steps

If you want this repo to become a general-purpose styled map generator, the highest-value next steps are:

1. Move all hard-coded constants out of `map.html` into a real config schema.
2. Introduce a `data/` directory structure and a checked-in sample dataset.
3. Replace globals with modules or a small renderer class.
4. Define a map manifest format for layer paths and bounds.
5. Make the R pipeline output normalized filenames and metadata.
6. Add one or two alternate map examples to prove the abstraction works.

## Suggested Near-Term Target Structure

One plausible next structure is:

```text
data/
  sao-miguel/
    coastline.geojson
    contours.geojson
    lakes.geojson
    multilakes.geojson
    manifest.json
  ile-de-re/
    ...

configs/
  themes/
    classic.json
    dark-atlantic.json
  layouts/
    print-30cm.json

src/
  renderers/
  layers/
  config/
  app/
```

That would let you mix:

- dataset
- theme
- layout

without rewriting the renderer each time.

## Summary

This repo already has the beginnings of a useful map-making workflow:

- geospatial data extraction in R
- a custom D3-based browser renderer
- a visual style oriented toward decorative print maps

What it does not have yet is a formal boundary between data, configuration, and rendering. Establishing that boundary is the main step needed to turn this from a one-off map composition into a reusable tool.
