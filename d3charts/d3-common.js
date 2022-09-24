var pt = pt || {};

pt.margin = {top: 50, right: 200, bottom: 50, left: 50};
pt.outerWidth = 1210 ;
pt.outerHeight = 600;
pt.innerWidth = pt.outerWidth - pt.margin.left - pt.margin.right;
pt.innerHeight = pt.outerHeight - pt.margin.top - pt.margin.bottom;
topYAxisPadding = 10;

// Define solarized accent colors
// http://ethanschoonover.com/solarized
var colorsSolarized = {
    "yellow"  :  "#b58900",
    "orange"  :  "#cb4b16",
    "red"     :  "#dc322f",
    "magenta" :  "#d33682",
    "violet"  :  "#6c71c4",
    "blue"    :  "#268bd2",
    "cyan"    :  "#2aa198",
    "green"   :  "#859900"
};

// Define Schemes Category10 and Category20
// https://github.com/d3/d3/blob/master/API.md#colors-d3-color
// http://bl.ocks.org/aaizemberg/78bd3dade9593896a59d
var colorsCat10 = d3.schemeCategory10;
var colorsCat20 = d3.schemeCategory20;

// Define Colorbrewer Paired
// https://bl.ocks.org/mbostock/5577023
var colorsBrewerPaired = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"];

// Define Tableau10. Are these the same as Category10?
// http://tableaufriction.blogspot.com/2012/11/finally-you-can-use-tableau-data-colors.html
var colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

var colorsSel = ["#a6a6a6","#a6a6a6","#a6a6a6","#a6a6a6","#a6a6a6","#a6a6a6","#DAA520"];


// Define color brewer scheme for maps 
// Shades of orange 5 categories
// http://colorbrewer2.org/#type=sequential&scheme=YlOrBr&n=5
var colorsMapCat5 = ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"];
// Shades of green 4 categories
// http://colorbrewer2.org/#type=sequential&scheme=YlGn&n=4
var colorsMapCat4 = ["#ffffcc","#c2e699","#78c679","#238443"];
// Diverging class
// http://colorbrewer2.org/#type=diverging&scheme=RdYlBu&n=6
// var colorsMapCat5div = ["#2c7bb6","#abd9e9","#ffffbf","#fdae61","#d7191c"]
var colorsMapCat5div = ["#4575b4","#91bfdb","#e0f3f8","#ffffbf","#fc8d59"];
var colorsMapCat4multi = ["#c6dbef","#9ecae1","#6baed6","#4292c6","#084594"]
// Function to parse time dates
// Stata Dates:
var parseStataDate = d3.timeParse("%Ym%m");
// Fred Dates:
var parseDate = d3.timeParse("%Y-%m-%d");
// Function for custom quarter date format
// Main idea from http://stackoverflow.com/questions/20355668/d3-js-how-to-format-tick-values-as-quarters-instead-of-months
function quarterDate(d){
    var month = d.getMonth();
    var year  = d.getFullYear();
    // return string with quarter
    if (month == 0) {
        return year+"Q1";
    } else if (month == 3) {
        return year+"Q2";
    } else if (month == 6) {
        return year+"Q3";
    } else {
        return year+"Q4";
    }
}

// Date to slice labor data and other series
minLaborDate = parseDate("2012-01-01");


// Function to label tick marks in SEPs
function sepDates(d) {
    var year = d.getFullYear();
    if (year == 2020) {
        return "Longer run";
    } else if (year > 2020) {
        return "";
        // return "•••";
    } else {
        return year;
    }
}

// Function to label tick marks in SEPs
function sepDatesBox(d) {
    return d.index;
}

// Parse MSA Labor Data
function parseMsaData (data, series) {
    'use strict';

    var dataCols = data.columns;
    data.forEach( function (d) {
        // Make non-Date vars numeric
        d.month= parseDate(d.DATE);
        d.usrec = +d.USRECM;
        var ic;
        var col;
        for (ic in dataCols) {
            col = dataCols[ic];
            if (col !== "DATE") {
                d[col] = +d[col];
            }
        }
        // Rename Variables
        if (series=="UR") {
            d.US = +d.USUR;
            d.Ohio = +d.OHUR;
            d.Cincinnati = +d.CINCUR;
            d.Cleveland = +d.CLEVUR;
            d.Columbus = +d.COLUUR;
            d.Lexington = +d.LEXIUR;
            d.Pittsburgh = +d.PITTUR;
            d.Mansfield = +d.MANSUR;
        } else {
            d.US = +d.USEG;
            d.Ohio = +d.OHEG;
            d.Cincinnati = +d.CINCEG;
            d.Cleveland = +d.CLEVEG;
            d.Columbus = +d.COLUEG;
            d.Lexington = +d.LEXIEG;
            d.Pittsburgh = +d.PITTEG;
            d.Mansfield = +d.MANSEG;
        }
    });
    return data;
}


function parseLaborData (data) {
    'use strict';

    // parse data 
    data.forEach( function (d) {
        d.date= parseDate(d.DATE);
        d.unrate= Number(d.UNRATE);
        d.empchg= Number(d.EMPCHG);
        d.recess= Number(d.USRECM);
    });

    // Return parsed data
    return data;
}

function parseFomcData (data) {
    'use strict';
//index,Actual,Upper End of Range,Upper End of Central Tendency,Median,Lower End of Central Tendency,Lower End of Range
    // Rename variables

    data.map( function (d) {
        d["date"] = d["index"];
        d["actual"] = (d["Actual"]  === "") ? NaN : +d["Actual"];
        d["Med" ] = (d["Median"] === "") ? NaN : +d["Median"];
        d["RgLo"] = (d["Lower End of Range"] === "") ? NaN : +d["Lower End of Range"];
        d["CtLo"] = (d["Lower End of Central Tendency"] === "") ? NaN : +d["Lower End of Central Tendency"];
        d["RgHi"] = (d["Upper End of Range"] === "") ? NaN : +d["Upper End of Range"];
        d["CtHi"] = (d["Upper End of Central Tendency"] === "") ? NaN : +d["Upper End of Central Tendency"];
    });


    // Parse Date as middle of year
    data.forEach( function (d) {
        d.date = parseDate(d.date+"-06-30");
    });

    return data;
}

function parseFomcDataBox (data) {
    'use strict';
//index,Actual,Upper End of Range,Upper End of Central Tendency,Median,Lower End of Central Tendency,Lower End of Range
    // Rename variables

    data.map( function (d) {
        d["date"] = d["index"];
        d["actual"] = (d["Actual"]  === "") ? NaN : +d["Actual"];
        d["Med" ] = (d["Median"] === "") ? NaN : +d["Median"];
        d["RgLo"] = (d["Lower End of Range"] === "") ? NaN : +d["Lower End of Range"];
        d["CtLo"] = (d["Lower End of Central Tendency"] === "") ? NaN : +d["Lower End of Central Tendency"];
        d["RgHi"] = (d["Upper End of Range"] === "") ? NaN : +d["Upper End of Range"];
        d["CtHi"] = (d["Upper End of Central Tendency"] === "") ? NaN : +d["Upper End of Central Tendency"];
    });

    // Parse Date as middle of year
    data.forEach( function (d) {
        d.date = parseDate(d.date+"-06-30");
    })
    return data;
}

// Insert current Date
d3.select(".current-date").append("text")
    .attr("dy",".35em")
    .attr("text-anchor","start")
    .html(d3.timeFormat("%B, %Y")(Date.now()));

// Legends positions
function labelPositions (arrayLast,y) {
    // 'use strict';
    var items =[];
    var obj;
    for (var i=0;i<=arrayLast.length-1;i++) {
         obj = { idx0: +i, value: arrayLast[i], pos: ''};
         // console.log(obj)
         items.push(obj);
    }
    function compare(a,b) {
      if (a.value > b.value) {
        return 1;
      }
      if (a.value < b.value) {
        return -1;
      }
      // a must be equal to b
      return 0;
    }
    // sort by value
    items.sort(compare);
    // Calculate diff
    var d1 = y(items[0].value) - y(items[arrayLast.length-1].value) ;
    console.log(d1);
    if (d1 >= 20*(arrayLast.length-1) ) {
        for (i=0;i<=arrayLast.length-1;i++) {
            items[i].pos = y(items[0].value) - i*22;
        }
    } else {
        var extra = 20*(arrayLast.length-1) - d1;
        console.log(extra);
        for (i=0;i<=arrayLast.length-1;i++) {
            items[i].pos = y(items[0].value) + extra/2 - i*20;
        }
    }
    return items;
}
