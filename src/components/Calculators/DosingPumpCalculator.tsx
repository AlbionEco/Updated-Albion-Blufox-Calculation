import React, { useState } from 'react';
import { Printer, Calculator, FileText, Info, Settings } from 'lucide-react';

const DosingPumpCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    projName: '',
    projCode: '',
    requiredPPMHypo: 0,
    requiredPPMNaoh: 0,
    requiredPPMCitric: 0,
    requiredPPMCLO2: 0,
    CapacityOfWaterHypo: 0,
    CapacityOfWaterNaoh: 0,
    CapacityOfWaterCitric: 0,
    CapacityOfWaterCLO2: 0,
    ChemicalConcHypo: 0,
    ChemicalConcNaoh: 0,
    ChemicalConcCitric: 0,
    ChemicalConcCLO2: 0,
    membrane: '',
    CapacityOfPlant: 0,
    CapacityOfPlant2: 0,
    NoOfDaysToRefill: 0,
    CapacityOfTank: 0,
    NoOfDaysToRefill2: 0,
    CapacityOfTank2: 0,
    TotalMinADay2: 0,
  });

  const [outputs, setOutputs] = useState<any>(null);
  const [tableResults, setTableResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const calculateTable = () => {
    const ChemicalQtyHypo = ((inputs.CapacityOfWaterHypo * inputs.requiredPPMHypo) / 1000000) / inputs.ChemicalConcHypo;
    const ChemicalQtyNaoh = ((inputs.CapacityOfWaterNaoh * inputs.requiredPPMNaoh) / 1000000) / inputs.ChemicalConcNaoh;
    const ChemicalQtyCitric = ((inputs.CapacityOfWaterCitric * inputs.requiredPPMCitric) / 1000000) / inputs.ChemicalConcCitric;
    const ChemicalQtyCLO2 = parseFloat((((inputs.CapacityOfWaterCLO2 * inputs.requiredPPMCLO2) / 1000000) / inputs.ChemicalConcCLO2).toFixed(4));

    setTableResults({
      ChemicalQtyHypo,
      ChemicalQtyNaoh,
      ChemicalQtyCitric,
      ChemicalQtyCLO2,
      RatePerKgHypo: (ChemicalQtyHypo * 25),
      RatePerKgCLO2: (ChemicalQtyCLO2 * 1800)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableResults) {
      calculateTable();
    }

    const TotalMinADay = inputs.membrane === 'sumitomo' ? 15 : 24;
    const chemicalRequiredPerDay = tableResults?.ChemicalQtyHypo || 0;
    const Flow = (inputs.CapacityOfPlant / 20);
    const BackwashFlow = Flow * 1.5;
    const CapacityOfWaterPerday = ((BackwashFlow * 1000) / 60) * TotalMinADay;
    const TotalChemical = chemicalRequiredPerDay * inputs.NoOfDaysToRefill;
    const DosingPumpcapacity = ((TotalChemical + Number(inputs.CapacityOfTank)) / (TotalMinADay * inputs.NoOfDaysToRefill)) * 60;

    // Disinfection
    const chemicalRequiredPerDay2 = tableResults?.ChemicalQtyCLO2 || 0;
    const Flow2 = (inputs.CapacityOfPlant2 / 20);
    const CapacityOfWaterPerday2 = ((Flow2 * 1000) / 60) * inputs.TotalMinADay2;
    const TotalChemical2 = chemicalRequiredPerDay2 * inputs.NoOfDaysToRefill2;
    const DosingPumpcapacity2 = ((TotalChemical2 + Number(inputs.CapacityOfTank2)) / (20 * inputs.NoOfDaysToRefill2));

    setOutputs({
      Flow,
      BackwashFlow,
      CapacityOfWaterPerday,
      TotalChemical,
      DosingPumpcapacity,
      chemicalRequiredPerDay,
      // Disinfection
      Flow2,
      CapacityOfWaterPerday2,
      TotalChemical2,
      DosingPumpcapacity2,
      chemicalRequiredPerDay2,
      TotalMinADay
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">Capacity of Dosing Pump</h1>
              <p className="text-green-100 text-[10px] uppercase tracking-wider">Albion Ecotech</p>
            </div>
          </div>
          <img
            src="/Albion high - logo.jpg"
            alt="Albion Logo"
           className="h-12 bg-white p-1 rounded"
          />
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
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

          {/* Table Input Section */}
          <div className="space-y-4 no-print">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
              <FileText className="w-3.5 h-3.5 text-green-600" />
              <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Chemical Input Data</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 border border-gray-200">Parameter</th>
                    <th className="p-2 border border-gray-200">Hypo (10%)</th>
                    <th className="p-2 border border-gray-200">NaOH (30%)</th>
                    <th className="p-2 border border-gray-200">Citric (30%)</th>
                    <th className="p-2 border border-gray-200">CLO2 (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-200 font-medium">Required PPM</td>
                    <td className="p-2 border border-gray-200"><input type="number" id="requiredPPMHypo" value={inputs.requiredPPMHypo} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="requiredPPMNaoh" value={inputs.requiredPPMNaoh} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="requiredPPMCitric" value={inputs.requiredPPMCitric} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="requiredPPMCLO2" value={inputs.requiredPPMCLO2} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-200 font-medium">Water Capacity (L)</td>
                    <td className="p-2 border border-gray-200"><input type="number" id="CapacityOfWaterHypo" value={inputs.CapacityOfWaterHypo} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="CapacityOfWaterNaoh" value={inputs.CapacityOfWaterNaoh} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="CapacityOfWaterCitric" value={inputs.CapacityOfWaterCitric} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="CapacityOfWaterCLO2" value={inputs.CapacityOfWaterCLO2} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-200 font-medium">Chemical Conc.</td>
                    <td className="p-2 border border-gray-200"><input type="number" id="ChemicalConcHypo" value={inputs.ChemicalConcHypo} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="ChemicalConcNaoh" value={inputs.ChemicalConcNaoh} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="ChemicalConcCitric" value={inputs.ChemicalConcCitric} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                    <td className="p-2 border border-gray-200"><input type="number" id="ChemicalConcCLO2" value={inputs.ChemicalConcCLO2} onChange={handleInputChange} className="w-full p-1 border border-gray-200 rounded" /></td>
                  </tr>
                  {tableResults && (
                    <>
                      <tr className="bg-green-50 font-bold">
                        <td className="p-2 border border-gray-200">Chemical Qty (kgs)</td>
                        <td className="p-2 border border-gray-200">{tableResults.ChemicalQtyHypo.toFixed(4)}</td>
                        <td className="p-2 border border-gray-200">{tableResults.ChemicalQtyNaoh.toFixed(4)}</td>
                        <td className="p-2 border border-gray-200">{tableResults.ChemicalQtyCitric.toFixed(4)}</td>
                        <td className="p-2 border border-gray-200">{tableResults.ChemicalQtyCLO2.toFixed(4)}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-2 border border-gray-200">Rate/Kg (Rs)</td>
                        <td className="p-2 border border-gray-200">{tableResults.RatePerKgHypo.toFixed(2)}</td>
                        <td className="p-2 border border-gray-200">-</td>
                        <td className="p-2 border border-gray-200">-</td>
                        <td className="p-2 border border-gray-200">{tableResults.RatePerKgCLO2.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={calculateTable} className="bg-green-600 text-white px-4 py-1.5 rounded text-xs font-bold no-print">Calculate Chemical Qty</button>
          </div>

          {/* Membrane Selection */}
          <div className="space-y-2 no-print">
            <label className="text-[10px] font-bold text-gray-700 uppercase">Membrane Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="membrane" value="sumitomo" checked={inputs.membrane === 'sumitomo'} onChange={(e) => setInputs(p => ({...p, membrane: e.target.value}))} />
                Sumitomo
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="membrane" value="blufox" checked={inputs.membrane === 'blufox'} onChange={(e) => setInputs(p => ({...p, membrane: e.target.value}))} />
                Blufox
              </label>
            </div>
          </div>

          {/* Main Calculation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Settings className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Backwash Parameters</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput label="Plant Capacity (KLD)" id="CapacityOfPlant" value={inputs.CapacityOfPlant} onChange={handleInputChange} />
                <CompactInput label="Refill Days" id="NoOfDaysToRefill" value={inputs.NoOfDaysToRefill} onChange={handleInputChange} />
                <CompactInput label="Tank Capacity (L)" id="CapacityOfTank" value={inputs.CapacityOfTank} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Settings className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Disinfection Parameters</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput label="Plant Capacity (KLD)" id="CapacityOfPlant2" value={inputs.CapacityOfPlant2} onChange={handleInputChange} />
                <CompactInput label="Total Min/Day" id="TotalMinADay2" value={inputs.TotalMinADay2} onChange={handleInputChange} />
                <CompactInput label="Refill Days" id="NoOfDaysToRefill2" value={inputs.NoOfDaysToRefill2} onChange={handleInputChange} />
                <CompactInput label="Tank Capacity (L)" id="CapacityOfTank2" value={inputs.CapacityOfTank2} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded shadow no-print">Calculate Dosing Pump Capacity</button>

          {/* Results */}
          {outputs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-green-600">Backwash Results</h3>
                <ResultItem label="Flow" value={outputs.Flow.toFixed(2)} unit="m³/h" />
                <ResultItem label="Backwash Flow" value={outputs.BackwashFlow.toFixed(2)} unit="m³/h" />
                <ResultItem label="Water/Day" value={outputs.CapacityOfWaterPerday.toFixed(2)} unit="LPD" />
                <ResultItem label="Total Chemical" value={outputs.TotalChemical.toFixed(2)} unit="kg" />
                <ResultItem label="Pump Capacity" value={outputs.DosingPumpcapacity.toFixed(2)} unit="LPH" highlight />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-emerald-600">Disinfection Results</h3>
                <ResultItem label="Flow" value={outputs.Flow2.toFixed(2)} unit="m³/h" />
                <ResultItem label="Water/Day" value={outputs.CapacityOfWaterPerday2.toFixed(2)} unit="LPD" />
                <ResultItem label="Total Chemical" value={outputs.TotalChemical2.toFixed(2)} unit="kg" />
                <ResultItem label="Pump Capacity" value={outputs.DosingPumpcapacity2.toFixed(2)} unit="LPH" highlight />
              </div>
            </div>
          )}

          <div className="flex justify-end no-print">
            <button type="button" onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded font-bold flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print Report
            </button>
          </div>
        </form>
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

export default DosingPumpCalculator;
