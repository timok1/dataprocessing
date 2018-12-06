// Timo Koster 10815716

window.onload = function() {
  var gdp = "https://stats.oecd.org/SDMX-JSON/data/PDB_LV/AUS+AUT+BEL+CAN+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+RUS.T_GDPPOP.CPC/all?startTime=2008&endTime=2015&dimensionAtObservation=allDimensions"
  var emissions = "https://stats.oecd.org/SDMX-JSON/data/AIR_GHG/AUS+AUT+BEL+CAN+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+RUS.GHG+CO2.INTENS+GHG_CAP/all?startTime=2008&endTime=2015&dimensionAtObservation=allDimensions"
  var renewables = "https://stats.oecd.org/SDMX-JSON/data/GREEN_GROWTH/AUS+AUT+BEL+CAN+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+RUS.RE_TPES/all?startTime=2008&endTime=2015&dimensionAtObservation=allDimensions"
  var requests = [d3.json(gdp), d3.json(emissions), d3.json(renewables)];

  Promise.all(requests).then(function(response) {
      // Create nested lists of data
      dataList = processData(response);
      // Create plot with year
      createGraph(dataList, 2015);
  }).catch(function(e){
      throw(e);
  });
};

function processData(data){
  var dataList = [];
  // Seperate data
  var gdpData = data[0]['dataSets'][0]['observations'];
  var emissionsData = data[1]['dataSets'][0]['observations'];
  var renewablesData = data[2]['dataSets'][0]['observations'];
  var countriesYearsData = data[0]['structure']['dimensions']['observation'];
  // Get years in dataset
  years = [];
  for (let year of countriesYearsData[3]['values']){
    years.push(year['name']);
  }
  nYears = years.length
  // Get correct keys
  var gdpKeys = Object.keys(gdpData);
  var renewablesKeys = Object.keys(renewablesData);
  // create nested lists with data. i, j and k make sure correct value gets chosen
  for (let i = 0, j = 0, k = 0; i < gdpKeys.length; i++) {
    if (i % nYears == 0 && i != 0) {
      j++;
      k = 0;
    }
    dataList.push([gdpData[gdpKeys[i]][0], emissionsData[gdpKeys[i]][0], renewablesData[renewablesKeys[i]][0], countriesYearsData[0]['values'][j]['name'], years[k]]);
    k++;
  };
  return dataList;
};

function createGraph(dataset, year){
  d3.select("body").append("h1").text("Week 5 Data Processing Homework Assignment");

  // Graph parameters
  var h = 600;
  var w = 800;
  var xPadding = 50;
  var yPaddingTop = 50;
  var yPaddingBottom = 40;
  var colorArray = ['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'];
  var nColors = colorArray.length;
  // Get years in dataset
  var years = [];
  for (let item of dataList){
    if (years.includes(item[4])){
      break;
    }
    years.push(item[4]);
  }

  // Create svg for graph
  var svg = d3.select("body").append("svg")
              .attr("width", w)
              .attr("height", h);

  // Scale functions for axes
  var xScale = d3.scaleLinear()
          .domain([0, 120000])
          .range([xPadding, w - xPadding]);
  var yScale = d3.scaleLinear()
          .domain([0, 30])
          .range([h - yPaddingBottom, yPaddingTop]);

  // Create y-axis
  var yAxis = d3.axisLeft(yScale);
  svg.append("g")
          .attr("class", "y-axis")
          .attr("transform", "translate(" + xPadding + ", 0)")
          .call(yAxis);
  // y-axis label
  svg.append("text")
    .attr("class","axisLabel")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -(h / 2))
    .attr("y", 11)
    .text("Greenhouse Gasses Emitted (1000 kg per capita per year)");

  // Create x-axis
  var xAxis = d3.axisBottom(xScale);
  var xLoc = h -yPaddingBottom
  svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0, " + xLoc + ")")
          .call(xAxis);
  // x-axis label
  svg.append("text")
    .attr("class","axisLabel")
    .attr("text-anchor", "middle")
    .attr("x", w/2)
    .attr("y", h - 5)
    .text("GDP (USD Per Capita)");

  // Graph title
  svg.append("text")
    .attr("class","graphTitle")
    .attr("x", xPadding)
    .attr("y", 20)
    .text("GDP and Emitted Greenhouse Gasses Per Country");

  // Create dropdown menu for years in dataset
  var dropdown = d3.select('body')
                    .append('select')
                    .on('change',update)
                    .selectAll('option')
                  	.data(years)
                    .enter()
                  	.append('option')
                  	.text(function (d) { return d;})
                    // Select latest year as default
                    .property("selected", function(d) {
                      return d === years[years.length - 1];
                    });

  // Draw new circles when new value is selected
  function update() {
  	selectYear = d3.select('select').property('value');
    createGraphValues(selectYear);
  };

  // Create legend
  function legend(){
    var hLegend = 140;
    var wLegend = 200;
    var locLegend = [w - wLegend - 1, yPaddingTop - 10]
    // Create outline for legend
    var legendBox = svg.append("rect")
                      .attr("x", locLegend[0])
                      .attr("y", locLegend[1])
                      .attr("width", wLegend)
                      .attr("height", hLegend)
                      .attr("fill", "none")
                      .attr("stroke", "black")
                      .attr("stroke-width", 1);

    // Create legend values
    var i = 0;
    var xLocCircle = locLegend[0] + 20;
    var titleSpace = 30
    // Creates element for every element in colorArray
    for (let color of colorArray){
      var yLocCircle = locLegend[1] + hLegend - 15 - i/nColors*(hLegend-titleSpace);
      svg.append("circle")
          .attr("r", 7)
          .attr("cx", xLocCircle)
          .attr("cy", yLocCircle)
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("stroke-width", 1);
      if ((i + 1) < nColors) {
        svg.append("text")
            .attr("x", xLocCircle + 15)
            .attr("y", yLocCircle + 5)
            .attr("class", "legendText")
            .text((i * 10) + "% - " + ((i + 1) * 10) + "%");
      }
      // Give last element different text, and create legendTitle
      else {
        svg.append("text")
            .attr("class", "legendTitle")
            .attr("text-anchor", "middle")
            .attr("x", locLegend[0] + wLegend / 2)
            .attr("y", locLegend[1] + titleSpace / 2 + 4)
            .text("Renewable Energy Share");
        svg.append("text")
            .attr("x", xLocCircle + 15)
            .attr("y", yLocCircle + 5)
            .attr("class", "legendText")
            .text((i * 10) + "%+");
      }
      i++;
    }
  };
  legend();

  // Draw datapoints in graph for given year
  function createGraphValues(year) {
    yearIndex = year - years[0];
    // Create a new dataset for given year
    datasetYear = []
    for (let i = yearIndex; i < dataset.length; i+=years.length) {
      datasetYear.push(dataset[i]);
    }

    // Remove previous datapoints
    svg.selectAll(".valueCircles").remove();

    // Draw datapoints at correct positions
    var circles = svg.selectAll("valueCircles")
                    .data(datasetYear)
                    .enter()
                    .append("circle")
                    .attr("class", "valueCircles")
                    .attr("cx", function(d) {
                        return xScale(d[0]);
                    })
                    .attr("cy", function(d) {
                        return yScale(d[1]);
                    })
                    .attr("r", 7)
                    // Color datapoints
                    .attr("fill", function(d) {
                     colorIndex = Math.floor(d[2] / 40 * 4)
                     if (colorIndex > 4) {
                       colorIndex = 4
                     }
                     return colorArray[colorIndex]
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", 1);

    // Add displayed year in graph
    svg.selectAll(".graphYearText").remove();
    svg.append("text")
          .attr("class", "graphYearText")
          .attr("x", xPadding + 20)
          .attr("y", yPaddingTop + 40)
          .text(year);

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    // Listen if mouse touches a datapoint, highlight point and display tooltip
    circles.on("mouseover", function(d){
      d3.select(this).attr("stroke-width", 2)
                      .attr("r", 10);
      tooltip.style("visibility", "visible")
            // Format tooltip text
            .html("<b><font size='+1'><font color='black'>"+ d[3] +
                "</font></font><br>GDP: </b>$" + Math.round(d[0]) +
                "<br><b> GHG Emitted: </b>" + d[1] * 1000 + " kg" +
                "<br><b> Renewable Energy Share: </b>" +
                Math.round(d[2] * 100) / 100 + "%");
    })

    // Stops displaying tooltip if mouse moves away, remove highlight
    circles.on("mouseout", function(){
      d3.select(this).attr("stroke-width", 1)
                      .attr("r", 7);
      tooltip.style("visibility", "hidden");
    })

    // Show tooltip next to mouse
    circles.on("mousemove", function(){
      tooltip.style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 20) + "px");
    })
  }

  createGraphValues(year);

  // Create tooltip


  // Add text elements at end of page
  d3.select("body")
        .append("p")
        .text("This graph shows the amount of all greenhouse gasses emitted and the total GDP per capita. It also shows the amount of renewable energy used as a percentage of all energy that's used within a country (with the color of the datapoints). Find more detailed information by hovering over a datapoint. You can also select to display data from different years (in the range " + years[0] + " - " + years[years.length - 1] + ") with the dropdown menu.")
        .append("p")
        .text("Graph created by Timo Koster (10815716)")
        .append("a")
        .html("<br><br>Sources:")
        .append("a")
        .html('<br> GDP')
        .attr("href", "https://stats.oecd.org/viewhtml.aspx?datasetcode=PDB_LV&lang=en#")
        .append("a")
        .html('<br> Greenhouse Gasses')
        .attr("href", "https://stats.oecd.org/viewhtml.aspx?datasetcode=AIR_GHG&lang=en#")
        .append("a")
        .html('<br> Renewable Energy')
        .attr("href", "https://stats.oecd.org/viewhtml.aspx?datasetcode=GREEN_GROWTH&lang=en");
}
