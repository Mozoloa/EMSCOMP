import React, { useState, useEffect } from 'react';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import Knob from './Knob.jsx';
import manifest from '../public/manifest.json';


function ErrorAlert({ message, reset }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Interface(props) {
  const colorProps = {
    meterColor: '#EC4899',
    knobColor: '#FFFFFF',
    thumbColor: '#F8FAFC',
  };

  // Initialize paramValues state with default values from the manifest
  const [paramValues, setParamValues] = useState(() => {
    const initialParams = {};
    manifest.parameters.forEach(group => {
      group.params.forEach(param => {
        initialParams[group.paramId + param.paramId] = props[group.paramId + param.paramId] ?? param.defaultValue;
      });
    });
    return initialParams;
  });

  useEffect(() => {
    manifest.parameters.forEach(group => {
      group.params.forEach(param => {
        const fullParamId = group.paramId + param.paramId;
        if (props[fullParamId] !== undefined && props[fullParamId] !== paramValues[fullParamId]) {
          setParamValues(currentValues => ({
            ...currentValues,
            [fullParamId]: props[fullParamId]
          }));
        }
      });
    });
  }, [props, paramValues]);

  const handleValueChange = (fullParamId, newValue) => {
    setParamValues({ ...paramValues, [fullParamId]: newValue });
    props.requestParamValueUpdate(fullParamId, newValue);
  };

  const formatValueForDisplay = (value) => {
    return Math.round(value * 10) / 10;
  };

  const getPrecision = (paramId) => {
    if (paramId === 'freq' || paramId === 'hpforder') return 1; // integer values
    if (paramId === 'q' || paramId === 'hpfq') return 0.1; // one decimal place
    if (paramId === 'gain') return 0.5; // half steps
    return 1; // default precision
  };

  return (
    <div id='main'>
      {props.error && (<ErrorAlert message={props.error.message} reset={props.resetErrorState} />)}
      <div id='controls'>
        {manifest.parameters.map(group => (
          <div key={group.paramId} id={group.paramId} className="group-container">
            <div className="group-title">{group.name}</div>
            <div className="group-params">
              {group.params.map(param => {
                const fullParamId = group.paramId + param.paramId;
                return (
                  <div key={fullParamId} id={fullParamId} className="flex flex-col items-center">
                    <Knob
                      value={paramValues[fullParamId]}
                      onChange={(newValue) => handleValueChange(fullParamId, newValue)}
                      min={param.min}
                      max={param.max}
                      precision={getPrecision(param)}
                      log={param.log ?? false}
                      {...colorProps}
                    />
                    <div className="text-sm text-slate-50 text-center font-light">
                      {param.name}
                    </div>
                    <div className="text-sm text-pink-500 text-center font-light">
                      {`${formatValueForDisplay(paramValues[fullParamId])}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}