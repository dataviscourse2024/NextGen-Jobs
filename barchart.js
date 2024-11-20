// Load the D3 library before running this script
d3.csv("processed_ai_job_market_insights.csv").then(data => {
    // Set dimensions and margins for the chart
    const margin = { top: 30, right: 30, bottom: 90, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Preprocess the data to count job growth projections per skill
    const skillsData = d3.rollup(data, v => v.length, d => d.Required_Skills);

    // Create the SVG container
    const svg = d3.select("#bar-chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const x = d3.scaleBand()
        .domain([...skillsData.keys()])
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max([...skillsData.values()])])
        .range([height, 0]);

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.bottom -10)
        .text("Required Skill");


    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -margin.left)
        .attr("y", -margin.top)
        .attr("transform", "rotate(-90)")
        .text("Jobs (count)");

    // Add bars
    svg.selectAll(".bar")
        .data(skillsData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0]))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d[1]))
        .attr("height", d => height - y(d[1]))
        .attr("fill", "#69b3a2")
        
        .on("mouseover", function(d, i){
            d3.select(this).transition()
            .duration("50")
            .attr("opacity", ".85");
        })

        .on("mouseout", function(d, i){
            d3.select(this).transition()
            .duration("50")
            .attr("opacity", "1");
        });

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Job Growth Projections by Skill Set");
});