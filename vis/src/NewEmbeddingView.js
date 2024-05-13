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

    const [selectedX, setSelectedX] = useState(null);
    const [selectedY, setSelectedY] = useState(null);
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
    }, [tempSelectedX, tempSelectedY]);

    useEffect(() => {
        const svg = d3.select(ref.current);
        console.log(localStorage);
        if (selectedX !== null || selectedY !== null) {
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
        console.log('selectedX:', selectedX);
        console.log('selectedY:', selectedY);

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


            const drawPlot = (selectedX, selectedY) => {
                let xKey = '';
                let yKey = '';
                if (selectedX && Array.isArray(selectedX)) {
                    xKey = selectedX.map(option => option.value).join('_');
                }
                if (selectedY && Array.isArray(selectedY)) {
                    yKey = selectedY.map(option => option.value).join('_');
                }
                //console.log('X key:', xKey);
                //console.log('Y key:', yKey);

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

            if (selectedX || selectedY) {
                drawPlot(selectedX, selectedY);
            }
        });
    }, [selectedX, selectedY]);


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

    const handleXChange = options => {
        if (options) {
            const optionWithUnderscore = options.find(option => option.value.includes('_'));
            if (optionWithUnderscore) {
                options = [options[options.length - 1]];
            } else {
                populateDimension(url, options, 1);
            }
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

            setSelectedY(options);
        }
    };

    const saveSelectionToLocalStorage = () => {
        console.log('Saving selection to local storage');
        localStorage.setItem('selectedX', JSON.stringify(selectedX));
        localStorage.setItem('selectedY', JSON.stringify(selectedY));
        console.log('localStorage:', localStorage);
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
                value={isShiftDown ? tempSelectedX : selectedX}
                onChange={handleTempXChange}
                formatOptionLabel={formatOptionLabel}
                isMulti={true}
                closeMenuOnSelect={!isShiftDown}
            />
            <Select
                isDisabled={isLoading}
                options={columns}
                value={isShiftDown ? tempSelectedY : selectedY}
                onChange={handleTempYChange}
                formatOptionLabel={formatOptionLabel}
                isMulti={true}
                closeMenuOnSelect={!isShiftDown}
            />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <svg
                    ref={ref}
                    width={500}
                    height={500}
                    style={{ backgroundColor: 'white' }}
                />
            </div>
            {isLoading && <div className='loaderContainer'>creating embedding...<div className="loader" /></div>}
        </div>
    );
};

export default NewEmbeddingView;