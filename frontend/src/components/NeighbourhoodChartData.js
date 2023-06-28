import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import "../App.css";

function NeighbourhoodChartData({hashMap}) {
    
    const labels = Object.keys(hashMap);
    const dataValues = Object.values(hashMap);
    
    const data = {
        labels: labels,
        datasets: [
        {
            label: 'Busyness',
            data: dataValues,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1,
        },
        ],
    };
    
    const options = {
        responsive: true,
        scales: {
        y: {
            beginAtZero: true
            }
        }
    };

    return(
        <div>
            <Bar data={data} options={options}/>
      </div>
    );
}

export default NeighbourhoodChartData;
