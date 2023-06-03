install.packages(c("ggplot2", "sf"))

library("ggplot2")
library("sf") # general mapping
library("geodata") # get gadm data (administrative data per country)
library("elevatr") # get elevation data
library("raster") # get contour lines from elevation data
library("geojsonio")

# COASTLINE

osm_coastline <- read_sf("~/dev/projects/r-maps/land-polygons-complete-4326/land_polygons.shp")

osm_coastline <- st_make_valid(osm_coastline)

# il de ré / la rochelle
longitude <- c(-1.72, -1.036)
latitude <- c(46.36, 46.023)

# creates a data frame which is a collection of variables (like a matrix/list). Fundamental data structure for R
bb_rect <- data.frame(latitude, longitude) %>% # pass in the values for the data frame
  st_as_sf(coords = c("longitude", "latitude")) %>% # 
  st_set_crs(4326) %>%
  st_bbox() %>%
  st_as_sfc()

coastline_intersect <- osm_coastline %>% st_crop(bb_rect)

# Plot the coastline - Takes a while
ggplot() +
  geom_sf(data = france) +
  xlab("Longitude") + ylab("Latitude") + theme_minimal()

st_write(coastline_intersect, "~/dev/projects/map-generator/data/il-de-re-coastline.geojson", detele_dsn = T)

# END OF COASTLINE

# START OF ELEVATION/CONTOURS

france <- gadm(country = "France", level = 1, path = "MapData")
region <- france[10]

bounding_longitude <- c(longitude[1], longitude[2], longitude[2], longitude[1])
bounding_latitude <- c(latitude[1], latitude[2], latitude[2], latitude[1])
bbox_charentes <- vect(cbind(id = 1, part = 1, bounding_longitude, bounding_latitude),type = "polygons", crs = "+proj=longlat +datum=WGS84")

ildere <- intersect(region, bbox_charentes)
plot(region)

region_sf <- st_as_sf(region)
elevation_region <- get_elev_raster(region_sf, z = 11, clip = "bbox")
plot(elevation_region, col = grey(1:100))

# END OF ELEVATION/CONTOURS