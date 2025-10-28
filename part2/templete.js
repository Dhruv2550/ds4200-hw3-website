// Part 2.1: Side-by-side Boxplot
const socialMedia = d3.csv("socialMedia.csv");

socialMedia.then(function(data) {
    data.forEach(d => { d.Likes = +d.Likes; });

    const margin = {top: 50, right: 50, bottom: 50, left: 50},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#boxplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
                     .domain([...new Set(data.map(d => d.AgeGroup))])
                     .range([0, width])
                     .padding(0.2);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.Likes)])
                     .range([height, 0]);

    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .call(d3.axisLeft(yScale));

    svg.append("text")
       .attr("x", width/2)
       .attr("y", height + margin.bottom - 5)
       .attr("text-anchor", "middle")
       .text("Age Group");

    svg.append("text")
       .attr("x", -height/2)
       .attr("y", -margin.left + 15)
       .attr("text-anchor", "middle")
       .attr("transform", "rotate(-90)")
       .text("Number of Likes");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };


    // `d3.rollup` groups the data by AgeGroup and applies `rollupFunction` to calculate min, q1, median, q3, and max for each group
    // `forEach` loops over each AgeGroup and retrieves its calculated quantiles; x and boxWidth define the position and width of the box in the plot
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    // Loop through each age group to draw boxes
    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // vertical line from min to max
        svg.append("line")
           .attr("x1", x + boxWidth/2)
           .attr("x2", x + boxWidth/2)
           .attr("y1", yScale(quantiles.min))
           .attr("y2", yScale(quantiles.max))
           .attr("stroke", "black");

        // rectangle from q1 to q3
        svg.append("rect")
           .attr("x", x)
           .attr("y", yScale(quantiles.q3))
           .attr("width", boxWidth)
           .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
           .attr("fill", "#69b3a2");

        // median line
        svg.append("line")
           .attr("x1", x)
           .attr("x2", x + boxWidth)
           .attr("y1", yScale(quantiles.median))
           .attr("y2", yScale(quantiles.median))
           .attr("stroke", "black");
    });
});


// Part 2.2: Side-by-side Bar Plot
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    data.forEach(d => { d.AvgLikes = +d.AvgLikes; });

    const margin = {top: 50, right: 150, bottom: 50, left: 50},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#barplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    const x0 = d3.scaleBand()
                 .domain(platforms)
                 .range([0, width])
                 .padding(0.2);

    const x1 = d3.scaleBand()
                 .domain(postTypes)
                 .range([0, x0.bandwidth()])
                 .padding(0.05);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.AvgLikes)])
                .range([height, 0]);

    const color = d3.scaleOrdinal()
                    .domain(postTypes)
                    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(x0));

    svg.append("g")
       .call(d3.axisLeft(y));

    svg.append("text")
       .attr("x", width/2)
       .attr("y", height + margin.bottom - 5)
       .attr("text-anchor", "middle")
       .text("Platform");

    svg.append("text")
       .attr("x", -height/2)
       .attr("y", -margin.left + 15)
       .attr("text-anchor", "middle")
       .attr("transform", "rotate(-90)")
       .text("Average Likes");

    // Group for each platform
    const barGroups = svg.selectAll("g.barGroup")
                         .data(platforms)
                         .enter()
                         .append("g")
                         .attr("transform", d => `translate(${x0(d)},0)`);

    barGroups.selectAll("rect")
             .data(d => data.filter(item => item.Platform === d))
             .enter()
             .append("rect")
             .attr("x", d => x1(d.PostType))
             .attr("y", d => y(d.AvgLikes))
             .attr("width", x1.bandwidth())
             .attr("height", d => height - y(d.AvgLikes))
             .attr("fill", d => color(d.PostType));

    // Legend
    const legend = svg.append("g")
                      .attr("transform", `translate(${width + 20},0)`);

    postTypes.forEach((type, i) => {
        legend.append("rect")
              .attr("x", 0)
              .attr("y", i * 20)
              .attr("width", 15)
              .attr("height", 15)
              .attr("fill", color(type));

        legend.append("text")
              .attr("x", 20)
              .attr("y", i * 20 + 12)
              .text(type)
              .attr("alignment-baseline", "middle");
    });
});


// Part 2.3: Line Plot
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    data.forEach(d => { d.AvgLikes = +d.AvgLikes; });

    const margin = {top: 50, right: 50, bottom: 50, left: 50},
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#lineplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scalePoint()
                     .domain(data.map(d => d.Date))
                     .range([0, width])
                     .padding(0.5);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.AvgLikes)])
                     .range([height, 0]);

    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(d3.axisBottom(xScale))
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("transform", "rotate(-25)");

    svg.append("g")
       .call(d3.axisLeft(yScale));

    svg.append("text")
       .attr("x", width/2)
       .attr("y", height + margin.bottom - 5)
       .attr("text-anchor", "middle")
       .text("Date");

    svg.append("text")
       .attr("x", -height/2)
       .attr("y", -margin.left + 15)
       .attr("text-anchor", "middle")
       .attr("transform", "rotate(-90)")
       .text("Average Likes");

    const line = d3.line()
                   .x(d => xScale(d.Date))
                   .y(d => yScale(d.AvgLikes))
                   .curve(d3.curveNatural);

    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line);
});
