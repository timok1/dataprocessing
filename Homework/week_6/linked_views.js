// Timo Koster 10815716
var winners = "data/race_winners.json";
var world_countries = "data/world_countries.json";
var requests = [d3.json(world_countries), d3.json(winners)];

Promise.all(requests).then(function(response) {
  createMap(response);
})

// Creates map. Map is heavily based on map by Micah Stubbs from http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
function createMap(response) {
  var data = response[0];
  var winners = response[1];

  var margin = {top: 0, right: 50, bottom: 0, left: 0},
              width = 950 - margin.left - margin.right,
              height = 650 - margin.top - margin.bottom;

  var path = d3.geoPath();
  // Create svg for map
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');
  // Map title
  svg.append("text")
      .attr("class", "mapTitle")
      .attr("x", 30)
      .attr("y", 35)
      .attr("text-anchor", "start")
      .text("F1 Race Wins Per Country (1950-2017)");

  // Projection, zoom level and center of map
  var projection = d3.geoMercator()
                     .scale(140)
                    .translate([width / 2, height / 1.5 + 20]);

  var path = d3.geoPath().projection(projection);

  var winsByCountry = {};
  var maxWins = 0
  var winnersKeys = Object.keys(winners)
  // Get amount of wins per country
  for (let driver of winnersKeys) {
    if (winners[driver]['country_id'] in winsByCountry) {
      winsByCountry[winners[driver]['country_id']] += winners[driver]['victories'];
    }
    else {
      winsByCountry[winners[driver]['country_id']] = winners[driver]['victories'];
    }
    // Get most amount of wins for scale of barGraph
    if (winners[driver]['victories'] > maxWins) {
      maxWins = winners[driver]['victories']
    }
  }

  // Colors for map
  var colorArray = ['lightgray','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b'];
  var nColors = colorArray.length;
  // Add countries to map
  var countries = svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(data.features)
    .enter().append("path")
      .attr("d", path)
      // Give colors to countries based on their wins
      .style("fill", function(d) {
        if (winsByCountry[d.id] != undefined) {
            colorIndex = Math.floor((winsByCountry[d.id]) / 80 * (nColors - 1)) + 1
          if (colorIndex > nColors - 1) {colorIndex = nColors - 1}
          return colorArray[colorIndex];
        }
        // Color winless countries grey
        else {
          return colorArray[0];
        }
      })

  svg.append("path")
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);

  // tooltip for map
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip_map");

  // Listen if mouse touches country, highlight country and display tooltip
  countries.on("mouseover", function(d){
    if (winsByCountry[d.id] != undefined) {
      tooltip.style("visibility", "visible")
            .html("<b><font size='+1'><font color='black'>"+ d.properties.name +
                "</font></font><br><b>Race Wins: </b>" + winsByCountry[d.id]);
      d3.select(this).style("stroke-width", 4)
          .style("stroke", "deepskyblue")
          .style("cursor","pointer");
    }
  })

  // Stops displaying tooltip if mouse moves away, remove highlight
  countries.on("mouseout", function(){
    d3.select(this).style("stroke-width", .5)
        .style("stroke", "black");
    tooltip.style("visibility", "hidden");
  })

  // Show tooltip next to mouse
  countries.on("mousemove", function(){
    tooltip.style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY - 20) + "px");
  })

  // Display bar chart for country on click
  countries.on("click", function(d){
    if (winsByCountry[d.id] != undefined) {
      createBarChart(winners, d.id, maxWins);
    }
  })

  // d3.select("body")
  // .append("a")
  //         .html('<br>Source of data')
  //         .attr("class","sources")
  //         .attr("href", "https://www.kaggle.com/cjgdev/formula-1-race-data-19502017");

  // Create legend
  function legend(){
    var hLegend = 200;
    var wLegend = 150;
    var locLegend = [width - wLegend - 1, 60]
    // Create outline for legend
    var legendBox = svg.append("rect")
                      .attr("x", locLegend[0])
                      .attr("y", locLegend[1])
                      .attr("width", wLegend)
                      .attr("height", hLegend)
                      .attr("fill", "white")
                      .attr("stroke", "black")
                      .attr("stroke-width", 1);

    // Create legend values
    var i = 0;
    var xLocCircle = locLegend[0] + 20;
    var titleSpace = 30
    // Creates element in legend for every element in colorArray
    for (let color of colorArray){
      var yLocCircle = locLegend[1] + hLegend - 15 - i/nColors*(hLegend-titleSpace);
      svg.append("circle")
          .attr("r", 7)
          .attr("cx", xLocCircle)
          .attr("cy", yLocCircle)
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("stroke-width", 1);
      // Text for 0 wins
      if (i === 0) {
        svg.append("text")
            .attr("x", xLocCircle + 15)
            .attr("y", yLocCircle + 5)
            .attr("class", "legendText")
            .text('0');
      }
      // Exclude 0 from text at 1-9
      else if (i === 1) {
        svg.append("text")
            .attr("x", xLocCircle + 15)
            .attr("y", yLocCircle + 5)
            .attr("class", "legendText")
            .text("1 - 9");
      }
      // normal text for most elements
      else if ((i + 1) < nColors) {
        svg.append("text")
            .attr("x", xLocCircle + 15)
            .attr("y", yLocCircle + 5)
            .attr("class", "legendText")
            .text(((i - 1) * 10) + " - " + (i - 1) + '9');
      }
      // Give last element different text, and create legendTitle
      else {
        svg.append("text")
            .attr("class", "legendTitle")
            .attr("text-anchor", "middle")
            .attr("x", locLegend[0] + wLegend / 2)
            .attr("y", locLegend[1] + titleSpace / 2 + 4)
            .text("Race Wins");
        svg.append("text")
            .attr("x", xLocCircle + 15)
            .attr("y", yLocCircle + 5)
            .attr("class", "legendText")
            .text(((i - 1) * 10) + "+");
      }
      i++;
    }
}
  legend();
}

// Create bar chart
function createBarChart(winners, countryID, maxWins) {
  var drivers = Object.keys(winners);
  var nationalDrivers = {};
  var first = true;
  // Create new json for just drivers of this country
  for (let driver of drivers) {
    if (winners[driver]['country_id'] == countryID){
      nationalDrivers[driver] = {'victories': winners[driver]['victories']};
      if (first) {
        var nationality = winners[driver]['nationality'];
        first = false;
      }
    }
  }

  var nationalDriversNames = Object.keys(nationalDrivers);

  var margin = {top: 50, right: 0, bottom: 70, left: 65};
  var w = 800 - margin.left;
  var h = 645 - margin.top - margin.bottom;

  // Remove previous chart and create new svg
  d3.select(".barChart").remove();
  var svg = d3.select("body").append("svg")
                .attr("class", "barChart")
                .attr("width", w + margin.left)
                .attr("height", h + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Chart title
  svg.append("text")
      .attr("class", "graphTitle")
      .attr("x", 0)
      .attr("y", - 18)
      .attr("text-anchor", "start")
      .text(nationality + " Race Winners In F1 (1950 - 2017)");

  // Scales
  var yScale = d3.scaleLinear()
          .domain([0, maxWins])
          .range([h, 0]);
  // Set width of chart depending on amount of drivers
  if ((nationalDriversNames.length - 1) * 80 < w) {
    var xRangeMax = nationalDriversNames.length * 80;
  }
  else {
    var xRangeMax = w;
  }
  var xScale = d3.scaleBand()
          .domain(nationalDriversNames)
          .range([0, xRangeMax])
          .padding(0.1);

  // Create bars
  var rects = svg.selectAll("rect")
                .data(nationalDriversNames)
                .enter()
                .append("rect")
                .attr("x", function(d) {
                          return xScale(d);
                        })
                .attr("y", function(d) {
                      return yScale(nationalDrivers[d].victories);
                        })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) {
                      return h - yScale(nationalDrivers[d].victories);
                })
                .attr("fill", "skyblue");

  // Create y-axis
  var yAxis = d3.axisLeft(yScale);
  svg.append("g")
          .attr("class", "y-axis")
          .call(yAxis);

  // Add label to y-axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("class", "y-axis-label")
    .attr("x", -(h / 2))
    .attr("text-anchor", "middle")
    .attr("y", - 35)
    .text("Race Victories");

  // Create x-axis
  var xAxis = d3.axisBottom(xScale);
  svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis)
          .selectAll("text")
          .attr("text-anchor", "end")
          .attr("y", 3)
          .attr("x", -7)
          .attr("transform", "rotate(-30)");

  // Tooltip for chart
  var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip_graph")
        .style("visibility", "hidden");

  // Listen if mouse touches a bar, then takes appropiate action
  rects.on("mouseover", function(d){
    d3.select(this).attr("fill", "midnightblue")
    tooltipText = ''
    for (team in winners[d].teams) {
      tooltipText += ('<br><b> &nbsp&nbsp &bull; ' + team + ': </b>' +
      winners[d].teams[team]);
    }
    tooltip.style("visibility", "visible")
          .html("<b><font size='+1'><font color='black'>"+ d +
              "</font></font><br>Total Victories: </b>" +
              winners[d].victories + "<font size='-1'>" + tooltipText) + '</font>';
  })

  // Stops displaying tooltip if mouse moves away, reset color of bars
  rects.on("mouseout", function(){
    rects.attr("fill", "skyblue")
    tooltip.style("visibility", "hidden");
  })

  // Show tooltip next to mouse
  rects.on("mousemove", function(){
    tooltip.style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY) - 70 + "px");
  })
}
