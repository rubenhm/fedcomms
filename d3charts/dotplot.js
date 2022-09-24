// Reads data from a CSV file with the annual SEPs projections
// Also read data from a CSV with recent SEPs for LR projections
// Data are from FRED

var pt = pt || {};

pt.plotDotPlot = pt.plotDotPlot || {};
pt.plotDotPlot.svg = null;


// Aux function
// Create array [1,2,...,N]
// http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
function nArray (N) {
    var dotArray = [];
    for (var i = 1; i <= N; i++) {
      dotArray.push(i);
    }
    return dotArray;
}

function rArray (a,N) {
    var newArray = [];
    for (var i = 1; i <= N; i++) {
        newArray.push(a);
    }
    return newArray;
}


pt.plotDotPlot.init = function () {
  'use strict';

  // Define SVG
  pt.plotDotPlot.svg = d3.select("#dotplot .placeholder")
      .append("svg")
      .attr("width", pt.outerWidth)
      .attr("height", pt.outerHeight);
};


pt.plotDotPlot.chart = function(error, latestdate, data) {
      'use strict';

      if (error) {
        return pt.displayError(error);
      }

      var sepDate = d3.timeFormat("%b %d, %Y")(d3.timeParse("%Y%m%d")(latestdate["0"]["date"]));
      console.log(sepDate);

      // Examine data
      console.log(data);

      // Read years
      var years = [];
      for (var i=0;i<data.length; i++) {
        years.push(data[i].index);
      }
      console.log(years);

      // Read rates
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
      var dataCols = Object.keys(data[0]);
      // Remove index
      dataCols.splice(0,1);
      // Interest Rate Scale range provided in SEPs
      // make numeric
      var numScale = dataCols.map(function (d) {
        return +d;
      });

      console.log(dataCols);
      console.log(numScale);
      // http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
      function arrayMax(array) {
        return array.reduce(function(a, b) {
          return Math.max(a, b);
        });
      }
      // Calculate max number of dots for the same rate
      var maxDots = d3.max(data, function (d) {
          // Generate array of values
          // console.log(d)
          var dvalues = [];
          var ic;
          for (ic in dataCols) {
              var col = dataCols[ic];
              // if (col != "Period") {
                dvalues.splice(0,0,d[col].length);
              // }
          }
          // console.log(dvalues)
          // Spread operator (...) to calculate max of an array:
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
          // console.log(Math.max(...dvalues)) 
          // return Math.max(...dvalues);
          // translate
          return arrayMax(dvalues);
        });

      // console.log(maxDots)

      // Generate array of serials
      // dotArray = [1, 2, ..., N]
      var dotArray = nArray(maxDots);
      console.log(dotArray);

      // Scales and Axes
      // Ordinal Band scale for X. Keep as string (don't use +d.index)
      pt.plotDotPlot.x0 = d3.scaleBand()
             .domain(data.map(function (d) {return d.index; }))
             .rangeRound([0,pt.innerWidth])
             .padding(0.1);

      // Ordinal point scale to arrange dots in each band
      // domain is the largest number of dots in any given band
      // range is the bandwidth of the band
      pt.plotDotPlot.x1 = d3.scalePoint()
              .domain(dotArray)
              .range([0, pt.plotDotPlot.x0.bandwidth()]);

      // Y linear scale with hardcoded bounds
      pt.plotDotPlot.y = d3.scaleLinear()
              // .domain(d3.extent(numScale)) // provided
              .domain([0,5])                 // harcoded
              .range([pt.innerHeight,0]);

      // Axes generators
      // TODO: use fewer ticks
      pt.plotDotPlot.xAxis = d3.axisBottom(pt.plotDotPlot.x0);
      pt.plotDotPlot.yAxis = d3.axisRight(pt.plotDotPlot.y).ticks(10);

      // Gridlines: https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
      // gridlines in x axis function
      function make_x_gridlines() {
          return d3.axisBottom(pt.plotDotPlot.x0)
              .ticks(10);
      }

      // gridlines in y axis function
      function make_y_gridlines() {
          return d3.axisLeft(pt.plotDotPlot.y)
              .ticks(10);
      }

      // Add svg
      pt.plotDotPlot.chartGroup = pt.plotDotPlot.svg.append("g")
              .attr("transform","translate("+pt.margin.left+","+pt.margin.top+")");

      pt.plotDotPlot.chartGroup.append("g").attr("class","x axis")
               .attr("transform", "translate(0,"+pt.innerHeight+")")
               .call(pt.plotDotPlot.xAxis);
               

      pt.plotDotPlot.chartGroup.append("g")
                .attr("class","grid")
                .attr("transform", "translate(0," + pt.innerHeight + ")")
                .call(make_x_gridlines()
                  .tickSize(-pt.innerHeight)
                  .tickFormat("")
                );

      pt.plotDotPlot.chartGroup.append("g").attr("class","y axis")
               .attr("transform", "translate("+pt.innerWidth+",0)")
               .call(pt.plotDotPlot.yAxis);

      pt.plotDotPlot.chartGroup.append("g")
               .attr("class","grid")
               .call(make_y_gridlines()
                  .tickSize(-pt.innerWidth)
                  .tickFormat("")
                );

      // Add labels to axes
      pt.plotDotPlot.chartGroup.append("text")
              .attr("class", "y label")
              .attr("text-anchor","end")
              .attr("x", pt.innerWidth)
              .attr("y", -topYAxisPadding)
              .text("Percent, end of year")

      pt.plotDotPlot.chartGroup.append("text")
            .attr("class", "y label")
            .attr("x", pt.innerWidth)
            .attr("y", -3.2*topYAxisPadding)
            .attr("text-anchor","end")
            .text("Release date: "+ sepDate);


      // Add circles
      for (var rows = 0; rows < years.length; rows++)  {

          var rateData = data[rows]
          // console.log(rateData)
          pt.plotDotPlot.chartGroup.selectAll("fomc "+"M"+years[rows])
                .data(rateData)
                .enter().append("g")
                .attr("class","fomc "+"M"+years[rows])

          for (var cols = 0; cols< dataCols.length; cols++) {

               // console.log(dataCols[cols])
               // Calculate length of dot array
               var lenDotArray = rateData[dataCols[cols]].length
               // console.log(lenDotArray)
               // console.log("year = "+years[rows]+", rate="+dataCols[cols]) 
               var mclass = "dots "+"M"+ rows+" N"+cols
               pt.plotDotPlot.chartGroup.selectAll(mclass)
                     .data(function (d) {
                        return d=rateData[dataCols[cols]];
                     })
                     .enter()
                     .append("circle")
                     .attr("class",mclass)
                     .attr("transform", function(d) {
                        // console.log(d)
                        // Center dots in each band:
                        // Caculate translate distance as half of diff with bandwidth
                        var transDim = pt.plotDotPlot.x0(years[rows])+(pt.plotDotPlot.x0.bandwidth()-pt.plotDotPlot.x1(lenDotArray))/2;
                        // console.log(x0(years[rows])+(x0.bandwidth()-x1(lenDotArray))/2) 
                        return "translate("+transDim+",0)"; 
                      })
                     .attr("cx", function (d) { 
                        // console.log(d)
                        // console.log(x1(d)) 
                        return pt.plotDotPlot.x1(d);
                     })
                     .attr("cy", function (d) {
                           return  pt.plotDotPlot.y(+dataCols[cols]); })
                     .attr("r", function (d) { 
                            if (d >0){
                              return 5;
                            } else {
                              return 0;
                            }
                      })
          }
      }

}

