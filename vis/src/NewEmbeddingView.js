import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { env } from './constants';
import Select from 'react-select';
import './NewEmbeddingView.css';

const NewEmbeddingView = ({ componentId, globalBrushedPoints, setGlobalBrushedPoints, resizeKey, setDropdownsHeight }) => {
    const url = `http://localhost:3000/logs/log_${env}.csv`;
    const ref = useRef();
    const dualDimensionColumns = useState([]);
    const singleDimensionColumns = useState([]);
    const [columns, setColumns] = useState([]);

    const [selectedXY, setSelectedXY] = useState(null);
    const [selectedX, setSelectedX] = useState(null);
    const [selectedY, setSelectedY] = useState(null);

    const [hoverPoint, setHoverPoint] = useState(null);

    useEffect(() => {
        const dropdownsHeight = document.querySelector('.embedding-view').offsetHeight;
        setDropdownsHeight(dropdownsHeight);
    }, [setDropdownsHeight]);

    useEffect(() => {
        for (let i = 0; i < columns.length; i++) {
            if (columns[i].value.endsWith('_x') || columns[i].value.endsWith('_y')) {
                const columnName = columns[i].value.slice(0, -2);
                const option = { value: columnName, label: columnName };
                if (!dualDimensionColumns.some(o => o.value === option.value)) {
                    dualDimensionColumns.push(option);
                }
            } else {
                singleDimensionColumns.push(columns[i]);
            }
        }
    }, [columns, dualDimensionColumns, singleDimensionColumns]);


    useEffect(() => {
        const svg = d3.select(ref.current);

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


            const drawPlot = (selectedXY, selectedX, selectedY) => {
                let xKey = '';
                let yKey = '';
                if (selectedX) {
                    xKey = selectedX.value;
                }
                if (selectedY) {
                    yKey = selectedY.value;
                }
                if (selectedXY) {
                    xKey = selectedXY.value + '_x';
                    yKey = selectedXY.value + '_y';
                }

                svg.selectAll('*').remove();

                const svgWidth = svg.node().parentNode.clientWidth;
                const svgHeight = svg.node().parentNode.clientHeight;

                const xScale = d3.scaleLinear()
                    .domain(d3.extent(meanData, d => +d[xKey]))
                    .range([0, svgWidth]);

                const yScale = d3.scaleLinear()
                    .domain(d3.extent(meanData, d => +d[yKey]))
                    .range([svgHeight, 0]);

                // Add X gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + svgHeight + ")")
                    .call(d3.axisBottom(xScale)
                        .tickSize(-svgHeight)
                        .tickFormat("")
                    )

                // Add Y gridlines
                svg.append("g")
                    .attr("class", "grid")
                    .call(d3.axisLeft(yScale)
                        .tickSize(-svgWidth)
                        .tickFormat("")
                    )


                function brushstarted() {
                    svg.selectAll('circle').style('pointer-events', 'none');
                }

                function brushended(event) {
                    svg.selectAll('circle').style('pointer-events', 'auto');

                    if (!event.selection) return;

                    setGlobalBrushedPoints([]);

                    const [[x0, y0], [x1, y1]] = event.selection;

                    svg.selectAll('circle')
                        .each(function (d) {
                            const cx = xScale(+d[xKey]);
                            const cy = yScale(+d[yKey]);

                            if (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
                                setGlobalBrushedPoints(prevPoints => [...prevPoints, d.run]);
                            }
                        });
                    //console.log(globalBrushedPoints);
                }

                const brush = d3.brush()
                    .extent([[0, 0], [svgWidth, svgHeight]])
                    .on("start", brushstarted)
                    .on("end", brushended);

                svg.call(brush);

                svg.selectAll('circle')
                    .data(meanData)
                    .join('circle')
                    .attr('cx', d => xScale(+d[xKey]))
                    .attr('cy', d => yScale(+d[yKey]))
                    .on('mouseover', function (e, d) {
                        if (!globalBrushedPoints.includes(d.run)) {
                            setHoverPoint(d.run);
                            setGlobalBrushedPoints(prevPoints => [...prevPoints, d.run]);
                        }
                    })
                    .on('mouseout', function (e, d) {
                        //console.log('out ', d.run);
                        if (hoverPoint === d.run) {
                            setHoverPoint(null);
                            setGlobalBrushedPoints(prevPoints => prevPoints.filter(run => run !== d.run));
                        }
                    })
                    .attr('r', d => globalBrushedPoints.includes(d.run) ? 6 : 4)
                    .attr('fill', 'steelblue');
            };

            if (selectedXY || selectedX || selectedY) {
                drawPlot(selectedXY, selectedX, selectedY);
            }
        });
    }, [selectedXY, selectedX, selectedY, globalBrushedPoints, resizeKey, hoverPoint, url, setGlobalBrushedPoints]);

    const handleXYChange = option => {
        if (option) {
            setSelectedX(null);
            setSelectedY(null);
            setSelectedXY(option);
        }
    };

    const handleXChange = option => {
        if (option) {
            setSelectedXY(null);
            setSelectedX(option);
        }
    };

    const handleYChange = option => {
        if (option) {
            setSelectedXY(null);
            setSelectedY(option);
        }
    };

    const formatOptionLabel = (option, { context }) => {
        if (context === 'menu') {
            if (selectedX !== null && selectedX.value === option.value) {
                return `${option.label} (selected for x-axis)`;
            }
            if (selectedY !== null && selectedY.value === option.value) {
                return `${option.label} (selected for y-axis)`;
            }
        }
        return option.label;
    };


    const customSelectStyles = {
        valueContainer: (provided) => ({
            ...provided,
            display: 'block',
            width: '100px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',

        }),
        multiValue: (provided) => ({
            ...provided,
            display: 'inline-flex',
            margin: '2px',
        }),
    };

    return (
        <div className="embedding-view">
            <Select
                styles={customSelectStyles}
                options={dualDimensionColumns}
                value={selectedXY}
                onChange={handleXYChange}
                formatOptionLabel={formatOptionLabel}
                placeholder='Select columns for X-Y plane...'
            />
            <Select
                styles={customSelectStyles}
                options={singleDimensionColumns}
                value={selectedX}
                onChange={handleXChange}
                formatOptionLabel={formatOptionLabel}
                placeholder='Select columns for X-axis...'
            />
            <Select
                styles={customSelectStyles}
                options={singleDimensionColumns}
                value={selectedY}
                onChange={handleYChange}
                formatOptionLabel={formatOptionLabel}
                placeholder='Select columns for Y-axis...'
            />
            <div className='embeddingChart square'>
                <svg ref={ref} className='square-svg' />
            </div>
        </div>
    );
};

export default NewEmbeddingView;