import React, { Component } from 'react'
import {Vega} from 'react-vega'

export default class Chart extends Component {
    
    render() {
        let spec = JSON.parse(this.props.spec);
        return (
            <div>
                <Vega spec={spec} actions={false} signalListeners={{"brush": this.props.handleSignals}}/> 
            </div>
        )
    }
}