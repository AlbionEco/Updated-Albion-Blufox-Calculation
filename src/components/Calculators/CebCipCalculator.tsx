import React, { useState } from 'react';
import { Printer, Calculator, FileText, Info } from 'lucide-react';

const CebCipCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    projName: '',
    projCode: '',
    RequiredPPM_backwash: 0,
    CapacityofPlant_backwash: 0,
    ChemicalSelection_backwash: '',
    Noofdaystorefill_backwash: 0,
    CapacityOfTank_backwash: 0,
    RequiredPPM_disinfection: 0,
    ChemicalRequired_disinfection: 'Hypo-10%',
    CapacityofPlant_disinfection: 0,
    Noofdaystorefill_disinfection: 0,
    CapacityOfTank_disinfection: 0,
    TotalMinutesInADay_disinfection: 0,
  });

  const [outputs, setOutputs] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const calculate = () => {
    let ChemicalConcentration_backwash = 0;
    const sel = inputs.ChemicalSelection_backwash;
    if (sel === "Hypo-10%") ChemicalConcentration_backwash = 0.1;
    else if (sel === "Hypo-12%") ChemicalConcentration_backwash = 0.12;
    else if (sel === "NaOH-23%") ChemicalConcentration_backwash = 0.23;
    else if (sel === "NaOH-48%") ChemicalConcentration_backwash = 0.48;
    else if (sel === "Citric-30%") ChemicalConcentration_backwash = 0.3;
    else if (sel === "Citric-100%") ChemicalConcentration_backwash = 1;
    else if (sel === "Polymer-100%") ChemicalConcentration_backwash = 1;
    else if (sel === "PAC-30%") ChemicalConcentration_backwash = 0.3;
    else if (sel === "PAC-100%") ChemicalConcentration_backwash = 1;
    else if (sel === "CLO2-15%") ChemicalConcentration_backwash = 0.15;
    
    const RequiredPPM_backwash = inputs.RequiredPPM_backwash;
    const ChemicalSelection_backwash= inputs.ChemicalSelection_backwash;
    const Noofdaystorefill_backwash=inputs.Noofdaystorefill_backwash;
    const flow_backwash = inputs.CapacityofPlant_backwash / 20;
    const Backwashflow_backwash = flow_backwash * 1.5;
    const CapacityOfWaterPerDay_backwash = ((Backwashflow_backwash * 1000) / 60) * 24;
    const chemicalQTYRequired_backwash = ((RequiredPPM_backwash * CapacityOfWaterPerDay_backwash) / 1000000) / ChemicalConcentration_backwash;
    const TotalChemical_backwash = chemicalQTYRequired_backwash * inputs.Noofdaystorefill_backwash;
    const dosingPumpCapacity_backwash = ((inputs.CapacityOfTank_backwash + TotalChemical_backwash) / (24 * inputs.Noofdaystorefill_backwash)) * 60;

    let ChemicalConcentration_disinfection = 0;
    if (inputs.ChemicalRequired_disinfection === "Hypo-10%") ChemicalConcentration_disinfection = 0.1;
    else if (inputs.ChemicalRequired_disinfection === "CLO2-15%") ChemicalConcentration_disinfection = 0.15;

    const flow_disinfection = inputs.CapacityofPlant_disinfection / 20;
    const CapacityOfWaterPerDay_disinfection = ((flow_disinfection * 1000) / 60) * inputs.TotalMinutesInADay_disinfection;
    const chemicalQTYRequired_disinfection = ((inputs.RequiredPPM_disinfection * CapacityOfWaterPerDay_disinfection) / 1000000) / ChemicalConcentration_disinfection;
    const TotalChemical_disinfection = chemicalQTYRequired_disinfection * inputs.Noofdaystorefill_disinfection;
    const dosingPumpCapacity_disinfection = ((inputs.CapacityOfTank_disinfection + TotalChemical_disinfection) / (20 * inputs.Noofdaystorefill_disinfection));

    setOutputs({
      backwash: {
        RequiredPPM_backwash: RequiredPPM_backwash,
        flow: flow_backwash,
        backwashFlow: Backwashflow_backwash,
        waterPerDay: CapacityOfWaterPerDay_backwash,
        chemicalPerDay: chemicalQTYRequired_backwash,
        totalChemical: TotalChemical_backwash,
        pumpCapacity: dosingPumpCapacity_backwash,
        ChemicalSelection_backwash: ChemicalSelection_backwash,
        Noofdaystorefill_backwash: Noofdaystorefill_backwash
      },
      disinfection: {
        flow: flow_disinfection,
        waterPerDay: CapacityOfWaterPerDay_disinfection,
        chemicalPerDay: chemicalQTYRequired_disinfection,
        totalChemical: TotalChemical_disinfection,
        pumpCapacity: dosingPumpCapacity_disinfection
      }
    });
  };

  const showDisinfection = inputs.ChemicalSelection_backwash === "Hypo-10%" || inputs.ChemicalSelection_backwash === "CLO2-15%";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">Dosing Pump Calculation</h1>
              <p className="text-green-100 text-[10px] uppercase tracking-wider">CEB / CIP / Disinfection</p>
            </div>
          </div>
          <img src="/Albion high - logo.jpg" alt="Albion Logo" className="h-12 bg-white p-1 rounded" />
        </div>

        <div className="p-4 space-y-6">
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

          {/* Reference Table */}
          <div className="overflow-x-auto no-print">
            <table className="w-full text-[10px] border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1">Chemical</th>
                  <th className="border p-1">Disinfection</th>
                  <th className="border p-1" colSpan={3}>SUMITOMO MEMBRANE</th>
                  <th className="border p-1" colSpan={3}>BLUFOX MEMBRANE</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border p-1">PPM</th>
                  <th className="border p-1">PPM</th>
                  <th className="border p-1">Backwash</th>
                  <th className="border p-1">CEB</th>
                  <th className="border p-1">CIP</th>
                  <th className="border p-1">Backwash</th>
                  <th className="border p-1">CEB</th>
                  <th className="border p-1">CIP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-1 font-bold">Hypo</td>
                  <td className="border p-1 text-center">3 ppm</td>
                  <td className="border p-1 text-center">20 ppm</td>
                  <td className="border p-1 text-center">500 ppm</td>
                  <td className="border p-1 text-center">3000 ppm</td>
                  <td className="border p-1 text-center">20 ppm</td>
                  <td className="border p-1 text-center">500 ppm</td>
                  <td className="border p-1 text-center">3000 ppm</td>
                </tr>
                <tr>
                  <td className="border p-1 font-bold">Citric</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">2000 ppm</td>
                  <td className="border p-1 text-center">20000 ppm</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">300 ppm</td>
                  <td className="border p-1 text-center">10000 ppm</td>
                </tr>
                <tr>
                  <td className="border p-1 font-bold">NaOH</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">200 ppm</td>
                  <td className="border p-1 text-center">5000 ppm</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">Nil</td>
                  <td className="border p-1 text-center">Nil</td>
                </tr>
                <tr>
                  <td className="border p-1 font-bold">CLO₂</td>
                  <td className="border p-1 text-center">0.3  ppm</td>
                  <td className="border p-1 text-center">-</td>
                  <td className="border p-1 text-center">-</td>
                  <td className="border p-1 text-center">-</td>
                  <td className="border p-1 text-center">-</td>
                  <td className="border p-1 text-center">-</td>
                  <td className="border p-1 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
            {/* Backwash Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Settings className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Backwash Selection</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CompactInput label="Required PPM (B/W)" id="RequiredPPM_backwash" value={inputs.RequiredPPM_backwash} onChange={handleInputChange} />
                <CompactInput label="Plant Capacity (m³/day)" id="CapacityofPlant_backwash" value={inputs.CapacityofPlant_backwash} onChange={handleInputChange} />
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Chemical Selection</label>
                  <select id="ChemicalSelection_backwash" value={inputs.ChemicalSelection_backwash} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="">--Select--</option>
                    <option value="Hypo-10%">Hypo-10%</option>
                    <option value="Hypo-12%">Hypo-12%</option>
                    <option value="NaOH-23%">NaOH-23%</option>
                    <option value="NaOH-48%">NaOH-48%</option>
                    <option value="Citric-30%">Citric-30%</option>
                    <option value="Citric-100%">Citric-100%</option>
                    <option value="Polymer-100%">Polymer-100%</option>
                    <option value="PAC-30%">PAC-30%</option>
                    <option value="PAC-100%">PAC-100%</option>
                    <option value="CLO2-15%">CLO2-15%</option>
                  </select>
                </div>
                <CompactInput label="Days to Refill" id="Noofdaystorefill_backwash" value={inputs.Noofdaystorefill_backwash} onChange={handleInputChange} />
                <CompactInput label="Tank Capacity (L)" id="CapacityOfTank_backwash" value={inputs.CapacityOfTank_backwash} onChange={handleInputChange} />
              </div>
            </div>

            {/* Disinfection Form */}
            {showDisinfection && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                  <Settings className="w-3.5 h-3.5 text-emerald-600" />
                  <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Disinfection Selection</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CompactInput label="Required PPM" id="RequiredPPM_disinfection" value={inputs.RequiredPPM_disinfection} onChange={handleInputChange} />
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Chemical Required</label>
                    <select id="ChemicalRequired_disinfection" value={inputs.ChemicalRequired_disinfection} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                      <option value="Hypo-10%">Hypo-10%</option>
                      <option value="CLO2-15%">CLO2-15%</option>
                    </select>
                  </div>
                  <CompactInput label="Plant Capacity (m³/day)" id="CapacityofPlant_disinfection" value={inputs.CapacityofPlant_disinfection} onChange={handleInputChange} />
                  <CompactInput label="Days to Refill" id="Noofdaystorefill_disinfection" value={inputs.Noofdaystorefill_disinfection} onChange={handleInputChange} />
                  <CompactInput label="Tank Capacity (L)" id="CapacityOfTank_disinfection" value={inputs.CapacityOfTank_disinfection} onChange={handleInputChange} />
                  <CompactInput label="Total Min/Day" id="TotalMinutesInADay_disinfection" value={inputs.TotalMinutesInADay_disinfection} onChange={handleInputChange} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-4 no-print">
            <button type="button" onClick={calculate} className="bg-green-600 text-white font-bold px-8 py-2 rounded shadow hover:bg-green-700 transition-colors">
              Calculate Results
            </button>
          </div>

          {/* Results Display */}
          {outputs && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-green-600 uppercase">Chemical/Dosing Pump Selection for Backwash</h3>
               
                <ResultItem label="Required PPM (B/W)" value={outputs.backwash.RequiredPPM_backwash} unit="ppm" />
                <ResultItem label="Chemical Selection" value={outputs.backwash.ChemicalSelection_backwash} unit=" " highlight />
                <ResultItem label="Capacity of water per day( as backwash runs for 1 min in every hour for both blufox and sumitomo)" value={outputs.backwash.waterPerDay.toFixed(2)} unit="L/day" />
                <ResultItem label="Now Chemical Required/day" value={outputs.backwash.chemicalPerDay.toFixed(2)} unit="kgs/day" />
                <ResultItem label="Enter No. of days to refill" value={outputs.backwash.Noofdaystorefill_backwash} unit="days" />
                <ResultItem label="Total Chemical" value={outputs.backwash.totalChemical.toFixed(2)} unit="kg" />
                <ResultItem label="Capacity of Tank" value={inputs.CapacityOfTank_backwash} unit="L" />
                <ResultItem label="Dosing Pump Capacity" value={outputs.backwash.pumpCapacity.toFixed(2)} unit="LPH" highlight />
              </div>

              {showDisinfection && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase">Disinfection Results</h3>
                  <ResultItem label="Required PPM" value={inputs.RequiredPPM_disinfection} unit="ppm" />
                  <ResultItem label="Chemical Required" value={inputs.ChemicalRequired_disinfection} unit=" " highlight />
                  <ResultItem label="Capacity of water per day" value={outputs.disinfection.waterPerDay.toFixed(2)} unit="L/day" />
                  <ResultItem label="Now Chemical Required/day" value={outputs.disinfection.chemicalPerDay.toFixed(2)} unit="kgs/day" />
                  <ResultItem label="Enter No. of days to refill" value={inputs.Noofdaystorefill_disinfection} unit="days" />
                  <ResultItem label="Total Chemical" value={outputs.disinfection.totalChemical.toFixed(2)} unit="kg" />
                  <ResultItem label="Capacity of Tank" value={inputs.CapacityOfTank_disinfection} unit="L" />
                  <ResultItem label="Pump Capacity" value={outputs.disinfection.pumpCapacity.toFixed(2)} unit="LPH" highlight />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end no-print">
            <button type="button" onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center gap-2">
              <Printer className="w-3 h-3" /> Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactInput: React.FC<{ label: string; id: string; value: any; onChange: any }> = ({ label, id, value, onChange }) => (
  <div className="space-y-0.5">
    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{label}</label>
    <input type="number" id={id} value={value} onChange={onChange} className="w-full px-1.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded outline-none focus:border-green-400" />
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
const Settings: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default CebCipCalculator;
