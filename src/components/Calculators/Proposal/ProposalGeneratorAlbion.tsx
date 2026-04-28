import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Calculator } from 'lucide-react';

import { generateB2BWordProposal } from './b2b_proposal.ts';
import { generateB2CWordProposal } from './b2c_proposal.ts'
import { Helmet } from 'react-helmet-async';

const ProposalGenerator: React.FC = () => {
  const [inputs, setInputs] = useState({
    quotation_Number: 'QTN-2026-',
    date: new Date().toISOString().split('T')[0],
    client_Name: '',
    offer_Price: 0,
    flowRate: '',
    treatment_Type: '',
    packagedOrCivil: 'packaged',
    Technology_Type: 'MBR',
    authorized_Person: '',
    b2borb2c: 'b2b',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const updateProgress = (percent: number, message: string) => {
    setProgress(percent);
    setProgressMessage(message);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  // handle proper radio button change for media type
  const handleradioTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputs(prev => ({ ...prev, packagedOrCivil: value }));
  };

  const handleradioB2BorB2CTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputs(prev => ({ ...prev, b2borb2c: value }));
  }

  const handleGenerateWord = async () => {
    setIsGenerating(true);
    updateProgress(0, "Starting Word Generation...");

    if(inputs.b2borb2c === "b2b" && Number(inputs.flowRate) > 0) {
      await generateB2BWordProposal(inputs, updateProgress);
    } else if(inputs.b2borb2c === "b2c") {
      await generateB2CWordProposal(inputs, updateProgress);
    } else {
      alert(`Word generation logic not implemented yet. Please try again after some time.`);
      setIsGenerating(false);
      return;
    }

    setTimeout(() => setIsGenerating(false), 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans text-slate-900">
      <Helmet>
        <title>Proposal Generator - Albion</title>
        <link rel="icon" href="/Albion_Only_Logo-removebg-preview.png" />
      </Helmet>
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">Proposal Generator</h1>
              <p className="text-green-100 text-[10px] uppercase tracking-wider">Albion</p>
            </div>
          </div>
          <img
            src="/Albion high - logo.jpg"
            alt="Albion Logo"
            className="h-12 bg-white p-1 rounded"
          />
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
            <div className="space-y-1.5">
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

            {/* Offer Price */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Offer Price (Rs.) (Optional)
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

            {/* Treatment Type  STP- ETP */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Water Treatment Type (Must Write Full name)
              </label>
              <input
                type="text"
                id="treatment_Type"
                value={inputs.treatment_Type}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g., Sewage Treatment Plant / Effluent Treatment Plant"
              />
            </div>

            <div className='grid grid-rows-2 gap-4'>
              {/* Modular or Civil based selection */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-3">

                  {/* Packaged */}
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.packagedOrCivil === "packaged"
                      ? "border-green-500 bg-green-500/5 text-green-600"
                      : "border-slate-100 hover:border-slate-200 text-slate-600"
                      }`}
                  >
                    <input
                      type="radio"
                      name="packagedOrCivil"
                      value="packaged"
                      checked={inputs.packagedOrCivil === "packaged"}
                      onChange={handleradioTypeChange}
                      className="hidden"
                    />
                    <span className="text-xs font-bold uppercase">
                      Packaged / Modular
                    </span>
                  </label>

                  {/* Civil */}
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.packagedOrCivil === "civil"
                      ? "border-green-500 bg-green-500/5 text-green-600 "
                      : "border-slate-100 hover:border-slate-200 text-slate-600"
                      }`}
                  >
                    <input
                      type="radio"
                      name="packagedOrCivil"
                      value="civil"
                      checked={inputs.packagedOrCivil === "civil"}
                      onChange={handleradioTypeChange}
                      className="hidden"
                    />
                    <span className="text-xs font-bold uppercase">
                      Civil
                    </span>
                  </label>

                </div>
              </div>

              {/* B2B or B2C */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-3">

                  {/* B2B */}
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.b2borb2c === "b2b"
                      ? "border-green-500 bg-green-500/5 text-green-600"
                      : "border-slate-100 hover:border-slate-200 text-slate-600"
                      }`}
                  >
                    <input
                      type="radio"
                      name="b2borb2c"
                      value="b2b"
                      checked={inputs.b2borb2c === "b2b"}
                      onChange={handleradioB2BorB2CTypeChange}
                      className="hidden"
                    />
                    <span className="text-xs font-bold uppercase">
                      B2B
                    </span>
                  </label>

                  {/* B2C */}
                  <label
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${inputs.b2borb2c === "b2c"
                      ? "border-green-500 bg-green-500/5 text-green-600 "
                      : "border-slate-100 hover:border-slate-200 text-slate-600"
                      }`}
                  >
                    <input
                      type="radio"
                      name="b2borb2c"
                      value="b2c"
                      checked={inputs.b2borb2c === "b2c"}
                      onChange={handleradioB2BorB2CTypeChange}
                      className="hidden"
                    />
                    <span className="text-xs font-bold uppercase">
                      B2C
                    </span>
                  </label>

                </div>
              </div>

            </div>

            {/* Drop Down - MBR , AMBBR */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Plant Type
              </label>
              <select
                id="Technology_Type"
                value={inputs.Technology_Type}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                <option value="MBR">MBR</option>
                <option value="AMBBR">AMBBR</option>
              </select>
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
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
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