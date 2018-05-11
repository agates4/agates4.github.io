//Init Map
//*******************************************************************************************************************************************************
var lat = 41.141376;
var lng = -8.613999;
var zoom = 14;

// add an OpenStreetMap tile layer
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';


var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });


var map = L.map('map', {
    center: [lat, lng], // Porto
    zoom: zoom,
    layers: [streets],
    zoomControl: true,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: "Show me the fullscreen !",
        titleCancel: "Exit fullscreen mode",
        position: 'bottomright'
    }
});

var baseLayers = {
    "Grayscale": grayscale, // Grayscale tile layer
    "Streets": streets, // Streets tile layer
};

layerControl = L.control.layers(baseLayers, null, {
    position: 'bottomleft'
}).addTo(map);

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var featureGroup = L.featureGroup();

var drawControl = new L.Control.Draw({
    position: 'bottomright',
	collapsed: false,
    draw: {
        // Available Shapes in Draw box. To disable anyone of them just convert true to false
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: true,
        marker: false,
    }

});
map.addControl(drawControl); // To add anything to map, add it to "drawControl"
//*******************************************************************************************************************************************************
//*****************************************************************************************************************************************
// Index Road Network by Using R-Tree
//*****************************************************************************************************************************************
var rt = cw(function(data,cb){
	var self = this;
	var request,_resp;
	importScripts("js/rtree.js");
	if(!self.rt){
		self.rt=RTree();
		request = new XMLHttpRequest();
		request.open("GET", data);
		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				_resp=JSON.parse(request.responseText);
				self.rt.geoJSON(_resp);
				cb(true);
			}
		};
		request.send();
	}else{
		return self.rt.bbox(data);
	}
});

rt.data(cw.makeUrl("https://raw.githubusercontent.com/agates4/agates4.github.io/master/IV/js/trips.json"));
//*****************************************************************************************************************************************	
//*****************************************************************************************************************************************
// Drawing Shapes (polyline, polygon, circle, rectangle, marker) Event:
// Select from draw box and start drawing on map.
//*****************************************************************************************************************************************	

map.on('draw:created', function (e) {
	
	var type = e.layerType,
		layer = e.layer;
	
	if (type === 'rectangle') {
		// console.log(layer.getLatLngs()); //Rectangle Corners points
		var bounds=layer.getBounds();
		rt.data([[bounds.getSouthWest().lng,bounds.getSouthWest().lat],[bounds.getNorthEast().lng,bounds.getNorthEast().lat]]).
        then(function(d)
        {
            var streetnames = d.map(function(a) {
                return a.properties.streetnames;
            });

            var avspeed = d.map(function(a) {
                return a.properties.avspeed;
            });

            var distance = d.map(function(a) {
                return a.properties.distance;
            });

            var duration = d.map(function(a) {
                return a.properties.duration;
            });

            getStreetWords(streetnames);
            console.log(d);
            getScatterPlot(d);

            // console.log(result);		// Trip Info: avspeed, distance, duration, endtime, maxspeed, minspeed, starttime, streetnames, taxiid, tripid
            DrawRS(result);
        });
	}
	
	drawnItems.addLayer(layer);			//Add your Selection to Map  
});
//*****************************************************************************************************************************************
// DrawRS Function:
// Input is a list of road segments ID and their color. Then the visualization can show the corresponding road segments with the color
// Test:      var input_data = [{road:53, color:"#f00"}, {road:248, color:"#0f0"}, {road:1281, color:"#00f"}];
//            DrawRS(input_data);
//*****************************************************************************************************************************************
function DrawRS(trips) {
	for (var j=0; j<trips.length; j++) {  // Check Number of Segments and go through all segments
		var TPT = new Array();			  
		TPT = TArr[trips[j].tripid].split(',');  		 // Find each segment in TArr Dictionary. 
		var polyline = new L.Polyline([]).addTo(drawnItems);
        polyline.setStyle({
            color: 'red',                      // polyline color
			weight: 1,                         // polyline weight
			opacity: 0.5,                      // polyline opacity
			smoothFactor: 1.0  
        });
		for(var y = 0; y < TPT.length-1; y=y+2){    // Parse latlng for each segment
			polyline.addLatLng([parseFloat(TPT[y+1]), parseFloat(TPT[y])]);
		}
	}		
}

        var width = 300,
        size = 150,
        padding = 20;

    var x = d3.scale.linear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scale.linear()
        .range([size - padding / 2, padding / 2]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top")
        .ticks(6);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .ticks(6);

    var color = d3.scale.category10();

function getScatterPlot(fullData) {
    var data = [];
        for (var key in fullData) {
            data.push({
                speed: fullData[key].properties.avspeed,
                distance: fullData[key].properties.distance,
                duration: fullData[key].properties.duration
            });
        }

        console.log(data)

        var domainTrait = {},
            allAtrributes = d3.keys(data[0]),
            n = allAtrributes.length;

        allAtrributes.forEach(function(trait) {
            domainTrait[trait] = d3.extent(data, function(d) {
                return d[trait];
            });
        });

        xAxis.tickSize(size * n);
        yAxis.tickSize(-size * n);

        var svg = d3.select("#rightside").append("svg")
            .attr("width", size * n + padding)
            .attr("height", size * n + padding)
            .append("g")
            .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        svg.selectAll(".x.axis")
            .data(allAtrributes)
            .enter().append("g")
            .attr("class", "x axis")
            .attr("transform", function(d, i) {
                return "translate(" + (n - i - 1) * size + ",0)";
            })
            .each(function(d) {
                x.domain(domainTrait[d]);
                d3.select(this).call(xAxis);
            });

        svg.selectAll(".y.axis")
            .data(allAtrributes)
            .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function(d, i) {
                return "translate(0," + i * size + ")";
            })
            .each(function(d) {
                y.domain(domainTrait[d]);
                d3.select(this).call(yAxis);
            });

        var cell = svg.selectAll(".cell")
            .data(cross(allAtrributes, allAtrributes))
            .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function(d) {
                return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")";
            })
            .each(plot);

            function plot(p) {
                var cell = d3.select(this);
            
                x.domain(domainTrait[p.x]);
                y.domain(domainTrait[p.y]);
            
                cell.append("rect")
                    .attr("class", "frame")
                    .attr("width", size - padding)
                    .attr("height", size - padding)
                    .attr("x", padding / 2)
                    .attr("y", padding / 2);
                cell.selectAll("circle")
                    .data(data)
                    .enter().append("circle")
                    .attr("cx", function(d) {
                        return x(d[p.x]);
                    })
                    .attr("cy", function(d) {
                        return y(d[p.y]);
                    })
                    .attr("r", 4)
                    .style("fill", function(d) {
                        return color(d.duration);
                    }).on("click", function(d){
                        alert("Distance = " + Math.round(d.distance) + "\n" +
                        "Speed = " + Math.round(d.speed) + "\n" +
                        "Duration = " + Math.round(d.duration) + "\n")
                    })
            }
            
            function cross(a, b) {
                var c = [],
                    n = a.length,
                    m = b.length,
                    i, j;
                for (i = -1; ++i < n;)
                    for (j = -1; ++j < m;) c.push({
                        x: a[i],
                        i: i,
                        y: b[j],
                        j: j
                    });
                return c;
            }
    
}

function getStreetWords(result) {
    var counts = {};
    for (var i = 0; i < result.length; i++) {
        var num = result[i];
        for (let index = 0; index < num.length; index++) {
            const element = num[index];
            if(counts[element]) {
                counts[element] += 1;
            }
            else
                counts[element] = 1;
        }
    }
    frequency_list = []
    for (var key in counts) {
        frequency_list.push({"text":key,"size":counts[key] / 50 < 1 ? 0 : counts[key] / 50})
        // $('#chart1').append("<text style=\"font-size:" + counts[key] + ";\">" + key + "</text>")
        // console.log(key, counts[key]);
    }
    var color = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    d3.layout.cloud().size([850, 350])
            .words(frequency_list)
            .rotate(0)
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();

    function draw(words) {
        d3.select("#rightside").append("svg")
                .attr("width", 850)
                .attr("height", 350)
                .attr("class", "wordcloud")
                .append("g")
                // without the transform, words words would get cutoff to the left and top, they would
                // appear outside of the SVG area
                .attr("transform", "translate(320,200)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                }).on("click", function(d){
                    alert("frequency: " + counts[d.text])
                })
                .text(function(d) { return d.text; });
    }
}