import React from 'react';
import { Button, List } from 'antd';
import GifPlayer from 'react-gif-player';
import { env } from './constants';

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

const GifList = ({ embeddingData }) => {
    let slicedData = [];
    if (embeddingData !== null && embeddingData !== undefined) {
        let data = embeddingData
        if (data.length > 10) {
            data = shuffle(data)
            slicedData = data.slice(0,10)
        } else {
            slicedData = data
        }
    }
    return (
        <div id='behavior' className='subpane'>
            <div style={{height: 5}} />
            <div style={{marginLeft: 10, fontSize: 16}}>Behaviors</div>
            <div style={{overflow: "scroll", height: 820, marginLeft: 0, marginTop: 5}}>
                <List
                    grid={{
                    gutter: 10,
                    xs: 2,
                    sm: 2,
                    md: 2,
                    lg: 2,
                    xl: 2,
                    xxl: 2,
                    }}
                    dataSource={slicedData}
                    renderItem={(embeddingData) => (
                        <List.Item>
                            <div>
                                <GifPlayer
                                    style={{width:200, height: 200, marginLeft: 8}}
                                    gif={`http://localhost:3000/gifs_${env}/training-episode-${embeddingData.key}.gif`}
                                    autoplay={true}
                                />
                                <Button style={{width:200, height: 30, marginLeft: 8}} onClick={() => console.log('button clicked')}> {"r:"+embeddingData.r} </Button>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default GifList;
