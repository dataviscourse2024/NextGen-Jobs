document.addEventListener('DOMContentLoaded', () => {
    let allData;
    const width = 800, height = 400;


    // Create filter container
    const filterDiv = document.createElement('div');
    filterDiv.style.margin = '20px';
    filterDiv.style.display = 'flex';
    filterDiv.style.gap = '20px';


    // Create industry filter
    const industrySelect = document.createElement('select');
    industrySelect.id = 'industry-filter';
    const industryLabel = document.createElement('label');
    industryLabel.textContent = 'Industry: ';
    industryLabel.appendChild(industrySelect);
    filterDiv.appendChild(industryLabel);


    // Create AI Adoption Level filter
    const aiSelect = document.createElement('select');
    aiSelect.id = 'ai-filter';
    const aiLabel = document.createElement('label');
    aiLabel.textContent = 'AI Adoption Level: ';
    aiLabel.appendChild(aiSelect);
    filterDiv.appendChild(aiLabel);


    // Create Automation Risk filter
    const riskSelect = document.createElement('select');
    riskSelect.id = 'risk-filter';
    const riskLabel = document.createElement('label');
    riskLabel.textContent = 'Automation Risk: ';
    riskLabel.appendChild(riskSelect);
    filterDiv.appendChild(riskLabel);

    document.getElementById('word-cloud').insertBefore(filterDiv, document.getElementById('word-cloud-canvas'));


    // Initialize canvas
    const canvas = d3.select("#word-cloud-canvas")
        .attr("width", width)
        .attr("height", height)
        .node();
    const context = canvas.getContext("2d");

    
    // Load and process data
    d3.csv("processed_ai_job_market_insights.csv").then(data => {
        allData = data;
        
        // Populate industry dropdown
        const industries = ["All Industries", ...new Set(data.map(d => d.Industry))];
        industries.forEach(industry => {
            const option = document.createElement('option');
            option.value = industry;
            option.text = industry;
            industrySelect.appendChild(option);
        });

        // Populate AI Adoption Level dropdown
        const aiLevels = ["All Levels", "1 (Low)", "2 (Medium)", "3 (High)"];
        aiLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level === "All Levels" ? level : level.charAt(0);
            option.text = level;
            aiSelect.appendChild(option);
        });

        // Populate Automation Risk dropdown
        const riskLevels = ["All Levels", "1 (Low)", "2 (Medium)", "3 (High)"];
        riskLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level === "All Levels" ? level : level.charAt(0);
            option.text = level;
            riskSelect.appendChild(option);
        });

        // Add filter event listeners
        [industrySelect, aiSelect, riskSelect].forEach(select => {
            select.addEventListener('change', updateFilteredData);
        });

        updateFilteredData();
    });

    function updateFilteredData() {
        const selectedIndustry = industrySelect.value;
        const selectedAI = aiSelect.value;
        const selectedRisk = riskSelect.value;

        let filteredData = allData;

        // Apply industry filter
        if (selectedIndustry !== "All Industries") {
            filteredData = filteredData.filter(d => d.Industry === selectedIndustry);
        }

        // Apply AI Adoption Level filter
        if (selectedAI !== "All Levels") {
            filteredData = filteredData.filter(d => d.AI_Adoption_Level === selectedAI);
        }

        // Apply Automation Risk filter
        if (selectedRisk !== "All Levels") {
            filteredData = filteredData.filter(d => d.Automation_Risk === selectedRisk);
        }

        updateWordCloud(filteredData);
    }

    function updateWordCloud(data) {
        const skillCounts = d3.rollup(data, v => v.length, d => d.Required_Skills);

        d3.layout.cloud()
            .size([width, height])
            .words(Array.from(skillCounts, ([skill, count]) => ({
                text: skill,
                size: Math.max(20, count * 4)
            })))
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Arial")
            .fontSize(d => d.size)
            .on("end", draw)
            .start();
    }

    function draw(words) {
        context.clearRect(0, 0, width, height);
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