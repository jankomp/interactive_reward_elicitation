import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import './Dashboard.css';
import EmbeddingView from './EmbeddingView';
// import BehaviorView from './BehaviorView';
// import BehaviorGroupView from './BehaviorGroupView';
// import AnalysisPanel from './AnalysisPanel';
import { env } from './constants';

const { Header, Sider, Footer } = Layout;

const Dashboard = () => {
  const [run, setRun] = useState(0);
  const [r, setR] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(200);
  const [x1, setX1] = useState(null);
  const [x2, setX2] = useState(null);
  const [y1, setY1] = useState(null);
  const [y2, setY2] = useState(null);
  const [showGroup, setShowGroup] = useState(true);
  const [embeddingData, setEmbeddingData] = useState(null);
  const [filterEmbeddingData, setFilterEmbeddingData] = useState(null);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    fetch(`./logs/embedding_${env}.json`)
      .then((res) => res.json())
      .then((data) => {
        setEmbeddingData(data);
        setFilterEmbeddingData(data);
      });
  }, []);

  const updateRunId = (run_id) => {
    setRun(Number(run_id).toFixed(1));
    setShowGroup(false);
  };

  const updateFilter = (x1, x2, y1, y2) => {
    const filteredData = embeddingData.filter((data) => data.x >= x1 && data.x <= x2 && data.y >= y1 && data.y <= y2);
    setX1(x1);
    setX2(x2);
    setY1(y1);
    setY2(y2);
    console.log(filteredData);
    setFilterEmbeddingData(filteredData);
    setShowGroup(true);
  };

  const addFilter = (filter) => {
    setFilters((prevFilters) => [...prevFilters, filter]);
  };

  const resetFilter = () => {
    setX1(null);
    setX2(null);
    setY1(null);
    setY2(null);
    setFilterEmbeddingData(embeddingData);
    setFilters([]);
  };

  const updateRange = (start, end) => {
    setStart(Math.floor(start));
    setEnd(Math.floor(end));
  };

  return (
    <div>
      <Layout>
        <Header style={{ height: 60, paddingInline: 10, backgroundColor: '#7dbcea', fontSize: 20 }}>
          Interactive Reward Elicitation
        </Header>
      </Layout>
      <Layout style={{ height: 920 }}>
        <Sider width={400} style={{ backgroundColor: '#eee' }}>
          <EmbeddingView
            embeddingData={filterEmbeddingData}
            filters={filters}
            run={run}
            r={r}
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
            updateWeights={updateRunId}
            updateFilter={updateFilter}
            resetFilter={resetFilter}
            showGroup={showGroup}
            updateShowGroup={setShowGroup}
          />
        </Sider>
        {/* <Sider width={18} style={{ backgroundColor: '#eee' }}></Sider>
        <Sider width={1080} style={{ backgroundColor: '#eee' }}>
          <div className='pane'>
            <div className='header'>Sample View</div>
            <Layout style={{ height: 880 }}>
              <Sider width={450} style={{ backgroundColor: '#eee' }}>
                {showGroup ? <BehaviorGroupView updateWeights={updateRunId} filterEmbeddingData={filterEmbeddingData} /> : <BehaviorView showGroup={showGroup} x1={x1} x2={x2} y1={y1} y2={y2} run={run} start={start} end={end} />}
              </Sider>
              <Sider width={610} style={{ backgroundColor: '#eee' }}>
                <AnalysisPanel showGroup={showGroup} x1={x1} x2={x2} y1={y1} y2={y2} w1={1} w2={1} w3={1} w4={1} filters={filters} start={start} end={end} updateRange={updateRange} addFilter={addFilter} />
              </Sider>
            </Layout>
          </div>
        </Sider> */}
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
