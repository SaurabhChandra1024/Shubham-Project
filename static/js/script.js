let data = []; // Ensure this is populated with your data
let filters = {
    endYear: null,
    topics: [],
    sector: null,
    region: null,
    pest: null,
    source: [],
    country: [],
    city: [] // Remove this if not needed
};

function initializeDashboard() {
    fetchData().then(() => {
        populateDropdowns();
        setupEventListeners();
        updateCharts();
    });
}

function setupEventListeners() {
    document.getElementById('endYear').addEventListener('input', (e) => {
        filters.endYear = e.target.value;
        document.getElementById('endYearValue').textContent = e.target.value;
        updateCharts();
    });

    document.getElementById('topics').addEventListener('change', (e) => {
        filters.topics = Array.from(e.target.selectedOptions, option => option.value);
        updateCharts();
    });

    document.getElementById('sector').addEventListener('change', (e) => {
        filters.sector = e.target.value;
        updateCharts();
    });

    document.getElementById('region').addEventListener('change', (e) => {
        filters.region = e.target.value;
        updateCharts();
    });

    document.getElementById('pest').addEventListener('change', (e) => {
        filters.pest = e.target.value;
        updateCharts();
    });

    document.getElementById('source').addEventListener('change', (e) => {
        filters.source = Array.from(e.target.selectedOptions, option => option.value);
        updateCharts();
    });

    document.getElementById('country').addEventListener('change', (e) => {
        filters.country = Array.from(e.target.selectedOptions, option => option.value);
        updateCharts();
    });

    // Remove city event listener if not needed
    document.getElementById('city').addEventListener('change', (e) => {
         filters.city = Array.from(e.target.selectedOptions, option => option.value);
         updateCharts();
    });
}

// Fetch data from the API endpoint
function fetchData() {
    return fetch('/data/')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
        });
}

// Populate dropdowns with unique values from the data
function populateDropdowns() {
    const uniqueTopics = [...new Set(data.map(item => item.topic))];
    const uniqueSources = [...new Set(data.map(item => item.source))];
    const uniqueCountries = [...new Set(data.map(item => item.country))];
    const uniqueRegions = [...new Set(data.map(item => item.region))];
    const uniquePests = [...new Set(data.map(item => item.pestle))];
    const uniqueSectors = [...new Set(data.map(item => item.sector))];

    populateSelect('topics', uniqueTopics);
    populateSelect('source', uniqueSources);
    populateSelect('country', uniqueCountries);
    populateSelect('region', uniqueRegions);
    populateSelect('pest', uniquePests);
    populateSelect('sector', uniqueSectors);
}

// Populate a select element with options
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

// Filter data based on current filters
function filterData() {
    return data.filter(item => {
        return (
            (!filters.endYear || item.end_year <= parseInt(filters.endYear)) &&
            (!filters.topics.length || filters.topics.includes(item.topic)) &&
            (!filters.sector || item.sector === filters.sector) &&
            (!filters.region || item.region === filters.region) &&
            (!filters.pest || item.pestle === filters.pest) &&
            (!filters.source.length || filters.source.includes(item.source)) &&
            (!filters.country.length || filters.country.includes(item.country))
        );
    });
}

// Update all charts
function updateCharts() {
    const filteredData = filterData();
    createBarChart('intensityChart', filteredData, 'intensity');
    createBarChart('likelihoodChart', filteredData, 'likelihood');
    createBarChart('relevanceChart', filteredData, 'relevance');
    createBarChart('yearChart', filteredData, 'end_year');
    createBarChart('countryChart', filteredData, 'country');
    createBarChart('topicsChart', filteredData, 'topic');
    createBarChart('regionChart', filteredData, 'region');
    // Remove city chart if not needed
    createBarChart('cityChart', filteredData, 'city');
}

// Create a bar chart
function createBarChart(svgId, data, key) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svg.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data for the chart
    const chartData = d3.rollups(data, v => v.length, d => d[key])
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => {
            if (typeof a.value === 'string' && typeof b.value === 'string') {
                return a.value.localeCompare(b.value);
            } else {
                return a.value - b.value;
            }
        });

    x.domain(chartData.map(d => d.value));
    y.domain([0, d3.max(chartData, d => d.count)]);

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g.append('g')
        .call(d3.axisLeft(y));

    g.selectAll('.bar')
        .data(chartData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.value))
        .attr('y', d => y(d.count))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.count));
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);