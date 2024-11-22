async function drawWorldMap() {
    const width = 960, height = 500;

    const projection = d3.geoMercator()
        .scale(130)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const cityCoordinates = {
        "Dubai": [55.2708, 25.2048],
        "Singapore": [103.8198, 1.3521],
        "Berlin": [13.4050, 52.5200],
        "Tokyo": [139.6917, 35.6895],
        "San Francisco": [-122.4194, 37.7749],
        "London": [-0.1278, 51.5074],
        "Paris": [2.3522, 48.8566],
        "Sydney": [151.2093, -33.8688],
        "New York": [-74.0060, 40.7128],
        "Toronto": [-79.3832, 43.6532]
    };

    try {
        // Load data
        const [worldData, jobData] = await Promise.all([
            d3.json("map.json"),
            d3.csv("ai_job_market_insights.csv")
        ]);

        // Aggregate job data by city
        const jobSummaryByCity = d3.group(jobData, d => d.Location.trim());

        // Create SVG
        const svg = d3.select("#map")
            .attr("width", width)
            .attr("height", height);

        // Clear existing content
        svg.selectAll("*").remove();
        d3.select("#legend").html("");

        // Draw map background
        const countries = topojson.feature(worldData, worldData.objects.countries).features;
        svg.append("g")
            .selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#f0f0f0")
            .attr("stroke", "#999")
            .attr("stroke-width", 0.5);

        // Add city markers with enhanced interactivity
        const markers = svg.selectAll("circle")
            .data(Array.from(jobSummaryByCity.entries()))
            .enter()
            .append("circle")
            .attr("cx", ([city]) => {
                const coords = cityCoordinates[city];
                return coords ? projection(coords)[0] : null;
            })
            .attr("cy", ([city]) => {
                const coords = cityCoordinates[city];
                return coords ? projection(coords)[1] : null;
            })
            .attr("r", 10)
            .attr("fill", "#69b3a2")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.8)
            .attr("class", "city-marker")
            .style("cursor", "pointer");

        // Add hover effects
        markers.on("mouseover", function(event, [city, jobs]) {
            // Highlight the selected city
            d3.select(this)
                .attr("r", 12)
                .attr("fill", "#4a7c6f");

            // Update tooltip content
            updateTooltip(`
                <strong>${city}</strong><br>
                Total Jobs: ${jobs.length}<br>
                Click for industry breakdown
            `);
        })
        .on("mouseout", function() {
            // Reset marker style
            d3.select(this)
                .attr("r", 10)
                .attr("fill", "#69b3a2");

            // Reset tooltip
            clearTooltip();
        })
        .on("click", (event, [city, jobs]) => {
            // Highlight selected city and dim others
            markers.attr("opacity", 0.3);
            d3.select(event.target)
                .attr("opacity", 1)
                .attr("r", 12);

            // Draw pie chart
            drawCityJobPieChart(city, jobs);
        });

        // Add legend
        const legend = d3.select("#legend")
            .append("div")
            .attr("class", "legend-container");

        legend.html(`
            <h4 style="margin-bottom: 10px;">Map Legend</h4>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <span style="display: inline-block; width: 15px; height: 15px; background: #69b3a2; border: 1px solid black;"></span>
                <span>City with Job Data</span>
            </div>
            <div style="margin-top: 8px; font-style: italic;">Click on any city to view industry distribution</div>
        `);

    } catch (error) {
        console.error("Error loading data:", error);
        d3.select("#map").html("<p>Error loading map data. Please try again later.</p>");
    }
}

function drawCityJobPieChart(city, jobs) {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    // Process data
    const industryData = Array.from(
        d3.rollup(jobs, v => v.length, d => d.Industry),
        ([industry, count]) => ({ industry, count })
    ).sort((a, b) => b.count - a.count);

    // Set up pie chart
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(radius * 0.3)
        .outerRadius(radius * 0.8);

    const labelArc = d3.arc()
        .innerRadius(radius * 0.85)
        .outerRadius(radius * 0.85);

    // Clear and set up SVG
    const svg = d3.select("#pie-chart")
        .html("") // Clear existing content
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);

    // Add title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("y", -height/2 + 20)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`Industry Distribution in ${city}`);

    // Create pie chart segments
    const segments = svg.selectAll("path")
        .data(pie(industryData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colors(d.data.industry))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            // Highlight segment
            d3.select(this)
                .attr("opacity", 0.7)
                .transition()
                .duration(200)
                .attr("d", d3.arc()
                    .innerRadius(radius * 0.3)
                    .outerRadius(radius * 0.85));

            // Update tooltip
            const percentage = ((d.data.count / jobs.length) * 100).toFixed(1);
            updateTooltip(`
                <strong>${d.data.industry}</strong><br>
                Jobs: ${d.data.count}<br>
                Percentage: ${percentage}%
            `);
        })
        .on("mouseout", function() {
            // Reset segment
            d3.select(this)
                .attr("opacity", 1)
                .transition()
                .duration(200)
                .attr("d", arc);

            // Reset tooltip
            clearTooltip();
        });

    // Add percentage labels
    const labels = svg.selectAll("text.label")
        .data(pie(industryData))
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("opacity", d => (d.data.count / jobs.length > 0.05 ? 1 : 0))
        .text(d => `${((d.data.count / jobs.length) * 100).toFixed(0)}%`);
}

// New tooltip handling functions
function updateTooltip(content) {
    d3.select("#tooltip-display")
        .style("visibility", "visible")
        .select(".tooltip-content")
        .html(content);
}

function clearTooltip() {
    d3.select("#tooltip-display")
        .select(".tooltip-content")
        .html("Hover over the map or pie chart to see details");
}

// Initialize visualization when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    drawWorldMap();
});