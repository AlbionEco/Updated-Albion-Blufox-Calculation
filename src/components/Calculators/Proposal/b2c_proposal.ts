import * as docx from "docx";
import { saveAs } from "file-saver";
import { loadImage, base64ToUint8Array, formatToDDMMYYYY } from "./utils";
import { TextWrappingType } from "docx";


async function drawBackground(doc: any, watermark: any) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const imgWidth = 130;
  const imgHeight = 130;

  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  doc.addImage(watermark, "JPG", x, y, imgWidth, imgHeight);
}

export async function generateB2CWordProposal(
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

    let membraneSurfaceAreaPerMBR = 0;
    if (module === "BF100N" || module === "BF100oxy" || module === "BF100") {
      membraneSurfaceAreaPerMBR = 10;
    } else if (module === "BF150N") {
      membraneSurfaceAreaPerMBR = 15;
    } else if (
      module === "BF200N" ||
      module === "BF200oxy" ||
      module === "BF200"
    ) {
      membraneSurfaceAreaPerMBR = 20;
    } else if (module === "BF125") {
      membraneSurfaceAreaPerMBR = 12.5;
    } else if (module === "BF300") {
      membraneSurfaceAreaPerMBR = 30;
    } else if (module === "BF220oxy") {
      membraneSurfaceAreaPerMBR = 22;
    }
    const RasPumpFlow = parseFloat(((flowRate / 24) * 3).toString()).toFixed(2);

    const TotalNumberOfModule = Math.ceil(
      (flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR),
    );
    const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
    const MembraneSurfaceAreaPerTrain =
      NoofModulePerTrain * membraneSurfaceAreaPerMBR;
    const TotalMembraneSurfaceArea = parseFloat(
      (TotalNumberOfModule * membraneSurfaceAreaPerMBR).toString(),
    ).toFixed(1);
    // Calculations for tank dimensions
    let length = 0;
    let width = 0;
    let height = 0;
    let effectiveWaterDepth = 0;
    let width2 = 0;
    let surfaceareapertrain = 0;
    let boxpipe = TotalNumberOfModule >= 15 ? 100 : 80;

    if (
      module === "BF100" ||
      module === "BF100N" ||
      module === "BF125" ||
      module === "BF100oxy"
    ) {
      length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
      width = 700 / 1000;
      height = 1300 / 1000;
      effectiveWaterDepth = 1.6;
      width2 = 2.3;
    } else if (
      module === "BF150N" ||
      module === "BF200" ||
      module === "BF200oxy"
    ) {
      length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
      width = 700 / 1000;
      height = 1800 / 1000;
      effectiveWaterDepth = 2.1;
      width2 = 3;
    } else if (module === "BF200N" || module === "BF300") {
      length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
      width = 700 / 1000;
      height = 2300 / 1000;
      effectiveWaterDepth = 2.7;
      width2 = 4;
    } else if (module === "BF220oxy") {
      length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
      width = 700 / 1000;
      height = 2355 / 1000;
      effectiveWaterDepth = 2.77;
      width2 = 4;
    }
    surfaceareapertrain = (length + 0.6) * (width + 0.6) * (height + 0.7);

    const TotalMembraneTankVolume = parseFloat(
      surfaceareapertrain.toString(),
    ).toFixed(2);
    const RequiredTotalFlowrateforpeakflux = parseFloat(
      (flowRate / workingHr).toString(),
    ).toFixed(2);
    const RequiredBackwashFlowRate = parseFloat(
      (parseFloat(RequiredTotalFlowrateforpeakflux) * 1.5).toString(),
    ).toFixed(2);

    let RequiredtotalAirFlowRate = 0;
    if (module.substring(0, 2) === "BF") {
      RequiredtotalAirFlowRate = parseFloat(
        (parseFloat(TotalMembraneSurfaceArea) * 0.3).toString(),
      );
    }

    const effectiveFlowRate = flowRate / 20;
    const perTrainFlowRate = parseFloat(
      (effectiveFlowRate / noOfTrain).toString(),
    ).toFixed(2);
    const formattedDate = formatToDDMMYYYY(date);

    setProgress(20, "Loading Image Assets...");
    const watermarkBuffer = base64ToUint8Array(
      await loadImage("/Blufox Logo.jpg"),
    );
    const headerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/header.jpg"),
    );
    const footerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/footer.jpg"),
    );
    const membraneImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MembraneImage1.jpg"),
    );

    const pidImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MembraneP&ID.jpg"),
    );
    const gaImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MembraneGADrawing.jpg"),
    );
    const cycleImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MBR working cycle programming.jpg"),
    );
    const blufoxExtraImg1Buffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/Blufox Extra Image 1.jpg"),
    );
    const blufoxExtraImg2Buffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/Blufox Extra Image 2.jpg"),
    );
    const blufoxExtraImg3Buffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/Blufox Extra Image 3.jpg"),
    );

    let ModuleSize = "";
    if (
      module == "BF100" ||
      module == "BF100N" ||
      module == "BF125" ||
      module == "BF100oxy"
    ) {
      ModuleSize = "1000 x 534 x 46";
    } else if (
      module == "BF150N" ||
      module == "BF200" ||
      module == "BF200oxy"
    ) {
      ModuleSize = "1500 x 534 x 46";
    } else if (module == "BF200N" || module == "BF300") {
      ModuleSize = "2000 x 534 x 46";
    } else if (module == "BF220oxy") {
      ModuleSize = "2055 x 534 x 46";
    }

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
              size: 22, // 11pt = 22 half-points
              color: "000000",
            },
            paragraph: {
              spacing: {
                line: 300, // 15pt = 300 twips
                lineRule: "auto", // "auto" tells Word to treat 276 as a relative ratio
                after: 0,
                before: 0,
              }, // REMOVE DEFAULT SPACING
              //alignment set to justified
              alignment: AlignmentType.JUSTIFIED,
              //line spacing 15pt
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

                new Paragraph({
                  children: [
                    new ImageRun({
                      data: watermarkBuffer,
                      transformation: {
                        width: 500,
                        height: 500,
                      },
                      floating: {
                        horizontalPosition: {
                          relative: "page",
                          align: "center",
                        },
                        verticalPosition: {
                          relative: "page",
                          align: "center",
                        },
                        behindDocument: true,
                        wrap: {
                          type: TextWrappingType.NONE,
                        },
                      },
                      type: "jpg",
                    }),
                  ],
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
                  transformation: { width: 500, height: 350 },
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
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
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
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
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
                  [
                    "Material of Fiber",
                    "Reinforced PVDF with PET Layer Support",
                  ],
                  ["Element Header", "ABS resin (Heavy Duty)"],
                  ["Pore size", "0.03-0.06 Micron (outside - in) "],
                  ["Fiber Size (OD/ID)", "2.0mm / 0.9mm"],
                  [
                    "Surface Area (MBR)",
                    `${membraneSurfaceAreaPerMBR} m2/module`,
                  ],
                  ["Operation Pressure", "2.95 to17.71 inHg (minus)"],
                  ["Backwash Pressure ", "Max 0.2 MPa"],
                  ["Backwash Time ", "30~120 sec."],
                  ["Turbidity outlet", "<1 NTU"],
                  ["Element Dimension", `${ModuleSize} mm (Drawing as below)`],
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
                                    bold:
                                      row[0] === "Surface Area (MBR)" &&
                                      row.indexOf(c) === 1,
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
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
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
                  ["Flow Rate of the system", "KLD", `${flowRate}`],
                  [
                    "Effective flow Rate",
                    "m3/hr",
                    `${effectiveFlowRate.toFixed(2)}`,
                  ],
                  ["Design Frame/Train Qty", "Nos", `${noOfTrain}`],
                  [
                    "Per Frame/Train Flow Rate ",
                    "m3/hr",
                    `${perTrainFlowRate}`,
                  ],
                  ["Design Flux (Avg.)", "LMH", `${flux}`],
                  [
                    "Total MBR Module Required",
                    "No.",
                    `${TotalNumberOfModule}`,
                  ],
                  [
                    "Per Frame MBR Module Required",
                    "No.",
                    `${NoofModulePerTrain}`,
                  ],
                  [
                    "Per Frame MBR Module Surface Area",
                    "m2",
                    `${MembraneSurfaceAreaPerTrain}`,
                  ],
                  [
                    "Total MBR Membrane Surface Area",
                    "m2",
                    `${TotalMembraneSurfaceArea}`,
                  ],
                  [
                    "Total MBR Air Required",
                    "m3/hr",
                    `${RequiredtotalAirFlowRate}`,
                  ],
                  [
                    "MBR Frame/Train Size (Each)",
                    "L x W x H mm",
                    `${Math.ceil(length * 1000)} x ${Math.ceil(width * 1000)} x ${Math.ceil(height * 1000)}`,
                  ],
                  ["MBR Frame MOC", "-", `SS304`],
                  [
                    "MBR Tank Volume Required",
                    "m3",
                    `${TotalMembraneTankVolume}`,
                  ],
                  [
                    "Permeate Pump Flow",
                    "m3/hr",
                    `${RequiredTotalFlowrateforpeakflux}`,
                  ],
                  [
                    "Back Wash Pump Flow",
                    "m3/hr",
                    `${RequiredBackwashFlowRate}`,
                  ],
                  ["RAS Pump Flow ", "m3", `${RasPumpFlow}`],
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
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
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
                                alignment: AlignmentType.LEFT,
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
            ].map(
              (note, i) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${i + 1}.  ${note}`,
                    }),
                  ],
                  spacing: {
                    after: 50,
                  },
                }),
            ),

            new Paragraph({ text: "" }),
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
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
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
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 4,
                  color: "D3D3D3",
                },
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
                      children: [
                        new Paragraph({
                          text: "1.",
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
              text: "• Supply of Membranes Module / only membranes.",
              indent: { left: 200 },
            }),
            new Paragraph({ text: "• Supply P&ID", indent: { left: 200 } }),
            new Paragraph({
              text: "• Operation Manual",
              indent: { left: 200 },
            }),
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
              text: "• Pre-treatment, Biological, Post Treatment",
              indent: { left: 200 },
            }),
            new Paragraph({
              text: "• Control Panel & Instruments.",
              indent: { left: 200 },
            }),
            new Paragraph({
              text: "• Pumps, Blowers, Lifting system etc.",
              indent: { left: 200 },
            }),
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
            ].map((t) => new Paragraph({ text: t, indent: { left: 200 } })),
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
            new Paragraph({
              children: [
                new ImageRun({
                  data: blufoxExtraImg1Buffer,
                  transformation: { width: 200, height: 200 },
                  type: "jpg",
                }),
                new ImageRun({
                  data: blufoxExtraImg2Buffer,
                  transformation: { width: 200, height: 200 },
                  type: "jpg",
                }),
                new ImageRun({
                  data: blufoxExtraImg3Buffer,
                  transformation: { width: 200, height: 200 },
                  type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
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
