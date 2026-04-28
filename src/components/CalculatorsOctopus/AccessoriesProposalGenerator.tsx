import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, ChevronRight, Package, Settings2, User, Calendar, Hash, Info } from 'lucide-react';
import { generateAccessoriesWordProposal, AccessoriesProposalInputs } from './accessories_proposal';
import { Helmet } from 'react-helmet-async';

const AccessoriesProposalGenerator: React.FC = () => {
  const [inputs, setInputs] = useState<AccessoriesProposalInputs>({
    ref_Number: 'REF-' + new Date().getFullYear() + '-',
    to_Client: '',
    date: new Date().toISOString().split('T')[0],
    sub: 'Proposal for Swimming Pool Accessories',
    items: {
      algaeBrush: { selected: false, qty: '1', unit: 'Nos.', size: '10"', label: 'Algae Brush', category: 'Cleaning Accessories' },
      leafNetBag: { selected: false, qty: '1', unit: 'Nos.', label: 'Deluxe Leaf Net Bag', category: 'Cleaning Accessories' },
      telescopicHandle: { selected: false, qty: '1', unit: 'Nos.', label: 'Telescopic Handle', category: 'Cleaning Accessories' },
      vacuumHead: { selected: false, qty: '1', unit: 'Nos.', size: '14"', label: 'Aluminum Vacuum Head', category: 'Cleaning Accessories' },
      hosePipe: { selected: false, qty: '1', unit: 'Nos.', type: 'PE Hose Pipe', size: '15mtr', label: 'Hose Pipe', category: 'Cleaning Accessories' },
      vacuumNozzle: { selected: false, qty: '1', unit: 'Nos.', label: 'Vacuum Nozzle', category: 'Cleaning Accessories' },
      wallBrush: { selected: false, qty: '1', unit: 'Nos.', size: '18"', label: 'Wall Brush', category: 'Cleaning Accessories' },
      disinfectionChemical: { selected: false, qty: '1', unit: 'kg', label: 'Pool Disinfection Chemical', category: 'Cleaning Accessories' },
      testKit: { selected: false, qty: '1', unit: 'Nos.', label: 'Test Kit', category: 'Cleaning Accessories' },
      
      pipelessFilter: { selected: false, qty: '1', unit: 'Nos.', label: 'Pipeless Pool Filter', category: 'Filtration System' },
      poolFilter: { selected: false, qty: '1', unit: 'Nos.', type: 'Top Mounted', dia: '450', label: 'Pool Filter', category: 'Filtration System' },
      media: { selected: false, qty: '1', unit: 'KG', type: 'AFM', label: 'Filtration Media', category: 'Filtration System' },
      pump: { selected: false, qty: '1', unit: 'Nos.', hp: '0.75', label: 'Pool Pump', category: 'Filtration System' },
      uvSterilizer: { selected: false, qty: '1', unit: 'Nos.', label: 'UV Sterilizer', category: 'Filtration System' },
      saltChlorinator: { selected: false, qty: '1', unit: 'Nos.', label: 'HQ SQ Salt Chlorinator', category: 'Filtration System' },

      inletNozzle: { selected: false, qty: '1', unit: 'Nos.', label: 'Inlet Nozzle', category: 'Pool Fittings' },
      mainDrain: { selected: false, qty: '1', unit: 'Nos.', label: 'Main Drain', category: 'Pool Fittings' },
      poolSkimmer: { selected: false, qty: '1', unit: 'Nos.', label: 'Skimmer (Ultra wide)', category: 'Pool Fittings' },
      overflow: { selected: false, qty: '1', unit: 'mtr', size: '8 in', label: 'Overflow Grating', category: 'Pool Fittings' },
      fittings: { selected: false, qty: '1', unit: 'Set', label: 'Pool Fittings', category: 'Pool Fittings' },

      underwaterLight: { selected: false, qty: '1', unit: 'Nos.', watt: '6W', label: 'Underwater Light', category: 'Equipment' },
      poolLadder: { selected: false, qty: '1', unit: 'Nos.', steps: '3 step', label: 'Pool Ladder (SS304)', category: 'Equipment' },
      roboticCleaner: { selected: false, qty: '1', unit: 'Nos.', label: 'Robotic Pool Cleaner', category: 'Equipment' },
      ssCascade: { selected: false, qty: '1', unit: 'Nos.', label: 'SS Cascade', category: 'Equipment' },
    },
    authorized_Person: 'Your Name',
    special_Terms: 'Terms & Conditions:\n1. Payment: 100% advance along with P.O.\n2. Delivery: Within 7-10 days from receipt of advance.\n3. Taxes: GST 18% extra as applicable.\n4. Validity: This proposal is valid for 15 days.',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleItemToggle = (key: string) => {
    setInputs(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [key]: { ...prev.items[key], selected: !prev.items[key].selected }
      }
    }));
  };

  const handleItemSubChange = (key: string, field: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [key]: { ...prev.items[key], [field]: value }
      }
    }));
  };

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    await generateAccessoriesWordProposal(inputs, (percent, message) => {
      setProgress({ percent, message });
    });
    setTimeout(() => {
      setIsGenerating(false);
      setProgress({ percent: 0, message: '' });
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Helmet>
        <title>Octopus Proposal - Octopus</title>
        <link rel="icon" href="/Octopus Images/Octopus Only Logo.png" />
      </Helmet>
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 pb-6 no-print">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#20b3c4] text-xs font-bold uppercase tracking-wider">
              <Package className="w-3 h-3" />
              Accessories Proposal
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Accessories <span className="text-[#20b3c4]">Proposal</span> Generator
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
              Create Professional proposals for swimming pool accessories and Products.
            </p>
          </div>
          <button
            onClick={handleGenerateProposal}
            disabled={isGenerating}
            className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${isGenerating
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-[#028799] hover:shadow-xl hover:shadow-[#C7F5FF] active:scale-95'
              }`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <span>Download Proposal</span>
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>{progress.message}</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#20b3c4] transition-all duration-500 ease-out"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#20b3c4] flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-black text-slate-900 uppercase tracking-tight">Basic Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Reference Number
                </label>
                <input
                  type="text"
                  id="ref_Number"
                  value={inputs.ref_Number}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-[#20b3c4] outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> To (Client Name)
                </label>
                <textarea
                  id="to_Client"
                  value={inputs.to_Client}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-[#20b3c4] outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={inputs.date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-[#20b3c4] outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Subject
                </label>
                <input
                  type="text"
                  id="sub"
                  value={inputs.sub}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-[#20b3c4] outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> Authorized Person
                </label>
                <input
                  type="text"
                  id="authorized_Person"
                  value={inputs.authorized_Person}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-[#20b3c4] outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerateProposal}
            disabled={isGenerating}
            className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${isGenerating
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-[#20b3c4] hover:shadow-xl hover:shadow-[#C7F5FF] active:scale-95'
              }`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <>
                <span>Download Proposal</span>
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Right Column: Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#20b3c4] flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-black text-slate-900 uppercase tracking-tight">Product Selection</h2>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {Object.values(inputs.items).filter(i => i.selected).length} Items Selected
              </div>
            </div>
            <div className="p-6 space-y-8">
              {Object.entries(
                Object.entries(inputs.items).reduce((acc, [key, item]) => {
                  const category = item.category;
                  if (!acc[category]) acc[category] = [];
                  acc[category].push({ key, ...item });
                  return acc;
                }, {} as Record<string, any[]>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {category}
                    </h3>
                    <div className="h-px w-full bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => {
                      const key = item.key;
                      return (
                        <div
                          key={key}
                          className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${item.selected
                            ? 'border-[#E0F7FA] bg-[#F0FDFF]'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => handleItemToggle(key)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${item.selected
                                  ? 'bg-[#20b3c4] border-[#20b3c4] text-white'
                                  : 'border-slate-200 group-hover:border-[#20b3c4]'
                                  }`}
                              >
                                {item.selected && <CheckCircle2 className="w-4 h-4" />}
                              </div>
                              <span className={`font-bold text-sm ${item.selected ? 'text-black' : 'text-slate-600'}`}>
                                {item.label}
                              </span>
                            </div>
                          </div>

                          {item.selected && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-[1.5fr_2.5fr] gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                                  <div className="grid grid-cols-[3fr_1fr] gap-0 ">
                                    <input
                                      type="number"
                                      value={item.qty}
                                      onChange={(e) => handleItemSubChange(key, 'qty', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-600/20 rounded-r-0"
                                    />
                                    <span
                                      className='bg-gray-200 text-xs rounded-lg text-center justify-center px-3 py-1.5'
                                    >
                                      {item.unit}
                                    </span>
                                  </div>
                                </div>

                                {/* Sub-selections */}
                                {key === 'poolFilter' && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                      <select
                                        value={item.type}
                                        onChange={(e) => handleItemSubChange(key, 'type', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                      >
                                        <option value="Top Mounted">Top Mounted</option>
                                        <option value="Side Mounted">Side Mounted</option>
                                        <option value="Commercial">Commercial Filter</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Dia</label>
                                      <select
                                        value={item.dia}
                                        onChange={(e) => handleItemSubChange(key, 'dia', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                      >
                                        {item.type === 'Top Mounted' && (
                                          <>
                                            <option value="450">450 Dia</option>
                                            <option value="550">550 Dia</option>
                                            <option value="650">650 Dia</option>
                                            <option value="700">700 Dia</option>
                                            <option value="800">800 Dia</option>
                                            <option value="900">900 Dia</option>
                                          </>
                                        )}
                                        {item.type === 'Side Mounted' && <option value="1200">1200 Dia</option>}
                                        {item.type === 'Commercial' && <option value="2000">2000 Dia</option>}
                                      </select>
                                    </div>
                                  </div>
                                )}

                                {key === 'pump' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">HP</label>
                                    <select
                                      value={item.hp}
                                      onChange={(e) => handleItemSubChange(key, 'hp', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value="0.75">0.75 HP</option>
                                      <option value="1">1 HP</option>
                                      <option value="1.5">1.5 HP</option>
                                      <option value="2">2 HP</option>
                                      <option value="3">3 HP</option>
                                    </select>
                                  </div>
                                )}

                                {key === 'media' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                    <select
                                      value={item.type}
                                      onChange={(e) => handleItemSubChange(key, 'type', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value="AFM">AFM</option>
                                      <option value="SAND">SAND</option>
                                    </select>
                                  </div>
                                )}

                                {key === 'algaeBrush' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Size</label>
                                    <select
                                      value={item.size}
                                      onChange={(e) => handleItemSubChange(key, 'size', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value='10"'>10"</option>
                                      <option value='18"'>18"</option>
                                    </select>
                                  </div>
                                )}

                                {key === 'vacuumHead' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Size</label>
                                    <select
                                      value={item.size}
                                      onChange={(e) => handleItemSubChange(key, 'size', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value='14"'>14"</option>
                                      <option value='18"'>18"</option>
                                    </select>
                                  </div>
                                )}

                                {key === 'overflowGrating' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Size</label>
                                    <select
                                      value={item.size}
                                      onChange={(e) => handleItemSubChange(key, 'size', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value='8 in'>8 in</option>
                                      <option value='10 in'>10 in</option>
                                      <option value='12 in'>12 in</option>
                                    </select>
                                  </div>
                                )}

                                {key === 'hosePipe' && (
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                                      <select
                                        value={item.type}
                                        onChange={(e) => handleItemSubChange(key, 'type', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                      >
                                        <option value="PE Hose Pipe">PE Hose Pipe</option>
                                        <option value="EVA Hose Pipe">EVA Hose Pipe</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Length</label>
                                      <select
                                        value={item.size}
                                        onChange={(e) => handleItemSubChange(key, 'size', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                      >
                                        {item.type === 'PE Hose Pipe' && (
                                          <>
                                            <option value="15mtr">15mtr</option>
                                            <option value="30mtr">30mtr</option>
                                          </>
                                        )}
                                        {item.type === 'EVA Hose Pipe' && (
                                          <>
                                            <option value="9mtr">9mtr</option>
                                            <option value="15mtr">15mtr</option>
                                            <option value="30mtr">30mtr</option>
                                          </>
                                        )}
                                      </select>
                                    </div>
                                  </div>
                                )}

                                {key === 'poolLadder' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Steps</label>
                                    <select
                                      value={item.steps}
                                      onChange={(e) => handleItemSubChange(key, 'steps', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value="3 step">3 step</option>
                                      <option value="4 step">4 step</option>
                                      <option value="5 step">5 step</option>
                                    </select>
                                  </div>
                                )}

                                {key === 'underwaterLight' && (
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Wattage</label>
                                    <select
                                      value={item.watt}
                                      onChange={(e) => handleItemSubChange(key, 'watt', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                    >
                                      <option value="6W">6W</option>
                                      <option value="9W">9W</option>
                                      <option value="12W">12W</option>
                                      <option value="18W">18W</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoriesProposalGenerator;
