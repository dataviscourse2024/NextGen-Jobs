document.addEventListener('DOMContentLoaded', () => {
    let allData;
    // Increased canvas size
    const width = 1200, height = 600;

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

    // Initialize canvas with new dimensions
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
        // Count skills and create word objects
        const skillCounts = d3.rollup(data, v => v.length, d => d.Required_Skills);
        
        // Convert to array and sort by count
        const sortedWords = Array.from(skillCounts, ([skill, count]) => ({
            text: skill,
            size: Math.max(30, count * 6), // Increased base font size and scaling
            count: count
        })).sort((a, b) => b.count - a.count);

        d3.layout.cloud()
            .size([width, height])
            .words(sortedWords)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Arial")
            .fontSize(d => d.size)
            .on("end", words => draw(words, sortedWords))
            .start();
    }

    function draw(words, sortedWords) {
        context.clearRect(0, 0, width, height);
        
        // Get indices for color assignment
        const maxIndex = sortedWords.length - 1;
        
        words.forEach(word => {
            context.save();
            context.translate(word.x + width / 2, word.y + height / 2);
            context.rotate(word.rotate * Math.PI / 180);
            context.font = `${word.size}px Arial`;
            
            // Determine word color based on its size ranking
            const index = sortedWords.findIndex(w => w.text === word.text);
            let color;
            if (index < 2) {
                // Two biggest words in blue
                color = '#1E90FF';
            } else if (index >= maxIndex - 1) {
                // Two smallest words in red
                color = '#FF4444';
            } else {
                // Rest in dark grey
                color = '#444444';
            }
            
            context.fillStyle = color;
            context.textAlign = "center";
            context.fillText(word.text, 0, 0);
            context.restore();
        });
    }
});