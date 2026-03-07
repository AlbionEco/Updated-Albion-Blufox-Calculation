import React, { useState } from 'react';
import { Printer, Calculator, FileText, Zap, Info } from 'lucide-react';

const BiologicalCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    flow: 0,
    bodi: 0,
    bodo: 0,
    nh4: 0,
    fm: 0,
    mlss: 8000,
    membraneType: 10,
    flux: 15,
    o2transfer: 'airfine1',
    air: '3SWD'
  });

  const [results, setResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const calculate = () => {
    const { flow, bodi, bodo, nh4, fm, mlss, membraneType, flux, o2transfer, air } = inputs;

    let o2transferrate = 0;
    if (o2transfer === "airfine1") {
      if (air === "3SWD") o2transferrate = 0.15;
      else if (air === "4SWD") o2transferrate = 0.2;
      else if (air === "5SWD") o2transferrate = 0.3;
      else if (air === "6SWD") o2transferrate = 0.36;
    } else {
      if (air === "3SWD") o2transferrate = 0.24;
      else if (air === "4SWD") o2transferrate = 0.32;
      else if (air === "5SWD") o2transferrate = 0.4;
      else if (air === "6SWD") o2transferrate = 0.48;
    }

    let difCalculation = 0;
    if (o2transfer === "airfine1") {
      if (o2transferrate === 0.15) difCalculation = 7.5;
      else if (o2transferrate === 0.2) difCalculation = 6.25;
      else if (o2transferrate === 0.3) difCalculation = 5.5;
      else difCalculation = 5.5;
    } else {
      if (o2transferrate === 0.24) difCalculation = 12;
      else if (o2transferrate === 0.32) difCalculation = 10;
      else if (o2transferrate === 0.4) difCalculation = 8.5;
      else difCalculation = 8.5;
    }

    const bodI = bodi / 1000;
    const workingHr = 24;
    const o2req = 1.2;
    const o2reqnh4 = 4.6;
    const alpha = 0.8;
    const beta = 0.7;
    const density = 1.2;
    const percentageofo2 = 0.215;

    const mlvss = (mlss * 0.8) / 1000;
    const volumeOfAerationtank = parseFloat(((flow * bodI) / (fm * mlvss)).toFixed(2));
    const detentionTime = Math.round((volumeOfAerationtank / flow) * 24);
    const noOfMembrane = Math.ceil((flow * 1000) / (membraneType * flux * 20));
    const totalSqMeter = noOfMembrane * membraneType;
    const membraneAir = parseFloat((totalSqMeter * 0.3).toFixed(2));
    const PermeateFlow = parseFloat((flow / 20).toFixed(2));
    const backwashFlow = parseFloat((PermeateFlow * 1.5).toFixed(2));
    const backwashtankvolume = parseFloat((((backwashFlow * 1000) / 60) * 4).toFixed(2));
    const RASpumpFlow = parseFloat(((flow / 24) * 3).toFixed(2));
    const bodload = (bodi * flow) / 1000;
    const oxygenRequired = bodload * o2req;
    const airRequired = parseFloat((oxygenRequired / (alpha * beta * o2transferrate * density * percentageofo2 * 24)).toFixed(2));
    const noOfDiffuserforAt = Math.round(airRequired / difCalculation);
    const nh4load = (nh4 * flow) / 1000;
    const oxygenRequiredNh4 = nh4load * o2reqnh4;
    const airRequiredForNh4 = parseFloat((oxygenRequiredNh4 / (alpha * beta * o2transferrate * density * percentageofo2 * 24)).toFixed(2));
    const totalAirRequired = parseFloat((parseFloat(airRequired.toString()) + parseFloat(airRequiredForNh4.toString())).toFixed(2));
    const noOfdiffuserfornh4Removal = Math.round(airRequiredForNh4 / difCalculation);
    const totaldiffuser = noOfdiffuserfornh4Removal + noOfDiffuserforAt;

    setResults({
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
      totaldiffuser,
      o2transferrate,
      difCalculation
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 pb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Biological Treatment</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">System Calculation</p>
        </div>
        <div className="text-right">
          <p className="text-blue-600 font-black text-2xl tracking-tighter">BLUFOX</p>
          <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">Ecoventures LLP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="xl:col-span-4 space-y-6 no-print">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Input Parameters</h2>
            </div>

            <div className="space-y-5">
              <TechnicalInput label="Flow" unit="KLD" id="flow" value={inputs.flow} onChange={handleInputChange} />

              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="BODi" unit="mg/L" id="bodi" value={inputs.bodi} onChange={handleInputChange} />
                <TechnicalInput label="BODo" unit="mg/L" id="bodo" value={inputs.bodo} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="NH4" unit="mg/L" id="nh4" value={inputs.nh4} onChange={handleInputChange} />
                <TechnicalInput label="F/M" unit="Metcalf" id="fm" value={inputs.fm} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MLSS</label>
                  <select
                    id="mlss"
                    value={inputs.mlss}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="8000">8000</option>
                    <option value="10000">10000</option>
                    <option value="12000">12000</option>
                  </select>
                </div>


                {/* flux */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flux</label>
                  <select
                    id="flux"
                    value={inputs.flux}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    {[8, 10, 12, 14, 15, 18, 20, 25].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>



              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">O2 Transfer @</label>
                  <select
                    id="o2transfer"
                    value={inputs.o2transfer}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="airfine1">Airfine - 1</option>
                    <option value="airfine3">Airfine - 3</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SWD</label>
                  <select
                    id="air"
                    value={inputs.air}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="3SWD">3SWD</option>
                    <option value="4SWD">4SWD</option>
                    <option value="5SWD">5SWD</option>
                    <option value="6SWD">6SWD</option>
                  </select>
                </div>

                {/* Membrane Type */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Membrane Type (Sq. mtr)</label>
                  <select
                    id="membraneType"
                    value={inputs.membraneType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    {[6, 9, 10, 12, 12.5, 20, 30, 34.4, 40].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>



              <button
                type="button"
                onClick={calculate}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group"
              >
                <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                CALCULATE RESULTS
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-8">
          {results ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center no-print">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="font-black italic uppercase tracking-tight">Biological Treatment Calculation Sheet</h3>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white">
                  {/* Company Header */}
                  <div className="px-6 py-8 bg-blue-50 border-b-2 border-slate-900">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Blufox Ecoventures LLP</h2>
                        <p className="text-[11px] text-slate-600 max-w-md leading-relaxed font-medium">
                          1908, The Junomoneta Tower, Beside Rajhans Multiplex,
                          <br />Adajan Hazira Main Road, Pal, Surat 395009 Gujarat, India
                        </p>
                        <div className="flex gap-4 text-[10px] text-blue-600 font-bold pt-1">
                          <span><a href="mailto:info@blufoxmembranes.com">info@blufoxmembranes.com</a></span>
                          <span><a href="tel:+919727822279">+91 97278 22279</a></span>
                          <span><a href="https://www.blufoxmembranes.com" target="_blank" rel="noopener noreferrer">www.blufoxmembranes.com</a></span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-blue-600 font-bold pt-1">
                          <span><a href="mailto:blufox.ecoventures@gmail.com">blufox.ecoventures@gmail.com</a></span>
                          <span> <a href="tel:+919099022279"> +91 90990 22279</a></span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <img src="/bluefox-logo-with-tagline.png" alt="blufox logo" className="h-14 w-auto" />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-slate-900 text-white text-center text-sm font-black uppercase tracking-[0.4em] italic border-b border-slate-900">
                    Biological Treatment System
                  </div>

                  <div className="bg-white print:bg-white ">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th colSpan={3} className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">System Parameters & Results</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 ">
                              <TableRow label="Flow" value={inputs.flow} unit="KLD" />
                              <TableRow label="BODi" value={inputs.bodi} unit="mg/L" />
                              <TableRow label="BODo" value={inputs.bodo} unit="mg/L" />
                              <TableRow label="F/M" value={inputs.fm} unit="Metcalf" />
                              <TableRow label="MLSS" value={inputs.mlss} unit="Metcalf" />
                              <TableRow label="Membrane Type" value={inputs.membraneType} unit="m²" />
                              <TableRow label="Flux" value={inputs.flux} unit="LMH" />
                              <TableRow label="Airfine" value={inputs.o2transfer === 'airfine1' ? 'Airfine - 1' : 'Airfine - 3'} />
                              <TableRow label="SWD" value={inputs.air} />
                              <TableRow label="NH4" value={inputs.nh4} unit="mg/L" />
                        <TableRow label="Volume of Aeration Tank" value={results.volumeOfAerationtank} unit="m³" highlight />
                        <TableRow label="Detention Time" value={results.detentionTime} unit="hrs" />
                        <TableRow label="No. of Membrane" value={results.noOfMembrane} />
                        <TableRow label="Total Sq mtr" value={results.totalSqMeter} unit="m²" />
                        <TableRow label="Air Required - MBR Membrane" value={results.membraneAir} unit="m³/hr" highlight />
                        <TableRow label="MBR Permeate Pump Flow" value={results.PermeateFlow} unit="m³/hr" />
                        <TableRow label="MBR B/W Pump Flow" value={results.backwashFlow} unit="m³/hr" />
                        <TableRow label="B/W Tank Volume" value={results.backwashtankvolume} unit="Liters" />
                        <TableRow label="MBR RAS Pump Flow" value={results.RASpumpFlow} unit="m³/hr" />
                        <TableRow label="Air Required (Aeration)" value={results.airRequired} unit="m³/hr" />
                        <TableRow label="Air Required (NH4)" value={results.airRequiredForNh4} unit="m³/hr" />

                        <tr className="bg-slate-900 text-white">
                          <td className="px-6 py-3 text-xs font-black uppercase tracking-widest">Total Air Required (Aeration + NH4)</td>
                          <td className="px-6 py-3 text-right font-mono text-sm font-bold">{results.totalAirRequired}</td>
                          <td className="px-6 py-3 text-left w-20 text-[11px] font-black uppercase">m³/hr</td>
                        </tr>
                        <tr className="bg-blue-600 text-white">
                          <td className="px-6 py-3 text-xs font-black uppercase tracking-widest">Total Air Diffusers (Aeration + NH4)</td>
                          <td className="px-6 py-3 text-right font-mono text-sm font-bold">{results.totaldiffuser}</td>
                          <td className="px-6 py-3 text-left w-20 text-[11px] font-black uppercase">Nos.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-red-50/50 px-6 py-6 border-t border-slate-200">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest">Note:</p>
                      <ul className="text-[11px] text-red-700/80 space-y-1 font-bold italic">
                        <li>* Calculations are based on standard Metcalf & Eddy parameters.</li>
                        <li>* O2 transfer rates are specific to Airfine diffuser specifications.</li>
                        <li>* This projection is for biological treatment sizing only.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
              <Zap className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-black uppercase tracking-[0.2em] text-sm">Awaiting Parameter Input</p>
              <p className="text-xs mt-2">Configure system variables and run calculation to view results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TechnicalInput: React.FC<{ label: string; unit: string; id: string; value: any; onChange: any }> = ({ label, unit, id, value, onChange }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <span className="text-[11px] text-slate-500 uppercase">{unit}</span>
    </div>
    <input
      type="number"
      step="any"
      id={id}
      value={value}
      onChange={onChange}
      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
    />
  </div>
);

const TableRow: React.FC<{ label: React.ReactNode; value: any; unit?: string; highlight?: boolean; indent?: boolean }> = ({ label, value, unit, highlight, indent }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className={`px-4 py-2.5 text-[13px] font-medium text-slate-600 ${indent ? 'pl-8' : ''}`}>{label}</td>
    <td className="px-4 py-2.5 text-right">
      <span className={`font-mono text-xs font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
    </td>
    <td className="px-4 py-2.5 text-left w-20">
      {unit && <span className="text-[11px] text-slate-500 uppercase">{unit}</span>}
    </td>
  </tr>
);

export default BiologicalCalculator;
