// url for json data

url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// retrieving url_data to build map
d3.json(url,function(url_data){
    
    //console.log(url_data["features"][1300]["geometry"]["coordinates"][0])

    //console.log(url_data["features"][0]["properties"]["time"])

    /* once we get response, create a geoJSON layer containing the "features" array
       then, send the layer to "createmap" function
    */
    
    var features_data = L.geoJSON(url_data.features)
  
    create_map(url_data.features)

})

// function to create maps

//function create_map(features_data,url_data_features)
function create_map(url_data_features)
{
   // circle popups

   var loc_coords = []
   var cir_pops = []

   url_data_features.forEach(function(d)
   {
     //console.log(d.geometry.coordinates[0])
      loc_coords.push(d.geometry.coordinates[1],d.geometry.coordinates[0])   //  pushing Latitude and Longtitude of locations to an array
      
      //console.log(d.properties.mag)

      var circles =
        L.circle(loc_coords,{     //adding circles as location markers with respective location coordinates
        fillOpacity:0.8,        
          color:"brown",
          weight:0.45,
          fillColor:fill_color(d.properties.mag),
          radius:d.properties.mag * 20000 // adjusting radius so that its visible
      })
    // adding popups on circles to view extra information
     cir_pops.push(circles.bindPopup(`<h3> ${d.properties.place} </h3> <hr> <p> <b>${Date(d.properties.time)} <br> EarthQuake Magnitude:${d.properties.mag}<b></p>`))

     loc_coords = []      // clearing the array for next location coordinates
    
   })

   //console.log(circles)

       // adding base map layers - street view , outdoor view and satellite view

       var street_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
       {
           maxZoom: 18,
           id: "mapbox.light",
           accessToken:API_KEY,
           //style: 'mapbox://styles/mapbox/light-v10'
           //style: 'light-v10'
       })

       var outdoor_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
       {
           maxZoom: 18,
           id: "mapbox.outdoors",
           accessToken:API_KEY,
           
       })

       var satellite_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
       {
           maxZoom: 18,
           id: "mapbox.satellite",
           accessToken:API_KEY,
           
       })
   
       // basemap object to hold our base layers
       var basemaps = {
         "Satellite": satellite_map,
         "Gray Scale": street_map,
         "Outdoors": outdoor_map
       }

       //create layer groups  - to view the given locations(of earthquakes) on selected base map view

       var circle_layer = L.layerGroup(cir_pops)
       var techtonic_layer = L.layerGroup()
   
       //overlay object to hold overlay layer
       var overlaymaps = {
         "Fault Lines": techtonic_layer,
         "EarthQuake Data": circle_layer
       }
   
       //create map = base layer + overlay layer
       var map_obj = L.map("map",{
         // center: [39.09, -90.71],
        // center: [14.09, -68.71],
         center: [28.09, -68.71],
         zoom:4,
         layers:[satellite_map,circle_layer,techtonic_layer]
       }) 
   
       /* create a layer
          pass basemaps + overlaymaps
          add layer control to map
       */ 
      L.control.layers(basemaps,overlaymaps,{
         collapsed:false
      }).addTo(map_obj)


    // adding legend to display at bottom right

      var legend = L.control({position: "bottomright"});

      legend.onAdd = function(map){

        var div = L.DomUtil.create('div','info legend'),
            mag = [0,1,2,3,4,5]
            labels = []

        for (var i=0;i <mag.length;i++){
          div.innerHTML += 
            '<i style="background:'+get_color(mag[i]+1)+'"></i>' +
            mag[i]+(mag[i+1] ?'&ndash;' + mag[i+1] + '<br>':'+');

        }
        return div
      }
      legend.addTo(map_obj)

// adding second overlaymap layer

    var geojson

    var techtonic_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"
      
    d3.json(techtonic_plates,function(data)
      {
        //console.log(data)
        geojson = L.geoJSON(data,{
        color:"rgb(240, 107, 45)",
        weight:2
        })
        //console.log(geojson)
        geojson.addTo(techtonic_layer)
        //console.log(cir_pops)
        
        //geojson.addTo(cir_pops)

        //cir_pops.addTo(geojson)
      })


}

// colors to fill circles based on mag(radius) size

function fill_color(mag)
{
  if (mag > 5)
    return "rgb(252, 51, 44)"

  else if (mag <= 5 && mag >4)
    return "rgb(240, 107, 45)"

  else if (mag <= 4 && mag >3)
    return "rgb(250, 166, 87)"

  else if (mag <= 3 && mag >2)
    return "rgb(243, 196, 94)"

  else if (mag <= 2 && mag >1)
    return "rgb(212, 255, 0)"

  else if (mag <= 1 && mag >0)
    return "rgb(171, 255, 97)"
    
}


// colors for legends 

function get_color(d)
{
  return d > 5 ? "rgb(252, 51, 44)":
         d > 4 ? "rgb(240, 107, 45)":
         d > 3 ? "rgb(250, 166, 87)":
         d > 2 ? "rgb(243, 196, 94)":
         d > 1 ? "rgb(212, 255, 0)":
                 "rgb(171, 255, 97)";
}




