import React, { useEffect, useState } from 'react';
import './ComparisonView.css';
import { env } from './constants';

function ComparisonView({ comparisonPair }) {
    const [gifPath1, setGifPath1] = useState(null);
    const [gifPath2, setGifPath2] = useState(null);

    useEffect(() => {
        if (comparisonPair) {
            console.log('Comparison pair:', comparisonPair);
            setGifPath1(`http://localhost:3000/gifs_${env}/training-episode-${comparisonPair[0].key}.gif`);
            setGifPath2(`http://localhost:3000/gifs_${env}/training-episode-${comparisonPair[1].key}.gif`);
        }
    }, [comparisonPair]);

    const handleLeftClick = () => {
        console.log('Left button clicked');
        // Add your button click logic here
    };

    const handleRightClick = () => {
        console.log('Right button clicked');
        // Add your button click logic here
    };

    const handleEqualClick = () => {
        console.log('Equal button clicked');
        // Add your button click logic here
    };

    const handleSkipClick = () => {
        console.log('Skip button clicked');
        // Add your button click logic here
    };

    return (
        <>
        <div className='header'>Comparison View</div>
            <div className="gif-display">
                <div className="gif-container">
                    <img
                        style={{ width: 200, height: 200, marginLeft: 8 }}
                        src={gifPath1}
                        autoplay={true}
                    />
                    <button onClick={handleLeftClick}>Left</button>
                </div>
                <div className="gif-container">
                    <img
                        style={{ width: 200, height: 200, marginLeft: 8 }}
                        src={gifPath2}
                        autoplay={true}
                    />
                    <button onClick={handleRightClick}>Right</button>
                </div>
            </div>
            <div className="button-container">
                <button onClick={handleEqualClick}>Equal</button>
                <button onClick={handleSkipClick}>Skip</button>
            </div>
        </>
    );
};

export default ComparisonView;