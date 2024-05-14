import React, { useEffect, useState } from 'react';
import { Button, List } from 'antd';
import { env } from './constants';

const GifList = ({ embeddingData, selectedBehaviors, selectBehavior }) => {
    const [slicedData, setSlicedData] = useState([]);

    useEffect(() => {
        setSlicedData([]);
        if (embeddingData !== null && embeddingData !== undefined) {
            let data = embeddingData.filter(item => selectedBehaviors.includes(Number(item.key)));
            if (data.length > 10) {
                setSlicedData(data.slice(0, 10));
            } else {
                setSlicedData(data);
            }
        }
    }, [embeddingData, selectedBehaviors]);

    const hoverBehavior = (key) => {
        console.log('hoverBehavior', key);
    }

    const leaveBehavior = (key) => {
        console.log('leaveBehavior', key);
    }


    return (
        <div id='behavior' className='subpane'>
            <div style={{ height: 5 }} />
            <div style={{ marginLeft: 10, fontSize: 16 }}>Behaviors</div>
            <div style={{ overflow: "scroll", height: 820, marginLeft: 0, marginTop: 5 }}>
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
                        <List.Item
                            key={embeddingData.key}
                            onMouseEnter={() => hoverBehavior(Number(embeddingData.key))}
                            onMouseLeave={() => leaveBehavior(Number(embeddingData.key))}
                        >
                            <div>
                                <img
                                    style={{ width: 200, height: 200, marginLeft: 8 }}
                                    src={`http://localhost:3000/gifs_${env}/training-episode-${embeddingData.key}.gif`}
                                    autoPlay={true}
                                />
                                <Button style={{ width: 200, height: 30, marginLeft: 8 }} onClick={() => console.log('button clicked')}> {"r:" + embeddingData.r} </Button>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default GifList;
