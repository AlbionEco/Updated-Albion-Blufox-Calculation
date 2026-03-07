import React, { useState, useEffect } from 'react';
import {  FileText, Download, Printer, Loader2,  Settings } from 'lucide-react';

import { generateBFProposal, generateBFWordProposal } from './bf_proposal';
import { generateSUSProposal, generateSUSWordProposal } from './sus_proposal';
import { generate500SProposal, generate500SWordProposal } from './500s_proposal';
import { generate500DProposal, generate500DWordProposal } from './500d_proposal';
import { generateSumitomoProposal, generateSumitomoWordProposal } from './sumitomo_proposal';

const ProposalGenerator: React.FC = () => {
  const [inputs, setInputs] = useState({
    quotation_Number: 'QTN-2026-',
    client_Name: '',
    date: new Date().toISOString().split('T')[0],
    special_Terms: '',
    treatment_Type: '',
    module: 'BF100',
    flowRate: '',
    flux: '',
    noOfTrain: '',
    noOfMembraneTank: '',
    workingHr: '20',
    membraneQty: 0,
    offer_Price: '',
    authorized_Person: '',
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
    const { module, flowRate, flux, workingHr } = inputs;
    const fRate = parseFloat(flowRate) || 0;
    const flx = parseFloat(flux) || 0;
    const wHr = parseFloat(workingHr) || 0;
    let membraneSurfaceAreaPerMBR = 0;

    if (module === "BF100N" || module === "BF100oxy" || module === "BF100") {
      membraneSurfaceAreaPerMBR = 10;
    } else if (module === "BF150N") {
      membraneSurfaceAreaPerMBR = 15;
    } else if (module === "BF200N" || module === "BF200oxy" || module === "BF200") {
      membraneSurfaceAreaPerMBR = 20;
    } else if (module === "BF125") {
      membraneSurfaceAreaPerMBR = 12.5;
    } else if (module === "BF300") {
      membraneSurfaceAreaPerMBR = 30;
    } else if (module === "BF220oxy") {
      membraneSurfaceAreaPerMBR = 22;
    } else if (module === "SUS097") {
      membraneSurfaceAreaPerMBR = 9.7;
    } else if (module === "SUS113") {
      membraneSurfaceAreaPerMBR = 11.3;
    } else if (module === "SUS193") {
      membraneSurfaceAreaPerMBR = 19.3;
    } else if (module === "SUS227") {
      membraneSurfaceAreaPerMBR = 22.7;
    } else if (module === "SUS313") {
      membraneSurfaceAreaPerMBR = 31.3;
    } else if (module === "SUS400") {
      membraneSurfaceAreaPerMBR = 40;
    } else if (module === "500S") {
      membraneSurfaceAreaPerMBR = 28;
    } else if (module === "500D") {
      membraneSurfaceAreaPerMBR = 31.6;
    } else if (module === "12B6") {
      membraneSurfaceAreaPerMBR = 6;
    } else if (module === "12B9") {
      membraneSurfaceAreaPerMBR = 9;
    } else if (module === "12B12") {
      membraneSurfaceAreaPerMBR = 12;
    }

    if (flx > 0 && wHr > 0 && membraneSurfaceAreaPerMBR > 0) {
      const TotalNumberOfModule = Math.ceil((fRate * 1000) / (flx * wHr * membraneSurfaceAreaPerMBR));
      setInputs(prev => ({ ...prev, membraneQty: TotalNumberOfModule }));
    } else {
      setInputs(prev => ({ ...prev, membraneQty: 0 }));
    }
  }, [inputs.module, inputs.flowRate, inputs.flux, inputs.workingHr]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleGeneratePDF = async () => {
    const { module } = inputs;
    setIsGenerating(true);
    updateProgress(0, "Starting PDF Generation...");

    if (module.startsWith('BF')) {
      await generateBFProposal(inputs, updateProgress);
    } else if (module.startsWith('SUS')) {
      await generateSUSProposal(inputs, updateProgress);
    } else if (module === '500S') {
      await generate500SProposal(inputs, updateProgress);
    } else if (module === '500D') {
      await generate500DProposal(inputs, updateProgress);
    } else if (module.startsWith('12B')) {
      await generateSumitomoProposal(inputs, updateProgress);
    } else {
      alert(`${module} PDF generation logic not implemented yet. Please try again after some time.`);
    }
    
    setTimeout(() => setIsGenerating(false), 1000);
  };

  const handleGenerateWord = async () => {
    const { module } = inputs;
    setIsGenerating(true);
    updateProgress(0, "Starting Word Generation...");

    if (module.startsWith('BF')) {
      await generateBFWordProposal(inputs, updateProgress);
    } else if (module.startsWith('SUS')) {
      await generateSUSWordProposal(inputs, updateProgress);
    } else if (module === '500S') {
      await generate500SWordProposal(inputs, updateProgress);
    } else if (module === '500D') {
      await generate500DWordProposal(inputs, updateProgress);
    } else if (module.startsWith('12B')) {
      await generateSumitomoWordProposal(inputs, updateProgress);
    } else {
      alert(`${module} Word generation logic not implemented yet. Please try again after some time.`);
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans text-slate-900">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 pb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Proposal Generator</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Technical Proposal Creation Tool</p>
        </div>
        <div className="text-right">
          <p className="text-blue-600 font-black text-2xl tracking-tighter">BLUFOX</p>
          <p className="text-slate-400 text-[12px] uppercase font-bold tracking-widest">Ecoventures LLP</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-black uppercase tracking-tight italic">Proposal Configuration</h3>
        </div>

        <form className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quotation Number */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Quotation Number
              </label>
              <input
                type="text"
                id="quotation_Number"
                value={inputs.quotation_Number}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="QTN-2026-XXXX"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Date
              </label>
              <input
                type="date"
                id="date"
                value={inputs.date}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Client Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Client Name
              </label>
              <textarea
                id="client_Name"
                value={inputs.client_Name}
                onChange={handleInputChange}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="XYZ Pvt. Ltd."
              />
            </div>

            {/* Treatment Type */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Water Treatment Type
              </label>
              <input
                type="text"
                id="treatment_Type"
                value={inputs.treatment_Type}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g., STP/ETP"
              />
            </div>

            {/* Membrane Module */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Select Membrane Module
              </label>
              <select
                id="module"
                value={inputs.module}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <optgroup label="BF Series">
                  <option value="BF100">BF100</option>
                  <option value="BF125">BF125</option>
                  <option value="BF200">BF200</option>
                  <option value="BF300">BF300</option>
                </optgroup>
                <optgroup label="BF N Series">
                  <option value="BF100N">BF100N</option>
                  <option value="BF150N">BF150N</option>
                  <option value="BF200N">BF200N</option>
                </optgroup>
                <optgroup label="BF Oxy Series">
                  <option value="BF100oxy">BF100oxy</option>
                  <option value="BF200oxy">BF200oxy</option>
                  <option value="BF220oxy">BF220oxy</option>
                </optgroup>
                <optgroup label="SUS Series">
                  <option value="SUS097">SUS097</option>
                  <option value="SUS113">SUS113</option>
                  <option value="SUS193">SUS193</option>
                  <option value="SUS227">SUS227</option>
                  <option value="SUS313">SUS313</option>
                  <option value="SUS400">SUS400</option>
                </optgroup>
                <optgroup label="500 Series">
                  <option value="500S">BF500S (28m2)</option>
                  <option value="500D">BF500D (31.6m2)</option>
                </optgroup>
                <optgroup label="Sumitomo PTFE Membrane">
                  <option value="12B6">Sumitomo 12B6 (6m2)</option>
                  <option value="12B9">Sumitomo 12B9 (9m2)</option>
                  <option value="12B12">Sumitomo 12B12 (12m2)</option>
                </optgroup>
              </select>
            </div>

            {/* Flow Rate */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Average Daily Flow Rate (KLD)
              </label>
              <input
                type="text"
                id="flowRate"
                value={inputs.flowRate}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter Flow Rate"
              />
            </div>

            {/* Flux */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Design Flux (LMH)
              </label>
              <input
                type="text"
                id="flux"
                value={inputs.flux}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter Flux"
              />
            </div>

            {/* Skid/Train */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Number of Skid/Train
              </label>
              <input
                type="text"
                id="noOfTrain"
                value={inputs.noOfTrain}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter no of Train"
              />
            </div>

            {/* Membrane Tank */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Number of Membrane Tank
              </label>
              <input
                type="text"
                id="noOfMembraneTank"
                value={inputs.noOfMembraneTank}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter no of Membrane Tank"
              />
            </div>

            {/* Working Hours */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Working Hours
              </label>
              <input
                type="text"
                id="workingHr"
                value={inputs.workingHr}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Membrane Quantity (Calculated) */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Membrane Quantity (Calculated)
              </label>
              <input
                type="number"
                id="membraneQty"
                value={inputs.membraneQty}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm font-black text-blue-700 outline-none"
              />
            </div>

            {/* Offer Price */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Offer Price (Rs. / Module)
              </label>
              <input
                type="text"
                id="offer_Price"
                value={inputs.offer_Price}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter Offer Price"
              />
            </div>

            {/* Authorized Person */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Authorized Person
              </label>
              <input
                type="text"
                id="authorized_Person"
                value={inputs.authorized_Person}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Name Surname"
              />
            </div>

            {/* Special Terms */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 Specific Terms
              </label>
              <textarea
                id="special_Terms"
                value={inputs.special_Terms}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter any specific terms or conditions..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              GENERATE PROPOSAL PDF
            </button>
            <button
              type="button"
              onClick={handleGenerateWord}
              disabled={isGenerating}
              className="flex-1 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-lg shadow-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              GENERATE PROPOSAL WORD
            </button>
          </div>
        </form>
      </div>

      {/* Progress Modal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-2">{progressMessage}</h3>
              <p className="text-sm text-slate-500">Please wait while we prepare your document...</p>
            </div>
            
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalGenerator;