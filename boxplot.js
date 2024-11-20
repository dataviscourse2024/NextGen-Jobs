d3.csv("processed_ai_job_market_insights.csv").then(data => {
    // Convert relevant columns to numbers and filter out entries with NaN salary values
    data = data.map(d => ({
        ...d,
        salary: +d.Salary_USD, // Ensure salary is a number
        AI_adoption: d.AI_Adoption_Level // Rename for consistency if needed
    })).filter(d => !isNaN(d.salary)); // Filter out entries with NaN salaries

    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Group the data by AI_adoption level
    const salaryByAdoption = d3.groups(data, d => d.AI_adoption);
    salaryByAdoption.sort(d3.ascending);
    console.log("adoption: ", salaryByAdoption)

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3.scaleBand()
        .domain(salaryByAdoption.map(d => d[0]))
        .range([0, width])
        .padding(0.2);

    // Y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.salary)])
        .range([height, 0]);

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.bottom - 20)
        .text("AI Adoption Level");


    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", - margin.left)
        .attr("y", - margin.top - 15)
        .attr("transform", "rotate(-90)")
        .text("Salary (USD)");

    var medians = [];
    // Draw box plots
    salaryByAdoption.forEach(([adoption, group]) => {
        const salaries = group.map(d => d.salary);
        salaries.sort(d3.ascending);

        const q1 = d3.quantile(salaries, 0.25);
        const median = d3.quantile(salaries, 0.5);
        medians.push({ x: adoption, y: median });
        const q3 = d3.quantile(salaries, 0.75);
        const min = d3.min(salaries);
        const max = d3.max(salaries);

        // Box
        svg.append("rect")
            .attr("x", x(adoption))
            .attr("y", y(q3))
            .attr("height", y(q1) - y(q3))
            .attr("width", x.bandwidth())
            .attr("stroke", "black")
            .attr("fill", "#69b3a2");

        // Median line
        svg.append("line")
            .attr("x1", x(adoption))
            .attr("x2", x(adoption) + x.bandwidth())
            .attr("y1", y(median))
            .attr("y2", y(median))
            .attr("stroke", "black");

        // Whiskers
        svg.append("line")
            .attr("x1", x(adoption) + x.bandwidth() / 2)
            .attr("x2", x(adoption) + x.bandwidth() / 2)
            .attr("y1", y(min))
            .attr("y2", y(q1))
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x(adoption) + x.bandwidth() / 2)
            .attr("x2", x(adoption) + x.bandwidth() / 2)
            .attr("y1", y(q3))
            .attr("y2", y(max))
            .attr("stroke", "black");
    });

    console.log("medians: ", medians[0].x)

    const lineGenerater = d3.line()
        .x(d => x(d.x) + x.bandwidth()/2)
        .y(d => y(d.y));

    svg.append("path")
        .datum(medians)
        .attr("class", "median-line")
        .attr("d", lineGenerater)
        .style("stroke", "yellow")
        .style("stroke-width", 1)

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Salary by AI Adoption Level");
});
