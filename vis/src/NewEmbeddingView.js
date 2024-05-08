import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { env } from './constants';

const NewEmbeddingView = () => {
    const ref = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current);
        const url = `http://localhost:3000/logs/embedding_${env}.json`;

        d3.json(url).then((data) => {
            const xScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.x))
                .range([0, 500]);

            const yScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.y))
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
                .data(data)
                .join('circle')
                .attr('cx', d => xScale(d.x))
                .attr('cy', d => yScale(d.y))
                .attr('r', 5)
                .attr('fill', 'steelblue');
        });
    }, []);

    return (
        <svg ref={ref} width={500} height={500}  style={{backgroundColor: 'white'}}/>
    );
};

export default NewEmbeddingView;