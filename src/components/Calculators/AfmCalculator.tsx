import React, { useState, useEffect } from 'react';
import { Printer, Calculator, FileText, Info } from 'lucide-react';

const AfmCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    project: '',
    flowVelocity: 0,
    VolumetricFlowRate: 0,
    NoFilters: 0,
    FilterHeight: 0,
    TopCollectorHeight: 0,
    DishedEndHeight: 0,
    BackwashTemperature: 10,
    BackwashVelocity: 0,
    SuspendedSolidsLoading: 0,
    afmStandardFilterationLayers: 'AFM G1',
    AFMGrade2: 'AFMng Grade 2',
    AFMGrade1: 'AFMng Grade 1',
    manualAFMGrade3BelowLateral: 0,
    manualAFMGrade3AboveLateral: 0,
    manualAFMGrade2: 0,
    manualAFMGrade1: 0,
    manualAFMGrade0: 0,
    manualAnthracite: 0,
  });

  const [outputs, setOutputs] = useState<any>(null);
  const [backwashData, setBackwashData] = useState<any>(null);
  const [errors, setErrors] = useState({ flowVelocity: '', afmGrade2: '' });

  useEffect(() => {
    fetch('/backwashafm.json')
      .then(res => res.json())
      .then(data => setBackwashData(data))
      .catch(err => console.error('Failed to load backwash data:', err));
  }, []);

  const validateInputs = (id: string, value: number) => {
    if (id === 'flowVelocity') {
      if (value < 5 || value > 30) {
        setErrors(prev => ({ ...prev, flowVelocity: 'Flow velocity must be between 5 and 30 m/h' }));
      } else {
        setErrors(prev => ({ ...prev, flowVelocity: '' }));
      }
    }
    if (id === 'manualAFMGrade2') {
      if (value < 0 || value > 0.5) {
        setErrors(prev => ({ ...prev, afmGrade2: 'AFM Grade 2 must be between 0 and 0.5 m' }));
      } else {
        setErrors(prev => ({ ...prev, afmGrade2: '' }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const numValue = type === 'number' ? parseFloat(value) : value;

    if (type === 'number') {
      validateInputs(id, parseFloat(value));
    }

    setInputs(prev => ({
      ...prev,
      [id]: numValue
    }));
  };

  const calculate = async () => {
    if (errors.flowVelocity || errors.afmGrade2) {
      alert('Please fix validation errors before calculating.');
      return;
    }

    const {
      flowVelocity,
      VolumetricFlowRate,
      NoFilters,
      FilterHeight,
      TopCollectorHeight,
      DishedEndHeight,
      BackwashTemperature,
      BackwashVelocity,
      SuspendedSolidsLoading,
      afmStandardFilterationLayers,
      AFMGrade2,
      AFMGrade1
    } = inputs;

    let {
      manualAFMGrade3BelowLateral,
      manualAFMGrade3AboveLateral,
      manualAFMGrade2,
      manualAFMGrade1,
      manualAFMGrade0,
      manualAnthracite
    } = inputs;


    const TotalFilterationAreaRequired = VolumetricFlowRate / flowVelocity;
    const FiltrationAreaPerFilter = TotalFilterationAreaRequired / NoFilters;
    const FilterDiameter = Math.sqrt(FiltrationAreaPerFilter * 4 / Math.PI);


    // Load JSON
    const response = await fetch("/backwashafm.json");
    const data = await response.json();

    // Helper to get value from backwash data
    const getBackwashValue = (targetKey: string) => {
      const obj = data.find((o: any) => o[targetKey]);
      if (!obj) return 0;

      const tempData = obj[targetKey][BackwashTemperature.toString()];
      if (!tempData) return 0;

      return tempData[BackwashVelocity.toString()] ?? 0;
    };

    const AFMngG2P = getBackwashValue("AFMng Grade 2 - Bed Expansion");
    const AFMsG2P = 0; // As per script
    const AFMngG1P = getBackwashValue("AFMng Grade 1(100%)");
    const AFMsG1P = getBackwashValue("AFMs Grade 1(100%)");
    const AFMsG0P = getBackwashValue("AFMng Grade 0 (100%)");
    console.log("AFMngG2P", AFMngG2P);
    console.log("AFMngG1P", AFMngG1P);
    console.log("AFMsG1P", AFMsG1P);
    console.log("AFMsG0P", AFMsG0P);




    const AFMngG2Factor = 1 + (AFMngG2P / 100);
    const AFMsG2Factor = 1 + (AFMsG2P / 100);
    const AFMngG1Factor = 1 + (AFMngG1P / 100);
    const AFMsG1Factor = 1 + (AFMsG1P / 100);
    const AFMsG0Factor = 1 + (AFMsG0P / 100);
    const AnthraciteFactor = 1.5;

    // Standard Filtration heights
    let F21 = (AFMGrade2 === "AFMng Grade 2") ? 0.4 * (TopCollectorHeight - 0.2) / AFMngG2Factor : 0.4 * (TopCollectorHeight - 0.2) / AFMsG2Factor;
    let G21 = (AFMGrade1 === "AFMng Grade 1") ? 0.65 * (TopCollectorHeight - 0.2) / AFMngG1Factor : 0.65 * (TopCollectorHeight - 0.2) / AFMsG1Factor;

    let F22 = (AFMGrade2 === "AFMng Grade 2") ? 0.3 * (TopCollectorHeight - 0.4) / AFMngG2Factor : 0.3 * (TopCollectorHeight - 0.4) / AFMsG2Factor;
    let G22 = (AFMGrade1 === "AFMng Grade 1") ? 0.6 * (TopCollectorHeight - 0.4) / AFMngG1Factor : 0.6 * (TopCollectorHeight - 0.4) / AFMsG1Factor;
    let I22 = TopCollectorHeight < 1.5 ? 0.15 : 0.2;

    let F23 = (AFMGrade2 === "AFMng Grade 2") ? 0.3 * (TopCollectorHeight - 0.2) / AFMngG2Factor : 0.3 * (TopCollectorHeight - 0.2) / AFMsG2Factor;
    let G23 = (AFMGrade1 === "AFMng Grade 1") ? 0.55 * (TopCollectorHeight - 0.2) / AFMngG1Factor : 0;
    let H23 = 0.25 * (TopCollectorHeight - 0.2) / AFMsG0Factor;

    let F24 = (AFMGrade2 === "AFMng Grade 2") ? 0.3 * (TopCollectorHeight - 0.4) / AFMngG2Factor : 0.3 * (TopCollectorHeight - 0.4) / AFMsG2Factor;
    let G24 = (AFMGrade1 === "AFMng Grade 1") ? 0.35 * (TopCollectorHeight - 0.2) / AFMngG1Factor : 0.35 * (TopCollectorHeight - 0.2) / AFMsG1Factor;
    let H24 = 0.25 * (TopCollectorHeight - 0.25) / AFMsG0Factor;
    let I24 = TopCollectorHeight < 1.5 ? 0.15 : 0.2;

    let G3below = 0, G3above = 0, G2 = 0, G1 = 0, G0 = 0, Anthracite = 0;

    if (afmStandardFilterationLayers === "AFM G1") {
      G3below = parseFloat((DishedEndHeight / 0.05).toFixed(2)) * 0.05;
      G3above = 0;
      G2 = Math.floor(F21 / 0.05) * 0.05;
      G1 = Math.floor(G21 / 0.05) * 0.05;
    } else if (afmStandardFilterationLayers === "AFM G1+Anthracite") {
      G3below = DishedEndHeight;
      G2 = Math.floor(F22 / 0.05) * 0.05;
      G1 = Math.floor(G22 / 0.05) * 0.05;
      Anthracite = I22;
    } else if (afmStandardFilterationLayers === "AFM G1+G0") {
      G3below = DishedEndHeight;
      G2 = Math.floor(F23 / 0.05) * 0.05;
      G1 = Math.floor(G23 / 0.05) * 0.05;
      G0 = Math.floor(H23 / 0.05) * 0.05;
    } else if (afmStandardFilterationLayers === "AFM G1+G0+Anthracite") {
      G3below = DishedEndHeight;
      G2 = Math.floor(F24 / 0.05) * 0.05;
      G1 = Math.floor(G24 / 0.05) * 0.05;
      G0 = Math.floor(H24 / 0.05) * 0.05;
      Anthracite = I24;
    }

    console.log("G2 %:", AFMngG2P);
    console.log("G1 %:", AFMngG1P);
    console.log("G0 %:", AFMsG0P);


    if (manualAFMGrade3BelowLateral === 0) manualAFMGrade3BelowLateral = G3below;
    if (manualAFMGrade3AboveLateral === 0) manualAFMGrade3AboveLateral = G3above;
    if (manualAFMGrade2 === 0) manualAFMGrade2 = G2;
    if (manualAFMGrade1 === 0) manualAFMGrade1 = G1;
    if (manualAFMGrade0 === 0) manualAFMGrade0 = G0;
    if (manualAnthracite === 0) manualAnthracite = Anthracite;

    let AFMngG2Expand = AFMGrade2 === "AFMng Grade 2" ? manualAFMGrade2 * AFMngG2Factor : 0;
    let AFMsG2Expand = AFMGrade2 === "AFMs Grade 2" ? manualAFMGrade2 * AFMsG2Factor : 0;
    let AFMngG1Expand = AFMGrade1 === "AFMng Grade 1" ? manualAFMGrade1 * AFMngG1Factor : 0;
    let AFMsG1Expand = AFMGrade1 === "AFMs Grade 1" ? manualAFMGrade1 * AFMsG1Factor : 0;
    let AFMsG0Expand = manualAFMGrade0 * AFMsG0Factor;
    let AnthraciteExpand = manualAnthracite * AnthraciteFactor;

    const MediaDepthWithinTc = manualAFMGrade3AboveLateral + manualAFMGrade2 + manualAFMGrade1 + manualAFMGrade0 + manualAnthracite;
    let MediaExpandedDepthwithinTC = 0;
    if (AFMGrade2 === "AFMng Grade 2" && AFMGrade1 === "AFMng Grade 1") {
      MediaExpandedDepthwithinTC = (AFMngG2Expand + AFMngG1Expand + AFMsG0Expand + AnthraciteExpand) + manualAFMGrade3AboveLateral;
    } else if (AFMGrade2 === "AFMs Grade 2" && AFMGrade1 === "AFMs Grade 1") {
      MediaExpandedDepthwithinTC = (AFMsG2Expand + AFMsG1Expand + AFMsG0Expand + AnthraciteExpand) + manualAFMGrade3AboveLateral;
    } else if (AFMGrade2 === "AFMng Grade 2" && AFMGrade1 === "AFMs Grade 1") {
      MediaExpandedDepthwithinTC = (AFMngG2Expand + AFMsG1Expand + AFMsG0Expand + AnthraciteExpand) + manualAFMGrade3AboveLateral;
    } else if (AFMGrade2 === "AFMs Grade 2" && AFMGrade1 === "AFMng Grade 1") {
      MediaExpandedDepthwithinTC = (AFMsG2Expand + AFMngG1Expand + AFMsG0Expand + AnthraciteExpand) + manualAFMGrade3AboveLateral;
    }

    const FiltrationBedHeightM = MediaDepthWithinTc - manualAFMGrade3AboveLateral;
    const FiltrationBedHeightatBackwashM = MediaExpandedDepthwithinTC - manualAFMGrade3AboveLateral;
    const BedExpansionM = FiltrationBedHeightatBackwashM - FiltrationBedHeightM;
    const BedExpansionP = (BedExpansionM / FiltrationBedHeightM) * 100;

    console.log("BedExpansionP,BedExpansionM,FiltrationBedHeightM", BedExpansionP, BedExpansionM, FiltrationBedHeightM);

    const BedHeightFiltrationM = MediaDepthWithinTc - manualAFMGrade3AboveLateral;
    const BedHeightBackwashM = MediaExpandedDepthwithinTC - manualAFMGrade3AboveLateral;
    const BedExpansionM2 = BedHeightBackwashM - BedHeightFiltrationM;
    const BedExpansionP2 = (BedExpansionM2 / BedHeightFiltrationM) * 100;
    console.log("MediaExpandedDepthwithinTC:", MediaExpandedDepthwithinTC);

    const FiltrationBedExpansion = (manualAnthracite > 0) ? Math.floor(BedExpansionP2) : Math.floor(BedExpansionP);
    console.log("FiltrationBedExpansion:", FiltrationBedExpansion);
    const BackwashFlowRate = FiltrationAreaPerFilter * BackwashVelocity;
    const RecommendedInternalPipeDiameter = Math.sqrt((4 * BackwashFlowRate) / (Math.PI * 2 * 3600)) * 1000;
    const MinimumInternalPipeDiameter = Math.sqrt((4 * BackwashFlowRate) / (Math.PI * 2.5 * 3600)) * 1000;

    // Media Quantities
    const InsideDishDepth = DishedEndHeight;
    let volumeVolumeGrade3 = ((Math.pow(FilterDiameter, 3) * DishedEndHeight * (Math.PI / 24)) * (3 * Math.pow(manualAFMGrade3BelowLateral / InsideDishDepth, 2) - Math.pow(manualAFMGrade3BelowLateral / InsideDishDepth, 3)) * 1000);
    let volumeVolumeGrade3All = (FiltrationAreaPerFilter * manualAFMGrade3AboveLateral * 1000) + volumeVolumeGrade3;
    let volumeVolumeGrade2 = FiltrationAreaPerFilter * manualAFMGrade2 * 1000;
    let volumeVolumeGrade1 = FiltrationAreaPerFilter * manualAFMGrade1 * 1000;
    let volumeVolumeGrade0 = FiltrationAreaPerFilter * manualAFMGrade0 * 1000;
    let volumeVolumeAnthracite = FiltrationAreaPerFilter * manualAnthracite * 1000;

    const BulkBedDensity = 1.25;
    const BulkBedDensityAnthracite = 0.7;

    let MediaWeightGrade3All = volumeVolumeGrade3All * BulkBedDensity;
    let MediaWeightGrade2 = volumeVolumeGrade2 * BulkBedDensity;
    let MediaWeightGrade1 = volumeVolumeGrade1 * BulkBedDensity;
    let MediaWeightGrade0 = volumeVolumeGrade0 * BulkBedDensity;
    let MediaWeightAnthracite = volumeVolumeAnthracite * BulkBedDensityAnthracite;

    const M23 = MediaWeightGrade3All * NoFilters;
    const N23 = MediaWeightGrade2 * NoFilters;
    const O23 = MediaWeightGrade1 * NoFilters;
    const P23 = MediaWeightGrade0 * NoFilters;
    const Q23 = MediaWeightAnthracite * NoFilters;

    const M24 = Math.round(M23 / 24) * 24 / 25;
    const N24 = Math.round(N23 / 24) * 24 / 25;
    const O24 = Math.round(O23 / 24) * 24 / 25;
    const P24 = Math.round(P23 / 25) * 25 / 25;
    const Q24 = Math.round(Q23 / 25) * 25 / 25;

    const AFMTotalMt = (M23 + N23 + O23 + P23) / 1000;
    const AFMTotalM3 = AFMTotalMt / BulkBedDensity;
    const AFMTotakBag = (M24 + N24 + O24 + P24);
    const AFMFullPalletes = Math.floor(AFMTotakBag / 40);
    const AFMFullPalletes2 = AFMTotakBag - (AFMFullPalletes * 40);
    const AFMtotalAmountofPalettes = Math.ceil(AFMTotakBag / 40);

    const FreeBoardAfterbedExpansion = TopCollectorHeight - MediaExpandedDepthwithinTC;
    let colorbg = "bg-green-500";
    let barHeight = "150px";

    if (FreeBoardAfterbedExpansion > 0.2) {
      colorbg = "bg-green-500";
      barHeight = "150px";
    } else if (FreeBoardAfterbedExpansion > 0.15) {
      colorbg = "bg-orange-500";
      barHeight = "180px";
      alert("Error: Max limit is near!");
    } else {
      colorbg = "bg-red-500";
      barHeight = "220px";
      alert("Error: Max limit exceeds!");
    }

    // Estimated Filtration Cycle Time
    const calculateCycleValues = (base: number, exponent: number) => {
      return flowVelocity < 5 ? 0 : base * Math.pow(flowVelocity, exponent);
    };

    let Loadingcapacity = 0;
    if (afmStandardFilterationLayers === "AFM G1") Loadingcapacity = calculateCycleValues(513.44, -1.013);
    else if (afmStandardFilterationLayers === "AFM G1+Anthracite") Loadingcapacity = calculateCycleValues(2114, -1.033);
    else if (afmStandardFilterationLayers === "AFM G1+G0") Loadingcapacity = calculateCycleValues(341.8, -1.025);
    else if (afmStandardFilterationLayers === "AFM G1+G0+Anthracite") Loadingcapacity = calculateCycleValues(1252.7, -1.011);

    const EstimatedFiltrationCycleTime = parseFloat(((Loadingcapacity / SuspendedSolidsLoading) * 4).toFixed(2));

    setOutputs({
      TotalFilterationAreaRequired,
      FiltrationAreaPerFilter,
      FilterDiameter,
      FiltrationBedExpansion,
      BackwashFlowRate,
      RecommendedInternalPipeDiameter,
      MinimumInternalPipeDiameter,
      EstimatedFiltrationCycleTime,
      FixAFMGrade3BelowLateral: G3below,
      FixAFMGrade3AboveLateral: G3above,
      fixAFMGrade2: G2,
      fixAFMGrade1: G1,
      fixAFMGrade0: G0,
      fixAnthracite: Anthracite,
      manualAFMGrade3BelowLateral,
      manualAFMGrade3AboveLateral,
      manualAFMGrade2,
      manualAFMGrade1,
      manualAFMGrade0,
      manualAnthracite,
      MediaWeightGrade3All,
      MediaWeightGrade2,
      MediaWeightGrade1,
      MediaWeightGrade0,
      MediaWeightAnthracite,
      M23, N23, O23, P23, Q23,
      M24, N24, O24, P24, Q24,
      AFMTotalM3,
      AFMTotalMt,
      AFMTotakBag,
      AFMFullPalletes,
      AFMFullPalletes2,
      AFMtotalAmountofPalettes,
      MediaDepthWithinTc,
      MediaExpandedDepthwithinTC,
      FreeBoardAfterbedExpansion,
      colorbg,
      barHeight
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">AFM Calculation</h1>
              <p className="text-green-100 text-[10px] uppercase tracking-wider underline">Under Review - Do Not Use for Production</p>
            </div>
          </div>
          <img
            src="/Albion high - logo.jpg"
            alt="Albion Logo"
            className="h-12 bg-white p-1 rounded"
          />
        </div>

        <form className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50/50 p-3 rounded border border-green-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Project Name</label>
              <input type="text" id="project" value={inputs.project} onChange={handleInputChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700 uppercase">Flow Velocity (m/h)</label>
              <input type="number" id="flowVelocity" value={inputs.flowVelocity} onChange={handleInputChange} className={`w-full px-2 py-1 text-sm rounded border outline-none ${errors.flowVelocity ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.flowVelocity && <p className="text-[9px] text-red-500 font-bold">{errors.flowVelocity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
            {/* Filtration Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Filtration</h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <CompactInput label="Volumetric Flow (m³/h)" id="VolumetricFlowRate" value={inputs.VolumetricFlowRate} onChange={handleInputChange} />
                <CompactInput label="No. Filters" id="NoFilters" value={inputs.NoFilters} onChange={handleInputChange} />
                <CompactInput label="Filter Height (m)" id="FilterHeight" value={inputs.FilterHeight} onChange={handleInputChange} />
                <CompactInput label="Top Collector Height (TC) (m)" id="TopCollectorHeight" value={inputs.TopCollectorHeight} onChange={handleInputChange} />
                <CompactInput label="Dished End Height (TD) (m)" id="DishedEndHeight" value={inputs.DishedEndHeight} onChange={handleInputChange} />
              </div>
            </div>

            {/* Backwash Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Backwash</h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">B/W Temp (℃)</label>
                  <select id="BackwashTemperature" value={inputs.BackwashTemperature} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                  </select>
                </div>
                <CompactInput label="Backwash Velocity (m/h)" id="BackwashVelocity" value={inputs.BackwashVelocity} onChange={handleInputChange} />
              </div>
            </div>

            {/* Layers Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Filtration Cycle</h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <CompactInput label="Suspended Solids Loading: (TSS mg/l)" id="SuspendedSolidsLoading" value={inputs.SuspendedSolidsLoading} onChange={handleInputChange} />
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Standard Layers</label>
                  <select id="afmStandardFilterationLayers" value={inputs.afmStandardFilterationLayers} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                    <option value="AFM G1">AFM G1</option>
                    <option value="AFM G1+Anthracite">AFM G1+Anthracite</option>
                    <option value="AFM G1+G0">AFM G1+G0</option>
                    <option value="AFM G1+G0+Anthracite">AFM G1+G0+Anthracite</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Grade 2</label>
                    <select id="AFMGrade2" value={inputs.AFMGrade2} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                      <option value="AFMng Grade 2">AFMng G2</option>
                      <option value="AFMs Grade 2">AFMs G2</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Grade 1</label>
                    <select id="AFMGrade1" value={inputs.AFMGrade1} onChange={handleInputChange} className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded">
                      <option value="AFMng Grade 1">AFMng G1</option>
                      <option value="AFMs Grade 1">AFMs G1</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 no-print">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-green-600" />
                <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Manual Input (m)</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <CompactInput label="AFM Grade 3 Below Lateral (m) (optional)" id="manualAFMGrade3BelowLateral" value={inputs.manualAFMGrade3BelowLateral} onChange={handleInputChange} />
                <CompactInput label="AFM Grade 3 Above Lateral (m) (optional)" id="manualAFMGrade3AboveLateral" value={inputs.manualAFMGrade3AboveLateral} onChange={handleInputChange} />
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">AFM Grade 2 (m) (optional)</label>
                  <input type="number" step="any" id="manualAFMGrade2" value={inputs.manualAFMGrade2} onChange={handleInputChange} className={`w-full px-1.5 py-1 text-xs bg-gray-50 border rounded outline-none ${errors.afmGrade2 ? 'border-red-500' : 'border-gray-200'}`} />
                  {errors.afmGrade2 && <p className="text-[8px] text-red-500 font-bold">{errors.afmGrade2}</p>}
                </div>
                <CompactInput label="AFM Grade 1(m) (optional)" id="manualAFMGrade1" value={inputs.manualAFMGrade1} onChange={handleInputChange} />
                <CompactInput label="AFM Grade 0 (m) (optional)" id="manualAFMGrade0" value={inputs.manualAFMGrade0} onChange={handleInputChange} />
                <CompactInput label="Anthracite (m) (optional)" id="manualAnthracite" value={inputs.manualAnthracite} onChange={handleInputChange} />
              </div>
            </div>
          </div>
            <div className="flex items-end">
              <button type="button" onClick={calculate} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded shadow transition-all flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" /> Calculate Results

              </button>
            </div>

          {outputs && (
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Filtration & Backwash Results */}
                <div className='flex grid grid-cols-3 gap-5'>
                  <div>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                      <FileText className="w-3.5 h-3.5 text-green-600" />
                      <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Filtration Parameter</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        <ResultItem label="Flow Velocity" value={inputs.flowVelocity} unit="m/h" />
                        <ResultItem label="Volumetric Flow Rate" value={inputs.VolumetricFlowRate} unit="m³/h" />
                        <ResultItem label="Total Filtration Area Required" value={Number(parseFloat(outputs.TotalFilterationAreaRequired.toFixed(2)))} unit="m²" />
                        <ResultItem label="No. Filters" value={inputs.NoFilters} unit="No." />
                        <ResultItem label="Filtration Area per Filter" value={Number(parseFloat(outputs.FiltrationAreaPerFilter.toFixed(2)))} unit="m²" />
                        <ResultItem label="Filter Diameter" value={Number(parseFloat(outputs.FilterDiameter.toFixed(2)))} unit="m" highlight />
                        <ResultItem label="Filter Height (H)" value={inputs.FilterHeight} unit="m" />
                        <ResultItem label="Top Collector Height (TC)" value={inputs.TopCollectorHeight} unit="m" />
                        <ResultItem label="Dished End Height (TD)" value={inputs.DishedEndHeight} unit="m" />

                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                      <FileText className="w-3.5 h-3.5 text-green-600" />
                      <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Backwash Parameter</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        <ResultItem label="B/W Temp" value={inputs.BackwashTemperature} unit="℃" />
                        <ResultItem label="B/W Velocity" value={inputs.BackwashVelocity} unit="m/h" />
                        <ResultItem label="Filtration Bed Expansion" value={outputs.FiltrationBedExpansion} unit="%(min.20%)" />
                        <ResultItem label="Backwash Flow Rate" value={Number(parseFloat(outputs.BackwashFlowRate.toFixed(2)))} unit="m³/h" />
                        <ResultItem label="Recommended Internal Pipe Diameter" value={Number(parseFloat(outputs.RecommendedInternalPipeDiameter.toFixed(2)))} unit="mm(2m/s)" />
                        <ResultItem label="Minimum Internal Pipe Diameter" value={Number(parseFloat(outputs.MinimumInternalPipeDiameter.toFixed(2)))} unit="mm(2.5m/s)" />

                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                      <FileText className="w-3.5 h-3.5 text-green-600" />
                      <h2 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">Filtration Cycle Time</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <ResultItem label="Suspended Solids Loading" value={inputs.SuspendedSolidsLoading} unit="TSS mg/l" />
                      <ResultItem label="AFM Standard Filtration Layers" value={inputs.afmStandardFilterationLayers} unit="" highlight />
                      <ResultItem label="Flow Velocity" value={inputs.flowVelocity} unit="m/h" />
                      <ResultItem label="Estimated Filtration Cycle Time" value={outputs.EstimatedFiltrationCycleTime} unit="Hrs." />
                    </div>
                  </div>
                </div>

              </div>

              {/* AFM Filtered Layering Table  */}
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <table className="w-full border border-gray-300 text-xs text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-center bg-green-200" colSpan={7}>
                        AFM Filtered Layering
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-2 text-center bg-[#05752c] text-white">Select<sup>(1)</sup> AFM Standard Filtration Layers (m)</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#375623] text-white">AFMs Grade 3 Below Laterals</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#375623] text-white">AFMs Grade 3 Above Laterals</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#5a8c39] text-white">AFMng Grade 2</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#a9d08e]">AFMng Grade 1</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#c6e0b4]">AFMs Grade 0</th>
                      <th className="border border-gray-300 p-2 text-center bg-gray-500 text-white">Anthracite 0.6–1.8mm(2)</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 font-semibold text-left">AFM G1</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.FixAFMGrade3BelowLateral).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.FixAFMGrade3AboveLateral).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.fixAFMGrade2).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.fixAFMGrade1).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.fixAFMGrade0).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.fixAnthracite).toFixed(2))}</td>
                    </tr>

                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 p-2 font-semibold text-left">Manual Input (m)</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.manualAFMGrade3BelowLateral).toFixed(0))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.manualAFMGrade3AboveLateral).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.manualAFMGrade2).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.manualAFMGrade1).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.manualAFMGrade0).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.manualAnthracite).toFixed(2))}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-semibold text-left" colSpan={7}>
                        <div className="text-[10px] text-gray-700 mt-2 space-y-1">
                          <p>
                            (1) Filtration layer height is based on recommended media ratio in %
                            & media bed expansion (see IFU).
                          </p>
                          <p>
                            Select backwash velocity 30–45 m/h to adjust bed expansion not exceeding
                            200 mm freeboard.
                          </p>
                          <p>
                            (2) Recommended Anthracite Layer 150–250 mm (Standard 200 mm).
                          </p>
                          <p>
                            If Anthracite layer is &lt; 0.2 m, indicated filtration cycle time is reduced.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>


              {/* AFM Quantity (total for all Filters) Table  */}
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <table className="w-full border border-gray-300 text-xs text-center">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-center bg-green-200" colSpan={6}>
                        AFM Quantity (total for all Filters)
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-2 text-center bg-[#05752c] text-white"></th>
                      <th className="border border-gray-300 p-2 text-center bg-[#375623] text-white">{outputs.manualAFMGrade3BelowLateral > 0 ? "AFMs Grade 3" : " "}</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#5a8c39] text-white">{outputs.manualAFMGrade2 > 0 ? inputs.AFMGrade2 : " "}</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#a9d08e]">{outputs.manualAFMGrade1 > 0 ? inputs.AFMGrade1 : " "}</th>
                      <th className="border border-gray-300 p-2 text-center bg-[#c6e0b4]">{outputs.manualAFMGrade0 > 0 ? "AFMs Grade 0" : " "}</th>
                      <th className="border border-gray-300 p-2 text-center bg-gray-500 text-white">{outputs.manualAnthracite > 0 ? "AnAnthracite 0.6-1.8mm(2)thracite" : " "}</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-gray-300 p-2 font-semibold text-left">Media weight 1 Filter (kg)</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.MediaWeightGrade3All).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.MediaWeightGrade2).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.MediaWeightGrade1).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.MediaWeightGrade0).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.MediaWeightAnthracite).toFixed(0)}</td>
                    </tr>

                    <tr className=" font-bold">
                      <td className="border border-gray-300 p-2 font-semibold text-left">Media weight all Filters (kg)</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.M23).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.N23).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.O23).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.P23).toFixed(0)}</td>
                      <td className="border border-gray-300 p-2">{parseFloat(outputs.Q23).toFixed(0)}</td>
                    </tr>

                    <tr className="">
                      <td className="border border-gray-300 p-2 font-semibold text-left">Total amount 25kg bags:</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.M24).toFixed(1))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.N24).toFixed(1))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.O24).toFixed(1))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.P24).toFixed(1))}</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.Q24).toFixed(1))}</td>
                    </tr>
                    <tr className=" font-bold">
                      <td className="border border-gray-300 p-2 font-semibold text-left">AFM total</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.AFMTotalM3).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">m³</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr className=" font-bold">
                      <td className="border border-gray-300 p-2 font-semibold text-left">AFM total</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.AFMTotalMt).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">mt</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr className="">
                      <td className="border border-gray-300 p-2 font-semibold text-left">AFM total bags</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.AFMTotakBag).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">x 25 kg bags</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr className="">
                      <td className="border border-gray-300 p-2 font-semibold text-left">AFM full palletes à 40 x 25kg (1 t)</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.AFMFullPalletes).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">+ 1 pallet @</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.AFMFullPalletes2).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2">bags (25kg)</td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr className="">
                      <td className="border border-gray-300 p-2 font-semibold text-left">AFM total amount of palettes</td>
                      <td className="border border-gray-300 p-2">{Number(parseFloat(outputs.AFMtotalAmountofPalettes).toFixed(2))}</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Visual & Freeboard */}
              <div className="relative flex items-center justify-center">

                {/* Image */}
                <img
                  src="/filter_diagram.png"
                  alt="Filter Diagram"
                  className="w-72 h-auto relative z-20"
                />

                {/* Media Layer Bar */}
                <div
                  className="absolute bottom-[22px] left-9 
               w-[130px] 
               flex flex-col justify-end 
               text-white z-10"
                  style={{ height: outputs.barHeight }} >

                  {/* Anthracite */}
                  {outputs.manualAnthracite > 0 && (
                    <div
                      className="bg-gray-500 text-[10px] flex items-start pl-1"
                      style={{ height: `${outputs.manualAnthracite * 100}%` }}
                    >
                      Anthracite
                    </div>
                  )}

                  {/* AFM Grade 0 */}
                  {outputs.manualAFMGrade0 > 0 && (
                    <div
                      className="bg-[#c6e0b4] text-black text-[10px] flex items-start pl-1"
                      style={{ height: `${outputs.manualAFMGrade0 * 100}%` }}
                    >
                      AFM Grade 0
                    </div>
                  )}

                  {/* AFM Grade 1 */}
                  {outputs.manualAFMGrade1 > 0 && (
                    <div
                      className="bg-[#a9d08e] text-[10px] flex items-start pl-1"
                      style={{ height: `${outputs.manualAFMGrade1 * 100}%` }}
                    >
                      AFM Grade 1
                    </div>
                  )}

                  {/* AFM Grade 2 */}
                  {outputs.manualAFMGrade2 > 0 && (
                    <div
                      className="bg-[#6b9e48] text-[10px] flex items-start pl-1"
                      style={{ height: `${outputs.manualAFMGrade2 * 100}%` }}
                    >
                      AFM Grade 2
                    </div>
                  )}

                  {/* AFM Grade 3 */}
                  {(outputs.manualAFMGrade3BelowLateral +
                    outputs.manualAFMGrade3AboveLateral) > 0 && (
                      <div
                        className="bg-[#375623] text-[10px] flex items-start pl-1"
                        style={{
                          height: `${(outputs.manualAFMGrade3BelowLateral +
                            outputs.manualAFMGrade3AboveLateral) *
                            100
                            }%`,
                        }}
                      >
                        AFM Grade 3
                      </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                  {/* Filter Section */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-700 uppercase">
                      Filter
                    </p>

                    <div className="mt-2">
                      <ResultItem label="Top Collector Height (m)" value={Number(parseFloat(inputs.TopCollectorHeight.toFixed(2)))} unit="m" />

                    </div>
                  </div>

                  {/* AFM Only Section */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-700 uppercase mt-4">
                      AFM Only
                    </p>

                    <div className="mt-2 space-y-2">
                      <ResultItem label="Media Depth (within TC)" value={Number(parseFloat(outputs.MediaDepthWithinTc.toFixed(2)))} unit="m" />
                      <ResultItem label="Media expanded depth (within TC)" value={Number(parseFloat(outputs.MediaExpandedDepthwithinTC.toFixed(2)))} unit="m" />
                    </div>

                  </div>
                  <div className={`p-3 rounded text-white text-center ${outputs.colorbg}`}>
                    <p className="text-[10px] font-bold uppercase">Freeboard after bed expansion</p>
                    <p className="text-xl font-bold">{outputs.FreeBoardAfterbedExpansion.toFixed(2)} m</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 text-justify">
                      <span className="text-orange-500"> Freeboard &lt; 200mm. Some media may be lost during backwash.</span>
                      <span className="text-red-500"> Freeboard &lt;150mm the media layering is incompatable with the filter. Media will be lost during backwash.</span>
                    </p>
                  </div>
                </div>
              </div>
              {outputs.FreeBoardAfterbedExpansion < 0.2 && (
                <p className="text-[9px] text-red-600 font-bold leading-tight">
                  WARNING: Freeboard &lt; 0.2m. Media may be lost during backwash.
                </p>
              )}
            </div>
          )}
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

export default AfmCalculator;
