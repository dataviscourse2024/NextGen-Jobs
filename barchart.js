// Sample data for Required_Skills
const skillsData = [
    { skill: "Project Management", count: 60 },
    { skill: "Python", count: 60 },
    { skill: "Cybersecurity", count: 58 },
    { skill: "Machine Learning", count: 52 },
    { skill: "UX/UI Design", count: 49 }
];

// Set dimensions and margins
const margin = { top: 20, right: 20, bottom: 70, left: 40 },
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Select existing SVG and set dimensions
const svg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")  // Append a group for margin adjustment
    .attr("transform", `translate(${margin.left},${margin.top})`);

// X and Y scales
const x = d3.scaleBand()
    .domain(skillsData.map(d => d.skill))
    .range([0, width])
    .padding(0.2);

const y = d3.scaleLinear()
    .domain([0, d3.max(skillsData, d => d.count)])
    .range([height, 0]);

// X-axis
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

// Y-axis
svg.append("g")
    .call(d3.axisLeft(y));

// Bars
svg.selectAll(".bar")
    .data(skillsData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.skill))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.count))
    .attr("height", d => height - y(d.count))
    .attr("fill", "#69b3a2");
