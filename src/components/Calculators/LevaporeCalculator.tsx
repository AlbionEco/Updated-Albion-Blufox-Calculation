import React, { useState } from 'react';
import { Printer, Calculator, FileText, Info } from 'lucide-react';

const LevaporeCalculator: React.FC = () => {
  // Input State
  const [inputs, setInputs] = useState({
    projName: '',
    projCode: '',
    flow: 0,
    hours: 24,
    codi: 0,
    codo: 0,
    bodi: 0,
    bodo: 0,
    tssi: 0,
    tsso: 0,
    nh4: 0,
    nh4o: 0,
    lvCod: 4,
    mediaVolume: 0.10,
    o2transferrate: 0.15,
    airfine: 'airfine1',
    air: '3SWD',
    mlss: 5000,
  });

  // Output State
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

    const mlvss = (inputs.mlss * 80) / 100;
    const workingHr = 24;
    const o2req = 1.2;
    const alpha = 0.8;
    const beta = 0.7;
    const density = 1.2;
    const percentageofo2 = 0.215;
    const o2nh4 = 4.6;
    let difcalc = 0;

    const codiTotal = (inputs.flow * inputs.codi) / 1000;
    const codoTotal = (50 * inputs.flow) / 1000;
    const codoRemoval = parseFloat((codiTotal - codoTotal).toFixed(2));

    const bodiTotal = (inputs.bodi * inputs.flow) / 1000;
    const bodoTotal = (inputs.bodo * inputs.flow) / 1000;
    const bodRemoval = parseFloat((bodiTotal - bodoTotal).toFixed(2));

    const tssiTotal = (inputs.flow * inputs.tssi) / 1000;
    const tssoTotal = (inputs.flow * 5) / 1000;
    const tssRemoved = parseFloat((tssiTotal - tssoTotal).toFixed(2));

    const vIFAStank = parseFloat((codiTotal / inputs.lvCod).toFixed(2));
    const IFASmedia = parseFloat((vIFAStank * inputs.mediaVolume).toFixed(2));
    const fm = parseFloat((bodiTotal / (2 * vIFAStank * (mlvss / 1000))).toFixed(2));
    const detentionTime = parseFloat(((vIFAStank / inputs.flow) * workingHr).toFixed(2));
    const RASflow = parseFloat(((inputs.flow / inputs.hours) * 0.6).toFixed(1));
    const sludge = parseFloat((0.4 * codoRemoval + 0.48 * tssRemoved).toFixed(1));

    const bodload = bodRemoval;
    const oxygen = parseFloat((bodload * o2req).toFixed(2));

    if (inputs.airfine === "airfine1") {
      if (inputs.air === "3SWD") difcalc = 7.5;
      else if (inputs.air === "4SWD") difcalc = 6.25;
      else if (inputs.air === "5SWD") difcalc = 5.5;
      else if (inputs.air === "6SWD") difcalc = 0;
    } else {
      if (inputs.air === "3SWD") difcalc = 12;
      else if (inputs.air === "4SWD") difcalc = 10;
      else if (inputs.air === "5SWD") difcalc = 8.5;
      else if (inputs.air === "6SWD") difcalc = 0;
    }

    const airrequire = parseFloat(
      (oxygen / (alpha * beta * inputs.o2transferrate * density * percentageofo2 * workingHr)).toFixed(2)
    );

    const nodif = Math.round(airrequire / difcalc);
    const nh4load = parseFloat(((inputs.nh4 * inputs.flow) / 1000).toFixed(2));
    const oxygennh4 = parseFloat((nh4load * o2nh4).toFixed(2));

    const airreqnh4 = parseFloat(
      (oxygennh4 / (alpha * beta * inputs.o2transferrate * density * percentageofo2 * workingHr)).toFixed(2)
    );

    const airbydiffuser = Math.round(airreqnh4 / difcalc);
    const nettotalair = parseFloat((Number(airrequire) + Number(airreqnh4)).toFixed(2));
    const netdiffuser = Math.ceil(nodif + airbydiffuser);

    setOutputs({
      codoRemoval,
      bodRemoval,
      tssRemoved,
      vIFAStank,
      CAStank: vIFAStank,
      IFASmedia,
      fm,
      mlss: inputs.mlss,
      mlvss,
      detentionTime,
      RASflow,
      sludge,
      airrequired: airrequire,
      airreqnh4,
      nettotalair,
      netdiffuser
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
              <p className="text-green-100 text-[10px] uppercase tracking-wider">LEVAPORE Technology</p>
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
              <input
                type="text"
                id="projName"
                value={inputs.projName}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
                placeholder="Project name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Project Code</label>
              <input
                type="text"
                id="projCode"
                value={inputs.projCode}
                onChange={handleInputChange}
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none"
                placeholder="Project code"
              />
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
                <CompactInput label="Flow (m³/day)" id="flow" value={inputs.flow} onChange={handleInputChange} required />
                <CompactInput label="Working Hrs" id="hours" value={inputs.hours} onChange={handleInputChange} required />
                <CompactInput label="CODi (mg/l)" id="codi" value={inputs.codi} onChange={handleInputChange} required />
                <CompactInput label="CODo (mg/l)" id="codo" value={inputs.codo} onChange={handleInputChange} />
                <CompactInput label="BODi (mg/l)" id="bodi" value={inputs.bodi} onChange={handleInputChange} required />
                <CompactInput label="BODo (mg/l)" id="bodo" value={inputs.bodo} onChange={handleInputChange} required />
                <CompactInput label="TSSi (mg/l)" id="tssi" value={inputs.tssi} onChange={handleInputChange} required />
                <CompactInput label="TSSo (mg/l)" id="tsso" value={inputs.tsso} onChange={handleInputChange} />
                <CompactInput label="NH₄i (mg/l)" id="nh4" value={inputs.nh4} onChange={handleInputChange} required />
                <CompactInput label="NH₄o (mg/l)" id="nh4o" value={inputs.nh4o} onChange={handleInputChange} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Lv-COD (kg.COD/m³.d)</label>
                  <select id="lvCod" value={inputs.lvCod} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Media Volume (%)</label>
                  <select id="mediaVolume" value={inputs.mediaVolume} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="0.10">0.10</option>
                    <option value="0.15">0.15</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">O₂ Transfer Rate</label>
                  <select id="o2transferrate" value={inputs.o2transferrate} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="0.15">0.15</option>
                    <option value="0.2">0.2</option>
                    <option value="0.25">0.25</option>
                  </select>
                </div>
                <div className="space-y-1">
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

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Calculator className="w-3.5 h-3.5" />
                Calculate
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
                  <ResultItem label="COD Removal" value={outputs.codoRemoval} unit="kg/d" />
                  <ResultItem label="BOD Removal" value={outputs.bodRemoval} unit="kg/d" />
                  <ResultItem label="TSS Removal" value={outputs.tssRemoved} unit="kg/d" />
                  <ResultItem label="IFAS Tank Vol" value={outputs.vIFAStank} unit="m³" highlight />
                  <ResultItem label="CAS Tank Vol" value={outputs.CAStank} unit="m³" />
                  <ResultItem label="IFAS Media" value={outputs.IFASmedia} unit="m³" />
                  <ResultItem label="F/M Ratio" value={outputs.fm} unit="Metcalf" />
                  <ResultItem label="MLSS/MLVSS" value={`${outputs.mlss}/${outputs.mlvss}`} unit="mg/l" />
                  <ResultItem label="HRT" value={outputs.detentionTime} unit="Hrs" />
                  <ResultItem label="RAS Flow" value={outputs.RASflow} unit="m³/h" />
                  <ResultItem label="Sludge" value={outputs.sludge} unit="kg/d" />
                  <ResultItem label="Air Required (BOD Removal)" value={`${outputs.airrequired}`} unit="m³/h" />
                  <ResultItem label="Air Required (NH₄ Removal)" value={`${outputs.airreqnh4}`} unit="m³/h" />
                  <div className="p-2 bg-green-600 rounded text-white shadow-sm mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium opacity-90 uppercase">Total Air</span>
                      <span className="text-base font-bold">{outputs.nettotalair}<span className='ml-[10px]'>m³/h</span></span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/20">
                      <span className="text-[10px] font-medium opacity-90 uppercase">Diffusers</span>
                      <span className="text-base font-bold">{outputs.netdiffuser}<span className='ml-[10px]'>Qty</span></span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-1.5 rounded text-[11px] transition-all flex items-center justify-center gap-2 mt-1 no-print"
                  >
                    <Printer className="w-3 h-3" />
                    Print
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
    <input 
      type="number" 
      id={id} 
      value={value} 
      onChange={onChange} 
      className="w-full px-1.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white transition-all outline-none focus:border-green-400" 
      required={required} 
    />
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

export default LevaporeCalculator;
