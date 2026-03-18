import React, { useState } from 'react';
import { Printer, Calculator, FileText, Info, Zap } from 'lucide-react';
import { table } from 'console';

const ProjectionCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    module: 'BF100',
    flowRate: 0,
    noOfTrain: 1,
    flux: 0,
    noOfMembraneTank: 1,
    workingHr: 20,
    designBase: 'with_BW',
    inlettype: 'sewagewater',
    NacloConcentrationOfChemical: 0,
    NaohConcentrationOfChemical: 0,
    AcidConcentrationOfChemical: 0,
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
    const { module, flowRate, noOfTrain, flux, noOfMembraneTank, workingHr, designBase,
      NacloConcentrationOfChemical, NaohConcentrationOfChemical, AcidConcentrationOfChemical } = inputs;

    let relaxation = 0;
    let CEBtext = "";
    if (["12B6", "12B9", "12B12", "12B38", "12B57"].includes(String(module))) {
      relaxation = 1;
      if (designBase === "with_BW") {
        CEBtext = "CEB (Maintenance cleaning - Every 10-15 days)";
      } else {
        CEBtext = "CEB (Maintenance cleaning - Every day as per vaccume pressure)";
      }
    } else {
      if (designBase === "with_BW") {
        CEBtext = "CEB (Maintenance cleaning - Every 10-15 days)";
        relaxation = 1;
      } else {
        CEBtext = "CEB (Maintenance cleaning - Every day as per vaccume pressure)";
        relaxation = 2;
      }
    }


    let membraneSurfaceAreaPerMBR = 0;
    const moduleMap: Record<string, number> = {
      "BF100": 10, "BF125": 12.5, "BF200": 20, "BF300": 30,
      "BF100N": 10, "BF150N": 15, "BF200N": 20, "BF100oxy": 10,
      "BF220oxy": 22, "SUS100": 10, "SUS200": 20, "SUS300": 30,
      "SUS313": 31.3, "SUS400": 40, "BF500D(430)": 40.9,
      "BF500D(370)": 34.4, "BF500D(340)": 31.6, "BF500S": 28,
      "12B6": 6, "12B9": 9, "12B12": 12, "12B38": 38, "12B57": 57
    };
    membraneSurfaceAreaPerMBR = moduleMap[module] || 0;

    let TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
    if (module.startsWith("12B")) {
      TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * 25 * workingHr * membraneSurfaceAreaPerMBR));
    }

    const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
    const MembraneSurfaceAreaPerTrain = NoofModulePerTrain * membraneSurfaceAreaPerMBR;
    const TotalMembraneSurfaceArea = parseFloat((TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1));
    const OperatingFlux = parseFloat((flux * 0.0238).toFixed(1));
    const rawTimeFlux = parseFloat((flux * 83.34 / 100).toFixed(1));
    const Timeflux = parseFloat((rawTimeFlux * 0.0238).toFixed(1));

    let length = 0, width = 0, height = 0, effectiveWaterDepth = 0, width2 = 0, surfaceareapertrain = 0;

    if (["BF100", "BF125", "BF100N", "BF100oxy"].includes(module)) {
      length = ((NoofModulePerTrain + 1) * 85 + 100) / 1000;
      width = 0.71;
      height = 1.3;
      effectiveWaterDepth = 1.6;
      width2 = 2.3;
    } else if (["BF200", "BF150N"].includes(module)) {
      length = ((NoofModulePerTrain + 1) * 85 + 100) / 1000;
      width = 0.71;
      height = 1.8;
      effectiveWaterDepth = 2.1;
      width2 = 3;
    } else if (module === "BF220oxy") {
      length = ((NoofModulePerTrain + 1) * 85 + 100) / 1000;
      width = 0.71;
      height = 2.055;
      effectiveWaterDepth = 2.4;
      width2 = 3;
    } else if (["BF300", "BF200N"].includes(module)) {
      length = ((NoofModulePerTrain + 1) * 85 + 100) / 1000;
      width = 0.71;
      height = 2.3;
      effectiveWaterDepth = 2.7;
      width2 = 4;
    } else if (module === "SUS100") {
      length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 25) + 100) / 1000;
      width = 0.68;
      height = 1.85;
      effectiveWaterDepth = 2.8;
      width2 = 1.85;
    } else if (module === "SUS200") {
      length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 25) + 100) / 1000;
      width = 1.25;
      height = 1.85;
      effectiveWaterDepth = 2.8;
      width2 = 1.85;
    } else if (["SUS300", "SUS400"].includes(module)) {
      length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 25) + 100) / 1000;
      width = 1.25;
      height = 2.5;
      effectiveWaterDepth = 3.5;
      width2 = 2.5;
    } else if (module === "SUS313") {
      length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 25) + 100) / 1000;
      width = 1.25;
      height = 2.55;
      effectiveWaterDepth = 3.55;
      width2 = 2.55;
    } else if (module.startsWith("BF500D")) {
      length = Math.ceil(((NoofModulePerTrain * 49) + ((NoofModulePerTrain + 1) * 40) + 100) * 100) / 100 / 1000;
      width = 0.844;
      height = 2.598;
      effectiveWaterDepth = 3.598;
      width2 = 1.444;
    } else if (module === "BF500S") {
      length = Math.ceil(((NoofModulePerTrain + 1) * 85 + 100) * 100) / 100 / 1000;
      width = 0.53;
      height = 2.1388;
      effectiveWaterDepth = 2.4388;
      width2 = 3.7;
    } else if (["12B6", "12B9", "12B12", "12B38", "12B57"].includes(module)) {
      length = ((NoofModulePerTrain / 2) * 143) + (((NoofModulePerTrain - 1) / 2) * 25) + (NoofModulePerTrain * 5) + 90;
      if (NoofModulePerTrain < 26) {
        width = 0.528;
      } else {
        width = 0.548;
      }
      if (module === "12B6") {
        height = 1.3;
        effectiveWaterDepth = 1.6; 
        width2 = 1.6;
      } else if (module === "12B9") {
        height = 0;
        effectiveWaterDepth = 0; 
        width2 = 0;
      } else if (module === "12B12") {
        height = 2.41;
        effectiveWaterDepth = 2.71; 
        width2 = 1.6;
      } else if (module === "12B38") {
        height = 2.2;
        effectiveWaterDepth = 2.5; 
        width2 = 1.6;
      } else if (module === "12B57") {
        height = 3.22;
        effectiveWaterDepth = 3.52; 
        width2 = 1.6;
      }
    }
    surfaceareapertrain = (length + 0.6) * (width + 0.6) * (height + 0.3);
    if (module.startsWith("SUS")) {
      surfaceareapertrain = (length + 0.8) * (width + 0.6) * (height + 1);
    }

    const TotalMembraneTankVolume = parseFloat((noOfTrain * surfaceareapertrain).toFixed(1));
console.log("noOfTrain", noOfTrain);
console.log("surfaceareapertrain", surfaceareapertrain);
console.log("TotalMembraneTankVolume", TotalMembraneTankVolume);



    const lengthinsidepertank = parseFloat((TotalMembraneTankVolume / effectiveWaterDepth / width2).toFixed(1));
    let RequiredTotalFlowrateforpeakflux = 0;
    let RequiredTotalFlowrateforpeakfluxlabel = "";

    if (module.startsWith("12B")) {
      RequiredTotalFlowrateforpeakflux = parseFloat(((flowRate / workingHr) + 15 / 100).toFixed(1));
      RequiredTotalFlowrateforpeakfluxlabel = "Required Total flow rate for peak flux @15m (H)"
    } else {
      RequiredTotalFlowrateforpeakflux = parseFloat((flowRate / workingHr).toFixed(1));
      RequiredTotalFlowrateforpeakfluxlabel = "Required Total flow rate for peak flux"
    }

    let filteration = 0;
    if (["12B6", "12B9", "12B12", "12B38", "12B57"].includes(String(module))) {
      filteration = 9;
    }
    else {
      filteration = 8;
    }
    let backwash = "0";
    if (["12B6", "12B9", "12B12", "12B38", "12B57"].includes(String(module))) {
      backwash = "Can be applied <100kPa / <1bar";
    }
    else {
      backwash = "1";
    }
    const RequiredBackwashFlowRate = parseFloat((RequiredTotalFlowrateforpeakflux * 1.5).toFixed(1));

    let RequiredtotalAirFlowRate = 0;
    if (module.substring(0, 2) === "BF") {
      RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.3).toFixed(1));
    } else if (module.substring(0, 3) === "SUS") {
      RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.25).toFixed(1));
    } else if (module.substring(0, 3) === "12B") {
      if (inputs.inlettype === "sewagewater") {
        RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.3).toFixed(1));
      } else if (inputs.inlettype === "effluentwater") {
        RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.45).toFixed(1));
      }
    }

    const RequiredtotalAirFlowRatepereach = parseFloat((RequiredtotalAirFlowRate / noOfTrain).toFixed(1));
    const BackwashNacloConcentration = 20;
    const backwashRequiredChemicalSolutionVolume = 100;
    const backwashRequiredChemicalQuantity = parseFloat(((((RequiredBackwashFlowRate * 1000 / 60) * 24) * 20 / 1000000) / 0.1).toFixed(1));

    const CebNacloConcentration = 500;
    const CebRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
    const CebRequiredChemicalQuantityeachTime = parseFloat(((CebRequiredChemicalSolutionVolume * CebNacloConcentration / 1000000) / 0.1).toFixed(1));
    const CebChemicalSolutionInjectionTime = 20;
    const CebChemicalInjectionFlowrate = parseFloat((CebRequiredChemicalSolutionVolume / CebChemicalSolutionInjectionTime).toFixed(1));

    const CipNacloConcentration = 3000;
    const CipRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
    const CipRequiredChemicalQuantityeachTime = parseFloat(((CipRequiredChemicalSolutionVolume * CipNacloConcentration / 1000000) / 0.1).toFixed(1));
    const CipChemicalSolutionInjectionTime = 20;
    const CipChemicalInjectionFlowrate = parseFloat((CipRequiredChemicalSolutionVolume / CipChemicalSolutionInjectionTime).toFixed(1));

    const acidConcentration = 10000;
    const acidRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
    const acidRequiredChemicalQuantityeachTime = parseFloat(((acidRequiredChemicalSolutionVolume * acidConcentration / 1000000) / 0.3).toFixed(1));
    const acidChemicalSolutionInjectionTime = 20;
    const acidChemicalInjectionFlowrate = parseFloat((acidRequiredChemicalSolutionVolume / acidChemicalSolutionInjectionTime).toFixed(1));

    const CebAcidConcentration = 300;
    const CebacidRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
    const CebacidRequiredChemicalQuantityeachTime = parseFloat(((CebacidRequiredChemicalSolutionVolume * CebAcidConcentration / 1000000) / 0.3).toFixed(1));
    const CebAcidChemicalSolutionInjectionTime = 20;
    const CebAcidChemicalInjectionFlowrate = parseFloat((CebacidRequiredChemicalSolutionVolume / CebAcidChemicalSolutionInjectionTime).toFixed(1));

    const CebDosingPumpCapacity = Math.round((CebRequiredChemicalQuantityeachTime / CebChemicalSolutionInjectionTime) * 60);
    const CebAcidDosingPumpCapacity = Math.round((CebacidRequiredChemicalQuantityeachTime / CebAcidChemicalSolutionInjectionTime) * 60);
    const CipDosingPumpCapacity = Math.round((CipRequiredChemicalQuantityeachTime / CipChemicalSolutionInjectionTime) * 60);
    const AcidDosingPumpCapacity = Math.round((acidRequiredChemicalQuantityeachTime / acidChemicalSolutionInjectionTime) * 60);


    const watervolumeinMembranePerTrain = 2 * TotalNumberOfModule / 1000;
    const watervolumeinPipesPerTrain = watervolumeinMembranePerTrain * 1.5;
    const totalwatervolumePertrain = Math.ceil((watervolumeinMembranePerTrain + watervolumeinPipesPerTrain) * 100) / 100;
    let CIPrunningTimeForChemicalInjection = 20;
    const CIPQuantity = CIPrunningTimeForChemicalInjection > 0 ? Math.ceil((totalwatervolumePertrain / CIPrunningTimeForChemicalInjection / 1 * 1.15) * 100) / 100 : 0;

    const NacloChemicalInjectionRatioForCIP = 500;
    const NacloChemicalInjectionRatioForHCIP = 3000;
    const NaclosubQuantity = NacloConcentrationOfChemical > 0 ? NacloChemicalInjectionRatioForCIP * (CIPQuantity / 1.15) / 1000 / (NacloConcentrationOfChemical / 100) * 1.15 : 0;
    const NacloQuantity = NacloConcentrationOfChemical > 0 ? NacloChemicalInjectionRatioForHCIP * (CIPQuantity / 1.15) / 1000 / (NacloConcentrationOfChemical / 100) * 1.15 : 0;
    const NacloTotalDynamicHead = 0.2;
    const NacloRequiredChemicalperCIP = NacloConcentrationOfChemical > 0 ? totalwatervolumePertrain * noOfTrain * NacloChemicalInjectionRatioForCIP / 1000 / (NacloConcentrationOfChemical / 100) : 0;
    const NacloRequiredChemicalperHCIP = NacloConcentrationOfChemical > 0 ? totalwatervolumePertrain * noOfTrain * NacloChemicalInjectionRatioForHCIP / 1000 / (NacloConcentrationOfChemical / 100) : 0;
    const NacloTankCapacityMoreThan = Math.round(NacloRequiredChemicalperHCIP);

    const NaohChemicalInjectionRatioForCIP = 200;
    const NaohChemicalInjectionRatioForHCIP = 5000;
    const NaohsubQuantity = NaohConcentrationOfChemical > 0 ? NaohChemicalInjectionRatioForCIP * (CIPQuantity / 1.15) / 1000 / (NaohConcentrationOfChemical / 100) * 1.15 : 0;
    const NaohQuantity = NaohConcentrationOfChemical > 0 ? NaohChemicalInjectionRatioForHCIP * (CIPQuantity / 1.15) / 1000 / (NaohConcentrationOfChemical / 100) * 1.15 : 0;
    const NaohTotalDynamicHead = 0.2;
    const NaohRequiredChemicalperCIP = NaohConcentrationOfChemical > 0 ? totalwatervolumePertrain * noOfTrain * NaohChemicalInjectionRatioForCIP / 1000 / (NaohConcentrationOfChemical / 100) : 0;
    const NaohRequiredChemicalperHCIP = NaohConcentrationOfChemical > 0 ? totalwatervolumePertrain * noOfTrain * NaohChemicalInjectionRatioForHCIP / 1000 / (NaohConcentrationOfChemical / 100) : 0;
    const NaohTankCapacityMoreThan = Math.ceil(NaohRequiredChemicalperHCIP);

    const AcidChemicalInjectionRatioForCIP = 1000;
    const AcidChemicalInjectionRatioForHCIP = 10000;
    const AcidsubQuantity = AcidConcentrationOfChemical > 0 ? AcidChemicalInjectionRatioForCIP * (CIPQuantity / 1.15) / 1000 / (AcidConcentrationOfChemical / 100) * 1.15 : 0;
    const AcidQuantity = AcidConcentrationOfChemical > 0 ? AcidChemicalInjectionRatioForHCIP * (CIPQuantity / 1.15) / 1000 / (AcidConcentrationOfChemical / 100) * 1.15 : 0;
    const AcidTotalDynamicHead = 0.2;
    const AcidRequiredChemicalperCIP = AcidConcentrationOfChemical > 0 ? totalwatervolumePertrain * noOfTrain * AcidChemicalInjectionRatioForCIP / 1000 / (AcidConcentrationOfChemical / 100) : 0;
    const AcidRequiredChemicalperHCIP = AcidConcentrationOfChemical > 0 ? totalwatervolumePertrain * noOfTrain * AcidChemicalInjectionRatioForHCIP / 1000 / (AcidConcentrationOfChemical / 100) : 0;
    const AcidTankCapacityMoreThan = Math.ceil(AcidRequiredChemicalperHCIP);


    let ModuleSize = "";
    if (["BF100", "BF125", "BF100N", "BF100oxy"].includes(module)) ModuleSize = "1000 x 534 x 46";
    else if (["BF200", "BF150N"].includes(module)) ModuleSize = "1500 x 534 x 46";
    else if (module === "BF220oxy") ModuleSize = "2055 x 534 x 46";
    else if (["BF300", "BF200N"].includes(module)) ModuleSize = "2000 x 534 x 46";
    else if (module === "SUS100") ModuleSize = "1300 x 680 x 30";
    else if (module === "SUS200") ModuleSize = "1300 x 1250 x 30";
    else if (["SUS300", "SUS313", "SUS400"].includes(module)) ModuleSize = "2000 x 1250 x 30";
    else if (module === "BF500D") ModuleSize = "2198 x 844 x 49";
    else if (module === "BF500S") ModuleSize = "1838.8 x 355 x 217";
    else if (module === "12B6") ModuleSize = "1300 x 156 x 164";
    else if (module === "12B9") ModuleSize = "";
    else if (module === "12B12") ModuleSize = "2410 x 156 x 164";
    else if (module === "12B38") ModuleSize = "2200 x 50 x 840";
    else if (module === "12B57") ModuleSize = "3220 x 50 x 840";

    setResults({
      membraneSurfaceAreaPerMBR,
      TotalNumberOfModule,
      NoofModulePerTrain,
      MembraneSurfaceAreaPerTrain,
      TotalMembraneSurfaceArea,
      OperatingFlux,
      rawTimeFlux,
      Timeflux,
      TotalMembraneTankVolume,
      ModuleSize,
      lengthinsidepertank,
      width2,
      effectiveWaterDepth,
      RequiredTotalFlowrateforpeakflux,
      RequiredTotalFlowrateforpeakfluxlabel,
      filteration,
      relaxation,
      backwash,
      RequiredBackwashFlowRate,
      RequiredtotalAirFlowRate,
      RequiredtotalAirFlowRatepereach,
      BackwashNacloConcentration,
      backwashRequiredChemicalSolutionVolume,
      backwashRequiredChemicalQuantity,
      CEBtext,
      CebNacloConcentration,
      CebRequiredChemicalSolutionVolume,
      CebRequiredChemicalQuantityeachTime,
      CebChemicalSolutionInjectionTime,
      CebChemicalInjectionFlowrate,
      CebDosingPumpCapacity,
      CebAcidConcentration,
      CebacidRequiredChemicalSolutionVolume,
      CebacidRequiredChemicalQuantityeachTime,
      CebAcidChemicalSolutionInjectionTime,
      CebAcidChemicalInjectionFlowrate,
      CebAcidDosingPumpCapacity,
      CipNacloConcentration,
      CipRequiredChemicalSolutionVolume,
      CipRequiredChemicalQuantityeachTime,
      CipChemicalSolutionInjectionTime,
      CipChemicalInjectionFlowrate,
      CipDosingPumpCapacity,
      acidConcentration,
      acidRequiredChemicalSolutionVolume,
      acidRequiredChemicalQuantityeachTime,
      acidChemicalSolutionInjectionTime,
      acidChemicalInjectionFlowrate,
      AcidDosingPumpCapacity
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-slate-900" id="BlufoxProjection">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-slate-900 pb-6 no-print">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">MBR Projection</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Technical Specification</p>
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Membrane Module</label>
                <select
                  id="module"
                  value={inputs.module}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <optgroup label="BF Series">
                    <option value="BF100">BF100</option>
                    <option value="BF125">BF125</option>
                    <option value="BF200">BF200</option>
                    <option value="BF300">BF300</option>
                  </optgroup>
                  <optgroup label="BF-N Series">
                    <option value="BF100N">BF100N</option>
                    <option value="BF150N">BF150N</option>
                    <option value="BF200N">BF200N</option>
                  </optgroup>
                  <optgroup label="Oxy Series">
                    <option value="BF100oxy">BF100oxy</option>
                    <option value="BF220oxy">BF220oxy</option>
                  </optgroup>
                  <optgroup label="SUS Series">
                    <option value="SUS100">SUS100</option>
                    <option value="SUS200">SUS200</option>
                    <option value="SUS300">SUS300</option>
                    <option value="SUS313">SUS313</option>
                    <option value="SUS400">SUS400</option>
                  </optgroup>
                  <optgroup label="BF-500 Series">
                    <option value="BF500D(430)">BF500D (430)</option>
                    <option value="BF500D(370)">BF500D (370)</option>
                    <option value="BF500D(340)">BF500D (340)</option>
                    <option value="BF500S">BF500S</option>
                  </optgroup>
                  <optgroup label="Sumitomo">
                    <option value="12B6"> 12B6 (6m2)</option>
                    <option value="12B9"> 12B9 (9m2)</option>
                    <option value="12B12"> 12B12 (12m2)</option>
                    <option value="12B38">12B38 (38m2)</option>
                    <option value="12B57">12B57 (57m2)</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="Flow Rate" unit="KLD" id="flowRate" value={inputs.flowRate} onChange={handleInputChange} />
                <TechnicalInput label="No. of Train" unit="QTY" id="noOfTrain" value={inputs.noOfTrain} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="Flux" unit="LMH" id="flux" value={inputs.flux} onChange={handleInputChange} />
                <TechnicalInput label="Working Hrs" unit="HRS" id="workingHr" value={inputs.workingHr} onChange={handleInputChange} />
              </div>

              <TechnicalInput label="Membrane Tanks" unit="QTY" id="noOfMembraneTank" value={inputs.noOfMembraneTank} onChange={handleInputChange} />

              {inputs.module?.startsWith("12B") && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <TechnicalInput label="NaClO" unit="%" id="NacloConcentrationOfChemical" value={inputs.NacloConcentrationOfChemical} onChange={handleInputChange} />
                    <TechnicalInput label="NaOH" unit="%" id="NaohConcentrationOfChemical" value={inputs.NaohConcentrationOfChemical} onChange={handleInputChange} />
                    <TechnicalInput label="Acid" unit="%" id="AcidConcentrationOfChemical" value={inputs.AcidConcentrationOfChemical} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Inlet Water Type
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setInputs((p) => ({ ...p, inlettype: "sewagewater" }))
                        }
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${inputs.inlettype === "sewagewater"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                          }`}
                      >
                        Sewage Water
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setInputs((p) => ({ ...p, inlettype: "effluentwater" }))
                        }
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${inputs.inlettype === "effluentwater"
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                          }`}
                      >
                        Effluent Water
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Design Configuration</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInputs(p => ({ ...p, designBase: 'with_BW' }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${inputs.designBase === 'with_BW'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                  >
                    With B/W
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputs(p => ({ ...p, designBase: 'without_BW' }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${inputs.designBase === 'without_BW'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                  >
                    Without B/W
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={calculate}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group"
              >
                <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                RUN PROJECTION
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-8 print:my-[-30px] print:mx-[-10px]">
          {results ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Specification Table */}
              <div className="bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center no-print">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="font-black italic uppercase tracking-tight">MBR Technical Projection Sheet</h3>
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
                    MBR Membranes Projection Sheet
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-px bg-slate-200 border-b border-slate-200">
                    {/* 1) Membrane Module */}
                    <div className="bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th colSpan={3} className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">1) Membrane Module</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <TableRow label="Product Model" value={inputs.module} />
                          <TableRow label="Membrane Surface area per MBR" value={results.membraneSurfaceAreaPerMBR} unit="m²" />
                          <TableRow label="Design average daily Flow rate" value={inputs.flowRate} unit="m³/d" />
                          <TableRow label="Number of Train" value={inputs.noOfTrain} unit="train" />
                          <TableRow label="Number of Module per Train/Frame" value={results.NoofModulePerTrain} unit="module/train" />
                          <TableRow label="Total number of Module" value={results.TotalNumberOfModule} unit="module" highlight />
                          <TableRow label="Membrane surface area per train/Frame" value={results.MembraneSurfaceAreaPerTrain} unit="m²" />
                          <TableRow label="Total Membrane surface area" value={results.TotalMembraneSurfaceArea} unit="m²" highlight />
                          <TableRow label="Operating Flux (Design Average) Daily Flux" value={results.OperatingFlux} unit="m/d" />
                          <TableRow label="Flux" value={inputs.flux} unit="LMH" highlight />
                          <TableRow
                            label={
                              <span>
                                Time Flux (Average Flux)<br />
                                <span className="text-[10px] text-slate-400 font-normal italic">Design by average daily flow</span>
                              </span>
                            }
                            value={results.Timeflux}
                            unit="m/d"
                          />
                          <TableRow label="" value={results.rawTimeFlux} unit="LMH" />
                          <TableRow label="Working Hours of MBR Suction Pump" value={inputs.workingHr} unit="hrs" />
                        </tbody>
                      </table>
                    </div>

                    {/* 2) Membrane Tank */}
                    <div className="bg-white">
                      <table className="w-full text-left border-collapse mb-8">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th colSpan={3} className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">2) Membrane Tank</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <TableRow label="Number of Membrane Tank" value={inputs.noOfMembraneTank} />
                          <TableRow label="Number of Module per Tank" value={inputs.noOfTrain} />
                          <TableRow label="Total Membrane Tank Volume (SWD)" value={results.TotalMembraneTankVolume} unit="m³" highlight />
                          <TableRow label="Module Size (H x L x W)" value={results.ModuleSize} unit="mm" />
                          <TableRow label="Length (inside, per tank)" value={results.lengthinsidepertank} unit="m" />
                          <TableRow label="Width (inside, per tank)" value={results.width2} unit="m" />
                          <TableRow label="Effective water depth" value={results.effectiveWaterDepth} unit="m" />
                        </tbody>
                      </table>
                      {/* 3) Major equipment for Membrane */}
                      <div className="bg-white">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th colSpan={3} className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">3) Major equipment for Membrane</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-blue-500/20">
                              <td colSpan={3} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-black-400">Permeate Pump</td>
                            </tr>
                            <TableRow label={results.RequiredTotalFlowrateforpeakfluxlabel} value={results.RequiredTotalFlowrateforpeakflux} unit="m³/hr" highlight />
                            <TableRow label="Filtration"
                              value={results.filteration}
                              unit="min"
                              indent />
                            <TableRow label="Relaxation"
                              value={results.relaxation}
                              unit="min" indent />
                            {inputs.designBase === 'with_BW' && (
                              <TableRow label="Backwash (after every 6 cycle at <1.5 bar)"
                                value={results.backwash}
                                unit="min" indent />
                            )}



                            {inputs.designBase === 'with_BW' && (
                              <>
                                <tr className="bg-purple-500/20">
                                  <td colSpan={3} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-black-400">Backwash Pump</td>
                                </tr>
                                <TableRow label="Required Backwash flow rate" value={results.RequiredBackwashFlowRate} unit="m³/hr" highlight />
                              </>
                            )}

                            <tr className="bg-blue-500/20">
                              <td colSpan={3} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-black-400">Membrane Blower</td>
                            </tr>
                            <TableRow label="Required Total air flow rate" value={results.RequiredtotalAirFlowRate} unit="Nm³/hr" highlight />
                            <TableRow label="Required air flow rate per each" value={results.RequiredtotalAirFlowRatepereach} unit="Nm³/hr" />
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {inputs.module?.startsWith("12B") && (<>
                    <div>
                      <table>
                        <tbody>
                          <tr className="bg-blue-500/10">
                            <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Chemical Dosing</td>
                          </tr>
                          <tr>
                            <td colSpan={6} className="py-4 px-6">
                              <div className="grid grid-cols-[6fr_4fr] gap-8">

                                <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                  <tbody>
                                    <tr className="bg-green-500/30">
                                      <td colSpan={3} className="px-3 py-2 text-[12px] font-black uppercase tracking-widest text-black-400">NaClO Pump</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={3} className='px-3 py-2.5 text-[12px] font-medium text-slate-600'>Metering pump can be applied for both CIP and H-CIP.</td>
                                    </tr>
                                    <TableRow label="No. of Pump" value={"1"} unit="No." subtable />
                                    <TableRow label="Concentration of Chemical" value={inputs.NacloConcentrationOfChemical} unit="%" subtable />
                                    <TableRow label="Chemical Injection Ratio for CIP" value={results.NacloChemicalInjectionRatioForCIP} unit="ppm" subtable />
                                    <TableRow label="Chemical Injection Ratio for H-CIP" value={results.NacloChemicalInjectionRatioForHCIP} unit="ppm" subtable />
                                    <TableRow label="Quantity (included 15% margin)" value={`${Number(parseFloat(results.NaclosubQuantity).toFixed(2))} - ${Number(parseFloat(results.NacloQuantity).toFixed(2))}`} unit="L/min" subtable />
                                    <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.NacloTotalDynamicHead).toFixed(2))} unit="Mpa" subtable />
                                  </tbody>
                                </table>

                                <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                  <tbody>
                                    <tr className="bg-green-500/30">
                                      <td colSpan={3} className="px-3 py-2 text-[12px] font-black uppercase tracking-widest text-black-400">NaClO Tank</td>
                                    </tr>
                                    <TableRow label="No. of tank" value={"1"} unit="No." subtable />
                                    <TableRow label="Capacity more than" value={Number(parseFloat(results.NacloTankCapacityMoreThan).toFixed(2))} unit="min" subtable />
                                    <TableRow label="Required Chemical per CIP" value={Number(parseFloat(results.NacloRequiredChemicalperCIP).toFixed(2))} unit="L" subtable />
                                    <TableRow label="Required Chemical per H-CIP" value={Number(parseFloat(results.NacloRequiredChemicalperHCIP).toFixed(2))} unit="L" subtable />
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={6} className="py-4 px-6">
                              <div className="grid grid-cols-[6fr_4fr] gap-8">

                                <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                  <tbody>
                                    <tr className="bg-purple-500/30">
                                      <td colSpan={3} className="px-3 py-2 text-[12px] font-black uppercase tracking-widest text-black-400">NaOH Pump</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={3} className='px-3 py-2.5 text-[12px] font-medium text-slate-600'>Metering pump can be applied for both CIP and H-CIP.</td>
                                    </tr>
                                    <TableRow label="No. of Pump" value={"1"} unit="No." subtable />
                                    <TableRow label="Concentration of Chemical" value={inputs.NaohConcentrationOfChemical} unit="%" subtable />
                                    <TableRow label="Chemical Injection Ratio for CIP" value={results.NaohChemicalInjectionRatioForCIP} unit="ppm" subtable />
                                    <TableRow label="Chemical Injection Ratio for H-CIP" value={results.NaohChemicalInjectionRatioForHCIP} unit="ppm" subtable />
                                    <TableRow label="Quantity (included 15% margin)" value={`${Number(parseFloat(results.NaohsubQuantity).toFixed(2))} - ${Number(parseFloat(results.NaohQuantity).toFixed(2))}`} unit="L/min" subtable />
                                    <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.NaohTotalDynamicHead).toFixed(2))} unit="Mpa" subtable />
                                  </tbody>
                                </table>

                                <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                  <tbody>
                                    <tr className="bg-purple-500/30">
                                      <td colSpan={3} className="px-3 py-2 text-[12px] font-black uppercase tracking-widest text-black-400">NaOH Tank</td>
                                    </tr>
                                    <TableRow label="No. of tank" value={"1"} unit="No." subtable />
                                    <TableRow label="Capacity more than" value={Number(parseFloat(results.NaohTankCapacityMoreThan).toFixed(2))} unit="min" subtable />
                                    <TableRow label="Required Chemical per CIP" value={Number(parseFloat(results.NaohRequiredChemicalperCIP).toFixed(2))} unit="L" subtable />
                                    <TableRow label="Required Chemical per H-CIP" value={Number(parseFloat(results.NaohRequiredChemicalperHCIP).toFixed(2))} unit="L" subtable />
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={6} className="py-4 px-6">
                              <div className="grid grid-cols-[6fr_4fr] gap-8">

                                <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                  <tbody>
                                    <tr className="bg-blue-500/30">
                                      <td colSpan={3} className="px-3 py-2 text-[12px] font-black uppercase tracking-widest text-black-400">Acid Pump</td>
                                    </tr>
                                    <tr>
                                      <td colSpan={3} className='px-3 py-2.5 text-[12px] font-medium text-slate-600'>Metering pump can be applied for both CIP and H-CIP.</td>
                                    </tr>
                                    <TableRow label="No. of Pump" value={"1"} unit="No." subtable />
                                    <TableRow label="Concentration of Chemical" value={inputs.AcidConcentrationOfChemical} unit="%" subtable />
                                    <TableRow label="Chemical Injection Ratio for CIP" value={results.AcidChemicalInjectionRatioForCIP} unit="ppm" subtable />
                                    <TableRow label="Chemical Injection Ratio for H-CIP" value={results.AcidChemicalInjectionRatioForHCIP} unit="ppm" subtable />
                                    <TableRow label="Quantity (included 15% margin)" value={`${Number(parseFloat(results.AcidsubQuantity).toFixed(2))} - ${Number(parseFloat(results.AcidQuantity).toFixed(2))}`} unit="L/min" subtable />
                                    <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.AcidTotalDynamicHead).toFixed(2))} unit="Mpa" subtable />
                                  </tbody>
                                </table>

                                <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                  <tbody>
                                    <tr className="bg-blue-500/30">
                                      <td colSpan={3} className="px-3 py-2 text-[12px] font-black uppercase tracking-widest text-black-400">Acid Tank </td>
                                    </tr>
                                    <TableRow label="No. of tank" value={"1"} unit="No." subtable />
                                    <TableRow label="Capacity more than" value={Number(parseFloat(results.AcidTankCapacityMoreThan).toFixed(2))} unit="min" subtable />
                                    <TableRow label="Required Chemical per CIP" value={Number(parseFloat(results.AcidRequiredChemicalperCIP).toFixed(2))} unit="L" subtable />
                                    <TableRow label="Required Chemical per H-CIP" value={Number(parseFloat(results.AcidRequiredChemicalperHCIP).toFixed(2))} unit="L" subtable />
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-200">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 mb-4">Chemical Cleaning Condition</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px] border-collapse">
                          <thead>
                            <tr className="bg-slate-200">
                              <th className="p-2 border border-slate-300">Type</th>
                              <th className="p-2 border border-slate-300">Chemical</th>
                              <th className="p-2 border border-slate-300">Concentration</th>
                              <th className="p-2 border border-slate-300">Cycle</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-2 border border-slate-300 font-bold">CIP</td>
                              <td className="p-2 border border-slate-300">Caustic Soda / Sodium Hypochlorite</td>
                              <td className="p-2 border border-slate-300">200ppm / 500ppm (mixture)</td>
                              <td className="p-2 border border-slate-300">Every 1-2 weeks</td>
                            </tr>
                            <tr>
                              <td className="p-2 border border-slate-300"></td>
                              <td className="p-2 border border-slate-300">Sulfuric / Hydrochloric / Citric Acid</td>
                              <td className="p-2 border border-slate-300">1000 ppm or 2000 ppm</td>
                              <td className="p-2 border border-slate-300">Every 2-4 weeks</td>
                            </tr>
                            <tr>
                              <td className="p-2 border border-slate-300 font-bold">H-CIP</td>
                              <td className="p-2 border border-slate-300">Caustic Soda / Sodium Hypochlorite</td>
                              <td className="p-2 border border-slate-300">5000 ppm / 3000 ppm (mixture)</td>
                              <td className="p-2 border border-slate-300">Every 3-6 months</td>
                            </tr>
                            <tr>
                              <td className="p-2 border border-slate-300 font-bold"></td>
                              <td className="p-2 border border-slate-300">Sulfuric / Hydrochloric / Citric Acid</td>
                              <td className="p-2 border border-slate-300">10,000 ppm / 20,000 ppm</td>
                              <td className="p-2 border border-slate-300">Every 3-6 months</td>
                            </tr>
                            <tr>
                              <td className="p-2 border border-slate-300 font-bold">OLC</td>
                              <td className="p-2 border border-slate-300">Same as H-CIP</td>
                              <td className="p-2 border border-slate-300"></td>
                              <td className="p-2 border border-slate-300">If necessary</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                  )}

                  <div className="bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th colSpan={6} className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">4) Chemical Cleaning System</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inputs.designBase === 'with_BW' && (
                          <>
                            <tr>
                              <td colSpan={6} className="py-4 px-6">
                                <div className="grid grid-cols-2 gap-8">

                                  {/* NaClO Table */}
                                  <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                    <tbody>
                                      <tr className="bg-purple-500/20">
                                        <td colSpan={6} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-black-400">Backwash Chemical Cleaning (Daily)</td>
                                      </tr>
                                      <tr>
                                        <td className="space-y-3">
                                          <TableRow label="NaCLO Concentration" value={results.BackwashNacloConcentration} unit="mg/L" indent />
                                          <TableRow label="Required Chemical Solution volume" value={results.backwashRequiredChemicalSolutionVolume} unit="L" indent />
                                          <TableRow label="Required Chemical Quantity" value={results.backwashRequiredChemicalQuantity} unit="kg/day (10% Concentration)" highlight indent />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <td colSpan={6} className="py-4 px-6">
                            <div className="grid grid-cols-2 gap-8">

                              {/* NaClO Table */}
                              <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                <tbody>
                                  <tr className="bg-green-500/10">
                                    <td className="px-5 py-5 text-[11px] font-black uppercase tracking-widest">
                                      {results.CEBtext}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="space-y-3">
                                      <TableRow label="NaCLO Concentration" value={results.CebNacloConcentration} unit="mg/L" indent />
                                      <TableRow label="Required Chemical solution volume (2L/m2)" value={results.CebRequiredChemicalSolutionVolume} unit="L" indent />
                                      <TableRow label="Required Chemical Quantity each time" value={results.CebRequiredChemicalQuantityeachTime} unit="kg (10% Concentration)" highlight indent />
                                      <TableRow label="Chemical solution injection time" value={results.CebChemicalSolutionInjectionTime} unit="min" indent />
                                      <TableRow label="Chemical injection flow rate" value={results.CebChemicalInjectionFlowrate} unit="L/min" indent />
                                      <TableRow label="Dosing Pump Capacity" value={results.CebDosingPumpCapacity} unit="LPH" highlight indent />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>


                              <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                <tbody>
                                  <tr className="bg-green-500/10">
                                    <td className="px-5 py-5 text-[11px] font-black uppercase tracking-widest">
                                      CEB (acid, Maintenance cleaning by Citric acid)
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="space-y-3">
                                      <TableRow label="Citric acid Concentration" value={results.CebAcidConcentration} unit="mg/L" indent />
                                      <TableRow label="Required Chemical solution volume (2L/m2)" value={results.CebacidRequiredChemicalSolutionVolume} unit="L" indent />
                                      <TableRow label="Required Chemical Quantity each time" value={results.CebacidRequiredChemicalQuantityeachTime} unit="kg (30% Concentration)" highlight indent />
                                      <TableRow label="Chemical solution injection time" value={results.CebAcidChemicalSolutionInjectionTime} unit="min" indent />
                                      <TableRow label="Chemical injection flow rate" value={results.CebAcidChemicalInjectionFlowrate} unit="L/min" indent />
                                      <TableRow label="Dosing Pump Capacity" value={results.CebAcidDosingPumpCapacity} unit="LPH" highlight indent />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td colSpan={6} className="py-4 px-6">
                            <div className="grid grid-cols-2 gap-8">


                              <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                <tbody>
                                  <tr className="bg-green-500/30">
                                    <td colSpan={3} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-black-400">CIP (Recovery cleaning - Every 4-6 Months)</td>
                                  </tr>
                                  <tr>
                                    <td className="space-y-3">
                                      <TableRow label="NaCLO Concentration" value={results.CipNacloConcentration} unit="mg/L" indent />
                                      <TableRow label="Required Chemical solution volume (2L/m2)" value={results.CipRequiredChemicalSolutionVolume} unit="L" indent />
                                      <TableRow label="Required Chemical Quantity each time" value={results.CipRequiredChemicalQuantityeachTime} unit="kg (10% Concentration)" highlight indent />
                                      <TableRow label="Chemical solution injection time" value={results.CipChemicalSolutionInjectionTime} unit="min" indent />
                                      <TableRow label="Chemical injection flow rate" value={results.CipChemicalInjectionFlowrate} unit="L/min" indent />
                                      <TableRow label="Dosing Pump Capacity" value={results.CipDosingPumpCapacity} unit="LPH" highlight indent />

                                    </td>
                                  </tr>
                                </tbody>
                              </table>


                              <table className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm mr-5">
                                <tbody>
                                  <tr className="bg-green-500/30">
                                    <td colSpan={3} className="px-6 py-2 text-[11px] font-black uppercase tracking-widest text-black-400">CIP (acid, Recovery cleaning by Citric acid)</td>
                                  </tr>
                                  <tr>
                                    <td className="space-y-3">
                                      <TableRow label="Citric acid Concentration" value={results.acidConcentration} unit="mg/L" indent />
                                      <TableRow label="Required Chemical solution volume (2L/m2)" value={results.acidRequiredChemicalSolutionVolume} unit="L" indent />
                                      <TableRow label="Required Chemical Quantity each time" value={results.acidRequiredChemicalQuantityeachTime} unit="kg (30% Concentration)" highlight indent />
                                      <TableRow label="Chemical solution injection time" value={results.acidChemicalSolutionInjectionTime} unit="min" indent />
                                      <TableRow label="Chemical injection flow rate" value={results.acidChemicalInjectionFlowrate} unit="L/min" indent />
                                      <TableRow label="Dosing Pump Capacity" value={results.AcidDosingPumpCapacity} unit="LPH" highlight indent />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </div>
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>

                  <div className="bg-red-50/50 px-6 py-6 border-t border-slate-200">
                    <div className="space-y-2">
                      <p className="text-xs font-black text-red-600 uppercase tracking-widest">Note:</p>
                      <ul className="text-[11px] text-red-700/80 space-y-1 font-bold italic">
                        <li>* If possible do the CIP in Separate Cleaning Tank with same Chemical Concentration</li>
                        <li>* MBR Module dimensions vary as per client Civil/Package tanks sizes.</li>
                        <li>* This Projection is subject to MBR Membrane calculation & design only.</li>
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
              <p className="text-xs mt-2">Configure system variables and run projection to view results.</p>
            </div>
          )
          }

        </div >
      </div >
    </div >
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

const TableRow: React.FC<{ label: React.ReactNode; value: any; unit?: string; highlight?: boolean; indent?: boolean, subtable?: boolean }> = ({ label, value, unit, highlight, indent, subtable }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className={`px-4 py-2.5 text-[11px] font-medium text-slate-600 ${subtable ? 'px-2' : 'px-3'} ${indent ? 'pl-8' : ''}`}>{label}</td>
    <td className={`px-4 py-2.5 text-right ${subtable ? 'px-2' : 'px-3'}`} >
      <span className={`font-mono text-xs font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
    </td>
    <td className={` px-4 py-2.5 text-left w-20 ${subtable ? 'px-2' : 'px-3'} `}>
      {unit && <span className="text-[11px] text-slate-500 uppercase">{unit}</span>}
    </td>
  </tr>
);

const StatBlock: React.FC<{ label: string; value: any; unit: string }> = ({ label, value, unit }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-slate-900 tracking-tighter">{value}</span>
      <span className="text-[11px] font-black text-slate-500">{unit}</span>
    </div>
  </div>
);

const ChemRow: React.FC<{ label: string; reagent: string; value: any }> = ({ label, reagent, value }) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="px-4 py-3 font-bold text-slate-700">{label}</td>
    <td className="px-4 py-3 text-slate-500 font-medium italic">{reagent}</td>
    <td className="px-4 py-3 text-right">
      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">{value} LPH</span>
    </td>
  </tr>
);

export default ProjectionCalculator;
