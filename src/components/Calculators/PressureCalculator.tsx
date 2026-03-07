import React, { useState } from 'react';
import { Printer, Calculator, FileText, Info } from 'lucide-react';

const PressureCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    projName: '',
    projCode: '',
    inputType: 'PlantCapacity',
    PlantCapacityorFlow: 0,
    Velocity: 0,
    contactTime: 0,
  });

  const [outputs, setOutputs] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();

    const pi = 3.147;
    let flow = 0;
    let PlantCapacity = 0;

    if (inputs.inputType === 'PlantCapacity') {
      PlantCapacity = inputs.PlantCapacityorFlow;
      flow = PlantCapacity / 20;
    } else {
      flow = inputs.PlantCapacityorFlow;
      PlantCapacity = flow * 20;
    }

    const flowPerMin = flow / 60;
    const area = flow / inputs.Velocity;
    const diaOfVesselreq = 2 * Math.sqrt(area / pi);
    const ReqVesselDia = Math.round(diaOfVesselreq * 1000);
    const ReqVolume = flowPerMin * inputs.contactTime * 1.4;
    const height = ReqVolume / area;
    const VesselHOS = Math.ceil(height * 1000);

    const v1 = (ReqVolume * 1000) * 0.55;
    const dv1 = v1 * 1.56;
    const v2 = (ReqVolume * 1000) * 0.50;
    const dv2 = v2 * 0.55;
    const v3 = (ReqVolume * 1000) * 0.60;
    const dv3 = v3 * 1.26;

    setOutputs({
      flow,
      ReqVesselDia,
      ReqVolume,
      VesselHOS,
      v1, dv1,
      v2, dv2,
      v3, dv3
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">Filter Pressure Calculation</h1>
              <p className="text-green-100 text-[10px] uppercase tracking-wider">Albion Ecotech</p>
            </div>
          </div>
          <img
            src="/Albion high - logo.jpg"
            alt="Albion Logo"
            className="h-12 bg-white p-1 rounded"
          />
        </div>

        <form onSubmit={calculate} className="p-4 space-y-4">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-green-50/50 p-3 rounded border border-green-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Project Name</label>
              <input type="text" placeholder='Project Name' id="projName" value={inputs.projName} onChange={handleInputChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Project Code</label>
              <input type="text" placeholder='Project Code' id="projCode" value={inputs.projCode} onChange={handleInputChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Input Data */}
            <div className="lg:col-span-6 space-y-4 no-print">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Input Parameters</h2>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Input Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="radio" name="inputType" value="PlantCapacity" checked={inputs.inputType === 'PlantCapacity'} onChange={() => setInputs(p => ({...p, inputType: 'PlantCapacity'}))} />
                      Plant Capacity
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="radio" name="inputType" value="Flow" checked={inputs.inputType === 'Flow'} onChange={() => setInputs(p => ({...p, inputType: 'Flow'}))} />
                      Flow
                    </label>
                  </div>
                </div>

                <CompactInput 
                  label={inputs.inputType === 'PlantCapacity' ? "Plant Capacity (m³/day)" : "Flow (m³/h)"} 
                  id="PlantCapacityorFlow" 
                  value={inputs.PlantCapacityorFlow} 
                  onChange={handleInputChange} 
                  required 
                />
                <CompactInput label="Velocity (m³/m²/hr)" id="Velocity" value={inputs.Velocity} onChange={handleInputChange} required />
                <CompactInput label="Contact Time (Min)" id="contactTime" value={inputs.contactTime} onChange={handleInputChange} required />
                
                <div className="p-2 bg-red-50 border-l-2 border-red-400 rounded">
                  <p className="text-[9px] text-red-700 leading-tight">
                    <span className="font-bold">Note:</span> Modified the contact time as per vessel shell height 1800mm/2000mm (If Client Required more height than only change Contact Time accordingly.)
                  </p>
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded shadow transition-all flex items-center justify-center gap-2 text-sm">
                <Calculator className="w-3.5 h-3.5" /> Calculate
              </button>
            </div>

            {/* Output Data */}
            <div className={`lg:col-span-6 space-y-3 transition-all duration-500 ${outputs ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Output Results</h2>
              </div>

              {!outputs ? (
                <div className="h-full flex items-center justify-center text-gray-400 italic py-8 border border-dashed border-gray-200 rounded text-[11px]">
                  Waiting for calculation...
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <ResultItem label="Flow" value={outputs.flow.toFixed(2)} unit="m³/h" />
                    <ResultItem label="Vessel Dia" value={outputs.ReqVesselDia} unit="mm" highlight />
                    <ResultItem label="Vessel Vol" value={outputs.ReqVolume.toFixed(2)} unit="m³" />
                    <ResultItem label="Vessel Height" value={outputs.VesselHOS} unit="mm" />
                  </div>

                  <div className="overflow-hidden border border-gray-200 rounded">
                    <table className="w-full text-[10px] text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-1.5 font-bold">Media Type</th>
                          <th className="p-1.5 font-bold">Vol (L)</th>
                          <th className="p-1.5 font-bold">Qty (kg)</th>
                          <th className="p-1.5 font-bold">Density</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="p-1.5">Sand (55%)</td>
                          <td className="p-1.5">{outputs.v1.toFixed(1)}</td>
                          <td className="p-1.5 font-bold">{outputs.dv1.toFixed(1)}</td>
                          <td className="p-1.5 text-gray-400">1.56</td>
                        </tr>
                        <tr>
                          <td className="p-1.5">Carbon (50%)</td>
                          <td className="p-1.5">{outputs.v2.toFixed(1)}</td>
                          <td className="p-1.5 font-bold">{outputs.dv2.toFixed(1)}</td>
                          <td className="p-1.5 text-gray-400">0.55</td>
                        </tr>
                        <tr>
                          <td className="p-1.5">AFM (60%)</td>
                          <td className="p-1.5">{outputs.v3.toFixed(1)}</td>
                          <td className="p-1.5 font-bold">{outputs.dv3.toFixed(1)}</td>
                          <td className="p-1.5 text-gray-400">1.26</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[9px] text-gray-500 italic">
                    * Above media volume is as per Filter Nozzle type distribution system.
                  </p>
                  
                  <button type="button" onClick={() => window.print()} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-1.5 rounded text-[11px] transition-all flex items-center justify-center gap-2 no-print">
                    <Printer className="w-3 h-3" /> Print Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const CompactInput: React.FC<{ label: string; id: string; value: any; onChange: any; required?: boolean }> = ({ label, id, value, onChange, required }) => (
  <div className="space-y-0.5">
    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{label}</label>
    <input type="number" step="any" id={id} value={value} onChange={onChange} className="w-full px-1.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded outline-none focus:border-green-400" required={required} />
  </div>
);

const ResultItem: React.FC<{
  label: string;
  value: any;
  unit?: string;
  highlight?: boolean;
}> = ({ label, value, unit, highlight }) => (
  <div
    className={`flex items-center px-2 py-1 rounded border ${
      highlight
        ? "bg-emerald-50 border-emerald-100"
        : "bg-white border-gray-50"
    }`}
  >
    {/* Left text */}
    <span className="flex-1 text-[10px] text-gray-600 font-medium">
      {label}
    </span>

    {/* Middle value (right aligned, fixed width) */}
    <span
      className={`w-24 text-right font-bold text-xs ${
        highlight ? "text-emerald-700" : "text-gray-900"
      }`}
    >
      {value}
    </span>

    {/* Right unit (fixed width, right aligned) */}
    {unit && (
      <span className="w-12 text-right text-[8px] text-gray-400 font-bold">
        {unit}
      </span>
    )}
  </div>
);

export default PressureCalculator;
