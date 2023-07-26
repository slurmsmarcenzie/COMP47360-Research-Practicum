import React, {useState, useEffect} from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../App.css";
import { useMapContext } from './MapContext';
import { useToggleSlider }  from "react-toggle-slider";
import { ToggleSlider }  from "react-toggle-slider";

function NeighbourhoodChartData({ map, hashMap, busynessHashMap, eventBaselineHashMap, colours, highlightEventImpact, Zone_ID,  resetColours}) {

    console.log('this is our hashmap of difference', hashMap)

    const {neighbourhoods} = useMapContext();
    const {useOriginal, setUseOriginal, showChart, setShowChart, isSplitView, setSplitView} = useMapContext();
    const {updateLayerColours} = useMapContext()

    // This state holds the data and options that the chart component needs to create the chart on the page. 
    // When this state changes, it triggers the chart to re-render with the new data and options.
    
    const [renderChart, setRenderChart] = useState(null);
    const [selectedValues, setSelectedValues] = useState([]);
    
    // This state holds a separate copy of the data and options for a chart. 
    // This copy isn't used directly in rendering but is useful for storing temporary or intermediary states of the chart's data and options.
    const [chartData, setChartData] = useState(null);

    const [showMostImpactedZones, setShowMostImpactedZones] = useState(false);  // New state for the toggle
    const [labels, setLabels] = useState([]);    

    const [active, setActive] = useState(true);
    const [highlightActive, setHighlightActive] = useState(null);
    const [initialRender, setInitialRender] = useState(true);

    // This function will handle sorting and extraction of names and data values
    const getImpactedZonesForChart = () => {
        if (!hashMap) {
        return {names: [], dataValues: []};
        }
    
        const entries = Object.entries(hashMap);
        let filteredEntries;
    
        if (showMostImpactedZones) {
        entries.sort((a, b) => b[1] - a[1]);
        filteredEntries = entries.slice(0, 5);
        } else {
        entries.sort((a, b) => a[1] - b[1]);
        filteredEntries = entries.slice(0, 5);
        }
    
        const filteredHashMap = Object.fromEntries(filteredEntries);
        const dataValues = filteredHashMap ? Object.values(filteredHashMap): [];
    
        const names = filteredEntries.map(([key]) => {
        const matchingObject = neighbourhoods.features.find(neighbourhood => neighbourhood.id === key);
        return matchingObject ? matchingObject.properties.zone : null;
        });
    
        return {names, dataValues};
    }
  
    // This function will handle extraction of labels
    const getImpactedZonesForHighlight = () => {

        if (!hashMap) {
            return [];
        }

        const entries = Object.entries(hashMap);
        let filteredEntries;

        if (showMostImpactedZones) {
            entries.sort((a, b) => b[1] - a[1]);
            // Filter only entries with a change greater than or equal to 0.2
            filteredEntries = entries.filter((entry) => entry[1] >= 0.25);
            // Get only the top 5 most impacted areas
            // filteredEntries = filteredEntries.slice(0, 5);
        } else {
            entries.sort((a, b) => a[1] - b[1]);
            // Filter only entries with a change less than 0.2
            filteredEntries = entries.filter((entry) => entry[1] < 0.2);
            // Get only the bottom 5 least impacted areas
            filteredEntries = filteredEntries.slice(0, 5);
        }

        const filteredHashMap = Object.fromEntries(filteredEntries);
        const selectedValues = filteredHashMap ? Object.keys(filteredHashMap) : [];

        return selectedValues
    }

    const makeChartData = (names, dataValues) => {
    
        const data = {
            labels: names,
            datasets: [
                { 
                    label: 'Change in Busyness',
                    barThickness: 24,
                    data: dataValues,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {chartArea} = chart;
                        if (!chartArea){
                            return null
                        }
                        if (context.dataIndex >= 0){
                            return showMostImpactedZones ? getGradientMostImpacted(chart) : getGradientLeastImpacted(chart);
                        } else{
                            return 'white'
                        }
                    },
                },
            ],
        };
    
        const options = {
            maintainAspectRatio: false,
            responsive: true,
            indexAxis: 'x',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        font: {
                            size: 10,
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false // hides gridlines along the x-axis
                    },
                },
                y: { 
                    display: false, // hides the y-axis
                    grid: {
                        display: false // hides gridlines along the y-axis
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {},
                title: {
                    display: true,
                    text: 'Change in Busyness',
                    color: 'white',  // Set title color
                    font: {
                        size: 14,  // Set font size
                        family: 'Arial'  // Set font family
                    },
                    align: 'center'  // center alignment
            },
        },
    };
        return {data, options};
    }
    
    useEffect(() => {
        setSelectedValues(getImpactedZonesForHighlight());
    }, [hashMap, showMostImpactedZones]);
    
    
    // Trigger chart rerender whenever showMostImpacted state changes
    useEffect(() => {
        const {names, dataValues} = getImpactedZonesForChart();
        setLabels(labels); // Set labels here
        const newChartData = makeChartData(names, dataValues);
        setChartData(newChartData); // Set chartData here
    }, [showMostImpactedZones, hashMap]);

    const toggleChartData = () => {
        setShowMostImpactedZones(!showMostImpactedZones); // Toggle showMostImpacted state here
        setRenderChart(chartData);
        setShowChart(true);
        highlightEventImpact(Zone_ID, labels);
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

    useEffect(() => {
        handleToggle();
    }, [active]);

    useEffect(() => {
        if (!initialRender) {
            toggleChartData();
        } else {
            setInitialRender(false);
        }
    }, [highlightActive]);

    const handleOptionChange = (event) => {
        setActive(event.target.value === 'eventImpact'); 
      };

      const handleImpactOptionChange = (event) => {
        setHighlightActive(event.target.value === 'most'); 
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
            <div className="radio-button">
                
                <input
                    type="radio"
                    name="chartDataOption"
                    value="eventImpact"
                    id="eventImpact"
                    checked={active}
                    onChange={handleOptionChange}
                />
                <label for="eventImpact">
                Impact
                </label>
                <input
                    type="radio"
                    name="chartDataOption"
                    value="baselineBusyness"
                    id="baselineBusyness"
                    checked={!active}
                    onChange={handleOptionChange}
                />
                <label for="baselineBusyness">
                Baseline
                </label>
            </div>
                
            {/* {!active ? null : <div className='flex-direction-infobox'>
            <div className="radio-button">
                
                <input
                    type="radio"
                    value="most"
                    id="most"
                    checked={highlightActive}
                    onChange={handleImpactOptionChange}
                />
                <label for="most">
                Most
                </label>
                <input
                    type="radio"
                    value="least"
                    id="least"
                    checked={!highlightActive}
                    onChange={handleImpactOptionChange}
                />
                <label for="least">
                Least
                </label>
                </div>
                </div>} */}

                <button className='floating-nav-cta-button' onClick={() => setSplitView(!isSplitView)}>
                    {isSplitView ? 'Show Original' : 'Compare Busyness Levels'}
                </button>
                <button className='floating-nav-cta-button' onClick={() => {
                    setShowMostImpactedZones(true)
                    highlightEventImpact(Zone_ID, selectedValues)}
                    }>
                  Highlight most impacted zones
                </button>
                {/* <button className='floating-nav-cta-button' onClick={() => {
                    setShowMostImpactedZones(false)
                    highlightEventImpact(Zone_ID, selectedValues)}
                    }>
                  Highlight least impacted zones
                </button> */}
            </div>
        </div>
    );
}

export default NeighbourhoodChartData;
