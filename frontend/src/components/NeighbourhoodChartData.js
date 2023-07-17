import React, {useState, useEffect} from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../App.css";
import { useMapContext } from './MapContext';

function NeighbourhoodChartData({ map, hashMap, busynessHashMap, eventBaselineHashMap, colours, highlightEventImpact, Zone_ID,  resetColours}) {

    const {neighbourhoods} = useMapContext();
    const {useOriginal, setUseOriginal, showChart, setShowChart, isSplitView, setSplitView} = useMapContext();
    const {updateLayerColours} = useMapContext()

    // This state holds the data and options that the chart component needs to create the chart on the page. 
    // When this state changes, it triggers the chart to re-render with the new data and options.

    const [renderChart, setRenderChart] = useState(null);

    // This state holds a separate copy of the data and options for a chart. 
    // This copy isn't used directly in rendering but is useful for storing temporary or intermediary states of the chart's data and options.
    const [chartData, setChartData] = useState(null);

    const [showMostImpactedZones, setShowMostImpactedZones] = useState(true);  // New state for the toggle
    const [labels, setLabels] = useState([]);    

    // Get the impacted zones
    const getImpactedZones = () => {

        // error handling to prevent that the hashmap is not empty
        if (!hashMap) {
            return {labels: [], dataValues: []};
        }

        // Get an array of [key, value] pairs from the hashMap
        const entries = Object.entries(hashMap);

        let filteredEntries;

        // Check the state to see if we want to display the most or least impacted zones
        if (showMostImpactedZones) {
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

        const names = labels.map(label => {
            // Find the corresponding object in the array
            const matchingObject = neighbourhoods.features.find(neighbourhood => neighbourhood.id === label);
          
            // If a matching object was found, return its name. Otherwise, return null.
            return matchingObject ? matchingObject.properties.zone : null;
          });

        return {names, labels, dataValues}
    }

    const makeChartData = (names, dataValues) => {

        const data = {
            labels: names,
            datasets: [
                { label: 'Busyness',
                barThickness: 24,
                data: dataValues,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea){
                        return null
                    }
                    if (context.dataIndex >= 0){
                        return showMostImpactedZones ? getGradientMostImpacted(chart) : getGradientLeastImpacted(chart);
                    } else{
                        return 'white'
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
            layout: {
                padding: {
                    left: 0,
                    right: 0
                }
            },
            plugins: {
                legend: {
                    display: false, // This should already remove the legend.
                },
                tooltip: {
                    callbacks: {
                        title: () => {}, // This removes the title in the tooltip.
                    },
                },
            },
            indexAxis: 'x', // Changed from 'y' to 'x'
            scales: {
                x: { // This was 'y'
                    beginAtZero: true,
                    ticks: {
                        color : '#fefefe',
                        align: 'start' // This will align the labels to the start (top for a horizontal axis)
                    }
                },
                y: { // This was 'x'
                    ticks: {
                        color : '#fefefe',
                        align: 'start', // This will align the labels to the start (left for a vertical axis)
                        display: false // This will hide the labels on the y-axis
                    }
                }
            }
        };
    
        return {data, options};
    }
    
    // Trigger chart rerender whenever showMostImpacted state changes
    useEffect(() => {
        const {names, labels, dataValues} = getImpactedZones();
        setLabels(labels); // Set labels here
        const newChartData = makeChartData(names, dataValues);
        setChartData(newChartData); // Set chartData here
    }, [showMostImpactedZones, hashMap]);

    const toggleChartData = () => {
        highlightEventImpact(Zone_ID, labels);
        setRenderChart(chartData);
        setShowChart(true);
        setShowMostImpactedZones(!showMostImpactedZones); // Toggle showMostImpacted state here
    };

    const getGradientMostImpacted = (context) => {
        const {ctx, chartArea: { top, bottom } } = context;
        const gradientSegment = ctx.createLinearGradient(0, top, 0, bottom);
        gradientSegment.addColorStop(0, colours[2]);
        gradientSegment.addColorStop(1, colours[1]);
        return gradientSegment;
    };
    

    const getGradientLeastImpacted = (context) => {
        const {ctx, chartArea: { top, bottom } } = context;
        const gradientSegment = ctx.createLinearGradient(0, top, 0, bottom);
        gradientSegment.addColorStop(0, colours[1]);
        gradientSegment.addColorStop(1, colours[0]);
        return gradientSegment;
    }

    const handleToggle = () => {
        setUseOriginal(!useOriginal);
        updateLayerColours(map.current, !useOriginal, eventBaselineHashMap, busynessHashMap);
        resetColours();
        setShowChart(false); 
        setShowMostImpactedZones(!showMostImpactedZones)
      };

    return (
        <div className='parent-chart-container'> 
            {showChart &&
            <div className='floating-info-box-chart-container'>
                {renderChart && <Bar data={renderChart.data} options={renderChart.options} />}
                <button 
                    className="floating-infobox-close-toggle-button" 
                    onClick={() => {                     
                    setShowChart(!showChart);
                    setShowMostImpactedZones(!showMostImpactedZones)
                    resetColours()
                    }}
                >
                    X
                </button>
            </div>
            }
            <div className='floating-infobox-box-button-container'>
                <button className='floating-infobox-box-toggle-button'onClick={toggleChartData}>
                    {showMostImpactedZones ? 'Highlight most impacted zones' : 'Highlight least impacted zones'}
                </button>
                <button className='floating-infobox-box-toggle-button' onClick={handleToggle}>
                    {useOriginal ? 'Show with Impact' : 'Show Baseline'}
                </button>
                <button className='floating-infobox-box-toggle-button' onClick={() => setSplitView(!isSplitView)}>
                    {isSplitView ? 'Show Original' : 'Show Splitview'}
                </button>
            </div>
        </div>
    );
}

export default NeighbourhoodChartData;
