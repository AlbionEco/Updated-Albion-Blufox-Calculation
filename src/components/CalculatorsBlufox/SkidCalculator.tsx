import React, { useState } from 'react';
import { Printer, Calculator, FileText, Zap, Layers, Box } from 'lucide-react';

const SkidCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    frameLayer: 'single', // 'single' | 'double'
    membraneType: 'BF', // 'BF' | 'SUS'
    model: 'BF125',
    pipethickness: '40mm', // For BF Single
    qty: 0,
    sitename: '',
  });

  const [results, setResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const name = e.target.name;
    const targetId = id || name;

    setInputs(prev => {
      const newInputs = {
        ...prev,
        [targetId]: type === 'number' ? parseFloat(value) || 0 : value
      };

      // Reset model when membrane type or frame layer changes
      if (targetId === 'membraneType') {
        newInputs.model = value === 'BF' ? 'BF125' : 'SUS97';
      }
      if (targetId === 'frameLayer') {
        newInputs.membraneType = 'BF';
        newInputs.model = 'BF125';
      }

      return newInputs;
    });
  };

  const calculate = () => {
    const { frameLayer, membraneType, model, pipethickness, qty, sitename } = inputs;
    const numQty = Number(qty);

    if (frameLayer === 'single') {
      if (membraneType === 'BF') {
        // BF Series (Single frame)
        let thickBoxpipe50 = 0;
        let thickBoxpipe = 0;
        let threadedNippleQty = 0;
        let flangeQty = 0;
        let threadedNippleLabel = '';
        let flangeLabel = '';

        if (pipethickness === '40mm') {
          if (model === 'BF125') {
            thickBoxpipe = ((1.2 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085) + 0.08) * 6);
          } else if (model === 'BF200') {
            thickBoxpipe = ((1.72 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085) + 0.08) * 8);
          } else if (model === 'BF300') {
            thickBoxpipe = ((2.22 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085) + 0.08) * 8);
          } else if (model === 'BF100N' || model === 'BF100oxy') {
            thickBoxpipe = ((1.2 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085) + 0.08) * 6);
          } else if (model === 'BF200N') {
            thickBoxpipe = ((1.72 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085) + 0.08) * 8);
          }

          if (numQty < 10) {
            threadedNippleQty = 2;
            flangeQty = 2;
          } else {
            threadedNippleQty = 4;
            flangeQty = 2;
          }
          threadedNippleLabel = '1" Threaded Nipple (3" long)';
          flangeLabel = '1" Flange';
        } else if (pipethickness === '50mm') {
          if (model === 'BF125') {
            thickBoxpipe = ((0.61 * 2) + (((numQty + 1) * 0.085)) * 2);
            thickBoxpipe50 = ((1.2 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085)) * 6) + 0.5;
          } else if (model === 'BF200') {
            thickBoxpipe = ((0.61 * 2) + (((numQty + 1) * 0.085)) * 2);
            thickBoxpipe50 = ((1.72 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085)) * 6) + 0.5;
          } else if (model === 'BF300') {
            thickBoxpipe = ((0.61 * 2) + (((numQty + 1) * 0.085)) * 2);
            thickBoxpipe50 = ((2.22 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085)) * 6) + 0.5;
          } else if (model === 'BF100N' || model === 'BF100oxy') {
            thickBoxpipe = ((0.61 * 2) + (((numQty + 1) * 0.085)) * 2);
            thickBoxpipe50 = ((1.2 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085)) * 6) + 0.5;
          } else if (model === 'BF200N') {
            thickBoxpipe = ((0.61 * 2) + (((numQty + 1) * 0.085)) * 2);
            thickBoxpipe50 = ((1.72 * 4) + (0.61 * 6) + (((numQty + 1) * 0.085)) * 6) + 0.5;
          }

          if (numQty < 10) {
            threadedNippleQty = 2;
            flangeQty = 4;
          } else {
            threadedNippleQty = 4;
            flangeQty = 4;
          }
          threadedNippleLabel = '1.5" Threaded Nipple (3" long)';
          flangeLabel = '1.5" Flange';
        }

        const nippleQty = (numQty * 2) + (numQty + 1) * 2;

        setResults({
          type: 'BF_SINGLE',
          model,
          qty: numQty,
          nippleQty,
          thickBoxpipe,
          thickBoxpipe50,
          threadedNippleQty,
          threadedNippleLabel,
          flangeQty,
          flangeLabel,
          sitename
        });
      } else {
        // SUS Series (Single frame)
        let thickboxpipe5050 = 0;
        let thickboxpipe10050 = 0;
        const thickboxpipe4015 = ((((numQty - 1) * 0.06) + 0.085) + 0.1) * 6;
        const thickboxpipe5025 = ((numQty * 2) + 2) * 0.05;
        const threadedCoupling4_3by4 = numQty * 2;
        const SCH10Pipe_3by4 = numQty % 2 === 0 ? numQty * 0.4 : (numQty - 1) * 0.4;
        const SCH1090Deg_3by4 = numQty % 2 === 0 ? numQty * 2 : (numQty - 1) * 2;
        const Flange_2 = 5;
        let SCH10Pipe_2 = 0;
        const SCH1090Deg_2 = 4;
        const Flange_3 = 1;
        const SCH10Pipe_3 = 0.2;
        let thkCoverplate_1 = 0;
        let thkCoverplate_2 = 0;

        if (model === "SUS97") {
          thickboxpipe5050 = ((((numQty - 1) * 0.06) + 0.085) * 8 + (0.58 * 6) + (1.875 * 4) + (0.15 * 8));
          thickboxpipe10050 = ((0.128 * 4) + ((((numQty - 1) * 0.06) + 0.085) * 2)) + 0.42;
          SCH10Pipe_2 = ((((numQty * 0.06) + 0.125) + 0.17 + 0.05) * 2) + 2.68;
          thkCoverplate_1 = (((numQty - 1) * 0.06) + 0.085 + 0.1 + 0.03) + 0.71;
          thkCoverplate_2 = 0.35 + 0.35 + 0.1;
        } else if (model === "SUS113") {
          thickboxpipe5050 = ((((numQty - 1) * 0.06) + 0.085) * 8 + (0.58 * 6) + (2.075 * 4) + (0.15 * 8));
          thickboxpipe10050 = ((0.128 * 4) + ((((numQty - 1) * 0.06) + 0.085) * 2)) + 0.42;
          SCH10Pipe_2 = ((((numQty * 0.06) + 0.125) + 0.17 + 0.05) * 2) + 2.88;
          thkCoverplate_1 = (((numQty - 1) * 0.06) + 0.085 + 0.1 + 0.03) + 0.71;
          thkCoverplate_2 = 0.35 + 0.35 + 0.1;
        } else if (model === "SUS193") {
          thickboxpipe5050 = ((((numQty - 1) * 0.06) + 0.085) * 8 + (1.15 * 6) + (1.875 * 4) + (0.15 * 8));
          thickboxpipe10050 = ((0.128 * 4) + ((((numQty - 1) * 0.06) + 0.085) * 2)) + 0.99;
          SCH10Pipe_2 = ((((numQty * 0.06) + 0.125) + 0.17 + 0.05) * 2) + 2.68;
          thkCoverplate_1 = (((numQty - 1) * 0.06) + 0.085 + 0.1 + 0.03) + 1.28;
          thkCoverplate_2 = 0.35 + 0.35 + 0.1;
        } else if (model === "SUS227") {
          thickboxpipe5050 = ((((numQty - 1) * 0.06) + 0.085) * 8 + (1.15 * 6) + (2.075 * 4) + (0.15 * 8));
          thickboxpipe10050 = ((0.128 * 4) + ((((numQty - 1) * 0.06) + 0.085) * 2)) + 0.99;
          SCH10Pipe_2 = ((((numQty * 0.06) + 0.125) + 0.17 + 0.05) * 2) + 2.88;
          thkCoverplate_1 = (((numQty - 1) * 0.06) + 0.085 + 0.1 + 0.03) + 1.28;
          thkCoverplate_2 = 0.35 + 0.35 + 0.1;
        } else if (model === "SUS313") {
          thickboxpipe5050 = ((((numQty - 1) * 0.06) + 0.085) * 8 + (1.15 * 6) + (2.575 * 4) + (0.15 * 8));
          thickboxpipe10050 = ((0.128 * 4) + ((((numQty - 1) * 0.06) + 0.085) * 2)) + 0.99;
          SCH10Pipe_2 = ((((numQty * 0.06) + 0.125) + 0.17 + 0.05) * 2) + 3.38;
          thkCoverplate_1 = (((numQty - 1) * 0.06) + 0.085 + 0.1 + 0.03) + 1.28;
          thkCoverplate_2 = 0.35 + 0.35 + 0.1;
        }

        setResults({
          type: 'SUS_SINGLE',
          model,
          qty: numQty,
          thickboxpipe5050,
          thickboxpipe10050,
          thickboxpipe4015,
          thickboxpipe5025,
          threadedCoupling4_3by4,
          SCH10Pipe_3by4,
          SCH1090Deg_3by4,
          totalFlange1_5: Number(Flange_2) + Flange_3,
          totalSCH10Pipe1_5: SCH10Pipe_2 + SCH10Pipe_3,
          SCH1090Deg_2,
          thkCoverplate_1,
          thkCoverplate_2,
          sitename
        });
      }
    } else {
      // BF Series (Double Frame)
      const pipeDouble = numQty * 2;
      const porforatedPipe = (numQty + 2) * 2;
      const nippleQty = (pipeDouble + porforatedPipe);

      const pipe80mm = (((Math.ceil(numQty / 2) + 1) * 0.085)) * 2;
      let pipe50mm = 0;
      const pipe40mm = (2.6 + ((Math.ceil(numQty / 2) + 1) * 0.085) * 2);

      if (model === "BF125") {
        pipe50mm = ((1.2 * 4) + (1.3 * 6) + (((Math.ceil(numQty / 2) + 1) * 0.085)) * 6) + 0.5;
      } else if (model === "BF200") {
        pipe50mm = ((1.72 * 4) + (1.3 * 6) + (((Math.ceil(numQty / 2) + 1) * 0.085)) * 6) + 0.5;
      } else if (model === "BF300") {
        pipe50mm = ((2.22 * 4) + (1.3 * 6) + (((Math.ceil(numQty / 2) + 1) * 0.085)) * 6) + 0.5;
      }

      setResults({
        type: 'BF_DOUBLE',
        model,
        qty: numQty,
        nippleQty,
        pipe80mm: Math.ceil(pipe80mm),
        pipe50mm: Math.ceil(pipe50mm),
        pipe40mm: Math.ceil(pipe40mm),
        sitename
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 pb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <Box className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Skid Calculation</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">MBR Frame & Skid Selection</p>
        </div>
        <div className="text-right">
          <p className="text-blue-600 font-black text-2xl tracking-tighter">BLUFOX</p>
          <p className="text-slate-400 text-[12px] uppercase font-bold tracking-widest">Ecoventures LLP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="xl:col-span-4 space-y-6 no-print">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Frame Layer Selection */}
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3 h-3" /> MBR Frame Layer
                </label>
                <div className="grid grid-cols-2 gap-2">
                   <button
  onClick={() =>
    setInputs((prev: any) => ({
      ...prev,
      frameLayer: "single",
    }))
  }
                    className={`py-2 px-4 rounded-lg text-sm font-bold transition-all border ${inputs.frameLayer === 'single' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                  >
                    Single
                  </button>
                  <button
  onClick={() =>
    setInputs((prev: any) => ({
      ...prev,
      frameLayer: "double",
    }))
  }
                    className={`py-2 px-4 rounded-lg text-sm font-bold transition-all border ${inputs.frameLayer === 'double' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                  >
                    Double
                  </button>
                </div>
              </div>

              {/* Membrane Type (Only for Single) */}
              {inputs.frameLayer === 'single' && (
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Membrane Type</label>
                  <select
                    id="membraneType"
                    value={inputs.membraneType}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="BF">BF Series</option>
                    <option value="SUS">SUS Series</option>
                  </select>
                </div>
              )}

              {/* Model Selection */}
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Select Model</label>
                <select
                  id="model"
                  value={inputs.model}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  {inputs.frameLayer === 'single' && inputs.membraneType === 'BF' && (
                    <>
                      <option value="BF125">BF 125</option>
                      <option value="BF200">BF 200</option>
                      <option value="BF300">BF 300</option>
                      <option value="BF100N">BF 100N</option>
                      <option value="BF200N">BF 200N</option>
                      <option value="BF100oxy">BF 100 oxy</option>
                    </>
                  )}
                  {inputs.frameLayer === 'single' && inputs.membraneType === 'SUS' && (
                    <>
                      <option value="SUS97">SUS 97</option>
                      <option value="SUS113">SUS 113</option>
                      <option value="SUS193">SUS 193</option>
                      <option value="SUS227">SUS 227</option>
                      <option value="SUS313">SUS 313</option>
                    </>
                  )}
                  {inputs.frameLayer === 'double' && (
                    <>
                      <option value="BF125">BF 125</option>
                      <option value="BF200">BF 200</option>
                      <option value="BF300">BF 300</option>
                    </>
                  )}
                </select>
              </div>

              {/* Pipe Thickness (Only for BF Single) */}
              {inputs.frameLayer === 'single' && inputs.membraneType === 'BF' && (
                <div className="space-y-3">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Thickness of box pipe</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${inputs.pipethickness === '40mm' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <input
                        type="radio"
                        name="pipethickness"
                        value="40mm"
                        checked={inputs.pipethickness === '40mm'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-xs font-medium text-slate-700">40mm x 40mm x 2mm</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${inputs.pipethickness === '50mm' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                      <input
                        type="radio"
                        name="pipethickness"
                        value="50mm"
                        checked={inputs.pipethickness === '50mm'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-xs font-medium text-slate-700">50mm x 50mm x 2mm</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Membrane Qty (Nos.)</label>
                <input
                  type="number"
                  id="qty"
                  value={inputs.qty}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Site Name */}
              <div className="space-y-3">
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Site / Project Name</label>
                <input
                  type="text"
                  id="sitename"
                  value={inputs.sitename}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <button
                type="button"
                onClick={calculate}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group mt-6"
              >
                <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                GENERATE SKID DATA
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
                    <h3 className="font-black italic uppercase tracking-tight">Skid Order Calculation Sheet</h3>
                  </div>
                  <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white p-8">
                  {/* Company Header */}
                  <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-8">
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
                        <div className="flex gap-4 text-[10px] text-blue-600 font-bold">
                          <span><a href="mailto:blufox.ecoventures@gmail.com">blufox.ecoventures@gmail.com</a></span>
                          <span> <a href="tel:+919099022279"> +91 90990 22279</a></span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Material: SS 304 Unpolished</p>
                    </div>
                    <div className="text-right">
                      <img src="/bluefox-logo-with-tagline.png" alt="blufox logo" className="h-12 w-auto mb-2" referrerPolicy="no-referrer" />
                      {results.sitename && (
                        <div className="mt-4 p-2 bg-blue-50 rounded border border-blue-100 inline-block">
                          <p className="text-[10px] uppercase font-bold text-blue-600 tracking-widest mb-1">Project Name</p>
                          <p className="text-sm font-black text-slate-800">{results.sitename}</p>
                        </div>
                        )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic border-b border-slate-200">Description</th>
                          <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic border-b border-slate-200">Value</th>
                          <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic border-b border-slate-200">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <TableRow label="Membrane Model" value={results.model} />
                        <TableRow label="Membrane Qty" value={results.qty} unit="Nos." />

                        {results.type === 'BF_SINGLE' && (
                          <>
                            <TableRow label='1/2" Nipple Qty (1.25" long)' value={results.nippleQty} unit="Nos." />
                            {results.thickBoxpipe50 > 0 && (
                              <TableRow label="50mm x 50mm x 2mm Thick Box Pipe" value={results.thickBoxpipe50.toFixed(2)} unit="mtr" highlight />
                            )}
                            <TableRow label="40mm x 40mm x 2mm Thick Box Pipe" value={results.thickBoxpipe.toFixed(2)} unit="mtr" highlight />
                            <TableRow label={results.threadedNippleLabel} value={results.threadedNippleQty} unit="Nos." />
                            <TableRow label={results.flangeLabel} value={results.flangeQty} unit="Nos." />
                          </>
                        )}

                        {results.type === 'BF_DOUBLE' && (
                          <>
                            <TableRow label='1/2" Nipple Qty (1.25" long)' value={results.nippleQty} unit="Nos." />
                            <TableRow label="80mm x 40mm x 2-3mm / 100mm x 50mm x 2-3mm Thick Box Pipe" value={results.pipe80mm} unit="mtr" highlight />
                            <TableRow label="50mm x 50mm x 2mm Thick Box Pipe" value={results.pipe50mm} unit="mtr" highlight />
                            <TableRow label="40mm x 40mm x 2mm Thick Box Pipe" value={results.pipe40mm} unit="mtr" highlight />
                            <TableRow label='1.5" Threaded Nipple (3" long)' value="2" unit="Nos." />
                            <TableRow label='1.5" Flange' value="2" unit="Nos." />
                            <TableRow label='2" Threaded Nipple (4" long)' value="1" unit="Nos." />
                            <TableRow label='2" Flange' value="1" unit="Nos." />
                          </>
                        )}

                        {results.type === 'SUS_SINGLE' && (
                          <>
                            <TableRow
                              label={results.qty <= 10 ? "40mm x 40mm x 2mm Thick Box Pipe" : "50mm x 50mm x 2mm Thick Box Pipe"}
                              value={results.thickboxpipe5050.toFixed(2)}
                              unit="mtr"
                              highlight
                            />
                            <TableRow
                              label={results.qty <= 10 ? "80mm x 40mm x 2mm Thick Box Pipe" : "100mm x 50mm x 2mm Thick Box Pipe"}
                              value={results.thickboxpipe10050.toFixed(2)}
                              unit="mtr"
                              highlight
                            />
                            <TableRow label="40mm x 15mm x 2mm Thick Box Pipe" value={results.thickboxpipe4015.toFixed(2)} unit="mtr" />
                            <TableRow label="50mm x 25mm x 2mm Thick Box Pipe" value={results.thickboxpipe5025.toFixed(2)} unit="mtr" />
                            <TableRow label='3/4" Threaded COUPLING 4" Long' value={results.threadedCoupling4_3by4.toFixed(2)} unit="Nos." />
                            <TableRow label='3/4" SCH 10 PIPE' value={results.SCH10Pipe_3by4.toFixed(2)} unit="mtr" />
                            <TableRow label='3/4" SCH 10 90 DEG. LR ELBOW' value={results.SCH1090Deg_3by4.toFixed(2)} unit="Nos." />
                            <TableRow label='1.5" FLANGE' value={results.totalFlange1_5} unit="Nos." />
                            <TableRow label='1.5" SCH 10 PIPE' value={results.totalSCH10Pipe1_5.toFixed(2)} unit="mtr" />
                            <TableRow label='1.5" SCH 10 90 DEG. ELBOW' value={results.SCH1090Deg_2} unit="Nos." />
                            <TableRow label="2 THK. COVER PLATE" value={`${results.thkCoverplate_1.toFixed(2)} x ${results.thkCoverplate_2.toFixed(2)}`} unit="1 Nos." />
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Notes */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Notes</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      {results.type === 'BF_SINGLE' && (
                        <>
                          <p>• Order 1/2" Nipple 2.5" long = 1.25" long - 2 Nos.</p>
                          <p>• Order 1.5" Pipe 6" long = 3" long - 2 Nos.</p>
                        </>
                      )}
                      <p>• All dimensions are based on standard Blufox frame designs.</p>
                      <p>• Material specification: Stainless Steel 304, unpolished finish.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
              <Zap className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-black uppercase tracking-[0.2em] text-sm">Awaiting Configuration</p>
              <p className="text-xs mt-2">Select frame layer, model and quantity to generate skid data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TableRow: React.FC<{ label: string; value: any; unit?: string; highlight?: boolean }> = ({ label, value, unit, highlight }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="py-3 px-6 text-[12px] font-medium text-slate-600">{label}</td>
    <td className="py-3 px-6 text-right">
      <span className={`font-mono text-xs font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
    </td>
    <td className="py-3 px-3 text-left w-32">
      {unit && <span className="text-[12px] text-slate-500 uppercase">{unit}</span>}
    </td>
  </tr>
);

export default SkidCalculator;
