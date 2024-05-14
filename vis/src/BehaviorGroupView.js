import React, { useState, useEffect } from 'react';
import './BehaviorView.css';
import OverlayedGif from './OverlayedGif';
import GifList from './GifList';

global.Buffer = global.Buffer || require('buffer').Buffer;


const BehaviorGroupView = ({selectedBehaviors, selectBehavior, embeddingData}) => {
    const [expanded, setExpanded] = useState(true); 

    const handleCollapseClick = () => {
        setExpanded(false);
      };

    const handleExpandClick = () => {
        setExpanded(true);
      }

    if (expanded) {
        return <><GifList embeddingData={embeddingData} selectedBehaviors={selectedBehaviors} selectBehavior={selectBehavior}/>
        <button onClick={handleCollapseClick}>Collapse</button></>;
    } else {
        return <><OverlayedGif embeddingData={embeddingData} />
        <button onClick={handleExpandClick}>Expand</button></>;
    }
};

export default BehaviorGroupView;