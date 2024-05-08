import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { env } from './constants';
import Select from 'react-select';

const NewEmbeddingView = () => {
    const ref = useRef();
    const [columns, setColumns] = useState([]);
    const [selectedX, setSelectedX] = useState(null);
    const [selectedY, setSelectedY] = useState(null);

    useEffect(() => {
        const svg = d3.select(ref.current);
        const url = `http://localhost:3000/logs/log_${env}.csv`;

        d3.csv(url).then((data) => {
            // Group the data by the "run" column
            const groupedData = d3.group(data, d => d.run);

            // Compute the mean of all the steps for each run
            const meanData = Array.from(groupedData, ([run, values]) => {
                const meanValues = {};
                for (const key of Object.keys(values[0])) {
                    meanValues[key] = d3.mean(values, d => +d[key]);
                }
                return meanValues;
            });
            setColumns(Object.keys(meanData[0]).map(key => ({ value: key, label: key })));

            if (meanData.length > 0 && !selectedX && !selectedY) {
                setSelectedX({ value: 'x', label: 'x' });
                setSelectedY({ value: 'y', label: 'y' });
            }
            const drawPlot = (xKey, yKey) => {
                svg.selectAll('*').remove();

                const xScale = d3.scaleLinear()
                    .domain(d3.extent(meanData, d => +d[xKey]))
                    .range([0, 500]);

                const yScale = d3.scaleLinear()
                    .domain(d3.extent(meanData, d => +d[yKey]))
                    .range([500, 0]);

                // Add X gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + 500 + ")")
                    .call(d3.axisBottom(xScale)
                        .tickSize(-500)
                        .tickFormat("")
                    )

                // Add Y gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .call(d3.axisLeft(yScale)
                        .tickSize(-500)
                        .tickFormat("")
                    )

                svg.selectAll('circle')
                    .data(meanData)
                    .join('circle')
                    .attr('cx', d => xScale(+d[xKey]))
                    .attr('cy', d => yScale(+d[yKey]))
                    .attr('r', 5)
                    .attr('fill', 'steelblue');
            };

            if (selectedX && selectedY) {
                drawPlot(selectedX.value, selectedY.value);
            }
        });
    }, [selectedX, selectedY]);

    const handleXChange = option => {
        setSelectedX(option);
    };

    const handleYChange = option => {
        setSelectedY(option);
    };

    const formatOptionLabel = (option, { context }) => {
        if (context === 'menu') {
            if (selectedX && option.value === selectedX.value) {
                return `${option.label} (selected for x-axis)`;
            }
            if (selectedY && option.value === selectedY.value) {
                return `${option.label} (selected for y-axis)`;
            }
        }
        return option.label;
    };

    return (
        <div>
        <Select 
            options={columns} 
            value={selectedX} 
            onChange={handleXChange} 
            formatOptionLabel={formatOptionLabel}
        />
        <Select 
            options={columns} 
            value={selectedY} 
            onChange={handleYChange} 
            formatOptionLabel={formatOptionLabel}
        />
            <svg ref={ref} width={500} height={500} style={{ backgroundColor: 'white' }} />
        </div>
    );
};

export default NewEmbeddingView;