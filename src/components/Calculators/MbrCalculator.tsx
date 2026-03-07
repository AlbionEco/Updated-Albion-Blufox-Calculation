import React, { useState } from 'react';
import { Printer, Calculator, FileText, Info } from 'lucide-react';

const MbrCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    projName: '',
    projCode: '',
    flow: 0,
    bodi: 0,
    bodo: 0,
    nh4: 0,
    fm: 0.1,
    mlss: 8000,
    membraneType: 6,
    flux: 12,
    o2transferrate: 0.15,
    airfine: 'airfine1',
    air: '3SWD',
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

    const workingHr = 24;
    const o2req = 1.2;
    const o2reqnh4 = 4.6;
    const alpha = 0.8;
    const beta = 0.7;
    const density = 1.2;
    const percentageofo2 = 0.215;

    let difcalc = 0;
    if (inputs.airfine === "airfine1") {
      if (inputs.air === "3SWD") difcalc = 7.5;
      else if (inputs.air === "4SWD") difcalc = 6.25;
      else if (inputs.air === "5SWD") difcalc = 5.5;
      else if (inputs.air === "6SWD") difcalc = 0;
    } else if (inputs.airfine === "airfine3") {
      if (inputs.air === "3SWD") difcalc = 12;
      else if (inputs.air === "4SWD") difcalc = 10;
      else if (inputs.air === "5SWD") difcalc = 8.5;
      else if (inputs.air === "6SWD") difcalc = 0;
    }

    const mlvss = (inputs.mlss * 0.8) / 1000;
    const bodI = inputs.bodi / 1000;
    
    const volumeOfAerationtank = parseFloat(((inputs.flow * bodI) / (inputs.fm * mlvss)).toFixed(2));
    const detentionTime = Math.round((volumeOfAerationtank / inputs.flow) * workingHr);
    const noOfMembrane = Math.ceil((inputs.flow * 1000) / (inputs.membraneType * inputs.flux * 20));
    const totalSqMeter = noOfMembrane * inputs.membraneType;
    const membraneAir = parseFloat((totalSqMeter * 0.3).toFixed(2));
    const PermeateFlow = parseFloat((inputs.flow / 20).toFixed(2));
    const backwashFlow = parseFloat((PermeateFlow * 1.5).toFixed(2));
    const backwashtankvolume = totalSqMeter * 2;
    const RASpumpFlow = parseFloat(((inputs.flow / 24) * 3).toFixed(2));

    const bodload = (inputs.bodi * inputs.flow) / 1000;
    const oxygenRequired = bodload * o2req;
    const airRequired = parseFloat((oxygenRequired / (alpha * beta * inputs.o2transferrate * density * percentageofo2 * workingHr)).toFixed(2));

    const nh4load = (inputs.nh4 * inputs.flow) / 1000;
    const oxygenRequiredNh4 = nh4load * o2reqnh4;
    const airRequiredForNh4 = parseFloat((oxygenRequiredNh4 / (alpha * beta * inputs.o2transferrate * density * percentageofo2 * workingHr)).toFixed(2));

    const totalAirRequired = parseFloat((Number(airRequired) + Number(airRequiredForNh4)).toFixed(2));
    
    const noOfDiffuserforAt = difcalc > 0 ? Math.round(airRequired / difcalc) : 0;
    const noOfdiffuserfornh4Removal = difcalc > 0 ? Math.round(airRequiredForNh4 / difcalc) : 0;
    const totaldiffuser = noOfdiffuserfornh4Removal + noOfDiffuserforAt;

    setOutputs({
      volumeOfAerationtank,
      detentionTime,
      noOfMembrane,
      totalSqMeter,
      membraneAir,
      PermeateFlow,
      backwashFlow,
      backwashtankvolume,
      RASpumpFlow,
      airRequired,
      airRequiredForNh4,
      totalAirRequired,
      totaldiffuser
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">Aeration Calculation</h1>
              <p className="text-green-100 text-[10px] uppercase tracking-wider">MBR Technology</p>
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
            <div className="lg:col-span-7 space-y-3 no-print">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Input Parameters</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <CompactInput label="Flow (KLD)" id="flow" value={inputs.flow} onChange={handleInputChange} required />
                <CompactInput label="BODi (mg/l)" id="bodi" value={inputs.bodi} onChange={handleInputChange} required />
                <CompactInput label="BODo (mg/l)" id="bodo" value={inputs.bodo} onChange={handleInputChange} required />
                <CompactInput label="NH₄ (mg/l)" id="nh4" value={inputs.nh4} onChange={handleInputChange} required />
                <CompactInput label="F/M (Metcalf)" id="fm" value={inputs.fm} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">MLSS (Metcalf)</label>
                  <select id="mlss" value={inputs.mlss} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="8000">8000</option>
                    <option value="10000">10000</option>
                    <option value="12000">12000</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Membrane Type (Sq mtr)</label>
                  <select id="membraneType" value={inputs.membraneType} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    {[6, 9, 10, 12, 12.5, 20, 22, 28, 30, 34.4, 40].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Flux (LMH)</label>
                  <select id="flux" value={inputs.flux} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    {[8, 10, 12, 15, 18, 20, 25, 30].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">O₂ Transfer Rate</label>
                  <select id="o2transferrate" value={inputs.o2transferrate} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="0.15">0.15</option>
                    <option value="0.2">0.20</option>
                    <option value="0.25">0.25</option>
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Diffuser Model</label>
                  <div className="flex gap-1">
                    <select id="airfine" value={inputs.airfine} onChange={handleInputChange} className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                      <option value="airfine1">Airfine-1</option>
                      <option value="airfine3">Airfine-3</option>
                    </select>
                    <select id="air" value={inputs.air} onChange={handleInputChange} className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                      <option value="3SWD">3SWD</option>
                      <option value="4SWD">4SWD</option>
                      <option value="5SWD">5SWD</option>
                      <option value="6SWD">6SWD</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded shadow transition-all flex items-center justify-center gap-2 text-sm">
                <Calculator className="w-3.5 h-3.5" /> Calculate
              </button>
            </div>

            {/* Output Data */}
            <div className={`lg:col-span-5 space-y-3 transition-all duration-500 ${outputs ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Output Results</h2>
              </div>

              {!outputs ? (
                <div className="h-full flex items-center justify-center text-gray-400 italic py-8 border border-dashed border-gray-200 rounded text-[11px]">
                  Waiting for calculation...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  <ResultItem label="Aeration Tank Vol" value={outputs.volumeOfAerationtank} unit="m³" highlight />
                  <ResultItem label="Detention Time" value={outputs.detentionTime} unit="Hrs" />
                  <ResultItem label="Membrane Qty" value={outputs.noOfMembrane} unit="Nos" />
                  <ResultItem label="Total Sq Meter" value={outputs.totalSqMeter} unit="m²" />
                  <ResultItem label="Membrane Air" value={outputs.membraneAir} unit="m³/h" highlight />
                  <ResultItem label="Permeate Flow" value={outputs.PermeateFlow} unit="m³/h" />
                  <ResultItem label="Backwash Flow" value={outputs.backwashFlow} unit="m³/h" />
                  <ResultItem label="B/W Tank Vol" value={outputs.backwashtankvolume} unit="L" />
                  <ResultItem label="RAS Pump Flow" value={outputs.RASpumpFlow} unit="m³/h" />
                  <ResultItem label="Air (Aeration)" value={outputs.airRequired} unit="m³/h" />
                  <ResultItem label="Air (NH₄)" value={outputs.airRequiredForNh4} unit="m³/h" />
                  
                  <div className="p-2 bg-green-600 rounded text-white shadow-sm mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium opacity-90 uppercase">Total Air (A+N)</span>
                      <span className="text-base font-bold">{outputs.totalAirRequired} m³/h</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/20">
                      <span className="text-[10px] font-medium opacity-90 uppercase">Total Diffusers</span>
                      <span className="text-base font-bold">{outputs.totaldiffuser} Qty</span>
                    </div>
                  </div>
                  
                  <button type="button" onClick={() => window.print()} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-1.5 rounded text-[11px] transition-all flex items-center justify-center gap-2 mt-1 no-print">
                    <Printer className="w-3 h-3" /> Print
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

export default MbrCalculator;
