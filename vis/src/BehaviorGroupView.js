import React, { useState, useEffect } from 'react';
import './BehaviorView.css';
import OverlayedGif from './OverlayedGif';
import GifList from './GifList';

global.Buffer = global.Buffer || require('buffer').Buffer;


const SampleGroupView = (updateRunID, filteredEmbeddingData) => {
    const [expanded, setExpanded] = useState(false); 

    if (expanded) {
        return <GifList filteredEmbeddingData={filteredEmbeddingData} resetExpanded={setExpanded}/>;
    } else {
        return <OverlayedGif filteredEmbeddingData={filteredEmbeddingData} resetExpanded={setExpanded} />;
    }
};

export default SampleGroupView;