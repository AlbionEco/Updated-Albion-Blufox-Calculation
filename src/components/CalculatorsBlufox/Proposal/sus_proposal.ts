import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as docx from "docx";
import { saveAs } from "file-saver";
import { loadImage, base64ToUint8Array, formatToDDMMYYYY } from "./utils";

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export async function generateSUSProposal(
  inputs: any,
  setProgress: (percent: number, message: string) => void,
) {
  try {
    setProgress(5, "Processing Inputs...");

    const {
      quotation_Number,
      client_Name,
      date,
      special_Terms,
      module,
      flowRate: rawFlowRate,
      noOfTrain: rawNoOfTrain,
      flux: rawFlux,
      workingHr: rawWorkingHr,
      offer_Price: rawOfferPrice,
      authorized_Person,
      treatment_Type,
    } = inputs;

    const flowRate = parseFloat(rawFlowRate) || 0;
    const noOfTrain = parseFloat(rawNoOfTrain) || 0;
    const flux = parseFloat(rawFlux) || 0;
    const workingHr = parseFloat(rawWorkingHr) || 0;
    const offer_Price = parseFloat(rawOfferPrice) || 0;

        //  Initialize Variables for Calculation & PDF Content
        let membraneSurfaceAreaPerMBR = 0;
        
        // Perform calculations based on formulas including SUS series
        if (module == "SUS097") {
                    membraneSurfaceAreaPerMBR = 9.7; 
                } else if (module == "SUS113") {
                    membraneSurfaceAreaPerMBR = 11.3; 
                } else if (module == "SUS193") {
                    membraneSurfaceAreaPerMBR = 19.3; 
                } else if (module == "SUS227") {
                    membraneSurfaceAreaPerMBR = 22.7; 
                } else if (module == "SUS313") {
                    membraneSurfaceAreaPerMBR = 31.3; 
                } else if (module == "SUS400") {
                    membraneSurfaceAreaPerMBR = 40; 
                }

        const effectiveFlowRate = flowRate / 20 //hr;
        const perTrainFlowRate = +(effectiveFlowRate / noOfTrain);
        // 1. Math first -> 2. .toFixed() to round -> 3. + to convert back to number
const RasPumpFlow = +((flowRate / 24) * 3).toFixed(2);
const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
const MembraneSurfaceAreaPerTrain = NoofModulePerTrain * membraneSurfaceAreaPerMBR;
const TotalMembraneSurfaceArea = +(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);
const OperatingFlux = +(flux * 0.0238).toFixed(1);
const rawTimeFlux = +(flux * 83.34 / 100).toFixed(1);
const Timeflux = +(rawTimeFlux * 0.0238).toFixed(1);


        let length = 0;
        let width = 0;
        let height = 0;
        let effectiveWaterDepth = 0;
        let width2 = 0;
        let surfaceareapertrain = 0;
        let boxpipe = 0;
        if (TotalNumberOfModule >= 15) {
            boxpipe = 100;
        } else {
            boxpipe = 80;
        }

        // Logic updated to handle SUS113 dimensions
        if (module == "SUS097") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 0.78;
          height = 1.6;
          effectiveWaterDepth = 2.6;
          width2 = 1.85;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS113") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 0.78;
          height = 1.8;          
          effectiveWaterDepth = 2.8;
          width2 = 1.85;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS193") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 1.6;
          effectiveWaterDepth = 2.6;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS227") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 1.8;
          effectiveWaterDepth = 2.8;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS313") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 2.3;
          effectiveWaterDepth = 3.3;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS400") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 2.3;
          effectiveWaterDepth = 3.3;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        }

        const TotalMembraneTankVolume = Number((surfaceareapertrain).toFixed(2));
        const lengthinsidepertank = Number((TotalMembraneTankVolume / effectiveWaterDepth / width2).toFixed(1));
        const RequiredTotalFlowrateforpeakflux = Number((flowRate / workingHr).toFixed(2));
        const filteration = 8;

        const backwash = 1;
        const RequiredBackwashFlowRate = Number((RequiredTotalFlowrateforpeakflux * 1.5).toFixed(2));
        let RequiredtotalAirFlowRate = 0;
        
        // Updated to handle SUS prefix check if needed, or keep generic BF check if applicable
        if (module.substring(0, 2) == "BF") {
            RequiredtotalAirFlowRate = Number((TotalMembraneSurfaceArea * 0.3).toFixed(2));
        }  else if (module.substring(0, 3) == "SUS") {
          RequiredtotalAirFlowRate = Number((TotalMembraneSurfaceArea * 0.25).toFixed(2));
        }

        let ModuleSize = "";

        if (module == "SUS097") {
            ModuleSize = "1300 x 680 x 30"
        } else if (module == "SUS113") {
            ModuleSize = "1500 x 680 x 30";
        } else if (module == "SUS193") {
            ModuleSize = "1300 x 1250 x 30";
        } else if (module == "SUS227") {
            ModuleSize = "1500 x 1250 x 30";
        } else if (module == "SUS313") {
            ModuleSize = "2000 x 1250 x 30";
        } else if (module == "SUS400") {
            ModuleSize = "2000 x 1250 x 30";
        }

    setProgress(15, "Loading Images...");
    const headerImgData = await loadImage("/Images for Proposal/header.jpg");
    const footerImgData = await loadImage("/Images for Proposal/footer.jpg");
    const susImg = await loadImage(
      "/Images for Proposal/SUS_img.jpg",
    );
    const pidImg = await loadImage("/Images for Proposal/MembraneP&ID.jpg");
    const gaImg = await loadImage("/Images for Proposal/SUS_GADrawing.jpg");
    const cycleImg = await loadImage(
      "/Images for Proposal/MBR working cycle programming.jpg",
    );

    setProgress(30, "Initializing PDF...");
    const doc = new jsPDF({ compress: true, unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const headerHeight = 25;
    const footerHeight = 25;

    const applyHeaderFooter = () => {
      doc.addImage(headerImgData, "JPEG", 0, 0, pageWidth, headerHeight);
      doc.addImage(
        footerImgData,
        "JPEG",
        0,
        pageHeight - footerHeight,
        pageWidth,
        footerHeight,
      );
    };

    const formattedDate = formatToDDMMYYYY(date);

    // Page 1
    setProgress(40, "Creating Page 1...");
    let currentY = headerHeight + 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Ref: ", 15, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${quotation_Number}`, 23, currentY);
    doc.setFont("helvetica", "bold");
    doc.text("Date: ", pageWidth - 60, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(formattedDate, pageWidth - 48, currentY);
    currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("To:", 15, currentY);
    currentY += 6;
    doc.setFont("helvetica", "normal");
    const clientLines = doc.splitTextToSize(client_Name, 160);
    doc.text(clientLines, 15, currentY);
    currentY += clientLines.length * 5 + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Proposal:", 15, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Blufox®  ${flowRate}KLD ${treatment_Type}- MBR Membranes`,
      37,
      currentY,
    );
    currentY += 10;
    doc.addImage(susImg, "JPEG", 40, currentY, 110, 120);
    currentY += 120;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Features", 15, currentY);
    currentY += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const features = [
      "• High hydrophilic PVDF membrane",
      "• Reinforced hollow fiber membrane",
      "• Reduced treatment plant footprint",
      "• Long membrane service life",
      "• Consistent and stable flux performance",
      "• Energy saving due to low operating pressure",
    ];
    features.forEach((feature) => {
      currentY += 5;
      doc.text(feature, 20, currentY);
    });

    // Page 2 - Product Features
    setProgress(50, "Creating Product Features...");
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Product Features", 15, currentY);
    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(0);

    const addBullet = (title: string, desc: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(`\u2022 ${title}`, 15, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(desc, 170);
      doc.text(lines, 20, currentY, { align: "justify", maxWidth: 170 });
      currentY += lines.length * 5 + 5;
    };

    addBullet(
      "Excellent Performance:",
      "The Performance of R-PVDF is 10 times better than materials like PES or PS.",
    );
    addBullet(
      "High Strength:",
      "We adopt the independently developed patent process, which is of higher membrane tensile strength and compressive strength. The tensile resistance can reach 200kg+ and the fiber break age ratio is less than 3%. The Inner Potting material use for holding Fibers is PU with combine of epoxy resin, which gives hollow fiber superior strength in aeration mode.",
    );
    addBullet(
      "Permanent Hydrophilic Membrane:",
      "Based on patent technology, special hydrophilization processing is applied on RPVDF so as to enable a stronger hydrophilic on membrane filaments and still keep its original superior characteristics. Design of the membranes eliminate the dead pockets which results in reduce the bio fouling of the membranes in long term.",
    );
    addBullet(
      "Internationally Advanced Membrane Micro-structure:",
      "The sponge-like structure consists of a surface layer of 0.03 - 0.06 micrometers cerebral cortex, with which membrane processes stronger tolerance to run-through, thus ensuring the safety of water outlet.",
    );
    addBullet(
      "High Peeling Strength:",
      "The membrane won the peeled off even after 1million back-flush.",
    );
    addBullet(
      "Waste Water Optimization:",
      "Stable effluent quality, high resistance to water quality impact load test. Effluent suspended matter and turbidity are close to zero.",
    );
    addBullet(
      "Flexible Operational Control:",
      "The efficient interception of membrane intercepts microorganisms completely in the bioreactor, complete separation of HRT and SRT. Flexible operational control.",
    );
    addBullet(
      "Reduce Land and Civil Construction Investment:",
      "The concentration of MBR tank's activate sludge is around 8,000 – 12,000 mg/l, which both spares the room for sedimentation tank and minimizes land occupation and construction investment. The occupied area is about 1/3 of the traditional process.",
    );

    // Page 3 - More Features & Process
    doc.addPage();
    currentY = headerHeight + 15;
    addBullet(
      "Reproduction of Nitro bacteria:",
      "High systematic nitrification efficiency is beneficial to the retention and reproduction of nitrobacteria. Deamination and de-phosphorization may also be realized if the mode of operation is changed.",
    );
    addBullet(
      "Improve the Degradation Efficiency:",
      "The degradation efficiency of refractory organics can be enhanced greatly since the sludge age can be very long.",
    );
    addBullet(
      "Can achieve Zero Sludge Discharge:",
      "Operated under high volumetric loading, low sludge loading, long sludge age, the reactor yields extremely low residual sludge. Due to the infinite sludge age, theoretically zero-release of sludge can be achieved.",
    );
    addBullet(
      "Easy Operation and Management:",
      "PLC control of system brings a convenient operation and management process. Simple rack or frame design ensure ease of design as well as maintenance.",
    );

    currentY += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Process Description of MBR Membranes: ", 15, currentY);
    currentY += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const processDesc = `MBR tank receives Effluent with the required MLSS after the aeration process. MBR tank consists of MBR membrane modules mounted on structural frame Air diffuser are provided. Below the membrane modules for air scouring.  ${" "}
The filtration takes place by means of suction pump which delivers the treated water in the product water tank, a part of the treated water is collected in a overhead backwash water tank. After every 7-8 minutes of service cycle the membranes are subjected to relaxation of 60 seconds. Backwash takes place typically after every 8 Cycle for a period of 1 minutes. In this step, product water from the overhead backwash tank flows by Pump into the membrane module and dislodges the impurities from the membrane surface. Air scouring continues during filtration, rest and backwash period.`;
    const processLines = doc.splitTextToSize(processDesc, 180);
    doc.text(processLines, 15, currentY, { align: "justify", maxWidth: 180 });

    // Page 4 - Operating Conditions & Specs
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Standard Operating Conditions:", 15, currentY);
    currentY += 5;
    autoTable(doc, {
      startY: currentY,
      head: [["Parameters", "Unit", "Range"]],
      body: [
        ["Required MLSS", "mg/lit", "6000-12000"],
        ["Permeate Water Flux", "LMH", "10-30"],
        ["Air flow Required/Scouring", "m2/m3/hr", "0.20-0.35"],
        ["Max. Trans Pressure (TMP)", "mm/Hg (inHg.)", "500(-20)"],
        ["Back Wash Pressure", "Kg/cm2", "1-1.5"],
        ["DO in MBR Basin", "mg/l", "1-3"],
        ["MLVSS Ratio", "-", "80%"],
        ["Membrane PH tolerance", "-", "3-10"],
        ["Temperature", "Degree", "10-40"],
        ["NaClo Tolerance", "mg/lit (ppm)", "5000"],
      ],
      tableWidth: 175,
      margin: { left: 15 },
      theme: "grid",
      headStyles: {
        fillColor: [169, 169, 169],
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      bodyStyles: { fillColor: [255, 255, 255], textColor: "#4b4b4b" },
    });
    currentY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(
      "** Kindly remove Fat, Oil, Grease to protect membranes from fouling and choking, use 1-2mm size fine screen in aeration tank feed line to reduce the heavy TSS stuck to the membranes surface during suction.",
      15,
      currentY,
      { maxWidth: 170, align: "justify" },
    );

    currentY += 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(200, 0, 0);
    doc.text(`${module}`, 15, currentY);
    doc.setTextColor(0, 0, 139);
    doc.text(
      ` - Membrane Specification`,
      15 + doc.getTextWidth(module),
      currentY,
    );
    currentY += 5;
    autoTable(doc, {
      startY: currentY,
      head: [["Items", "Unit"]],
      body: [
['Material of Fiber', 'Reinforced PVDF with PET Layer Support'],
                ['Element Header', 'ABS resin (Heavy Duty) with Side SS304 water collector pipe'],
                ['Pore size', '0.1 Micron (outside - in) '],
                ['Fiber Size (OD/ID)', '2.5mm / 1.9mm'], 
                ['Surface Area (MBR)', `${membraneSurfaceAreaPerMBR} m2/module`],
                ['Operation Pressure', '2.95 to 17.71 inHg (minus)'],
                ['Backwash Pressure ', 'Max 0.2 MPa'],
                ['Backwash Time ', '30~120 sec.'],
                ['Turbidity outlet', '<1 NTU'],
                ['Element Dimension', `${ModuleSize} mm (Drawing as below)`],
      ],
      tableWidth: 175,
      margin: { left: 15 },
      theme: "grid",
      headStyles: {
        fillColor: [169, 169, 169],
        fontStyle: "bolditalic",
        halign: "left",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      bodyStyles: { fillColor: [255, 255, 255] },
    });

    // Page 5 - P&ID
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Typical P&ID", 15, currentY);
    doc.addImage(pidImg, "JPEG", 20, currentY + 5, 170, 215);

    // Page 6 - GA Drawing
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("MBR Membranes GA Drawing", 15, currentY);
    doc.addImage(gaImg, "JPEG", 15, currentY + 5, 170, 200);

    // Page 7 - Offer Parameters
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Offer Parameter", 15, currentY);
    currentY += 5;
    autoTable(doc, {
      startY: currentY,
      head: [["Parameters", "Unit", "Range"]],
      body: [
        ['Flow Rate of the system', 'KLD', `${flowRate}`],
                ['Effective flow Rate (Considering loss of relax & Backwash)', 'm3/hr', `${effectiveFlowRate.toFixed(2)}`],
                ['Design Frame/Train Qty', 'Nos', `${noOfTrain}`],
                ['Per Frame/Train Flow Rate ', 'm3/hr', `${perTrainFlowRate}`],
                ['Design Flux (Avg.)', 'LMH', `${flux}`],
                ['Total MBR Module Required(BLUFOX®)', 'Nos', `${TotalNumberOfModule}`],
                ['Per Frame MBR Module Required', 'No.', `${NoofModulePerTrain}`],
                ['Per Frame MBR Module Surface Area', 'm2', `${MembraneSurfaceAreaPerTrain}`],
                ['Total MBR Membrane Surface Area', 'm2', `${TotalMembraneSurfaceArea}`],
                ['Total MBR Air Required', 'm3/hr', `${RequiredtotalAirFlowRate}`],
                ['MBR Frame/Train Size (Each)', 'L x W x H mm', `${Math.ceil((length * 1000))} x ${(Math.ceil((width) * 1000))} x ${Math.ceil((height * 1000))}`],
                ['MBR Frame MOC', '-', `SS304`],
                ['MBR Tank Volume Required (Approx.)', 'm3', `${TotalMembraneTankVolume}`],
                ['Permeate Pump Flow @ 12-13m Head', 'm3/hr', `${RequiredTotalFlowrateforpeakflux}`],
                ['Back Wash Pump Flow @ 10m Head ', 'm3/hr', `${RequiredBackwashFlowRate}`],
                ['RAS Pump Flow @ 15m Head ', 'm3/hr', `${RasPumpFlow}`],
           ],
      tableWidth: 175,
      margin: { left: 15 },
      theme: "grid",
      headStyles: {
        fillColor: [169, 169, 169],
        fontStyle: "bold",
        halign: "left",
      },
      styles: { fontStyle: "normal", halign: "left", textColor: 0 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      bodyStyles: { fillColor: [255, 255, 255] },
    });
    currentY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Note:", 15, currentY);
    currentY += 2;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(
      "1. Vertical Distance between the water level in the MBR tank and back wash tank shall not be more than 0.7mtr",
      15,
      currentY + 5,
      { maxWidth: 170, align: "justify" },
    );
    doc.text(
      "2. Maintain the water level 300-500mm above the MBR frame / Module.",
      15,
      currentY + 15,
      { maxWidth: 170, align: "justify" },
    );

    // Page 8 - Feed Limits
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("MBR Feed Limiting Conditions", 105, currentY, {
      align: "center",
    });
    currentY += 6;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Customer must ensure the feeding limits for MBR tank shall be as per the below table. In case the MBR feed limits are not meeting as per the below section, it may lead to Membrane damage / failure for which Supplier shall not be responsible.",
      15,
      currentY,
      { maxWidth: 170, align: "justify" },
    );

    currentY += 15;

    autoTable(doc, {
      startY: currentY,
      head: [
        ["#", "Parameter", "Design Value", "Accepted Operating Range", "Units"],
      ],
      body: [
        [
          1,
          "Membrane tank MLSS concentration",
          "10000",
          "8,000-12,000",
          "mg/L",
        ],
        [2, "Bioreactor MLSS", "8000", "6,000-10,000", "mg/L"],
        [3, "Bioreactor MLVSS concentration", "75", ">70%", "MLSS"],
        [4, "Dissolved oxygen concentration", "2", "1.5-3.0", "mg/L"],
        [5, "pH of mixed liquor", "7", "6.5-8.0", "-"],
        [6, "Total SRT in Bioreactor", "NA", "15-20", "days"],
        [7, "Soluble cBOD5", "<5", "≤10", "mg/L"],
        [8, "NH3-N", "0.5", "≤1", "mg/L"],
        [9, "Soluble COD", "<50", "<50", "mg/L"],
        [10, "Total Hardness (as CaCO3)", "-", "Not Scaling", "-"],
        [11, "Soluble Alkalinity (as CaCO3)", "100", "50-150", "mg/L"],
        [12, "Colloidal TOC (cTOC) concentration (Note 1)", "7", "≤10", "mg/L"],
        [13, "Total time to filter (TTF) (Note 2)", "100", "200", "s"],
        [
          14,
          "Mixed liquor recirculation from MBR -> Bioreactor (Note 3)",
          "4",
          "4 ± 10%",
          "4Q",
        ],
        [15, "Trash/Solids >2mm", "0", "≤2", "mg/L"],
        [16, "Fats, Oil & Grease (FOG)", "<10", "<10", "mg/L"],
        [17, "Mixed Liquor Temperature", "25", "25-35", "°C"],
      ],
      tableWidth: 170,
      margin: { left: 15 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 11,
        cellPadding: 2,
        valign: "middle",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // light gray
      },
    });

    // Page 9 - Cycle & Step Chart
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("NOTES:", 15, currentY);

    currentY += 7;

    const notes = [
      " Colloidal TOC (cTOC) is the difference between the TOC measured in the filtrate passing through a 1.5 µm filter paper and the TOC measured in the Blufox permeate. TOC measurement shall follow standard water testing methods.",
      " Per Seller's Time To Filter (TTF) procedure (available upon request).",
      " Assuming a MLSS recirculation ratio of 3Q (Pump configuration). Customer to confirm.",
      " Chemicals incompatible with BLUFOX PVDF membranes must not enter MBR tank (compatibility list available).",
      " Biological & membrane process designed for 25-35°C. Avoid >38°C.",
      " TDS of treated water <3000 ppm. Chlorides <1500 ppm. Sulphates <700 ppm.",
      " Oil & Grease must not exceed 10 mg/L (emulsified) with no free oil.",
      " Adequate alkalinity must be maintained for biological performance; chemical dosing may be required.",
    ];

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    notes.forEach((note, i) => {
      const numberedText = `${i + 1}. ${note}`;
      const lines = doc.splitTextToSize(numberedText, 180);
      doc.text(lines, 15, currentY, { maxWidth: 180, align: "justify" });
      currentY += lines.length * 6;
    });

    currentY += 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("MBR Working Cycle Programming:", 15, currentY);
    doc.addImage(cycleImg, "JPEG", 15, currentY + 5, 180, 30);
    currentY += 50;
    doc.text("Step Chart Pump and Valve Condition:", 15, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [
        [
          "Step",
          "Permeate Pump",
          "Backwash Pump",
          "Produced Water Valve",
          "Backwash Valve",
          "Air Inlet Valve",
          "Citric Dosing Pump",
          "NaClO Dosing Pump",
        ],
      ],
      body: [
        ["Permeate", "Open", " ", "Open", " ", "Open", " ", " "],
        ["Backwash", " ", "Open", " ", "Open", "Open", " ", " "],
        ["CEB NaClO", " ", "Open", " ", "Open", "Open", " ", "Open"],
        ["CEB Citric Acid", " ", "Open", " ", "Open", "Open", "Open", " "],
      ],
      tableWidth: 175,
      margin: { left: 15 },
      theme: "grid",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 191, 255],
        fontStyle: "bold",
        halign: "center",
        lineColor: [204, 204, 204],
        lineWidth: 0.1,
      },
      styles: { fontStyle: "normal", halign: "center", textColor: 0 },
    });

    // Page 10 - Commercial
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Commercial Offer:", 15, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [["No.", "Item", "Qty.", "Total Price (Rs.)"]],
      body: [
        [
          "1.",
          `Blufox - MBR Membranes\nPlant Capacity: ${flowRate} KLD ${treatment_Type}\nwith SS304 Skid(Frame)`,
          `${TotalNumberOfModule}`,
          `${(offer_Price * TotalNumberOfModule).toLocaleString("en-IN")}/-`,
        ],
        [
          "",
          "",
          "Total Price (Rs.)",
          `${(offer_Price * TotalNumberOfModule).toLocaleString("en-IN")}/-`,
        ],
      ],
      tableWidth: 175,
      margin: { left: 15 },
      theme: "grid",
      headStyles: {
        fillColor: [169, 169, 169],
        fontStyle: "bold",
        halign: "center",
      },
      styles: { fontStyle: "normal", halign: "left", textColor: 0 },
      didParseCell: function (data) {
        if (data.column.index === 2 || data.column.index === 3) {
          data.cell.styles.halign = "center";
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    currentY = doc.lastAutoTable.finalY + 5;

    currentY += 10;
    //Heading
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Scope of Supply:", 15, currentY);
    currentY += 5;
    // description 1
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(
      "\u2022  Supply of Membranes Module / only membranes.",
      20,
      currentY,
      { maxWidth: 180, align: "justify" },
    );
    currentY += 5;
    doc.text("\u2022  Supply P&ID", 20, currentY, {
      maxWidth: 180,
      align: "justify",
    });
    currentY += 5;
    doc.text("\u2022  Operation Manual", 20, currentY, {
      maxWidth: 180,
      align: "justify",
    });
    currentY += 15;

    //Heading
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Exclusion:", 15, currentY);
    currentY += 5;
    // description 1
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(
      "\u2022  Pre-treatment, Biological, Post Treatment",
      20,
      currentY,
      { maxWidth: 180, align: "justify" },
    );
    currentY += 5;
    doc.text("\u2022  Control Panel & Instruments.", 20, currentY, {
      maxWidth: 180,
      align: "justify",
    });
    currentY += 5;
    doc.text("\u2022  Pumps, Blowers, Lifting system etc.", 20, currentY, {
      maxWidth: 180,
      align: "justify",
    });
    currentY += 20;

    // --- PAYMENT TERMS HEADING ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Payment Terms and Conditions:", 15, currentY);
    currentY += 7;

    // --- TERMS BULLET POINTS ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const termsConditions = [
      "1)  Above Prices ex. work only.",
      "2)  GST 18 % will be extra.",
      "3)  Freight & Packing will be charges extra as actual.",
      "4)  Payment 50% Advance and 50% before delivery.",
      "5)  Offer Validity 30 days from offer date.",
      "6)  Installation under client scope only.",
      "7)  Delivery 15-60 days of Purchase Order along with advance payment.",
      "8)  Membrane Warranty will be one year against manufacturing defect only.",
      "9)  Client has to submit the feed water data, Process flow diagram, P&ID, Programming cycle design before commissioning of the plant, if client wants to understand the CEB / CIP process, supplier can provide video training support to client.",
      "10) Any other terms and conditions will be as per Blufox standard terms and conditions.",
    ];

    termsConditions.forEach((term) => {
      // 1. Split text to know exactly how many lines it occupies
      let lines = doc.splitTextToSize(term, 180);
      let blockHeight = lines.length * 5;

      // 3. Print the text
      doc.text(lines, 20, currentY);

      // 4. Update Y
      currentY += blockHeight + 2;
    });

    // Page 11 - Authorization
    // --- HELPER CONFIGURATION ---
    const contentStartX = 25;
    const textWidth = 165;
    const lineHeight = 5; // Approx height per line (adjust based on font size)
    const pageBottomLimit = pageHeight - footerHeight - 10; // Buffer space before footer

    // Function to handle Page Breaks
    function checkPageBreak(requiredSpace) {
      if (currentY + requiredSpace > pageBottomLimit) {
        doc.addPage();
        // add header and footet for the new page
        applyHeaderFooter();
        currentY = headerHeight + 15; // Reset Y position for new page
      }
    }

    // 1. Force a new page for the start of this section
    doc.addPage();
    currentY = headerHeight + 15;

    // --- SPECIAL TERMS (Dynamic Length) ---
    if (special_Terms && special_Terms.trim() !== "") {
      // Heading
      doc.setFontSize(14);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(0, 0, 139);
      checkPageBreak(15);
      doc.text("Special Terms and Conditions:", contentStartX, currentY);
      currentY += 7;

      // Content
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);

      // Split the massive text block into individual lines based on width
      const specialLines = doc.splitTextToSize(special_Terms, textWidth);

      // Loop through EVERY line. This allows the text to break across pages gracefully.
      specialLines.forEach((line) => {
        checkPageBreak(lineHeight); // Check if 1 line fits
        doc.text(line, contentStartX, currentY);
        currentY += lineHeight;
      });

      currentY += 10; // Gap after special terms
    }

    const signatureBlockHeight = 40;

    checkPageBreak(signatureBlockHeight);

    // 1. Heading
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 139);
    doc.text("Authorized Signatory", contentStartX, currentY);
    currentY += 8;

    // 2. Name
    doc.text(`${authorized_Person}`, contentStartX, currentY);
    currentY += 8;

    // 3. Company Name
    doc.text("Blufox Ecoventures LLP.", contentStartX, currentY);
    currentY += 15;

    // --- IMAGES SECTION ---
    // Images height is 50, plus some padding.
    const imagesHeight = 55;

    checkPageBreak(imagesHeight);

    // Final Pass: Add Header and Footer to ALL Pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      try {
        applyHeaderFooter();
      } catch (e) {
        console.error("Error applying header/footer on page " + i, e);
      }
    }

    setProgress(100, "Download Started!");
    doc.save(`Proposal_${quotation_Number}.pdf`);
  } catch (e: any) {
    console.error(e);
    alert("Error generating PDF: " + e.message);
  }
}

export async function generateSUSWordProposal(
  inputs: any,
  setProgress: (percent: number, message: string) => void,
) {
  try {
    setProgress(5, "Processing Inputs...");
    const {
      quotation_Number,
      client_Name,
      date,
      special_Terms,
      module,
      flowRate: rawFlowRate,
      noOfTrain: rawNoOfTrain,
      flux: rawFlux,
      workingHr: rawWorkingHr,
      offer_Price: rawOfferPrice,
      authorized_Person,
      treatment_Type,
    } = inputs;

    const flowRate = parseFloat(rawFlowRate) || 0;
    const noOfTrain = parseFloat(rawNoOfTrain) || 0;
    const flux = parseFloat(rawFlux) || 0;
    const workingHr = parseFloat(rawWorkingHr) || 0;
    const offer_Price = parseFloat(rawOfferPrice) || 0;

    //  Initialize Variables for Calculation & PDF Content
        let membraneSurfaceAreaPerMBR = 0;
        
        // Perform calculations based on formulas including SUS series
        if (module == "SUS097") {
                    membraneSurfaceAreaPerMBR = 9.7; 
                } else if (module == "SUS113") {
                    membraneSurfaceAreaPerMBR = 11.3; 
                } else if (module == "SUS193") {
                    membraneSurfaceAreaPerMBR = 19.3; 
                } else if (module == "SUS227") {
                    membraneSurfaceAreaPerMBR = 22.7; 
                } else if (module == "SUS313") {
                    membraneSurfaceAreaPerMBR = 31.3; 
                } else if (module == "SUS400") {
                    membraneSurfaceAreaPerMBR = 40; 
                }

        const effectiveFlowRate = flowRate / 20 //hr;
        const perTrainFlowRate = +(effectiveFlowRate / noOfTrain);
        // 1. Math first -> 2. .toFixed() to round -> 3. + to convert back to number
const RasPumpFlow = +((flowRate / 24) * 3).toFixed(2);
const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
const MembraneSurfaceAreaPerTrain = NoofModulePerTrain * membraneSurfaceAreaPerMBR;
const TotalMembraneSurfaceArea = +(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);
const OperatingFlux = +(flux * 0.0238).toFixed(1);
const rawTimeFlux = +(flux * 83.34 / 100).toFixed(1);
const Timeflux = +(rawTimeFlux * 0.0238).toFixed(1);


        let length = 0;
        let width = 0;
        let height = 0;
        let effectiveWaterDepth = 0;
        let width2 = 0;
        let surfaceareapertrain = 0;
        let boxpipe = 0;
        if (TotalNumberOfModule >= 15) {
            boxpipe = 100;
        } else {
            boxpipe = 80;
        }

        // Logic updated to handle SUS113 dimensions
        if (module == "SUS097") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 0.78;
          height = 1.6;
          effectiveWaterDepth = 2.6;
          width2 = 1.85;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS113") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 0.78;
          height = 1.8;          
          effectiveWaterDepth = 2.8;
          width2 = 1.85;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS193") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 1.6;
          effectiveWaterDepth = 2.6;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS227") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 1.8;
          effectiveWaterDepth = 2.8;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS313") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 2.3;
          effectiveWaterDepth = 3.3;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "SUS400") {
          length = ((NoofModulePerTrain * 33) + ((NoofModulePerTrain + 1) * 15) + 100) / 1000;
          width = 1.35;
          height = 2.3;
          effectiveWaterDepth = 3.3;
          width2 = 2.5;
          surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        }

        const TotalMembraneTankVolume = Number((surfaceareapertrain).toFixed(2));
        const lengthinsidepertank = Number((TotalMembraneTankVolume / effectiveWaterDepth / width2).toFixed(1));
        const RequiredTotalFlowrateforpeakflux = Number((flowRate / workingHr).toFixed(2));
        const filteration = 8;

        const backwash = 1;
        const RequiredBackwashFlowRate = Number((RequiredTotalFlowrateforpeakflux * 1.5).toFixed(2));
        let RequiredtotalAirFlowRate = 0;
        
        // Updated to handle SUS prefix check if needed, or keep generic BF check if applicable
        if (module.substring(0, 2) == "BF") {
            RequiredtotalAirFlowRate = Number((TotalMembraneSurfaceArea * 0.3).toFixed(2));
        }  else if (module.substring(0, 3) == "SUS") {
          RequiredtotalAirFlowRate = Number((TotalMembraneSurfaceArea * 0.25).toFixed(2));
        }

        let ModuleSize = "";

        if (module == "SUS097") {
            ModuleSize = "1300 x 680 x 30"
        } else if (module == "SUS113") {
            ModuleSize = "1500 x 680 x 30";
        } else if (module == "SUS193") {
            ModuleSize = "1300 x 1250 x 30";
        } else if (module == "SUS227") {
            ModuleSize = "1500 x 1250 x 30";
        } else if (module == "SUS313") {
            ModuleSize = "2000 x 1250 x 30";
        } else if (module == "SUS400") {
            ModuleSize = "2000 x 1250 x 30";
        }    setProgress(20, "Loading Image Assets...");
    const headerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/header.jpg"),
    );
    const footerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/footer.jpg"),
    );
    const membraneImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/SUS_img.jpg"),
    );

    const pidImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MembraneP&ID.jpg"),
    );
    const gaImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/SUS_GADrawing.jpg"),
    );
    const cycleImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MBR working cycle programming.jpg"),
    );

      const formattedDate = formatToDDMMYYYY(date);

    setProgress(40, "Building Word Document...");
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      ImageRun,
      Header,
      Footer,
      AlignmentType,
      PageBreak,
      Table,
      TableRow,
      TableCell,
      WidthType,
      BorderStyle,
      VerticalAlign,
    } = docx;

    const docObj = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Helvetica",
              size: 22, 
              color: "000000",
            },
            paragraph: {
              spacing: {
                line: 300,
                lineRule: "auto", 
                after: 0,
                before: 0,
              }, 
              alignment: AlignmentType.JUSTIFIED,
            },
          },
        },
      },
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: headerBuffer,
                      transformation: { width: 795, height: 90 },
                       type: "jpg",
                    }),
                  ],
                  indent: { left: -1200, right: -1200 },
                  spacing: { before: 0, after: 0 },
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: footerBuffer,
                      transformation: { width: 795, height: 100 },
                       type: "jpg",
                    }),
                  ],
                  indent: { left: -1200, right: -1200 },
                }),
              ],
            }),
          },
          properties: {
            page: {
              margin: {
                header: 0, // Header from top = 0cm
                footer: 0, // Footer from bottom = 0cm
                top: 1440, // Body starts at 1 inch
                bottom: 1441,
                left: 1200,
                right: 1200,
              },
            },
          },
          children: [
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "" }),
                new TextRun({ text: "Ref: ", bold: true, size: 24 }),
                new TextRun({ text: quotation_Number || "" }),
                new TextRun({
                  text: "\t\t\t\t\t\t\tDate: ",
                  size: 24,
                  bold: true,
           }),
                new TextRun({ text: formattedDate }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: "To:", bold: true, size: 24 })],
            }),
            ...client_Name
              .split("\n")
              .map((line: string) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "Proposal: ", bold: true, size: 24 }),
                new TextRun({
                  text: `Blufox®  ${flowRate}KLD ${treatment_Type}- MBR Membranes`,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: membraneImgBuffer,
                  transformation: { width: 350, height: 400 },
                   type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Features",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            ...[
              "",
              "• High hydrophilic PVDF membrane",
              "• Reinforced hollow fiber membrane",
              "• Reduced treatment plant footprint",
              "• Long membrane service life",
              "• Consistent and stable flux performance",
              "• Energy saving due to low operating pressure",
            ].map(
              (f) =>
                new Paragraph({
                  children: [new TextRun({ text: f })],
                  indent: { left: 200 },
                }),
            ),

            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Product Features",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            ...[
              {
                t: "Excellent Performance:",
                d: "The Performance of R-PVDF is 10 times better than materials like PES or PS.",
              },
              {
                t: "High Strength:",
                d: "We adopt the independently developed patent process, which is of higher membrane tensile strength and compressive strength. The tensile resistance can reach 200kg+ and the fiber break age ratio is less than 3%. The Inner Potting material use for holding Fibers is PU with combine of epoxy resin, which gives hollow fiber superior strength in aeration mode.",
              },
              {
                t: "Permanent Hydrophilic Membrane:",
                d: "Based on patent technology, special hydrophilization processing is applied on RPVDF so as to enable a stronger hydrophilic on membrane filaments and still keep its original superior characteristics. Design of the membranes eliminate the dead pockets which results in reduce the bio fouling of the membranes in long term.",
              },
              {
                t: "Internationally Advanced Membrane Micro-structure:",
                d: "The sponge-like structure consists of a surface layer of 0.03 - 0.06 micrometers cerebral cortex, with which membrane processes stronger tolerance to run-through, thus ensuring the safety of water outlet.",
              },
              {
                t: "High Peeling Strength:",
                d: "The membrane won the peeled off even after 1million back-flush.",
              },
              {
                t: "Waste Water Optimization:",
                d: "Stable effluent quality, high resistance to water quality impact load test. Effluent suspended matter and turbidity are close to zero.",
              },
              {
                t: "Flexible Operational Control:",
                d: "The efficient interception of membrane intercepts microorganisms completely in the bioreactor, complete separation of HRT and SRT. Flexible operational control.",
              },
              {
                t: "Reduce Land and Civil Construction Investment:",
                d: "The concentration of MBR tank's activate sludge is around 8,000 – 12,000 mg/l, which both spares the room for sedimentation tank and minimizes land occupation and construction investment. The occupied area is about 1/3 of the traditional process.",
              },
            ]
              .map((item) => [
                new Paragraph({
                  children: [new TextRun({ text: `• ${item.t}`, bold: true })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: item.d })],
                  indent: { left: 200 },
                }),
                new Paragraph({ text: "" }),
              ])
              .flat(),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            ...[
              {
                t: "Reproduction of Nitro bacteria:",
                d: "High systematic nitrification efficiency is beneficial to the retention and reproduction of nitrobacteria. Deamination and de-phosphorization may also be realized if the mode of operation is changed.",
              },
              {
                t: "Improve the Degradation Efficiency:",
                d: "The degradation efficiency of refractory organics can be enhanced greatly since the sludge age can be very long.",
              },
              {
                t: "Can achieve Zero Sludge Discharge:",
                d: "Operated under high volumetric loading, low sludge loading, long sludge age, the reactor yields extremely low residual sludge. Due to the infinite sludge age, theoretically zero-release of sludge can be achieved.",
              },
              {
                t: "Easy Operation and Management:",
                d: "PLC control of system brings a convenient operation and management process. Simple rack or frame design ensure ease of design as well as maintenance.",
              },
            ]
              .map((item) => [
                new Paragraph({
                  children: [new TextRun({ text: `• ${item.t}`, bold: true })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: item.d })],
                  indent: { left: 200 },
                }),
                new Paragraph({ text: "" }),
              ])
              .flat(),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Process Description of MBR Membranes:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "MBR tank receives Effluent with the required MLSS after the aeration process. MBR tank consists of MBR membrane modules mounted on structural frame Air diffuser are provided. Below the membrane modules for air scouring.",
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              text: "The filtration takes place by means of suction pump which delivers the treated water in the product water tank, a part of the treated water is collected in a overhead backwash water tank. After every 7-8 minutes of service cycle the membranes are subjected to relaxation of 60 seconds. Backwash takes place typically after every 8 Cycle for a period of 1 minutes. In this step, product water from the overhead backwash tank flows by Pump into the membrane module and dislodges the impurities from the membrane surface. Air scouring continues during filtration, rest and backwash period.",
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Standard Operating Conditions:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
  top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
},
              rows: [
                new TableRow({
                  children: ["Parameters", "Unit", "Range"].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 80,
                          bottom: 80,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: h,
                                bold: true,
                                color: "FFFFFF",
                              }),
                            ],
                          }),
                        ],
                        shading: { fill: "A9A9A9" },
                      }),
                  ),
                }),
                ...[
                  ["Required MLSS", "mg/lit", "6000-12000"],
                  ["Permeate Water Flux", "LMH", "10-30"],
                  ["Air flow Required/Scouring", "m2/m3/hr", "0.20-0.35"],
                  ["Max. Trans Pressure (TMP)", "mm/Hg (inHg.)", "500(-20)"],
                  ["Back Wash Pressure", "Kg/cm2", "1-1.5"],
                  ["DO in MBR Basin", "mg/l", "1-3"],
                  ["MLVSS Ratio", "-", "80%"],
                  ["Membrane PH tolerance", "-", "3-10"],
                  ["Temperature", "Degree", "10-40"],
                  ["NaClo Tolerance", "mg/lit (ppm)", "5000"],
                ].map(
                  (row, index) =>
                    new TableRow({
                      children: row.map(
                        (c) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            shading: {
                              fill: index % 2 === 0 ? "F0F0F0" : "FFFFFF",
                            },
                            margins: {
                              top: 80,
                              bottom: 80,
                              left: 200,
                              right: 200,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: c.toString(),
                                    color: "4b4b4b",
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ),
                    }),
                ),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "** Kindly remove Fat, Oil, Grease to protect membranes from fouling and choking, use 1-2mm size fine screen in aeration tank feed line to reduce the heavy TSS stuck to the membranes surface during suction.",
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: module,
                  bold: true,
                  size: 28,
                  color: "C80000",
                }),
                new TextRun({
                  text: " - Membrane Specification",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
  top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
},
              rows: [
                new TableRow({
                  children: ["Items", "Unit"].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 70,
                          bottom: 70,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: h,
                                bold: true,
                                color: "FFFFFF",
                              }),
                            ],
                          }),
                        ],
                        shading: { fill: "A9A9A9" },
                      }),
                  ),
                }),
                ...[
                   ['Material of Fiber', 'Reinforced PVDF with PET Layer Support'],
                ['Element Header', 'ABS resin (Heavy Duty) with Side SS304 water collector pipe'],
                ['Pore size', '0.1 Micron (outside - in) '], 
                ['Fiber Size (OD/ID)', '2.5mm / 1.9mm'], 
                ['Surface Area (MBR)', `${membraneSurfaceAreaPerMBR} m2/module`],
                ['Operation Pressure', '2.95 to 17.71 inHg (minus)'],
                ['Backwash Pressure ', 'Max 0.2 MPa'],
                ['Backwash Time ', '30~120 sec.'],
                ['Turbidity outlet', '<1 NTU'],
                ['Element Dimension', `${ModuleSize} mm (Drawing as below)`],
                ].map(
                  (row, index) =>
                    new TableRow({
                      children: row.map(
                        (c) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            shading: {
                              fill: index % 2 === 0 ? "F0F0F0" : "FFFFFF",
                            },
                            margins: {
                              top: 80,
                              bottom: 80,
                              left: 200,
                              right: 200,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: c.toString(),
                                    color: "4b4b4b",
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ),
                    }),
                ),
              ],
            }),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Typical P&ID",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: pidImgBuffer,
                  transformation: { width: 600, height: 800 },
                   type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "MBR Membranes GA Drawing",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: gaImgBuffer,
                  transformation: { width: 600, height: 800 },
                   type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "Offer Parameter",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
  top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
},
              rows: [
                new TableRow({
                  children: ["Parameters", "Unit", "Range"].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 80,
                          bottom: 80,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: h, bold: true })],
                          }),
                        ],
                        shading: { fill: "A9A9A9" },
                      }),
                  ),
                }),
                ...[
                  ['Flow Rate of the system', 'KLD', `${flowRate}`],
                ['Effective flow Rate (Considering loss of relax & Backwash)', 'm3/hr', `${effectiveFlowRate.toFixed(2)}`],
                ['Design Frame/Train Qty', 'Nos', `${noOfTrain}`],
                ['Per Frame/Train Flow Rate ', 'm3/hr', `${perTrainFlowRate}`],
                ['Design Flux (Avg.)', 'LMH', `${flux}`],
                ['Total MBR Module Required(BLUFOX®)', 'Nos', `${TotalNumberOfModule}`],
                ['Per Frame MBR Module Required', 'No.', `${NoofModulePerTrain}`],
                ['Per Frame MBR Module Surface Area', 'm2', `${MembraneSurfaceAreaPerTrain}`],
                ['Total MBR Membrane Surface Area', 'm2', `${TotalMembraneSurfaceArea}`],
                ['Total MBR Air Required', 'm3/hr', `${RequiredtotalAirFlowRate}`],
                ['MBR Frame/Train Size (Each)', 'L x W x H mm', `${Math.ceil((length * 1000))} x ${(Math.ceil((width) * 1000))} x ${Math.ceil((height * 1000))}`],
                ['MBR Frame MOC', '-', `SS304`],
                ['MBR Tank Volume Required (Approx.)', 'm3', `${TotalMembraneTankVolume}`],
                ['Permeate Pump Flow @ 12-13m Head', 'm3/hr', `${RequiredTotalFlowrateforpeakflux}`],
                ['Back Wash Pump Flow @ 10m Head ', 'm3/hr', `${RequiredBackwashFlowRate}`],
                ['RAS Pump Flow @ 15m Head ', 'm3/hr', `${RasPumpFlow}`],
                ].map(
                  (row, index) =>
                    new TableRow({
                      children: row.map(
                        (c) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            shading: {
                              fill: index % 2 === 0 ? "F0F0F0" : "FFFFFF",
                            },
                            margins: {
                              top: 80,
                              bottom: 80,
                              left: 200,
                              right: 200,
                            },
                            children: [new Paragraph({ text: c.toString() })],
                          }),
                      ),
                    }),
                ),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [new TextRun({ text: "Note:", bold: true })],
            }),
            new Paragraph({
              text: "1. Vertical Distance between the water level in the MBR tank and back wash tank shall not be more than 0.7mtr",
            }),
            new Paragraph({
              text: "2. Maintain the water level 300-500mm above the MBR frame / Module.",
            }),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "MBR Feed Limiting Conditions",
                  bold: true,
                  size: 28,
                  color: "000000",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Customer must ensure the feeding limits for MBR tank shall be as per the below table. In case the MBR feed limits are not meeting as per the below section, it may lead to Membrane damage / failure for which Supplier shall not be responsible.",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({ text: "" }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
  top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
},
              rows: [
                new TableRow({
                  children: [
                    "#",
                    "Parameter",
                    "Design Value",
                    "Accepted Operating Range",
                    "Units",
                  ].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 80,
                          bottom: 80,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: h,
                                bold: true,
                                color: "FFFFFF",
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        shading: { fill: "2980B9" },
                      }),
                  ),
                }),
                ...[
                  [
                    1,
                    "Membrane tank MLSS concentration",
                    "10000",
                    "8,000-12,000",
                    "mg/L",
                  ],
                  [2, "Bioreactor MLSS", "8000", "6,000-10,000", "mg/L"],
                  [3, "Bioreactor MLVSS concentration", "75", ">70%", "MLSS"],
                  [4, "Dissolved oxygen concentration", "2", "1.5-3.0", "mg/L"],
                  [5, "pH of mixed liquor", "7", "6.5-8.0", "-"],
                  [6, "Total SRT in Bioreactor", "NA", "15-20", "days"],
                  [7, "Soluble cBOD5", "<5", "≤10", "mg/L"],
                  [8, "NH3-N", "0.5", "≤1", "mg/L"],
                  [9, "Soluble COD", "<50", "<50", "mg/L"],
                  [10, "Total Hardness (as CaCO3)", "-", "Not Scaling", "-"],
                  [
                    11,
                    "Soluble Alkalinity (as CaCO3)",
                    "100",
                    "50-150",
                    "mg/L",
                  ],
                  [
                    12,
                    "Colloidal TOC (cTOC) concentration",
                    "7",
                    "≤10",
                    "mg/L",
                  ],
                  [13, "Total time to filter (TTF)", "100", "200", "s"],
                  [14, "Mixed liquor recirculation", "4", "4 ± 10%", "4Q"],
                  [15, "Trash/Solids >2mm", "0", "≤2", "mg/L"],
                  [16, "Fats, Oil & Grease (FOG)", "<10", "<10", "mg/L"],
                  [17, "Mixed Liquor Temperature", "25", "25-35", "°C"],
                ].map(
                  (row, index) =>
                    new TableRow({
                      children: row.map(
                        (c) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            shading: {
                              fill: index % 2 === 0 ? "F0F0F0" : "FFFFFF",
                            },
                            margins: {
                              top: 80,
                              bottom: 80,
                              left: 200,
                              right: 200,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: c.toString(),
                                    color: "4b4b4b",
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ),
                    }),
                ),
              ],
            }),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Notes:",
                  bold: true,
                  size: 26,
                  color: "000000",
                }),
              ],
            }),
            ...[
              " Colloidal TOC (cTOC) is the difference between the TOC measured in the filtrate passing through a 1.5 µm filter paper and the TOC measured in the Blufox permeate. TOC measurement shall follow standard water testing methods.",
              " Per Seller's Time To Filter (TTF) procedure (available upon request).",
              " Assuming a MLSS recirculation ratio of 3Q (Pump configuration). Customer to confirm.",
              " Chemicals incompatible with BLUFOX PVDF membranes must not enter MBR tank (compatibility list available).",
              " Biological & membrane process designed for 25-35°C. Avoid >38°C.",
              " TDS of treated water <3000 ppm. Chlorides <1500 ppm. Sulphates <700 ppm.",
              " Oil & Grease must not exceed 10 mg/L (emulsified) with no free oil.",
              " Adequate alkalinity must be maintained for biological performance; chemical dosing may be required.",
            ].map((note, i) => new Paragraph({
              children: [
                new TextRun({
                  text: `${i+1}.  ${note}` 
                })  
              ],
              spacing: { 
        after: 50,
    },
            }
          )),

            new Paragraph({text: ""}),
            new Paragraph({
              children: [
                new TextRun({
                  text: "MBR Working Cycle Programming:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: cycleImgBuffer,
                  transformation: { width: 600, height: 150 },
                   type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Step Chart Pump and Valve Condition:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
  top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
},
              rows: [
                new TableRow({
                  children: [
                    "Step",
                    "Permeate Pump",
                    "Backwash Pump",
                    "Produced Water Valve",
                    "Backwash Valve",
                    "Air Inlet Valve",
                    "Citric Dosing Pump",
                    "NaClO Dosing Pump",
                  ].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 40,
                          bottom: 40,
                          left: 100,
                          right: 100,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: h,
                                bold: true,
                                color: "00BFFF",
                              }),
                            ],
                          }),
                        ],
                      }),
                  ),
                }),
                ...[
                  ["Permeate", "Open", " ", "Open", " ", "Open", " ", " "],
                  ["Backwash", " ", "Open", " ", "Open", "Open", " ", " "],
                  ["CEB NaClO", " ", "Open", " ", "Open", "Open", " ", "Open"],
                  [
                    "CEB Citric Acid",
                    " ",
                    "Open",
                    " ",
                    "Open",
                    "Open",
                    "Open",
                    " ",
                  ],
                ].map(
                  (row) =>
                    new TableRow({
                      children: row.map(
                        (c) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            margins: {
                              top: 40,
                              bottom: 40,
                              left: 100,
                              right: 100,
                            },
                            children: [
                              new Paragraph({
                                text: c,
                                alignment: AlignmentType.CENTER,
                              }),
                            ],
                          }),
                      ),
                    }),
                ),
              ],
            }),
            new Paragraph({ children: [new PageBreak()] }),

            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Commercial Offer:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
  top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
},
              rows: [
                new TableRow({
                  children: ["No.", "Item", "Qty.", "Total Price (Rs.)"].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: {
                          top: 80,
                          bottom: 80,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: h, bold: true })],
                          }),
                        ],
                        shading: { fill: "A9A9A9" },
                      }),
                  ),
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      margins: {
                        top: 80,
                        bottom: 80,
                        left: 200,
                        right: 200,
                      },
                      children: [new Paragraph({ text: "1." })],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      margins: {
                        top: 80,
                        bottom: 80,
                        left: 200,
                        right: 200,
                      },
                      children: [
                        new Paragraph({ text: "Blufox - MBR Membranes" }),
                        new Paragraph({
                          text: `Plant Capacity: ${flowRate} KLD ${treatment_Type}`,
                        }),
                        new Paragraph({ text: "with SS304 Skid(Frame)" }),
                      ],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      margins: {
                        top: 80,
                        bottom: 80,
                        left: 200,
                        right: 200,
                      },
                      children: [
                        new Paragraph({
                          text: `${TotalNumberOfModule}`,
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      margins: {
                        top: 80,
                        bottom: 80,
                        left: 200,
                        right: 200,
                      },
                      children: [
                        new Paragraph({
                          text: `${(offer_Price * TotalNumberOfModule).toLocaleString("en-IN")}/-`,
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "" })] }),
                    new TableCell({ children: [new Paragraph({ text: "" })] }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Total Price (Rs.)",
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      margins: {
                        top: 80,
                        bottom: 80,
                        left: 200,
                        right: 200,
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${(offer_Price * TotalNumberOfModule).toLocaleString("en-IN")}/-`,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Scope of Supply:",
                  bold: true,
                  size: 26,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              text: "• Supply of Membranes Module / only membranes.", indent :{left: 200}
            }),
            new Paragraph({ text: "• Supply P&ID", indent :{left: 200} }),
            new Paragraph({ text: "• Operation Manual", indent :{left: 200} }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Exclusion:",
                  bold: true,
                  size: 26,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              text: "• Pre-treatment, Biological, Post Treatment", indent :{left: 200}
            }),
            new Paragraph({ text: "• Control Panel & Instruments.", indent :{left: 200} }),
            new Paragraph({ text: "• Pumps, Blowers, Lifting system etc.", indent :{left: 200} }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Payment Terms and Conditions:",
                  bold: true,
                  size: 26,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            ...[
              "1) Above Prices ex. work only.",
              "2) GST 18 % will be extra.",
              "3) Freight & Packing will be charges extra as actual.",
              "4) Payment 50% Advance and 50% before delivery.",
              "5) Offer Validity 30 days from offer date.",
              "6) Installation under client scope only.",
              "7) Delivery 15-60 days of Purchase Order along with advance payment.",
              "8) Membrane Warranty will be one year against manufacturing defect only.",
              "9) Client has to submit the feed water data, Process flow diagram, P&ID, Programming cycle design before commissioning of the plant, if client wants to understand the CEB / CIP process, supplier can provide video training support to client.",
              "10) Any other terms and conditions will be as per Blufox standard terms and conditions.",
            ].map((t) => new Paragraph({ text: t, indent :{left: 200} })),
            new Paragraph({ text: "" }),
            ...(special_Terms
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Special Terms:",
                        bold: true,
                        size: 26,
                        color: "00008B",
                        italics: true,
                      }),
                    ],
                  }),
                ]
              : []),
            ...(special_Terms || "")
              .split("\n")
              .map((line: string) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Authorized Signatory",
                  bold: true,
                  size: 26,
                  color: "00008B",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: authorized_Person,
                  bold: true,
                  size: 26,
                  color: "00008B",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Blufox Ecoventures LLP.",
                  bold: true,
                  size: 26,
                  color: "00008B",
                }),
              ],
            }),            
          ],
        },
      ],
    });

    setProgress(95, "Saving File...");
    const blob = await Packer.toBlob(docObj);
    saveAs(blob, `Proposal_${quotation_Number}.docx`);
    setProgress(100, "Download Started!");
  } catch (e: any) {
    console.error(e);
    alert("Error generating Word Doc: " + e.message);
  }
}
