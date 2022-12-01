import { Pie } from '@ant-design/plots';

const PieChart = (props) => {
    const data = [
        {
            type: 'Completed Tasks',
            value: props.completed,
        },
        {
            type: 'Incompleted Tasks',
            value: props.incompleted,
        }
    ];
    
    const config = {
        data,
        appendPadding: 10,
        angleField: 'value',
        colorField: 'type',
        color: ['#5285EC', '#E8ECEC'],
        radius: 0.8,
        legend: false,
        label: {
            type: 'outer',
            content: '{name}',
        },
        interactions: [
            {
                type: 'element-active',
            },
        ],
    };
    return <Pie {...config} />;
};

export default PieChart;
