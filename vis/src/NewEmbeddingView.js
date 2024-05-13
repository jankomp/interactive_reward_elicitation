import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { env } from './constants';
import Select from 'react-select';
import './NewEmbeddingView.css';

const NewEmbeddingView = () => {
    const url = `http://localhost:3000/logs/log_${env}.csv`;
    const ref = useRef();
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isShiftDown, setIsShiftDown] = useState(false);

    const [selectedXY, setSelectedXY] = useState(null);
    const [selectedX, setSelectedX] = useState(null);
    const [selectedY, setSelectedY] = useState(null);
    const [tempSelectedXY, setTempSelectedXY] = useState(selectedXY);
    const [tempSelectedX, setTempSelectedX] = useState(selectedX);
    const [tempSelectedY, setTempSelectedY] = useState(selectedY);

    const dimensionalReduction = (inputUrl, selectedOptions, dimensions) => {
        setIsLoading(true);
        return fetch(`http://localhost:3001/runPythonScript?inputUrl=${encodeURIComponent(JSON.stringify(inputUrl))}&selectedOptions=${encodeURIComponent(JSON.stringify(selectedOptions))}&dimensions=${encodeURIComponent(JSON.stringify(dimensions))}`)
            .then(response => {
                if (!response.ok) {
                    console.log('Response:', response);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('then');
                return response;
            })
            .catch(error => {
                console.error('Error:', error);
            })
            .finally(() => {
                console.log('finally');
                setIsLoading(false);
            });
    };

    const populateDimension = (url, selectedOptions, nDimensions) => {
        if (selectedOptions.length > 1) {
            // order selectedOptions alphabetically and numerically
            selectedOptions.sort((a, b) => {
                const numA = parseInt(a.value.match(/\d+/)[0]);
                const numB = parseInt(b.value.match(/\d+/)[0]);
                return numA - numB;
            });
            // if the option is already present in columns, do not add it again
            const selectedOptionsKey = selectedOptions.map(option => option.value).join('_');
            if (!columns.some(column => column.value === selectedOptionsKey)) {
                dimensionalReduction(url, selectedOptions.map(option => option.value), nDimensions).then((result) => {
                    console.log('Result:', result);
                });
            }
        }
    }


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Shift') {
                setIsShiftDown(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Shift') {
                setIsShiftDown(false);
                handleXYChange(tempSelectedXY);
                handleXChange(tempSelectedX);
                handleYChange(tempSelectedY);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [tempSelectedXY, tempSelectedX, tempSelectedY]);

    useEffect(() => {
        const svg = d3.select(ref.current);

        if (selectedXY !== null || selectedX !== null || selectedY !== null) {
            saveSelectionToLocalStorage();
        }
        if (selectedX === null) {
            const localX = JSON.parse(localStorage.getItem('selectedX'));
            setSelectedX(localX);
        }
        if (selectedY === null) {
            const localY = JSON.parse(localStorage.getItem('selectedY'));
            setSelectedY(localY);
        }
        if (selectedXY === null) {
            const localXY = JSON.parse(localStorage.getItem('selectedXY'));
            setSelectedXY(localXY);
        }

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
                if (selectedX && Array.isArray(selectedX)) {
                    xKey = selectedX.map(option => option.value).join('_');
                }
                if (selectedY && Array.isArray(selectedY)) {
                    yKey = selectedY.map(option => option.value).join('_');
                }
                if (selectedXY && Array.isArray(selectedXY)) {
                    xKey = selectedXY.map(option => option.value).join('_') + '_x';
                    yKey = selectedXY.map(option => option.value).join('_') + '_y';
                }
                //console.log('X key:', xKey);
                //console.log('Y key:', yKey);

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


                // Create a brush
                const brush = d3.brush()
                    .extent([[0, 0], [svgWidth, svgHeight]])
                    .on("end", brushended);

                // Append the brush to the SVG
                svg.append("g")
                    .attr("class", "brush")
                    .call(brush);

                function brushended(event) {
                    if (!event.selection) return; // Ignore empty selections.

                    // Get the bounds of the selection.
                    const [[x0, y0], [x1, y1]] = event.selection;

                    // Log all the selected points.
                    svg.selectAll('circle')
                        .each(function (d) {
                            const cx = xScale(+d[xKey]);
                            const cy = yScale(+d[yKey]);

                            // Check if the point is within the selection bounds.
                            if (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) {
                                console.log('selected ', d.run); // Log the selected data point.
                            }
                        });
                }
                svg.selectAll('circle')
                    .data(meanData)
                    .join('circle')
                    .attr('cx', d => xScale(+d[xKey]))
                    .attr('cy', d => yScale(+d[yKey]))
                    .attr('r', 5)
                    .attr('fill', 'steelblue')
                    .on('mouseover', function(e, d) {
                        console.log('hover ', d.run);
                    });
            };

            if (selectedXY || selectedX || selectedY) {
                drawPlot(selectedXY, selectedX, selectedY);
            }
        });
    }, [selectedXY, selectedX, selectedY]);


    const handleTempXYChange = (options) => {
        if (isShiftDown) {
            setTempSelectedXY(options);
        } else {
            handleXYChange(options);
        }
    };

    const handleTempXChange = (options) => {
        if (isShiftDown) {
            setTempSelectedX(options);
        } else {
            handleXChange(options);
        }
    };

    const handleTempYChange = (options) => {
        if (isShiftDown) {
            setTempSelectedY(options);
        } else {
            handleYChange(options);
        }
    };

    const handleXYChange = options => {
        if (options) {
            const optionWithUnderscore = options.find(option => option.value.includes('_'));
            if (optionWithUnderscore) {
                options = [options[options.length - 1]];
            } else {
                populateDimension(url, options, 2);
            }
            setSelectedX(null);
            setSelectedY(null);
            setSelectedXY(options);
        }
    };

    const handleXChange = options => {
        if (options) {
            const optionWithUnderscore = options.find(option => option.value.includes('_'));
            if (optionWithUnderscore) {
                options = [options[options.length - 1]];
            } else {
                populateDimension(url, options, 1);
            }
            setSelectedXY(null);
            setSelectedX(options);
        }
    };

    const handleYChange = options => {
        if (options) {
            const optionWithUnderscore = options.find(option => option.value.includes('_'));
            if (optionWithUnderscore) {
                options = [options[options.length - 1]];
            } else {
                populateDimension(url, options, 1);
            }
            setSelectedXY(null);
            setSelectedY(options);
        }
    };

    const saveSelectionToLocalStorage = () => {
        localStorage.setItem('selectedXY', JSON.stringify(selectedXY));
        localStorage.setItem('selectedX', JSON.stringify(selectedX));
        localStorage.setItem('selectedY', JSON.stringify(selectedY));
    };

    const formatOptionLabel = (option, { context }) => {
        if (context === 'menu') {
            if (Array.isArray(selectedX) && selectedX.some(selectedOption => selectedOption.value === option.value)) {
                return `${option.label} (selected for x-axis)`;
            }
            if (Array.isArray(selectedY) && selectedY.some(selectedOption => selectedOption.value === option.value)) {
                return `${option.label} (selected for y-axis)`;
            }
        }
        return option.label;
    };

    return (
        <div>
            <Select
                isDisabled={isLoading}
                options={columns}
                value={isShiftDown ? tempSelectedXY : selectedXY}
                onChange={handleTempXYChange}
                formatOptionLabel={formatOptionLabel}
                isMulti={true}
                closeMenuOnSelect={!isShiftDown}
                placeholder='Select columns for dimensional reduction to X-Y plane...'
            />
            <Select
                isDisabled={isLoading}
                options={columns}
                value={isShiftDown ? tempSelectedX : selectedX}
                onChange={handleTempXChange}
                formatOptionLabel={formatOptionLabel}
                isMulti={true}
                closeMenuOnSelect={!isShiftDown}
                placeholder='Select columns for X-axis...'
            />
            <Select
                isDisabled={isLoading}
                options={columns}
                value={isShiftDown ? tempSelectedY : selectedY}
                onChange={handleTempYChange}
                formatOptionLabel={formatOptionLabel}
                isMulti={true}
                closeMenuOnSelect={!isShiftDown}
                placeholder='Select columns for Y-axis...'
            />
            <div className='embeddingChart square'>
                <svg ref={ref} className='square-svg' />
                {isLoading && <div className='loaderContainer'>creating embedding...<div className="loader" /></div>}
            </div>
        </div>
    );
};

export default NewEmbeddingView;