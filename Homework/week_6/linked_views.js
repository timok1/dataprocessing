// Timo Koster 10815716
var winners = "race_winners.json";
var pop = "world_population.tsv";
var world_countries = "world_countries.json";
var requests = [d3.json(world_countries), d3.json(winners)];

Promise.all(requests).then(function(response) {
  console.log(response)
  createMap(response);

})

function createMap(stuff) {
  var data = stuff[0];
  var winners = stuff[1];
  var format = d3.format(",");
  var yPaddingTop = 50;

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 1000 - margin.left - margin.right,
              height = 650 - margin.top - margin.bottom;

  var colorArray = ['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']
  var nColors = colorArray.length

  var path = d3.geoPath();

  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  svg.append("text")
      .attr("class", "graphTitle")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .text("F1 Race Victories Per Country (1950-2017)");

  var projection = d3.geoMercator()
                     .scale(140)
                    .translate([width / 2, height / 1.5 + 20]);

  var path = d3.geoPath().projection(projection);



  function ready(data, winners) {
    var winsByCountry = {};

    winnersKeys = Object.keys(winners)
    for (let driver of winnersKeys) {
      if (winners[driver]['country_id'] in winsByCountry) {
        winsByCountry[winners[driver]['country_id']] += winners[driver]['victories'];
      }
      else {
        winsByCountry[winners[driver]['country_id']] = winners[driver]['victories'];
      }
    }

    var countries = svg.append("g")
        .attr("class", "countries")
      .selectAll("path")
        .data(data.features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) {
          if (winsByCountry[d.id] != undefined) {
              colorIndex = Math.ceil(winsByCountry[d.id] / 50 * (nColors - 1))
            if (colorIndex > nColors - 1) {colorIndex = nColors - 1}
            return colorArray[colorIndex];
          }
          else {
            return('lightgray');
          }
        })


    svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path);

    d3.select("body").append("p");

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    // Listen if mouse touches a datapoint, highlight point and display tooltip
    countries.on("mouseover", function(d){
      if (winsByCountry[d.id] != undefined) {
        tooltip.style("visibility", "visible")
              .html("<b><font size='+1'><font color='black'>"+ d.properties.name +
                  "</font></font><br><b>Race Victories: </b>" + winsByCountry[d.id]);
        d3.select(this).style("stroke-width", 4)
            .style("stroke", "#FF7700");
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

    countries.on("click", function(d){
      if (winsByCountry[d.id] != undefined) {
        createBarChart(winners, d.id);
      }
    })
  }
  ready(data, winners);
}

function createBarChart(winners, countryID) {
  var drivers = Object.keys(winners);
  var maxWins = 0;
  var nationalDrivers = {};
  for (let driver of drivers) {
    if (winners[driver]['country_id'] == countryID){
      if (winners[driver]['victories'] > maxWins) {
        maxWins = winners[driver]['victories'];
      }
      nationalDrivers[driver] = {'victories': winners[driver]['victories']};
    }
  }

  nationalDriversNames = Object.keys(nationalDrivers)

  var margin = {top: 30, right: 0, bottom: 70, left: 65};
  var w = 800 - margin.left;
  var h = 600 - margin.top - margin.bottom;

  d3.select(".barChart").remove();
  var svg = d3.select("body").append("svg")
                .attr("class", "barChart")
                .attr("width", w + margin.left)
                .attr("height", h + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var yScale = d3.scaleLinear()
          .domain([0, maxWins])
          .range([h, 0]);

  if ((nationalDriversNames.length - 1) * 100 < w) {
    var xRangeMax = nationalDriversNames.length * 100;
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
}
