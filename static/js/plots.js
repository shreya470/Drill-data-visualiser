document.addEventListener("DOMContentLoaded", function() {
    const chartContainer = d3.select("#chart");
    function customTickValues(startDate, endDate, intervalDays) {
      const tickValues = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
          tickValues.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + intervalDays);
      }
      return tickValues;
    }
  
    function drawPlot(data, metric, color) {
      const chart = chartContainer.append("div").attr("class", "chart");
      const margin = { top: 20, right: 30, bottom: 70, left: 70 };
      const width = chart.node().offsetWidth - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      const svg = chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      let maxValue = d3.max(data, d => d[metric]);
      maxValue = Math.ceil(maxValue / 10) * 10;
      let minValue = d3.min(data, d => d[metric]);
      minValue = Math.floor(minValue / 10) * 10;
      const delta = maxValue - minValue;
      const tickInterval = Math.pow(10, Math.floor(Math.log10(delta / 10)) + 1);
      const oneDay = 24 * 60 * 60 * 1000;
      const xScale = d3.scaleTime()
        .domain([new Date(d3.min(data, d => new Date(d.Time)) - oneDay), d3.max(data, d => new Date(d.Time))])
        .range([0, width]);
      const yScale = d3.scaleLinear()
        .domain([minValue - tickInterval, maxValue + tickInterval])
        .range([height, 0]);
      const tickValues = customTickValues(xScale.domain()[0], xScale.domain()[1], 6);
      const xAxis = d3.axisBottom(xScale)
        .tickValues(tickValues) // Set initial tick interval at every 6 days
        .tickFormat(d3.timeFormat("%Y-%m-%d"));
      const yAxis = d3.axisLeft(yScale)
        .tickValues(d3.range(minValue-tickInterval, maxValue + tickInterval, tickInterval))
      const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
      const yAxisGroup = svg.append("g")
        .call(yAxis);
  
      // Add X axis label
      svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
        .style("text-anchor", "middle")
        .text("Date");
  
        // Add Y axis label
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 15)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(metric);
  
      const line = d3.line()
        .x(d => xScale(new Date(d.Time))) // Reference 'Time'
        .y(d => yScale(d[metric]));
  
      svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
  
      svg.append("defs").append("clipPath")
        .attr("id", "yAxisClip")
        .append("rect")
        .attr("x", -margin.left)
        .attr("y", 0)
        .attr("width", margin.left)
        .attr("height", height+8);
      yAxisGroup.attr("clip-path", "url(#yAxisClip)");
  
  
      const path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .attr("clip-path", "url(#clip)");
  
      const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);
  
      const zoom = d3.zoom()
        .scaleExtent([1, 100])
        .on("zoom", zoomed);
  
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);
  
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(new Date(d.Time)))
        .attr("cy", d => yScale(d[metric]))
        .attr("r", 4)
        .style("fill", color)
        .style("pointer-events", "visible") // Ensure circles capture pointer events
        .attr("clip-path", "url(#clip)")
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`
            <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${metric}</div>
            <div style="color: #555; text-align: left;">
                <div><span style="font-weight: bold;">Date:</span> ${d3.timeFormat("%B %d, %Y")(new Date(d.Time))}</div>
                <div><span style="font-weight: bold;">Value:</span> ${d[metric].toFixed(2)}</div>
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(200).style("opacity", 0);
        });
  
      function zoomed(event) {
        const transform = event.transform;
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);
        const zoomLevel = transform.k;
        const intervalDays = zoomLevel > 6 ? 1 :
                            zoomLevel > 4 ? 2 :
                            zoomLevel > 3 ? 3 :
                            zoomLevel > 2 ? 4 :
                            zoomLevel > 1.5 ? 5 : 6;
        const tickValues = customTickValues(newXScale.domain()[0], newXScale.domain()[1], intervalDays);
        const xAxis = d3.axisBottom(newXScale)
          .tickValues(tickValues)
          .tickFormat(d3.timeFormat("%Y-%m-%d"));
  
        xAxisGroup.call(xAxis);
        yAxisGroup.call(yAxis.scale(newYScale));
  
        path.attr("d", line.x(d => newXScale(new Date(d.Time)))
          .y(d => newYScale(d[metric])));
        svg.selectAll("circle")
          .attr("cx", d => newXScale(new Date(d.Time)))
          .attr("cy", d => newYScale(d[metric]));
      }
    }
    // Load data for the selected Basin
    d3.json('/get-data').then(data => {
      const basins = ["Delaware", "Midland", "Eagleford"];
      const basinSelector = d3.select("#basinSelector");
      basins.forEach(basin => {
          basinSelector.append("option").text(basin).attr("value", basin);
      });
      basinSelector.on("change", function() {
        const selectedBasin = this.value;
        chartContainer.html("");
        const filteredData = data.filter(d => d.BasinActual === selectedBasin);
        drawPlot(filteredData, "ROP", "gold", "ROP");
        drawPlot(filteredData, "WOB", "mediumblue", "WOB");
        drawPlot(filteredData, "RPM", "hotpink", "RPM");
      });
      
  
      // Initial plot here which is for basins[0](Delaware)
      drawPlot(data.filter(d => d.BasinActual === basins[0]), "ROP", "gold");
      drawPlot(data.filter(d => d.BasinActual === basins[0]), "WOB", "mediumblue");
      drawPlot(data.filter(d => d.BasinActual === basins[0]), "RPM", "hotpink");
    });
  });
  