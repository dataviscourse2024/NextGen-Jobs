d3.csv("processed_ai_job_market_insights.csv").then(data => {
    const skillCounts = d3.rollup(data, v => v.length, d => d.Required_Skills);

    const width = 800, height = 400;
    const canvas = d3.select("#word-cloud-canvas")
        .attr("width", width)
        .attr("height", height)
        .node();
    const context = canvas.getContext("2d");

    d3.layout.cloud()
        .size([width, height])
        .words(Array.from(skillCounts, ([skill, count]) => ({ text: skill, size: Math.max(10, count * 1.5) })))
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Arial")
        .fontSize(d => d.size)
        .on("end", draw)
        .start();

    function draw(words) {
        context.clearRect(0, 0, width, height);  // Clear canvas before drawing
        words.forEach(word => {
            context.save();
            context.translate(word.x + width / 2, word.y + height / 2);
            context.rotate(word.rotate * Math.PI / 180);
            context.font = `${word.size}px Arial`;
            context.fillStyle = `hsl(${Math.random() * 360},100%,50%)`;
            context.textAlign = "center";
            context.fillText(word.text, 0, 0);
            context.restore();
        });
    }
});
