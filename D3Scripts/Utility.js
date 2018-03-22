// Get filter data based on category
function filterData(data, category, value) {
    var filterdata = data.filter(function (row) {
        return row[category] == value;
    });
    return filterdata;
}

// Create Dropdown
function populateDropDown(data, dropDownName, KeyValue) {
    var select = d3.select(dropDownName)
        .append("select");

    for (var d in data) {
        select.append("option")
            .attr("value", function () {
                return data[d][KeyValue];
            })
            .text(function () {
                return data[d][KeyValue];
            });
    }
    return select;
}