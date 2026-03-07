import React, { useState, useEffect } from 'react';
import { Printer, Calculator, FileText, Zap, Info, Table } from 'lucide-react';

const SumitomoCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    flowRate: 0,
    averageFlux: 0,
    minimumWaterTemperature: 0,
    industryType: 'Municipal',
    OilGrease: 0,
    membraneType: 'SquareType',
    noOfTrain: 1,
    designedMembraneType: 'B420-12B6-00',
    noOfDutyMembraneUnitPerTrain: 0,
    noOfstandByMembraneUnitPerTrain: 0,
    noOfDutyBlower: 1,
    pipeSize: 0,
    pipeLength: 0,
    CIPrunningTimeForChemicalInjection: 0,
    CIPLiftingheight: 0,
    BackwashLiftingHeight: 0,
    NacloConcentrationOfChemical: 0,
    NaohConcentrationOfChemical: 0,
    AcidConcentrationOfChemical: 0,
  });

  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (inputs.membraneType === 'SquareType') {
      setInputs(prev => ({ ...prev, designedMembraneType: 'B420-12B6-00' }));
    } else {
      setInputs(prev => ({ ...prev, designedMembraneType: 'USPMW-12B38-00' }));
    }
  }, [inputs.membraneType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const calculate = () => {
    const {
      flowRate, averageFlux, minimumWaterTemperature, industryType, OilGrease,
      membraneType, noOfTrain, designedMembraneType, noOfDutyMembraneUnitPerTrain,
      noOfstandByMembraneUnitPerTrain, noOfDutyBlower, pipeSize, pipeLength,
      CIPrunningTimeForChemicalInjection, CIPLiftingheight, BackwashLiftingHeight,
      NacloConcentrationOfChemical, NaohConcentrationOfChemical, AcidConcentrationOfChemical
    } = inputs;

    const Cycle = 10;
    const Filtration = 9;
    const Rest = 1;

    const subaverageflux1 = averageFlux * 24 / 1000;
    const operatingFlux = averageFlux * Cycle / Filtration;
    const suboperatingflux1 = operatingFlux * 24 / 1000;
    const temperatureCorrection = Math.pow((1 + 0.0217 * (25 - minimumWaterTemperature)), -1);
    const averageFlux2 = averageFlux * temperatureCorrection;
    const subaverageflux2 = averageFlux2 * 24 / 1000;
    const operatingFlux2 = averageFlux2 * Cycle / Filtration;
    const suboperatingflux2 = operatingFlux2 * 24 / 1000;
    const requiredMembraneAreaPerTrain = Math.ceil(flowRate / (averageFlux2 * 21 / 1000) / noOfTrain);

    let membraneAreaPerUnit = 0;
    let PumpLiftingHeight = 0;
    let Municipal = 0;
    let Industrial = 0;
    let Blowerwaterdepth = 0;

    if (designedMembraneType === "USPMW-12B38-00") {
      membraneAreaPerUnit = 1824; PumpLiftingHeight = 4.5; Municipal = 5; Industrial = 7.5; Blowerwaterdepth = 3.5;
    } else if (designedMembraneType === "USPMW-12B38-01") {
      membraneAreaPerUnit = 1368; PumpLiftingHeight = 4.5; Municipal = 3.8; Industrial = 0.71; Blowerwaterdepth = 3.5;
    } else if (designedMembraneType === "USPMW-12B38-02") {
      membraneAreaPerUnit = 912; PumpLiftingHeight = 4.5; Municipal = 2.6; Industrial = 3.9; Blowerwaterdepth = 3.5;
    } else if (designedMembraneType === "USPMW-12B38-03") {
      membraneAreaPerUnit = 456; PumpLiftingHeight = 4.5; Municipal = 1.4; Industrial = 2.1; Blowerwaterdepth = 3.5;
    } else if (designedMembraneType === "USPMW-12B57-00") {
      membraneAreaPerUnit = 2736; PumpLiftingHeight = 5.5; Municipal = 5; Industrial = 7.5; Blowerwaterdepth = 4.5;
    } else if (designedMembraneType === "USPMW-12B57-01") {
      membraneAreaPerUnit = 2052; PumpLiftingHeight = 5.5; Municipal = 3.8; Industrial = 5.7; Blowerwaterdepth = 4.5;
    } else if (designedMembraneType === "USPMW-12B57-02") {
      membraneAreaPerUnit = 1368; PumpLiftingHeight = 5.5; Municipal = 2.6; Industrial = 3.9; Blowerwaterdepth = 4.5;
    } else if (designedMembraneType === "USPMW-12B57-03") {
      membraneAreaPerUnit = 684; PumpLiftingHeight = 5.5; Municipal = 1.4; Industrial = 2.1; Blowerwaterdepth = 4.5;
    } else if (designedMembraneType === "B420-12B6-00") {
      membraneAreaPerUnit = 480; PumpLiftingHeight = 2.4; Municipal = 4.8; Industrial = 7.2; Blowerwaterdepth = 1.9;
    } else if (designedMembraneType === "B320-12B6-00") {
      membraneAreaPerUnit = 360; PumpLiftingHeight = 2.4; Municipal = 3.6; Industrial = 5.4; Blowerwaterdepth = 1.9;
    } else if (designedMembraneType === "B220-12B6-00") {
      membraneAreaPerUnit = 240; PumpLiftingHeight = 2.4; Municipal = 2.4; Industrial = 3.6; Blowerwaterdepth = 1.9;
    } else if (designedMembraneType === "B420-12B12-00") {
      membraneAreaPerUnit = 960; PumpLiftingHeight = 3.5; Municipal = 4.8; Industrial = 7.2; Blowerwaterdepth = 3.1;
    } else if (designedMembraneType === "B320-12B12-00") {
      membraneAreaPerUnit = 720; PumpLiftingHeight = 3.5; Municipal = 3.6; Industrial = 5.4; Blowerwaterdepth = 3.1;
    } else if (designedMembraneType === "B220-12B12-00") {
      membraneAreaPerUnit = 480; PumpLiftingHeight = 3.5; Municipal = 2.4; Industrial = 3.6; Blowerwaterdepth = 3.1;
    }

    const designDutyMembraneareapertrain = membraneAreaPerUnit * noOfDutyMembraneUnitPerTrain;
    const designStnadbymembraneareapertrain = membraneAreaPerUnit * noOfstandByMembraneUnitPerTrain;
    const totalmembraneunit = noOfTrain * noOfDutyMembraneUnitPerTrain;
    const totalmembraneunitstandby = noOfTrain * noOfstandByMembraneUnitPerTrain;
    const TotaldesignMembraneAreaDuty = membraneAreaPerUnit * totalmembraneunit;
    const TotaldesignMembraneAreaStandBy = membraneAreaPerUnit * totalmembraneunitstandby;
    const totalDesignedMembraneArea = TotaldesignMembraneAreaDuty + TotaldesignMembraneAreaStandBy;
    const subdesignfluxaverage = TotaldesignMembraneAreaDuty > 0 ? flowRate / TotaldesignMembraneAreaDuty : 0;
    const designfluxaverage = subdesignfluxaverage * 1000 / 24;
    const designfluxoperation = designfluxaverage * Cycle / Filtration;
    const subdesignfluxoperation = designfluxoperation * 24 / 1000;
    const filtrationTime = Filtration * (1440 / Cycle) / 60;
    const restTime = 24 - filtrationTime;
    const Quantity = Math.ceil((flowRate / 1440 * 24 / filtrationTime / noOfTrain * 1.15) * 100) / 100;
    const PumpMaxTMP = 6;
    const PumpPressureLoss = 2;
    const PumpMargin = Math.ceil((PumpMaxTMP + PumpLiftingHeight + PumpPressureLoss) * 0.1);
    const PumpTotalDynamicHead = Math.ceil((PumpMaxTMP + PumpLiftingHeight + PumpPressureLoss + PumpMargin) * 100) / 100;

    let RequiredAirVolume = industryType === "Municipal" ? Municipal : Industrial;
    const TotalAirVolume = RequiredAirVolume * totalmembraneunit;
    const BlowerQuantity = TotalAirVolume / noOfDutyBlower * 1.15;
    const BlowerPressureLossofDiffuserPipe = 5;
    const BlowerPressureLossofInstrument = 2;
    const BlowerMargin = 2;
    const BlowertotalDynamicHead = (Blowerwaterdepth * 9.8 + BlowerPressureLossofDiffuserPipe + BlowerPressureLossofInstrument + BlowerMargin);
    const noofPump = 1;
    const watervolumeinMembranePerTrain = 2 * designDutyMembraneareapertrain / 1000;
    const watervolumeinPipesPerTrain = Math.pow((pipeSize / 1000 / 2), 2) * 3.14 * pipeLength;
    const totalwatervolumePertrain = Math.ceil((watervolumeinMembranePerTrain + watervolumeinPipesPerTrain) * 100) / 100;

    const CIPQuantity = CIPrunningTimeForChemicalInjection > 0 ? Math.ceil((totalwatervolumePertrain / CIPrunningTimeForChemicalInjection / noofPump * 1.15) * 100) / 100 : 0;
    const CIPPressureLoss = 2;
    const CIPmargin = Math.ceil((CIPLiftingheight + CIPPressureLoss) * 0.1);
    const CIPTotalDynamicHead = (CIPLiftingheight + CIPPressureLoss + CIPmargin);

    const nooftank = 1;
    const waterVolumeUsedforCIPperTrain = totalwatervolumePertrain * 2;
    const tankCapacity = waterVolumeUsedforCIPperTrain * 1.5;
    const ChemicalInjection = CIPrunningTimeForChemicalInjection;
    const ChemicalSoaking = 90;
    const WaterFlushing = ChemicalInjection;

    const backwashnoofPump = 1;
    const Fluxofbackwash = designfluxaverage < 12.5 ? 20 : designfluxaverage * 1.5;
    const DutyMembraneareaperTrain = noOfTrain > 0 ? TotaldesignMembraneAreaDuty / noOfTrain : 0;
    const BackwashQuantity = Fluxofbackwash * 24 / 1000 * DutyMembraneareaperTrain / 1440 / backwashnoofPump * 1.15;
    const BackwashmaxTMP = 6;
    const backwashpressureloss = 2;
    const BackwashMargin = Math.ceil((BackwashmaxTMP + BackwashLiftingHeight + backwashpressureloss) * 0.1);
    const BackwashTotalDynamicHead = BackwashmaxTMP + BackwashLiftingHeight + backwashpressureloss + BackwashMargin;

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

    setResults({
      subaverageflux1, operatingFlux, suboperatingflux1, temperatureCorrection,
      averageFlux2, subaverageflux2, operatingFlux2, suboperatingflux2,
      requiredMembraneAreaPerTrain, membraneAreaPerUnit, PumpLiftingHeight,
      designDutyMembraneareapertrain, designStnadbymembraneareapertrain,
      totalmembraneunit, totalmembraneunitstandby, TotaldesignMembraneAreaDuty,
      TotaldesignMembraneAreaStandBy, totalDesignedMembraneArea,
      subdesignfluxaverage, designfluxaverage, designfluxoperation, subdesignfluxoperation,
      filtrationTime, restTime, Quantity, PumpTotalDynamicHead, PumpMaxTMP, PumpPressureLoss, PumpMargin,
      TotalAirVolume, BlowerQuantity, BlowertotalDynamicHead, Blowerwaterdepth, BlowerPressureLossofDiffuserPipe, BlowerPressureLossofInstrument, BlowerMargin,
      totalwatervolumePertrain, CIPQuantity, CIPTotalDynamicHead, CIPLiftingheight, CIPPressureLoss, CIPmargin,
      tankCapacity, waterVolumeUsedforCIPperTrain, ChemicalInjection, ChemicalSoaking, WaterFlushing,
      Fluxofbackwash, DutyMembraneareaperTrain, BackwashQuantity, BackwashTotalDynamicHead, BackwashmaxTMP, BackwashMargin,
      NaclosubQuantity, NacloQuantity, NacloTotalDynamicHead, NacloTankCapacityMoreThan, NacloRequiredChemicalperCIP, NacloRequiredChemicalperHCIP,
      NaohsubQuantity, NaohQuantity, NaohTotalDynamicHead, NaohTankCapacityMoreThan, NaohRequiredChemicalperCIP, NaohRequiredChemicalperHCIP,
      AcidsubQuantity, AcidQuantity, AcidTotalDynamicHead, AcidTankCapacityMoreThan, AcidRequiredChemicalperCIP, AcidRequiredChemicalperHCIP,
      RequiredAirVolume, Cycle, Filtration, Rest, PumpLiftingHeightValue: PumpLiftingHeight, watervolumeinPipesPerTrain, watervolumeinMembranePerTrain, nooftank, backwashnoofPump, backwashpressureloss, NacloChemicalInjectionRatioForCIP, NacloChemicalInjectionRatioForHCIP, NaohChemicalInjectionRatioForCIP, NaohChemicalInjectionRatioForHCIP, AcidChemicalInjectionRatioForCIP, AcidChemicalInjectionRatioForHCIP
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
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Sumitomo Projection</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">Sumitomo Membrane Calculation</p>
        </div>
        <div className="text-right">
          <p className="text-blue-600 font-black text-2xl tracking-tighter">BLUFOX</p>
          <p className="text-slate-400 text-[12px] uppercase font-bold tracking-widest">Ecoventures LLP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
        {/* Input Panel */}
        <div className="xl:col-span-6 space-y-6 no-print">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">Input Parameters</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="Design Flow rate" unit="m³/day" id="flowRate" value={inputs.flowRate} onChange={handleInputChange} />
                <TechnicalInput label="Average Flux" unit="LMH" id="averageFlux" value={inputs.averageFlux} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="Min Water Temp" unit="°C" id="minimumWaterTemperature" value={inputs.minimumWaterTemperature} onChange={handleInputChange} />
                <TechnicalInput label="Oil & Grease" unit="mg/L" id="OilGrease" value={inputs.OilGrease} onChange={handleInputChange} />
              </div>



              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Industry Type</label>
                  <select id="industryType" value={inputs.industryType} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    <option value="Municipal">Municipal</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Membrane Type</label>
                  <select id="membraneType" value={inputs.membraneType} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    <option value="SquareType">Square Type</option>
                    <option value="CassetteType">Cassette Type</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Designed Membrane Type</label>
                  <select id="designedMembraneType" value={inputs.designedMembraneType} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                    {inputs.membraneType === 'SquareType' ? (
                      <>
                        <option value="B420-12B6-00">B420-12B6-00</option>
                        <option value="B320-12B6-00">B320-12B6-00</option>
                        <option value="B220-12B6-00">B220-12B6-00</option>
                        <option value="B420-12B12-00">B420-12B12-00</option>
                        <option value="B320-12B12-00">B320-12B12-00</option>
                        <option value="B220-12B12-00">B220-12B12-00</option>
                      </>
                    ) : (
                      <>
                        <option value="USPMW-12B38-00">USPMW-12B38-00</option>
                        <option value="USPMW-12B38-01">USPMW-12B38-01</option>
                        <option value="USPMW-12B38-02">USPMW-12B38-02</option>
                        <option value="USPMW-12B38-03">USPMW-12B38-03</option>
                        <option value="USPMW-12B57-00">USPMW-12B57-00</option>
                        <option value="USPMW-12B57-01">USPMW-12B57-01</option>
                        <option value="USPMW-12B57-02">USPMW-12B57-02</option>
                        <option value="USPMW-12B57-03">USPMW-12B57-03</option>
                      </>
                    )}
                  </select>
                </div>

              </div>



              <div className="grid grid-cols-3 gap-4">
                <TechnicalInput label="No. of Train" unit="train" id="noOfTrain" value={inputs.noOfTrain} onChange={handleInputChange} />
                <TechnicalInput label="Duty Units/Train" unit="units" id="noOfDutyMembraneUnitPerTrain" value={inputs.noOfDutyMembraneUnitPerTrain} onChange={handleInputChange} />
                <TechnicalInput label="Stand-by Units/Train" unit="units" id="noOfstandByMembraneUnitPerTrain" value={inputs.noOfstandByMembraneUnitPerTrain} onChange={handleInputChange} />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="CIP Pipe Size" unit="mm" id="pipeSize" value={inputs.pipeSize} onChange={handleInputChange} />
                <TechnicalInput label="CIP Pipe Length" unit="m" id="pipeLength" value={inputs.pipeLength} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="CIP Injection Time" unit="min" id="CIPrunningTimeForChemicalInjection" value={inputs.CIPrunningTimeForChemicalInjection} onChange={handleInputChange} />
                <TechnicalInput label="CIP Lifting Height" unit="m" id="CIPLiftingheight" value={inputs.CIPLiftingheight} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TechnicalInput label="No. of duty blower" unit="units" id="noOfDutyBlower" value={inputs.noOfDutyBlower} onChange={handleInputChange} />
                <TechnicalInput label="BW Lifting Height" unit="m" id="BackwashLiftingHeight" value={inputs.BackwashLiftingHeight} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <TechnicalInput label="NaClO" unit="%" id="NacloConcentrationOfChemical" value={inputs.NacloConcentrationOfChemical} onChange={handleInputChange} />
                <TechnicalInput label="NaOH" unit="%" id="NaohConcentrationOfChemical" value={inputs.NaohConcentrationOfChemical} onChange={handleInputChange} />
                <TechnicalInput label="Acid" unit="%" id="AcidConcentrationOfChemical" value={inputs.AcidConcentrationOfChemical} onChange={handleInputChange} />
              </div>

              <button type="button" onClick={calculate} className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group mt-6">
                <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                RUN PROJECTION
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
                    <h3 className="font-black italic uppercase tracking-tight">Sumitomo Technical Projection Sheet</h3>
                  </div>
                  <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white">
                  {/* Company Header */}
                  <div className="px-6 py-8 bg-blue-50 border-b-2 border-slate-900">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Blufox Ecoventures LLP</h2>
                        <p className="text-[12px] text-slate-600 max-w-md leading-relaxed font-medium">
                          1908, The Junomoneta Tower, Beside Rajhans Multiplex,
                          <br />Adajan Hazira Main Road, Pal, Surat 395009 Gujarat, India
                        </p>
                        <div className="flex gap-4 text-[11px] text-blue-600 font-bold pt-1">
                          <span>info@blufoxmembranes.com</span>
                          <span>+91 97278 22279</span>
                          <span>www.blufoxmembranes.com</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <img src="/bluefox-logo-with-tagline.png" alt="blufox logo" className="h-14 w-auto" />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-900 text-white text-center text-sm font-black uppercase tracking-[0.4em] italic border-b border-slate-900">
                    Sumitomo MBR Membranes Projection Sheet
                  </div>

                  <div className="divide-y divide-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">Parameter</th>
                          <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">Value</th>
                          <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-[0.2em] text-blue-600 italic">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <TableRow label="Design Flow Rate" value={inputs.flowRate} unit="m³/day" />
                        <TableRow label="Average Flux (25 °C)" value={`${(inputs.averageFlux)}`} unit={`LMH (${Number(parseFloat(results.subaverageflux1).toFixed(2))} m/day)`} />
                        <TableRow label="Operating Flux (25 °C)" value={`${Number(parseFloat(results.operatingFlux).toFixed(2))} `} unit={`LMH (${Number(parseFloat(results.suboperatingflux1).toFixed(2))} m/day)`} />
                        <TableRow label="Minimum water temperature" value={inputs.minimumWaterTemperature} unit="°C" />
                        <TableRow label="Temperature Correction" value={results.temperatureCorrection.toFixed(2)} />
                        <TableRow label="Average Flux @25 °C" value={`${Number(parseFloat(results.averageFlux2).toFixed(2))}`} unit={` LMH (${Number(parseFloat(results.subaverageflux2).toFixed(2))} m/day)`} />
                        <TableRow label="Operating Flux @25 °C" value={`${Number(parseFloat(results.operatingFlux2).toFixed(2))} `} unit={`LMH (${Number(parseFloat(results.suboperatingflux2).toFixed(2))} m/day)`} />
                        <TableRow label="Industry Type" value={inputs.industryType} />
                        <TableRow label="Oil & Grease" value={inputs.OilGrease} unit="mg/L" />
                        <TableRow label="Membrane Type" value={inputs.membraneType} />
                        <TableRow label="No. Of Train" value={inputs.noOfTrain} unit="train" />
                        <TableRow label="Required Membrane area per train" value={results.requiredMembraneAreaPerTrain} unit="m²" />
                        <TableRow label="Design Membrane Type" value={inputs.designedMembraneType} highlight />
                        <TableRow label="Membrane area per unit" value={results.membraneAreaPerUnit} unit="m²" highlight />
                        <TableRow label="No. of Duty membrane unit per train" value={inputs.noOfDutyMembraneUnitPerTrain} unit="units" />
                        <TableRow label="No. of Stand-by membrane unit per train" value={inputs.noOfstandByMembraneUnitPerTrain} unit="units" />
                        <TableRow label="Designed Duty membrane area per train" value={Number(parseFloat(results.designDutyMembraneareapertrain).toFixed(2))} unit="m²" />
                        <TableRow label="Designed Stand-by membrane area per train" value={Number(parseFloat(results.designStnadbymembraneareapertrain).toFixed(2))} unit="m²" />

                        <TableRow label="Total Membrane Units" value={''} />
                        <TableRow label="Duty" value={results.totalmembraneunit} unit="units" indent />
                        <TableRow label="Stand-by" value={results.totalmembraneunitstandby} unit="units" indent />
                        <TableRow label="Total Designed Membrane area" value={Number(parseFloat(results.totalDesignedMembraneArea).toFixed(2))} unit="m²" highlight />
                        <TableRow label="Duty" value={Number(parseFloat(results.TotaldesignMembraneAreaDuty).toFixed(2))} unit="m²" indent />
                        <TableRow label="Stand-by" value={Number(parseFloat(results.TotaldesignMembraneAreaStandBy).toFixed(2))} unit="m²" indent />

                        <TableRow label="Designed Flux Average" value={`${Number(parseFloat(results.designfluxaverage).toFixed(2))} `} unit={`LMH (${Number(parseFloat(results.subdesignfluxaverage).toFixed(2))} m/day)`} />
                        <TableRow label="Operation" value={`${Number(parseFloat(results.designfluxoperation).toFixed(2))} `} unit={`LMH (${Number(parseFloat(results.subdesignfluxoperation).toFixed(2))} m/day)`} indent />

                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Basic Operation Condition</td>
                        </tr>
                        <TableRow label="1 Cycle" value={results.Cycle} unit="min" indent />
                        <TableRow label="Filtration" value={results.Filtration} unit="min" indent />
                        <TableRow label="Rest (Relaxation)" value={results.Rest} unit="min" indent />
                        <TableRow label="Backwash" value={"Can be applied less than 100kPa"} />
                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Permeate Pump</td>
                        </tr>
                        <TableRow label="Filtration Time" value={Number(parseFloat(results.filtrationTime).toFixed(2))} unit="h/d" />
                        <TableRow label="Rest Time" value={Number(parseFloat(results.restTime).toFixed(2))} unit="h/d" />
                        <TableRow label="Quantity" value={Number(parseFloat(results.Quantity).toFixed(2))} unit="m³/hr" highlight />
                        <TableRow label="Head" value={''} />
                        <TableRow label="Max. TMP" value={results.PumpMaxTMP} unit="m" indent />
                        <TableRow label="Lifting Height" value={results.PumpLiftingHeightValue} unit="m" indent />
                        <TableRow label="Pressure Loss" value={results.PumpPressureLoss} unit="m" indent />
                        <TableRow label="Margin" value={results.PumpMargin} unit="m" indent />
                        <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.PumpTotalDynamicHead).toFixed(2))} unit="m" indent highlight />

                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Membrane Blower</td>
                        </tr>
                        <TableRow label="Required air volume" value={Number(parseFloat(results.RequiredAirVolume).toFixed(2))} unit="m³/min" />
                        <TableRow label="Total air volume" value={Number(parseFloat(results.TotalAirVolume).toFixed(2))} unit="m³/min" />
                        <TableRow label="No. of duty blower" value={inputs.noOfDutyBlower} unit="units" />
                        <TableRow label="Quantity (included 15% margin)" value={Number(parseFloat(results.BlowerQuantity).toFixed(2))} unit="m³/min" highlight />
                        <TableRow label="Head" value={''} />
                        <TableRow label="Water Depth" value={Number(parseFloat(results.Blowerwaterdepth).toFixed(2))} unit="m" indent />
                        <TableRow label="Pressure loss of diffuser pipe" value={results.BlowerPressureLossofDiffuserPipe} unit="kPa" indent />
                        <TableRow label="Pressure loss of Instrument" value={Number(parseFloat(results.BlowerPressureLossofInstrument).toFixed(2))} unit="kPa" indent />
                        <TableRow label="Margin" value={Number(parseFloat(results.BlowerMargin).toFixed(2))} unit="kPa" indent />
                        <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.BlowertotalDynamicHead).toFixed(2))} unit="kPa" indent highlight />

                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">CIP Pump</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className='px-6 py-2.5 text-[12px] font-medium text-slate-600'> Pump is recommended to design as common pump for all trains.</td>
                        </tr>
                        <TableRow label="Pipe Size" value={inputs.pipeSize} unit="mm" indent />
                        <TableRow label="Pipe Length" value={inputs.pipeLength} unit="m" indent />
                        <TableRow label="Total water volume/train" value={Number(parseFloat(results.totalwatervolumePertrain).toFixed(2))} unit="m³" />
                        <TableRow label="Water volume in membrane/train" value={Number(parseFloat(results.watervolumeinMembranePerTrain).toFixed(2))} unit="m³" indent />
                        <TableRow label="Water volume in pipes/train" value={Number(parseFloat(results.watervolumeinPipesPerTrain).toFixed(2))} unit="m³" indent />
                        <TableRow label="Running Time for chemical injection" value={inputs.CIPrunningTimeForChemicalInjection} unit="min" />
                        <TableRow label="Quantity" value={Number(parseFloat(results.CIPQuantity).toFixed(2))} unit="m³/min" highlight />
                        <TableRow label="Head" value={''} />
                        <TableRow label="CIP Lifting Height" value={results.CIPLiftingheight} unit="m" indent />
                        <TableRow label="Pressure Loss" value={results.CIPPressureLoss} unit="m" indent />
                        <TableRow label="Margin" value={results.CIPmargin} unit="m" indent />
                        <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.CIPTotalDynamicHead).toFixed(2))} unit="m" indent highlight />

                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Permeate Tank</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className='px-6 py-2.5 text-[12px] font-medium text-slate-600'> Permeate tank is designed to store the water volume of 1 train CIP at least.</td>
                        </tr>
                        <TableRow label="No. of tank" value={Number(parseFloat(results.nooftank).toFixed(2))} unit="No." />
                        <TableRow label="Water volume used for CIP/train" value={Number(parseFloat(results.waterVolumeUsedforCIPperTrain).toFixed(2))} unit="m³" />
                        <TableRow label="Tank Capacity" value={Number(parseFloat(results.tankCapacity).toFixed(2))} unit="m³" />
                        <TableRow label="CIP time chart" value={''} />
                        <TableRow label="Chemical Injection" value={results.ChemicalInjection} unit="min" indent />
                        <TableRow label="Chemical Soaking" value={results.ChemicalSoaking} unit="min" indent />
                        <TableRow label="Water Flushing" value={results.WaterFlushing} unit="min" indent />
                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Backwash Pump</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className='px-6 py-2.5 text-[12px] font-medium text-slate-600'> If backwash is needed, design with use below.
                            Pump is recommended to design as common pump for all trains.</td>
                        </tr>
                        <TableRow label="No. of Pump" value={Number(parseFloat(results.backwashnoofPump).toFixed(2))} unit="No." />
                        <TableRow label="Flux of Backwash" value={Number(parseFloat(results.Fluxofbackwash).toFixed(2))} unit="LMH" />
                        <TableRow label="Duty Membrane area/train" value={Number(parseFloat(results.DutyMembraneareaperTrain).toFixed(2))} unit="m²" />
                        <TableRow label="Quantity" value={Number(parseFloat(results.BackwashQuantity).toFixed(2))} unit="m³/min" highlight />
                        <TableRow label="Head" value={''} />
                        <TableRow label="Max. TMP" value={results.BackwashmaxTMP} unit="m" indent />
                        <TableRow label="Lifting Height" value={inputs.BackwashLiftingHeight} unit="m" indent />
                        <TableRow label="Pressure Loss" value={results.backwashpressureloss} unit="m" indent />
                        <TableRow label="Margin" value={results.BackwashMargin} unit="m" indent />
                        <TableRow label="Total Dynamic Head" value={Number(parseFloat(results.BackwashTotalDynamicHead).toFixed(2))} unit="m" indent highlight />
                        <tr className="bg-blue-500/10">
                          <td colSpan={3} className="px-6 py-2 text-[12px] font-black uppercase tracking-widest text-blue-800 italic">Chemical Dosing</td>
                        </tr>
                        <tr>
                          <td colSpan={6} className="py-4 px-6">
                            <div className="grid grid-cols-[6fr_4fr] gap-8">

                              {/* Table */}
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

                              {/*  Table */}
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

                              {/* Table */}
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

                              {/*  Table */}
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

                              {/* Table */}
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

                              {/*  Table */}
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

                  {/* Chemical Cleaning Table */}
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
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
              <Zap className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-black uppercase tracking-[0.2em] text-sm">Awaiting Parameter Input</p>
              <p className="text-xs mt-2">Configure system variables and run projection to view results.</p>
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
      <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <span className="text-[12px] text-slate-500 uppercase">{unit}</span>
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

const TableRow: React.FC<{ label: React.ReactNode; value: any; unit?: string; highlight?: boolean; indent?: boolean; subtable?: boolean }> = ({ label, value, unit, highlight, subtable, indent }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className={`py-2 text-[12px] font-medium text-slate-600 ${subtable ? 'px-2' : 'px-3'} ${indent ? 'pl-13' : ''}`}>{label}</td>
    <td className={`py-2 text-right  ${subtable ? 'px-2' : 'px-3'}`}>
      <span className={`font-mono text-xs font-bold ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>{value}</span>
    </td>
    <td className={`py-1.5 text-left w-35 ${subtable ? 'px-2' : 'px-3'}`}>
      {unit && <span className="text-[12px] text-slate-500 uppercase">{unit}</span>}
    </td>
  </tr>
);

export default SumitomoCalculator;
