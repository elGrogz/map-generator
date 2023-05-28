install.packages(c("ggplot2", "sf"))

library("ggplot2")
library("sf")

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
  geom_sf(data = coastline_intersect) +
  xlab("Longitude") + ylab("Latitude") + theme_minimal()

st_write(coastline_intersect, "~/dev/projects/map-generator/data/il-de-re-coastline.geojson", detele_dsn = T)

# END OF COASTLINE