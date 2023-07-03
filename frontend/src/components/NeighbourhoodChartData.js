import React, {useState, useEffect} from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../App.css";

function NeighbourhoodChartData({ hashMap, colours, highlightEventImpact}) {

    const [renderChart, setRenderChart] = useState(null);
    const [showMostImpacted, setShowMostImpacted] = useState(true);  // New state for the toggle

    console.log('This is the hashmap in our graph function:', hashMap);

    // Get the impacted zones
    const getImpactedZones = () => {
        // Get an array of [key, value] pairs from the hashMap
        const entries = Object.entries(hashMap);

        let filteredEntries;

        // Check the state to see if we want to display the most or least impacted zones
        if (showMostImpacted) {
            // Sort the array based on the impact
            entries.sort((a, b) => b[1] - a[1]);
            // Get only the top 5 most impacted areas
            filteredEntries = entries.slice(0, 5);
        } else {
            // Sort in ascending order
            entries.sort((a, b) => a[1] - b[1]);
            // Get only the bottom 5 least impacted areas
            filteredEntries = entries.slice(0, 5);
        }

        // Create a new hashMap with only these filtered entries
        const filteredHashMap = Object.fromEntries(filteredEntries);

        // Get the keys and values from the filtered hashMap
        const labels = filteredHashMap ? Object.keys(filteredHashMap) : [];
        const dataValues = filteredHashMap ? Object.values(filteredHashMap) : [];

        return {labels, dataValues}
    }

    const makeChartData = (labels, dataValues) => {
        const data = {
            labels: labels,
            datasets: [
                { label: 'Busyness',
                barThickness: 16,
                data: dataValues,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea){
                        return null
                    }
                    if (context.dataIndex >= 0){
                        return showMostImpacted ? getGradientMostImpacted(chart) : getGradientLeastImpacted(chart);
                    } else{
                        return 'blue'
                    }
                },
                borderWidth: 1,
                borderRadius: 2,   
                },
            ],
        };
      
        const options = {
            maintainAspectRatio: false, // Set to false to control the canvas size manually
            responsive: true, // Enable responsiveness
            legend: {
                display: false
            },
            indexAxis: 'y',
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color : '#fefefe'
                    }
                },
                x: {
                    ticks: {
                        color : '#fefefe'
                    }
                }
            }
        };
    
        return {data, options};
    }
    

    // Trigger chart rerender whenever showMostImpacted state changes
    useEffect(() => {

        const {labels, dataValues} = getImpactedZones();

        const chartData = makeChartData(labels, dataValues);

        setTimeout(() => {
            highlightEventImpact(labels);
            setRenderChart(chartData);
        }, 300)
    }, [showMostImpacted, hashMap]);

    const getGradientMostImpacted = (context) => {
        const { chart, ctx, chartArea: { left, right } } = context;
        const gradientSegment = ctx.createLinearGradient(left, 0, right, 0);
        gradientSegment.addColorStop(0, colours[1]);
        gradientSegment.addColorStop(1, colours[2]);
        return gradientSegment;
    };

    const getGradientLeastImpacted = (context) => {
        const { chart, ctx, chartArea: { left, right } } = context;
        const gradientSegment = ctx.createLinearGradient(left, 0, right, 0);
        gradientSegment.addColorStop(0, colours[1]);
        gradientSegment.addColorStop(1, colours[0]);
        return gradientSegment;
    }

    return (
        <div className='parent-chart-container'> 
            <div className='floating-info-box-chart-container'>
                {renderChart && <Bar data={renderChart.data} options={renderChart.options} />}
            </div>
            <div className='floating-infobox-box-button-container'>
                <button className='floating-infobox-box-toggle-button'onClick={() => setShowMostImpacted(!showMostImpacted)}>
                    {showMostImpacted ? 'Show least impacted' : 'Show most impacted'}
                </button>
            </div>
        </div>
    );
}

export default NeighbourhoodChartData;
