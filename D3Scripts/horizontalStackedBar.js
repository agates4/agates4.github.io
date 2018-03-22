function drawBarChart(Container, data) {
    /* -------- Set margin and height width -------- */
    var margin = {
            top: 20,
            right: 30,
            bottom: 50,
            left: 140
        },
        width = parseInt(d3.select(Container).style('width'), 10) - margin.left - margin.right,
        height = 540 - margin.top - margin.bottom;
    /* ----- color scale (there are six sectors to highlight) ----- */
    color = d3.scale.ordinal()
        .range(["#98dafc", "#daad86", "#5e0231", "#e05038", "#334431", "#431c5d", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]);

    /* -------- Set Axis Orientation and Scale-------- */
    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .1);

    var x = d3.scale.linear()
        .rangeRound([0, width]);

    var formatCount = d3.format(".2s");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.format(".2s"));
    /* -------- Create SVG in container -------- */
    var svg = d3.select(Container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* -------- Set Domain for Colors -------- */
    color.domain(d3.keys(data).filter(function (d) {
        return d.key;
    }));

    /* -------- Sort Records -------- */
    // data.sort(function(a, b) { return a.values - b.values; });
    /* -------- Set Domain for Axis -------- */
    y.domain(data.map(function (d) {
        return d.key;
    }));
    x.domain([0, d3.max(data, function (d) {
        return d.values;
    }) + 20]);
    /* -------- Show X Axis -------- */
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    /* -------- Show Y Axis -------- */
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");
    /* -------- Show Bars -------- */
    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("id", function (d) {
            return d.key.replace(/ /g, '')
        })
        .attr("class", "g")
        .attr("transform", function (d) {
            return "translate(0," + y(d.key) + ")";
        })
        .on("mouseover", function (d) {
            highlightcountry(d.key);
        })
        .on("mouseout", function () {
            stophighlight();
        });

    state.append("rect")
        .attr("class", "rect")
        .attr("height", y.rangeBand())
        .attr("x", function (d, i) {
            return 0;
        })
        .attr("width", function (d) {
            return x(d.values);
        })
        .style("fill", function (d) {
            return color(d.key);
        })
        .on("mouseover", function (d) {
              d3.selectAll(".rect").style("opacity", function (d) {
          return 0.5;
        });
        d3.select(this).style("opacity", 1);
            highlightManufacturer(d.key);
        })
        .on("mouseout", function (d) {
              d3.selectAll(".rect").style("opacity", function (d) {
          return 1;
        });
            stophighlightManufacturer();
        });
  
    /* -------- Show Legends -------- 
    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(100," + i * 25 + ")"; }); */
    /* -------- Legends Rectangle to Show Color -------- 
    legend.append("rect")
        .attr("x", width - 150)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d.key)}); */
    /* -------- Legends Text --------
     legend.append("text")
         .attr("x", width - 24)
         .attr("y", 9)
         .attr("dy", ".35em")
         .style("text-anchor", "end")
         .text(function(d) { return d.key; });  */
}
/* ----- Function to Highlight Selected key ----- */
function highlightkey(name) {
    /* ----- Then you select every bars (with the common class) to update opacities ----- */
    d3.selectAll(".g").style("opacity", function (d) {
        return 0.3;
    });
    d3.select("#" + name.replace(/ /g, '')).style("opacity", 1);
}
/* -------- Function to Stop Highlight -------- */
function stophighlight() {
    d3.selectAll(".g").style("opacity", function (d) {
        return 0.9;
    });
}