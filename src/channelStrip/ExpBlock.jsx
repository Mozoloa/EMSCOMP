import React from 'react';
import DecibelMeter from '../elements/DecibelMeter.jsx';
import Knob from '../elements/Knob.jsx';
import CompGraph from './CompGraph.jsx';
import * as Util from '../Utilities.js';

function ExpBlock({ props, manifest, paramValues, handleValueChange }) {
    // if props.events is undefined, return null
    return (
        <div id="compBlock">
            <div className='group-container'>
                {/* Env signal meter */}
                <DecibelMeter
                    event={props.events.comp_env}
                />
                {/* Compression curve graph */}
                <CompGraph
                    threshold={props.comp_main_threshold}
                    ratio={props.comp_main_ratio}
                    knee={props.comp_main_knee}
                    events={props.events}
                />

                {/* Gain Reduction meter */}
                <DecibelMeter
                    event={props.events.comp_gr}
                    invert={true}
                />

                {/* Output signal meter */}
                <DecibelMeter
                    event={props.events.main_outputL}
                    invert={false}
                />

            </div>
            {/* Create a container for each parameter group */}
            {['comp_main', 'env', 'mix'].map(groupKey => {
                return (
                    <div key={groupKey} id={groupKey} className="group-container">
                        <div className="group-params">
                            {/* Filter and map parameters that belong to the current group */}
                            {manifest.parameters.filter(param => param.paramId.startsWith(groupKey)).map(param => {
                                const buttonValue = Util.formatValueForButton(paramValues[param.paramId], param.paramId, param.min, param.max, param.log);
                                const buttonDefaultValue = Util.formatValueForButton(param.defaultValue, param.paramId, param.min, param.max, param.log);
                                const accentColor = param.hue ? `hsl(${param.hue},100%, 60%)` : '#ccc';
                                return (
                                    <div key={param.paramId} id={param.paramId} className={`group-param}`}>
                                        <div id='knob-name'>{param.name}</div>
                                        <Knob
                                            value={buttonValue}
                                            defaultValue={buttonDefaultValue}
                                            onChange={(newValue) => handleValueChange(param, newValue)}
                                            name={param.name}
                                            paramId={param.paramId}
                                            accentColor={accentColor}
                                            knobColor="#050505"
                                        />
                                        <div className="param-value" style={{ color: accentColor }}>
                                            {`${Util.formatValueForDisplay(paramValues[param.paramId], param.paramId)}`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}


export default React.memo(ExpBlock);