import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Loader2, Settings, CheckCircle2, PlusCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { generateOctopusWordProposal, OctopusProposalInputs } from './octopus_proposal';

const OctopusProposalGenerator: React.FC = () => {
  const [inputs, setInputs] = useState<OctopusProposalInputs>({
    quotation_Number: 'QTN-2026-',
    client_Name: '',
    date: new Date().toISOString().split('T')[0],
    special_Terms: '',
    selectedPools: ['mainPool'],
    mainPoolLength: '',
    mainPoolWidth: '',
    mainPoolDepth: '',
    babyPoolLength: '',
    babyPoolWidth: '',
    babyPoolDepth: '',
    poolVolume: '',
    flowRate: '',
    workHours: '',
    mediaType: 'AFMMedia',
    layoutType: 'Skimmer',
    authorized_Person: '',
    gutterLength: '',
    gutterWidth: '',
    accessories: [] as string[],
    poolLadderUnits: '1',
    poolLadderUnits_steps: '',
    poolLightingUnits: '1',
    cascadeUnits: '1',
    pipelessUnits: '1',
    poolLightingUnits_watt: "",
    roboticCleanerUnits: '1',
    uvSterilizerUnits: '1',
    saltChlorinatorUnits: '1',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');


  const updateProgress = (percent: number, message: string) => {
    setProgress(percent);
    setProgressMessage(message);
  };

  // Calculation Logic (Immediate UI Feedback)
  useEffect(() => {
    const { 
      mainPoolLength, mainPoolWidth, mainPoolDepth, 
      babyPoolLength, babyPoolWidth, babyPoolDepth,
      selectedPools 
    } = inputs;

    let totalVolume = 0;

    if (selectedPools.includes('mainPool')) {
      const L = parseFloat(mainPoolLength) || 0;
      const W = parseFloat(mainPoolWidth) || 0;
      const D = parseFloat(mainPoolDepth) || 0;
      if (L > 0 && W > 0 && D > 0) {
        totalVolume += Math.round(L * W * D * 28.3168);
      }
    }

    if (selectedPools.includes('babyPool')) {
      const L = parseFloat(babyPoolLength) || 0;
      const W = parseFloat(babyPoolWidth) || 0;
      const D = parseFloat(babyPoolDepth) || 0;
      if (L > 0 && W > 0 && D > 0) {
        totalVolume += Math.round(L * W * D * 28.3168);
      }
    }

    if (totalVolume > 0) {
      setInputs(prev => ({ ...prev, poolVolume: totalVolume.toString() }));
    }
  }, [
    inputs.mainPoolLength, inputs.mainPoolWidth, inputs.mainPoolDepth, 
    inputs.babyPoolLength, inputs.babyPoolWidth, inputs.babyPoolDepth,
    inputs.selectedPools
  ]);

  // handle proper checkbox change for pool type
  const handlePoolTypeToggle = (pool: string) => {
    setInputs(prev => {
      const selectedPools = prev.selectedPools.includes(pool)
        ? prev.selectedPools.filter(p => p !== pool)
        : [...prev.selectedPools, pool];
      return { ...prev, selectedPools };
    });
  };

  // handle proper radio button change for media type
  const handlemediaTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputs(prev => ({ ...prev, mediaType: value }));
  };

  // handle proper radio button change for layout type
  const handleLayoutTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputs(prev => ({ ...prev, layoutType: value }));
  };


  const handleAccessoryToggle = (accessory: string) => {
    setInputs(prev => {
      const accessories = prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory];
      return { ...prev, accessories };
    });
  };

  //  MAIN CALCULATE
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, name, value } = e.target;
    const key = id || name;
    if (key) {
      setInputs(prev => ({ ...prev, [key]: value }));
    }
  }


  const handleGenerateWord = async () => {
    const { poolVolume } = inputs;
    setIsGenerating(true);
    updateProgress(0, "Starting Word Generation...");

    //change if Pool Volume available than run ahead
    if (Number(poolVolume) > 0) {
      await generateOctopusWordProposal(inputs, updateProgress);
    } else {
      alert(`Please enter pool dimensions or volume to generate a proposal.`);
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans text-slate-900">
      <Helmet>
        <title>Octopus Proposal - Octopus</title>
        <link rel="icon" href="/Octopus Images/Octopus Only Logo.png" />
      </Helmet>
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 pb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#20b3c4] p-2 rounded-lg shadow-lg shadow-blue-200">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Proposal Generator</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Product Proposal Creation Tool</p>
        </div>
        <div className="text-right">
          <p className="text-[#20b3c4] font-black text-2xl tracking-tighter">Octopus Pools</p>
          <p className="text-slate-400 text-[12px] uppercase font-bold tracking-widest">& Lifestyle</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#20b3c4]" />
            <h3 className="text-white font-black uppercase tracking-tight italic">Proposal Configuration</h3>
          </div>
          <div className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            v2.1.0 Build
          </div>
        </div>

        <form className="p-8 space-y-12">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left Column: Client & Basic Info */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-1.5 h-4 bg-[#20b3c4] rounded-full"></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Client Information</h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Name</label>
                    <textarea
                      id="client_Name"
                      value={inputs.client_Name}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all resize-none"
                      placeholder="Enter client or company name..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Authorized Person</label>
                    <input
                      type="text"
                      id="authorized_Person"
                      value={inputs.authorized_Person}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quotation No.</label>
                      <input
                        type="text"
                        id="quotation_Number"
                        value={inputs.quotation_Number}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        id="date"
                        value={inputs.date}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-1.5 h-4 bg-[#20b3c4] rounded-full"></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Technical Specs</h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Media Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.mediaType === 'AFMMedia' ? 'border-[#20b3c4] bg-[#20b3c4]/5 text-[#20b3c4]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                        <input type="radio" name="mediaType" value="AFMMedia" checked={inputs.mediaType === 'AFMMedia'} onChange={handlemediaTypeChange} className="hidden" />
                        <span className="text-xs font-bold uppercase">AFM Media</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.mediaType === 'SandMedia' ? 'border-[#20b3c4] bg-[#20b3c4]/5 text-[#20b3c4]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                        <input type="radio" name="mediaType" value="SandMedia" checked={inputs.mediaType === 'SandMedia'} onChange={handlemediaTypeChange} className="hidden" />
                        <span className="text-xs font-bold uppercase">Sand Media</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flow Rate (LPH)</label>
                      <input
                        type='number'
                        id="flowRate"
                        value={inputs.flowRate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all"
                        placeholder="Auto-calculated"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Work Hours</label>
                      <input
                        type="number"
                        id="workHours"
                        value={inputs.workHours}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all"
                        placeholder="Cycle hours"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Special Terms</label>
                    <textarea
                      id="special_Terms"
                      value={inputs.special_Terms}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all resize-none"
                      placeholder="Enter specific terms or conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pool Specs & Accessories */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-1.5 h-4 bg-[#20b3c4] rounded-full"></div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Pool Dimensions</h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pool Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.selectedPools.includes('mainPool') ? 'border-[#20b3c4] bg-[#20b3c4]/5 text-[#20b3c4]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                        <input type="checkbox" checked={inputs.selectedPools.includes('mainPool')} onChange={() => handlePoolTypeToggle('mainPool')} className="hidden" />
                        <span className="text-xs font-bold uppercase">Main Pool</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.selectedPools.includes('babyPool') ? 'border-[#20b3c4] bg-[#20b3c4]/5 text-[#20b3c4]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                        <input type="checkbox" checked={inputs.selectedPools.includes('babyPool')} onChange={() => handlePoolTypeToggle('babyPool')} className="hidden" />
                        <span className="text-xs font-bold uppercase">Baby Pool</span>
                      </label>
                    </div>
                  </div>

                  {inputs.selectedPools.includes('mainPool') && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Pool Dimensions</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Length (ft)</label>
                          <input type="number" id="mainPoolLength" value={inputs.mainPoolLength} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Width (ft)</label>
                          <input type="number" id="mainPoolWidth" value={inputs.mainPoolWidth} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Depth (ft)</label>
                          <input type="number" id="mainPoolDepth" value={inputs.mainPoolDepth} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {inputs.selectedPools.includes('babyPool') && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baby Pool Dimensions</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Length (ft)</label>
                          <input type="number" id="babyPoolLength" value={inputs.babyPoolLength} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Width (ft)</label>
                          <input type="number" id="babyPoolWidth" value={inputs.babyPoolWidth} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Depth (ft)</label>
                          <input type="number" id="babyPoolDepth" value={inputs.babyPoolDepth} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Layout Type</label>
                      <select id="layoutType" value={inputs.layoutType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#20b3c4]/20 focus:border-[#20b3c4] outline-none transition-all">
                        <option value="Skimmer">Skimmer Type</option>
                        <option value="Overflow">Overflow Type</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume (Litres)</label>
                      <input type="number" id="poolVolume" value={inputs.poolVolume} onChange={handleInputChange} className="w-full bg-slate-900 text-[#20b3c4] border-none rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-[#20b3c4]/20 outline-none transition-all" />
                    </div>
                  </div>

                  {inputs.layoutType === 'Overflow' && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gutter L (Mtr)</label>
                        <input type="number" id="gutterLength" value={inputs.gutterLength} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gutter W (Inch)</label>
                        <select id="gutterWidth" value={inputs.gutterWidth} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none">
                          <option value="">Select</option>
                          <option value="8">8"</option>
                          <option value="10">10"</option>
                          <option value="12">12"</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>

          {/* Accessories Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100/50">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <PlusCircle size={14} /> Optional Accessories
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  {
                    id: "PoolLadder",
                    label: "Pool Ladder (SS304)",
                    unitsKey: "poolLadderUnits",
                    StepsOptions: ["3 Steps", "4 Steps", "5 Steps"],
                  },
                  {
                    id: "PoolLighting",
                    label: "Underwater Lighting",
                    unitsKey: "poolLightingUnits",
                    WhattOptions: ["6W", "9W", "12W", "18W"],
                  },
                  {
                    id: "Cascade",
                    label: "SS Cascade",
                    unitsKey: "cascadeUnits"
                  },
                  {
                    id: "PipelessPoolFiltrationSystem",
                    label: "Pipeless System",
                    unitsKey: "pipelessUnits",
                  },
                  {
                    id: "RoboticPoolCleaner",
                    label: "Robotic Pool Cleaner",
                    unitsKey: "roboticCleanerUnits",
                  },
                  {
                    id: "UVSterilizer",
                    label: "UV Sterilizer",
                    unitsKey: "uvSterilizerUnits",
                  },
                  {
                    id: "SaltChlorinator",
                    label: "HQ SQ Salt Chlorinator",
                    unitsKey: "saltChlorinatorUnits",
                  }
                ] as const
              ).map((acc) => (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${inputs.accessories.includes(acc.id)
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                    : "bg-gray-50 border-gray-100 hover:border-gray-200"
                    }`}
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleAccessoryToggle(acc.id)}
                  >
                    <button
                      type="button"
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${inputs.accessories.includes(acc.id)
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 group-hover:border-blue-300"
                        }`}
                    >
                      {inputs.accessories.includes(acc.id) && (
                        <CheckCircle2 size={16} />
                      )}
                    </button>
                    <span
                      className={`font-medium transition-colors ${inputs.accessories.includes(acc.id)
                        ? "text-blue-900"
                        : "text-gray-700 group-hover:text-blue-600"
                        }`}
                    >
                      {acc.label}
                    </span>
                  </div>

                  {inputs.accessories.includes(acc.id) && (
                    <div className="flex items-center gap-2">

                      <span className="text-xs text-blue-600 font-bold uppercase">
                        Units:
                      </span>
                      {/* Units Input */}
                      <input
                        type="number"
                        name={acc.unitsKey}
                        value={inputs[acc.unitsKey]}
                        onChange={handleInputChange}
                        placeholder="Qty"
                        className="w-16 px-2 py-1 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />

                      {/* Watt or Steps Dropdown (only if exists) */}
                      {"WhattOptions" in acc && (
                        <select
                          name={`${acc.unitsKey}_watt`}
                          value={inputs[`${acc.unitsKey}_watt`] || ""}
                          onChange={handleInputChange}
                          className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select W</option>
                          {acc.WhattOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {"StepsOptions" in acc && (
                        <select
                          name={`${acc.unitsKey}_steps`}
                          value={inputs[`${acc.unitsKey}_steps`] || ""}
                          onChange={handleInputChange}
                          className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select Steps</option>
                          {acc.StepsOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGenerateWord}
              disabled={isGenerating}
              className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg shadow-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              <span className="tracking-tight uppercase italic">Generate Word Proposal</span>
            </button>
          </div>
        </form>
      </div >


      {/* Progress Modal */}
      {
        isGenerating && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">{progressMessage}</h3>
                <p className="text-sm text-slate-500">Please wait while we prepare your document...</p>
              </div>

              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[#20b3c4] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default OctopusProposalGenerator;