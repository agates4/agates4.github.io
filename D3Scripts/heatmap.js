function DrawHeatmap(Container, data) {
    var itemSize = 22,
        cellSize = itemSize - 1,
        margin = {
            top: 120,
            right: 20,
            bottom: 20,
            left: 110
        };

    var width = 750 - margin.right - margin.left,
        height = 300 - margin.top - margin.bottom;

    var formatDate = d3.time.format("%Y-%m-%d");
    var counts = {};
    heatmap(data);

    function heatmap(data) {
        var data = data.map(function (item) {
            counts[item.Subject] = counts[item.Subject] ? counts[item.Subject] + 1 : 1;
            var newItem = {};
            newItem.country = item.Subject;
            newItem.product = counts[item.Subject];
            newItem.value = +item.Popularity;
            newItem.name = item.Title;

            return newItem;
        })

        var x_elements = d3.set(data.map(function (item) {
                return item.product;
            })).values(),
            y_elements = d3.set(data.map(function (item) {
                return item.country;
            })).values();

        var xScale = d3.scale.ordinal()
            .domain(x_elements)
            .rangeBands([0, x_elements.length * itemSize]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(function (d) {
                return d;
            })
            .orient("top");

        var yScale = d3.scale.ordinal()
            .domain(y_elements)
            .rangeBands([0, y_elements.length * itemSize]);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat(function (d) {
                return d;
            })
            .orient("left");

        var colorScale = d3.scale.threshold()
            .domain([30, 50])
            .range(["#2980B9", "#E67E22", "#27AE60", "#27AE60"]);

        var svg = d3.select(Container)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        /* --------  Add the tooltip area to the webpage -------- */
        var tooltip = d3.select(Container).append("div")
            .attr("class", "tooltiph")
            .style("opacity", 0);

        var cells = svg.selectAll('rect')
            .data(data)
            .enter().append('g').append('rect')
            .attr('class', 'cell')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('y', function (d) {
                return yScale(d.country);
            })
            .attr('x', function (d) {
                return xScale(d.product);
            })
            .attr('fill', function (d) {
                return colorScale(d.value);
            })
            .on("mouseover", function (d) {
                tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              tooltip.html("Subject: "+d.country + "<br>Name: "+d.name)
              .style("left", (d3.event.pageX - 185) + "px")
              .style("top", (d3.event.pageY - 48) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            });

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll('text')
            .attr('font-weight', 'normal');

        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            .selectAll('text')
            .attr('font-weight', 'normal')
            .style("text-anchor", "start")
            .attr("dx", ".8em")
            .attr("dy", ".5em")
            .attr("transform", function (d) {
                return "rotate(-65)";
            });
    };
}