import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../App.css";

function NeighbourhoodChartData({ hashMap, colours }) {
    
    console.log(colours);

    const filteredHashMap = Object.keys(hashMap).reduce((acc, key) => {
        const value = hashMap[key];
        if (value < -0.3 || value > 0.3) {
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
          borderColor: '#FFF',
          borderWidth: 1,
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

    return (
        <div className='floating-info-box-chart-container'>
            <Bar data={data} options={options} />
        </div>
    );
}

export default NeighbourhoodChartData;
