var dataSet = $("#dataSet").val();

if (dataSet == "humidity") {
    var domainMin = 0;
    var domainMax = 100;
    var legendText = "Humidity (%)"
} else if (dataSet == "temperature") {
    var domainMin = 60;
    var domainMax = 90;
    var legendText = "Temperature (F°)"
} else if (dataSet == "sound") {
    var domainMin = 1700;
    var domainMax = 1900;
    var legendText = "Sound Wave"
}

var endTime = Math.round(new Date().getTime() / 1000),
    startTime = endTime - 3600;

var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");
var formatTime = d3.timeFormat("%H:%M:%S");
var formatDate = d3.timeFormat("%B %e");

var svg = d3.select("svg"),
    margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("id", "svgGroup"),
    gY = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("id", "yGroup"),
    gX = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").attr("id", "xGroup");

var x = d3.scaleTime()
    .rangeRound([0, width]),

    y = d3.scaleLinear()
    .rangeRound([height, 0]),

    line = d3.line()
    .x(function (d) {
        return x(d.time);
    })
    .y(function (d) {
        return y(d.value);
    });
            
    gY.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(legendText);

var div = d3.select("body").append("div")
        .attr("class", "dataValue")
        .style("opacity", 0);


var data = [];

$.ajax({
  url: 'https://io.adafruit.com/api/v2/2012zhangzihao/feeds/ccus.' + dataSet + '/data?start_time=' + startTime + '&end_time=' + endTime + '&limit=200',
  dataType: 'json',
  async: false,
  success: function(result) {
    var temp = result.filter(function (d) {
            if (isNaN(d.value)) {
                return false;
            }
            d.value = parseInt(d.value, 10);
            return true;
        });

        temp.forEach(function (d) {
            d.time = parseTime(d.created_at);
            d.value = +d.value;
        });
    data = temp.reverse();
  }
});

x.domain([data[0].time, data[data.length - 1].time]);
y.domain([domainMin, domainMax]);

g.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

g.append("g")
    .attr("clip-path", "url(#clip)")
  .append("path")
    .datum(data)
    .attr("class", "line")
  .transition()
    .duration(3500)
//    .ease(d3.easeLinear)
    .on("start", tick);   


    


function tick() {
    
    now = new Date();
    
    $.getJSON('https://io.adafruit.com/api/v2/2012zhangzihao/feeds/ccus.' + dataSet + '/data/last', function(result){
        
        if (isNaN(result.value)){
            return false;
        }
        else{
            result.value = +result.value;
            result.time = parseTime(result.created_at);
            data.push(result);
        }
    })
    
    x.domain([data[0].time, data[data.length - 1].time]);
    d3.selectAll("#xGroup > *").remove();
    gX.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
    
  // Redraw the line.
  d3.select(this)
      .attr("d", line)
      .attr("transform", null);
  // Slide it to the left.
  d3.active(this)
//      .attr("transform", "translate(-2)")
    .transition()
      .on("start", tick);
 //  Pop the old data point off the front.
    data.shift();
    console.log(data);
}


//
//function draw(dataSet, startTime, endTime) {

//    d3.json('https://io.adafruit.com/api/v2/2012zhangzihao/feeds/ccus.' + dataSet + '/data?start_time=' + startTime + '&end_time=' + endTime + '&limit=100', function (raw) {
//
//        var rawtemp = raw.filter(function (d) {
//            if (isNaN(d.value)) {
//                return false;
//            }
//            d.value = parseInt(d.value, 10);
//            return true;
//        });
//
//        rawtemp.forEach(function (d) {
//            d.time = parseTime(d.created_at);
//            d.value = +d.value;
//        });
//
//        console.log(rawtemp);
//        
//        //    var sensorValue = [];
//        //    var timeStamp = [];
//        //    for (var i = 0; i < temp.length; i++) {
//        //        sensorValue.push(+temp[i].value);
//        //        timeStamp.push(parseTime(temp[i].created_at));
//        //    };
//        //    console.log(sensorValue, timeStamp);
//
//

//
////        g.selectAll(".bar")
////            .data(data)
////            .enter().append("rect")
////            .attr("class", "bar")
////            .attr("x", function (d) {
////                return x(d.time);
////            })
////            .attr("width", (width / data.length))
////            .attr("y", function (d) {
////                return y(d.value);
////            })
////            .attr("height", function (d) {
////                return height - y(d.value);
////            })
////            .on("mouseover", function (d) {
////                div.transition()
////                    .duration(50)
////                    .style("opacity", .9);
////                div.html("<strong>Date:</strong> " +
////                        formatDate(d.time) + "<br/>" +
////                        "<strong>Time:</strong> " +
////                        formatTime(d.time) +
////
////                        "<br/>" + "<strong>Value:</strong> " + d.value)
////                    .style("left", (d3.event.pageX + 10) + "px")
////                    .style("top", (d3.event.pageY - 30) + "px");
////            })
////            .on("mouseout", function (d) {
////                div.transition()
////                    .duration(500)
////                    .style("opacity", 0);
////            });
//
//        g.selectAll("dot")
//            .data(data)
//            .enter().append("circle")
//            .attr("r", 5)
//            .attr("class", "dot")
//            .attr("cx", function (d) {
//                return x(d.time);
//            })
//            .attr("cy", function (d) {
//                return y(d.value);
//            })
//            .style("fill", "white")
//            .style("stroke", "black")
//            
//            .on("mouseover", function (d) {
//                div.transition()
//                    .duration(50)
//                    .style("opacity", .9);
//                div.html("<strong>Date:</strong> " +
//                        formatDate(d.time) + "<br/>" +
//                        "<strong>Time:</strong> " +
//                        formatTime(d.time) +
//
//                        "<br/>" + "<strong>Value:</strong> " + d.value)
//                    .style("left", (d3.event.pageX - 50) + "px")
//                    .style("top", (d3.event.pageY - 52) + "px");
//            })
//            .on("mouseout", function (d) {
//                div.transition()
//                    .duration(500)
//                    .style("opacity", 0);
//            });
//
//        g.append("g")
//            .attr("transform", "translate(0," + height + ")")
//            .call(d3.axisBottom(x))
//        //            .select(".domain")
//        //            .remove();
//
//
//        g.append("path")
//            .datum(data)
//            .attr("fill", "none")
//            .attr("stroke", "#006699")
//            .attr("stroke-linejoin", "round")
//            .attr("stroke-linecap", "round")
//            .attr("stroke-width", 1.5)
//            .attr("d", line);
//
//
//        //            .on('mouseover', tip.show)
//        //            .on('mouseout', tip.hide)
//    });
//}

//
//draw("humidity");
//
////toogle live ON/OFF
//var on = false;
//
//setInterval(function() {
//    if (on) {
//    changeData();
//    }
//}, 4000);
//
//$("#liveToggle").click(function() {
//    on = !on;
//});
//
//
//function changeData() {
//    var dataSet = $("#dataSet").val();
//    d3.selectAll("#svgGroup > *").remove();
//}