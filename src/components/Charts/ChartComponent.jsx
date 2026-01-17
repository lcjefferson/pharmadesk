import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ type, data, options }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            if (chartRef.current) chartRef.current.destroy();
            try {
                const ctx = canvasRef.current.getContext('2d');
                chartRef.current = new Chart(ctx, {
                    type,
                    data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        ...options
                    }
                });
            } catch (err) {
                console.error("Chart Error", err);
            }
        }
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, [type, data, options]);

    return <canvas ref={canvasRef} />;
};

export default ChartComponent;
