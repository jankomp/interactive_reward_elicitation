import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import './Dashboard.css';
import EmbeddingView from './EmbeddingView';
// import BehaviorView from './BehaviorView';
import BehaviorGroupView from './BehaviorGroupView';
import ComparisonView from './ComparisonView';
// import AnalysisPanel from './AnalysisPanel';
import { env } from './constants';
import NewEmbeddingView from './NewEmbeddingView';
import { ResizableBox } from 'react-resizable';

const { Header, Sider, Footer } = Layout;

const Dashboard = () => {
  const [embeddingData, setEmbeddingData] = useState(null);
  const [filteredEmbeddingData, setFilteredEmbeddingData] = useState(null);
  const [comparisonPair, setComparisonPair] = useState(null);
  const [brushedPoints, setBrushedPoints] = useState([]);
  const [resizeKey, setResizeKey] = useState(false);

  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(120);
  const [dropdownsHeight, setDropdownsHeight] = useState(0);

  useEffect(() => {
    fetch(`./logs/embedding_${env}.json`)
      .then((res) => res.json())
      .then((data) => {
        setEmbeddingData(data);

        // Remove duplicates
        data = data.reduce((acc, current) => {
          const x = acc.findIndex(item => item.key === current.key);
          if (x <= -1) {
            acc.push(current);
          }
          return acc;
        }, []);
        setFilteredEmbeddingData(data);
        if (data.length > 0) {
          setComparisonPair([data[0], data[1]]);
        }
      });
  }, []);


  const handleResize = (event, { size }) => {
    setWidth(size.width);
    setHeight(size.width + dropdownsHeight);
  };


  return (
    <div>
      <Layout>
        <Header style={{ height: 60, paddingInline: 10, backgroundColor: '#7dbcea', fontSize: 20 }}>
          Interactive Reward Elicitation
        </Header>
      </Layout>
      <Layout style={{ height: 920 }}>
        <div className="embedding-view-container">

          <ResizableBox className="box" width={width} height={height} onResize={handleResize} onResizeStop={() => setResizeKey(key => !key)}>
            <NewEmbeddingView componentId={1} globalBrushedPoints={brushedPoints} setGlobalBrushedPoints={setBrushedPoints} resizeKey={resizeKey} setDropdownsHeight={setDropdownsHeight}/>
          </ResizableBox>
          <ResizableBox className="box" width={width} height={height} onResize={handleResize}onResizeStop={() => setResizeKey(key => !key)}>
            <NewEmbeddingView componentId={2} globalBrushedPoints={brushedPoints} setGlobalBrushedPoints={setBrushedPoints} resizeKey={resizeKey} setDropdownsHeight={setDropdownsHeight}/>
          </ResizableBox>
          <ResizableBox className="box" width={width} height={height} onResize={handleResize}onResizeStop={() => setResizeKey(key => !key)}>
            <NewEmbeddingView componentId={3} globalBrushedPoints={brushedPoints} setGlobalBrushedPoints={setBrushedPoints} resizeKey={resizeKey} setDropdownsHeight={setDropdownsHeight}/>
          </ResizableBox>
          <ResizableBox className="box" width={width} height={height} onResize={handleResize}onResizeStop={() => setResizeKey(key => !key)}>
            <NewEmbeddingView componentId={4} globalBrushedPoints={brushedPoints} setGlobalBrushedPoints={setBrushedPoints} resizeKey={resizeKey} setDropdownsHeight={setDropdownsHeight}/>
          </ResizableBox>
        </div>
        <Sider width={18} style={{ backgroundColor: '#eee' }}></Sider>
        <Sider width={1080} style={{ backgroundColor: '#eee' }}>
          <div className='pane'>
            <div className='header'>Sample View</div>
            <Layout style={{ height: 880 }}>
              <Sider width={450} style={{ backgroundColor: '#eee' }}>
                {<BehaviorGroupView selectedBehaviors={brushedPoints} selectBehavior={setBrushedPoints} embeddingData={filteredEmbeddingData} />}
              </Sider>
              {/* <Sider width={610} style={{ backgroundColor: '#eee' }}>
                <AnalysisPanel showGroup={showGroup} x1={x1} x2={x2} y1={y1} y2={y2} w1={1} w2={1} w3={1} w4={1} filters={filters} start={start} end={end} updateRange={updateRange} addFilter={addFilter} />
              </Sider> */}
              <Sider width={500} style={{ backgroundColor: '#eee' }}>
                <ComparisonView comparisonPair={comparisonPair} />
              </Sider>
            </Layout>
          </div>
        </Sider>
      </Layout>
      <Layout>
        <Footer style={{ height: 20 }}>
          <div style={{ marginTop: -10 }}>
            <a href='https://github.com/jankomp/interactive_reward_elicitation'>https://github.com/jankomp/interactive_reward_elicitation</a>
          </div>
        </Footer>
      </Layout>
    </div>
  );
};

export default Dashboard;
