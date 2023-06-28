import React, {useRef, useEffect} from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../App.css";

function NeighbourhoodChartData({ hashMap, colours }) {

    const filteredHashMap = Object.keys(hashMap).reduce((acc, key) => {
        const value = hashMap[key];
        if (value < -0.5 || value > 0.5) {
          acc[key] = value;
        }
        return acc;
      }, {});

    const labels = filteredHashMap ? Object.keys(filteredHashMap) : [];
    const dataValues = filteredHashMap ? Object.values(filteredHashMap) : [];
  
    const data = {
      labels: labels,
      datasets: [
        { label: 'Busyness',
          barThickness: 4,
          data: dataValues,
          backgroundColor: (context) => {
            console.log(context)
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea){
                return null
            }
            if (context.dataIndex >= 0){
                return getGradient(chart)
            } else{
                return 'blue'
            }
          },
          borderWidth: 1,
          barThickness: 10,
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

    const getGradient = (context) => {

        const { chart, ctx, chartArea: { left, right } } = context;
        const gradientSegment = ctx.createLinearGradient(left, 0, right, 0);
        gradientSegment.addColorStop(0, colours[0]);
        gradientSegment.addColorStop(0.5, colours[1]);
        gradientSegment.addColorStop(1, colours[2]);
        return gradientSegment;
    };

    return (
        <div className='floating-info-box-chart-container'>
            <Bar data={data} options={options} />
        </div>
    );
}

export default NeighbourhoodChartData;
