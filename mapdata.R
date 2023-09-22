install.packages(c("ggplot2", "sf"))

library("ggplot2")
library("sf") # general mapping
library("geodata") # get gadm data (administrative data per country)
library("elevatr") # get elevation data
library("raster") # get contour lines from elevation data
library("geojsonio")
library("osmdata")

# COASTLINE
# coastline 1
osm_coastline <- read_sf("~/dev/projects/r-maps/land-polygons-complete-4326/land_polygons.shp")

# coastline 2
osm_coastline2 <- read_sf("/Users/gregor.gilchrist/Downloads/ne_10m_coastline/ne_10m_coastline.shp")

osm_coastline <- st_make_valid(osm_coastline)

osm_coastline2 <- st_make_valid(osm_coastline2)

# sao miguel
# 37.968898, -25.926816
# 37.640502, -25.027649

# il de ré / la rochelle
#longitude <- c(-1.72, -1.036)
#latitude <- c(46.36, 46.023)
#latitude <- c(37.968898, 37.640502)
#longitude <- c(-25.926816, -25.027649)
latitude <- c(38, 37.6)
longitude <- c(-26, -25)


# creates a data frame which is a collection of variables (like a matrix/list). Fundamental data structure for R
bb_rect <- data.frame(latitude, longitude) %>% # pass in the values for the data frame
  st_as_sf(coords = c("longitude", "latitude")) %>% # 
  st_set_crs(4326) %>%
  st_bbox() %>%
  st_as_sfc()

coastline_intersect <- osm_coastline %>% st_crop(bb_rect)

# Plot the coastline - Takes a while
ggplot() +
  geom_sf(data = coastline_intersect) +
  xlab("Longitude") + ylab("Latitude") + theme_minimal()

st_write(coastline_intersect, "~/dev/projects/map-generator/data/sao-miguel-coastline.geojson", detele_dsn = T)

# END OF COASTLINE

# START OF ELEVATION/CONTOURS

#france <- gadm(country = "France", level = 1, path = "MapData")
#region <- france[10]
portugal <- gadm(country = "Portugal", level = 1, path = "MapData")
region <- portugal[2]

#bounding_longitude <- c(longitude[1], longitude[2], longitude[2], longitude[1])
#bounding_latitude <- c(latitude[2], latitude[1], latitude[1], latitude[2])
#bbox_azores <- vect(cbind(id = 1, part = 1, bounding_longitude, bounding_latitude),type = "polygons", crs = "+proj=longlat +datum=WGS84")

#azores <- intersect(region, bbox_azores)
#region_sf <- st_as_sf(region)
raster_intersect <- coastline_intersect %>% st_crop(bb_rect)
plot(raster_intersect)

#region_sf <- st_as_sf(region)
elevation_region <- get_elev_raster(raster_intersect, z = 12, clip = "bbox")
plot(elevation_region, col = grey(1:100/100))
  
breaks <- seq(from = 200, to = 1500, by = 100)
contour_sao_miguel <- rasterToContour(elevation_region, maxpixels = 1000000, levels = breaks)
plot(contour_sao_miguel, lwd = 0.8, col = "#606060")
geojson_write(geojson_json(contour_sao_miguel), file = "~/dev/projects/map-generator/data/sao-miguel-elevation.geojson")

# END OF ELEVATION/CONTOURS

# LAKES
# Rough boundary of Lofoten
osm_lakes <-
  opq(bbox = bb_rect) %>%
  add_osm_feature(key = "natural", value = "water") %>%
  add_osm_feature(key = "water", value = "!river") %>% #Exclude the rivers
  osmdata_sf()

lakes <- osm_lakes$osm_polygons
multilakes <- osm_lakes$osm_multipolygons

ggplot() +
  geom_sf(data=coastline_intersect, col="transparent") +
  geom_sf(data = lakes, aes(fill= water), col="transparent") +
  geom_sf(data = multilakes, aes(fill= water), col="transparent") +
  coord_sf(xlim = longitude, ylim = latitude) +
  xlab("Longitude") + ylab("Latitude") + theme_minimal()
  
  
st_write(lakes, "~/dev/projects/map-generator/data/sao-miguel-lakes.geojson", detele_dsn = T)
st_write(multilakes, "~/dev/projects/map-generator/data/sao-miguel-multillakes.geojson", detele_dsn = T)
# END OF LAKES