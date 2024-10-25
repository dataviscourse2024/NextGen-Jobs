async function drawWorldMap() {
    const width = 960, height = 500;

    // Create a projection and path generator
    const projection = d3.geoMercator()
        .scale(130)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Load the TopoJSON data
    const worldData = await d3.json("map.json");

    // Select the SVG element and set dimensions
    const svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height);

    // Draw countries
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(worldData, worldData.objects.countries).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#333");

    // Draw graticules (optional)
    const graticule = d3.geoGraticule();
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#777")
        .attr("stroke-width", 0.5);
}

drawWorldMap();