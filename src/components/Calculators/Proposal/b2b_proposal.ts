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

export async function generateB2BWordProposal(
  inputs: any,
  setProgress: (percent: number, message: string) => void,
) {
  try {
    setProgress(5, "Processing Inputs...");
    const {
      quotation_Number,
      date,
      client_Name,
      offer_Price: rawOfferPrice,
      flowRate: rawFlowRate,
      treatment_Type,
      packagedOrCivil,
      Technology_Type,
      authorized_Person,
      b2borb2c,
    } = inputs;

    // Load JSON
    const response = await fetch("/B2B Json Data Albion.json");
    const B2BDataRaw = await response.json();
    const plantCapacityObj = B2BDataRaw.B2B[0]["Plant Capacity"];

    const flowRate = parseFloat(rawFlowRate) || 0;
    const offer_Price = parseFloat(rawOfferPrice) || 0;

    // Find the correct capacity key
    const keys = Object.keys(plantCapacityObj)
      .map(Number)
      .sort((a, b) => a - b);
    let selectedCapacityKey = keys[0].toString();
    for (const key of keys) {
      if (flowRate <= key) {
        selectedCapacityKey = key.toString();
        break;
      }
    }
    if (flowRate > keys[keys.length - 1]) {
      selectedCapacityKey = keys[keys.length - 1].toString();
    }

    const capacityData = plantCapacityObj[selectedCapacityKey];
    const FeedPlumpFlow = flowRate / 20;
    const FeedPumpModel = flowRate < 20 ? "LEO/Kirloskar" : "Kirloskar";
    const NumberofMembraneSqMtr = Number((flowRate * 1000) / 4000).toFixed(0);
    const PermeatPumpModel = flowRate < 20 ? "LEO/Kirloskar" : "Kirloskar";
    const PermeatPumpFlow = flowRate / 20;
    const BackWashPumpFlow = PermeatPumpFlow * 1.5;
    const BackwashTankSize = Number(capacityData["Backwash Tank Size"]);
    const AirCalculationforAerationFineBubbleDiffuser = Number(
      Number(capacityData["Air Calculation for Aeration @Air (CMH)"]) / 7.5,
    ).toFixed(0);
    const AirCalculationforAerationPrice =
      Number(AirCalculationforAerationFineBubbleDiffuser) * 1350;
    const NumberofTotalMembranesqmtr = Number((flowRate * 1000) / 4000).toFixed(
      0,
    );
    const MBRSSframePrice = Number(
      Number(NumberofTotalMembranesqmtr) * 10000 +
        Number(NumberofTotalMembranesqmtr) * 5000,
    ).toFixed(0);
    const Bacteriaqty = Number((flowRate * 6) / 20);
    const BacteriaPrice = Number(Bacteriaqty * 250);
    const BackwashTankPrice = Number(BackwashTankSize) * 8.5;
    const MBRPackageTankMSEPPrice =
      Number(capacityData["MBR Pkg Tank MSEP 5mm- Kg"]) * 120;
    const WiringPrice = Number(capacityData["Plumbing MSEP"]) * 0.8;

    const offerPrice =
      Number(capacityData["Fine Screen (SS 304) Price"]) +
      Number(capacityData["Feed Pump Price (1W+1S)"]) +
      Number(AirCalculationforAerationPrice) +
      Number(MBRSSframePrice) +
      Number(capacityData["Twinlobe Air Blower Price (1W+1S)"]) +
      Number(BacteriaPrice) +
      Number(capacityData["PERMEATE PUMP Price (1W+1S)"]) +
      Number(capacityData["BACKWASH PUMP Price (1W)"]) +
      Number(capacityData["RAS Sludge Pump Landing Price (1W) (BOQ)"]) +
      Number(capacityData["Disinfection Dosing Pump (E-Dose) Price (1W)"]) +
      Number(capacityData["Dosing Tank Price"]) +
      Number(capacityData["Backwash Dosing Pump (E-Dose) Price (1W)"]) +
      Number(BackwashTankPrice) +
      Number(MBRPackageTankMSEPPrice) +
      Number(capacityData["PLC Control Panel (Simatic) Price(Rs.) 1 Unit"]) +
      Number(WiringPrice) +
      Number(capacityData["Plumbing MSEP"]) +
      Number(capacityData["Plumbing UPVC"]) +
      Number(capacityData["Pressure Guage Price"]) +
      Number(capacityData["Vacuume Guage Price"]) +
      Number(capacityData["Level  Sensor Price"]) +
      Number(capacityData["Solenoid Valve Price"]) +
      Number(capacityData["Rotameter (UKL) Price (Permeate)"]) +
      Number(capacityData["Rotameter (UKL) Price (Backwash)"]) +
      Number(capacityData["Rotameter (UKL) Price (RAS)"]) +
      Number(capacityData["Miscellaneous  Price"]);
    const LandingPrice = offer_Price > 0 ? offer_Price : offerPrice;
    const ProductionPrice = Number((LandingPrice * 5) / 100).toFixed(0);
    const NetLandingPrice = Number(LandingPrice) + Number(ProductionPrice);
    const FinalOfferPrice = (
      Math.ceil(Number(NetLandingPrice * 1.35) / 1000) * 1000
    ).toFixed(0);
    //     console.log("Fine Screen (SS 304) Price: " + capacityData["Fine Screen (SS 304) Price"]);
    // console.log("Feed Pump Price (1W+1S): " + capacityData["Feed Pump Price (1W+1S)"]);
    // console.log("Air Calculation for Aeration Price: " + AirCalculationforAerationPrice);
    // console.log("MBRSS frame Price: " + MBRSSframePrice);
    // console.log("Twinlobe Air Blower Price (1W+1S): " + capacityData["Twinlobe Air Blower Price (1W+1S)"]);
    // console.log("Bacteria Price: " + BacteriaPrice);
    // console.log("PERMEATE PUMP Price (1W+1S): " + capacityData["PERMEATE PUMP Price (1W+1S)"]);
    // console.log("BACKWASH PUMP Price (1W): " + capacityData["BACKWASH PUMP Price (1W)"]);
    // console.log("RAS Sludge Pump Landing Price (1W) (BOQ): " + capacityData["RAS Sludge Pump Landing Price (1W) (BOQ)"]);
    // console.log("Disinfection Dosing Pump (E-Dose) Price (1W): " + capacityData["Disinfection Dosing Pump (E-Dose) Price (1W)"]);
    // console.log("Dosing Tank Price: " + capacityData["Dosing Tank Price"]);
    // console.log("Backwash Dosing Pump (E-Dose) Price (1W): " + capacityData["Backwash Dosing Pump (E-Dose) Price (1W)"]);
    //console.log("Backwash Tank Price: " + BackwashTankPrice);
    // console.log("MBR Package Tank MSEP Price: " + MBRPackageTankMSEPPrice);
    // console.log("PLC Control Panel (Simatic) Price(Rs.) 1 Unit: " + capacityData["PLC Control Panel (Simatic) Price(Rs.) 1 Unit"]);
    // console.log("Wiring Price: " + WiringPrice);
    // console.log("Plumbing MSEP: " + capacityData["Plumbing MSEP"]);
    // console.log("Plumbing UPVC: " + capacityData["Plumbing UPVC"]);
    // console.log("Pressure Gauge Price: " + capacityData["Pressure Guage Price"]);
    // console.log("Vacuum Gauge Price: " + capacityData["Vacuume Guage Price"]);
    // console.log("Level Sensor Price: " + capacityData["Level  Sensor Price"]);
    // console.log("Solenoid Valve Price: " + capacityData["Solenoid Valve Price"]);
    // console.log("Rotameter (UKL) Price (Permeate): " + capacityData["Rotameter (UKL) Price (Permeate)"]);
    // console.log("Rotameter (UKL) Price (Backwash): " + capacityData["Rotameter (UKL) Price (Backwash)"]);
    // console.log("Rotameter (UKL) Price (RAS): " + capacityData["Rotameter (UKL) Price (RAS)"]);
    // console.log("Miscellaneous Price: " + capacityData["Miscellaneous  Price"]);

    // console.log("offer_Price", offer_Price);
    // console.log("offerPrice", offerPrice);
    // console.log("NetLandingPrice", NetLandingPrice);

    // console.log("FinalOfferPrice", FinalOfferPrice);

    let technologyDescription = "";
    if (Technology_Type === "MBR") {
      technologyDescription = `X-Flocs® MBR Based ${treatment_Type} - ${packagedOrCivil === "packaged" ? "Packaged/Module System" : "Civil Based System"} (${flowRate} m3/day)`;
    } else if (Technology_Type === "AMBBR") {
      technologyDescription = `M-Flocs® AMBBR Based ${treatment_Type} - ${packagedOrCivil === "packaged" ? "Packaged/Module System" : "Civil Based System"} (${flowRate} m3/day)`;
    } else {
      technologyDescription = " ";
    }

    setProgress(20, "Loading Image Assets...");
    const watermarkBuffer = base64ToUint8Array(
      await loadImage("/Images for Albion Proposal/Albion Logo Watermark.jpg"),
    );
    const headerBuffer = base64ToUint8Array(
      await loadImage("/Images for Albion Proposal/Albion Header.jpg"),
    );
    const footerBuffer = base64ToUint8Array(
      await loadImage("/Images for Albion Proposal/Albion Footer.jpg"),
    );

    const MBRProcessFlowImgBuffer = base64ToUint8Array(
      await loadImage(
        "/Images for Albion Proposal/MBR Process Flow Diagram.png",
      ),
    );

    const AMBBRProcessFlowImgBuffer = base64ToUint8Array(
      await loadImage(
        "/Images for Albion Proposal/AMBBR Process Flow Diagram.png",
      ),
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
                      transformation: { width: 795, height: 105 },
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
            new Paragraph({
              children: [
                new TextRun({ text: "" }),
                new TextRun({ text: "Ref: ", bold: true, size: 22 }),
                new TextRun({ text: quotation_Number || "" }),
                new TextRun({
                  text: "\t\t\t\t\t\t\t\tDate: ",
                  size: 22,
                  bold: true,
                }),
                new TextRun({ text: formattedDate }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: "To:", bold: true, size: 22 })],
            }),
            ...client_Name
              .split("\n")
              .map((line: string) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Dear Sir," }),
            new Paragraph({
              children: [
                new TextRun({ text: "Sub: ", bold: true, size: 22 }),
                new TextRun({
                  text: `Proposal for Latest `,
                  size: 22,
                }),
                new TextRun({
                  text: `${technologyDescription}`,
                  bold: true,
                  size: 22,
                  color: "#006bbd",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `In reference to your requirement for ${treatment_Type} and recycling system and your discussion with undersigned; we are pleased to submit our budgetary techno-commercial proposal for a `,
                  size: 22,
                }),
                new TextRun({
                  text: `${technologyDescription}`,
                  bold: true,
                  size: 22,
                  color: "#006bbd",
                }),
                new TextRun({
                  text: " Treatment Plant",
                  size: 22,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "(Technical description of the system is in attached information sheet).",
                  size: 22,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Design Parameters",
                  size: 32,
                  bold: true,
                  underline: {},
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              text: `The plant is designed to treat effluent generate having following characteristics`,
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
                  children: [" ", " "].map(
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
                  ["Nature of Wastewater", `${treatment_Type}`],
                  ["Flow Rate", `${flowRate} m3/day`],
                  ["Operating Period", "24 hours/day"],
                  {
                    text: `Raw effluent Parameter (At inlet of ${
                      Technology_Type === "MBR" ? "X-Flocs®" : "M-Flocs®"
                    } System)`,
                    colspan: 2,
                    shading: "F0F0F0",
                  },
                  ["pH", "6.0 - 7.0"],
                  ["COD", "≤ 400 - 450 ppm"],
                  ["BOD (3 days@27 ˚C)", "≤ 250 - 300 ppm"],
                  ["TSS", "≤ 100 - 150 ppm"],
                  {
                    text: `Treated Effluent Parameter (After ${
                      Technology_Type === "MBR" ? "X-Flocs®" : "M-Flocs®"
                    } System)`,
                    colspan: 2,
                    shading: "F0F0F0",
                  },
                  ["pH", "6.5 - 7.5"],
                  ["COD", "≤ 50 ppm"],
                  ["BOD (3 days@27 ˚C)", "≤ 10 ppm"],
                  ["TSS", "≤ 5 ppm"],
                ].map((row, index) => {
                  if (Array.isArray(row)) {
                    return new TableRow({
                      children: row.map(
                        (c) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            shading: {
                              fill: index === 1 ? "F0F0F0" : "FFFFFF",
                            },
                            margins: {
                              top: 20,
                              bottom: 20,
                              left: 200,
                              right: 200,
                            },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: c.trim(),
                                    color: "4b4b4b",
                                    size: 20,
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ),
                    });
                  }
                  // 🔹 Special row (colspan + shading)
                  const specialRow = row as {
                    colspan: number;
                    text: string;
                    shading?: string;
                  };
                  return new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: specialRow.colspan,
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          fill: specialRow.shading || "F0F0F0",
                        },
                        margins: {
                          top: 20,
                          bottom: 20,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: specialRow.text.trim(),
                                color: "4b4b4b",
                                bold: true,
                                size: 20,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  });
                }),
              ],
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Note:",
                  bold: true,
                  size: 22,
                }),
                new TextRun({
                  text: ` Above treated water parameters are for disposal of treated water for landscaping If the COD & BOD Parameter will go high we can't take ${flowRate}m3/day flow as per designed structure because we need extra space for aeration which is not possible in current Packaged Plant as per calculations. So it will be a win in situation when parameter we consider high we can make flow accordingly to fulfill the parameter for drain.`,
                  size: 22,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            // page break
            new Paragraph({ children: [new PageBreak()] }),

            // ------------------------------- new Page

            new Paragraph({
              children: [
                new TextRun({
                  text: "Assumptions:",
                  bold: true,
                  size: 24,
                  underline: {},
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "The plant is designed to operate at +/-5% variation in raw wastewater parameter.",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "No other parameters other than mentioned above are present in the raw wastewater which is beyond Pollution Control Norm sand hazardous to micro-organisms.",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Treated water quality will be achieved if the inlet raw water quality is as per the raw water quality mentioned as well as no other pollutant than the mentioned, is present or exceeds the limits or which is hazardous in nature, which otherwise may affect the Bio-logical treatment process.",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Image section
            new Paragraph({
              children: [
                new ImageRun({
                  data:
                    Technology_Type === "MBR"
                      ? MBRProcessFlowImgBuffer
                      : AMBBRProcessFlowImgBuffer,
                  transformation: { width: 600, height: 300 },
                  type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            //page break
            new Paragraph({ children: [new PageBreak()] }),

            // --------------------------- new Page
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
                    new TableCell({
                      margins: {
                        top: 80,
                        bottom: 80,
                        left: 80,
                        right: 80,
                      },
                      children: [
                        new docx.Paragraph({
                          children: [
                            new TextRun({
                              text: `Techno-Commercial Offer ${Technology_Type === "MBR" ? "X-Flocs®" : "M-Flocs®"} ${Technology_Type} ${treatment_Type} - ${packagedOrCivil === "packaged" ? "Packaged/Module System" : "Civil Based System"}`,
                              size: 24,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 6,
                      shading: {
                        fill: "#bcdfff",
                      },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    "S.N.",
                    "Particulars",
                    "Specification",
                    "MOC",
                    "Qty.",
                    "Make",
                  ].map(
                    (h, index) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { top: 60, bottom: 60, left: 100, right: 100 },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: h,
                                bold: true,
                                size: 20,
                              }),
                            ],
                          }),
                        ],
                        shading: {
                          fill: "#dbffcf",
                        },
                      }),
                  ),
                }),
                ...[
                  {
                    text: `Materials & Equipment `,
                    colspan: 6,
                    shading: "#ffee00",
                  },
                  [
                    "1",
                    "Manual Bar Screen",
                    "10mm Pore Size opening",
                    "MSEP",
                    "1 No.",
                    "AEPL",
                  ],
                  [
                    "2",
                    "Manual Box Fine Screen",
                    "2mm Pore Size Opening - Box type",
                    "SS304",
                    "1 No.",
                    "AEPL",
                  ],
                  [
                    "3",
                    "Sewage Feed Pump",
                    `Flow: ${FeedPlumpFlow}m3/hr`,
                    "CI/SS",
                    "1W+1S",
                    `${FeedPumpModel}`,
                  ],
                  [
                    "4",
                    "Fine Bubble Air Diffuser",
                    "Type : Tubular, Size: 63*1000 Dia",
                    "EPDM",
                    "1 Lot",
                    "Airfin/Vasu",
                  ],
                  [
                    "5",
                    "Air Blower (AT + MBR)",
                    "Type: Twinlobe.",
                    "CI/MS",
                    "1W+1S",
                    "Akash / Equiv",
                  ],
                  [
                    "6",
                    "MBR membranes",
                    [
                      "Type: Curtain Type",
                      "Submerge Hollow Fibre",
                      "Pore Size: 0.06micron",
                      "With SS304 Frame Including",
                      `Design Flux: ${b2borb2c === "B2B" ? "20LMH" : "15LMH"}`,
                    ],
                    "R-PVDF",
                    `${NumberofMembraneSqMtr}`,
                    "Blufox®",
                  ],
                  [
                    "7",
                    "Disinfectant Dosing System",
                    `Flow: ${capacityData["Disinfection Dosing Pump (E-Dose) Capacity (LPH)"]} LPH with 100 Ltr. LLDPE Tank`,
                    "ABS/PP",
                    "1 No.",
                    "Verito/E Dose",
                  ],
                  [
                    "8",
                    "Backwash Dosing System",
                    `Flow: ${capacityData["Backwash Dosing Pump (E-Dose) Capacity (LPH)"]} LPH with 100 Ltr. LLDPE Tank`,
                    "ABS/PP",
                    "1 No.",
                    "Verito/E Dose.",
                  ],
                  [
                    "9",
                    "MBR Permeate Pump",
                    `Flow: ${PermeatPumpFlow}m3/hr`,
                    "SS304",
                    "1W+1S",
                    `${PermeatPumpModel}`,
                  ],
                  [
                    "10",
                    "MBR Backwash Pump",
                    `Flow: ${BackWashPumpFlow}m3/hr`,
                    "CI/SS",
                    "1W+1S",
                    "LEO/Adelino",
                  ],
                  [
                    "11",
                    "RAS Pump/Sludge Pump",
                    "Flow: 0.38m3/hr",
                    "CI/SS",
                    "1W+1S",
                    "LEO/Adelino",
                  ],
                  [
                    "12",
                    "Backwash Tank",
                    `Size: ${BackwashTankSize} Lit`,
                    "HDPE",
                    "1 No.",
                    "Jolly / Super",
                  ],
                  [
                    "13",
                    "Control Panel (Non-Compartmental) ",
                    [
                      "Type: Non compartmental",
                      "PLC & HMI: 4” Screen Display",
                      "Switch Gears make: L&T/ Equiv.",
                      "Cables & Wire: Polycab/RR",
                    ],
                    "MSPC",
                    "1 Unit",
                    "AEPL",
                  ],

                  {
                    text: `Instrumentation & Other Accessories`,
                    colspan: 6,
                    shading: "#ffee00",
                  },

                  [
                    "14",
                    "Online Rotameter",
                    "Flow range: As per Flow",
                    "Acrylic",
                    "3 Nos.",
                    "Aster/UKL",
                  ],
                  [
                    "15",
                    "Auto Control Valve",
                    "Diaphragm type SV",
                    "SS304",
                    "2 Nos.",
                    "Aira/Uflow",
                  ],
                  ["16", "Vacuum Gauge", "", "SS304", "1 No.", "Kains/Baumer"],
                  [
                    "17",
                    "Pressure Gauge",
                    "",
                    "SS304",
                    "1 No.",
                    "Kains/Baumer",
                  ],
                  ["18", "Level Sensor", "With 5m Cable", "", "4 Nos.", "AEPL"],
                  [
                    "19",
                    "Cable & Wiring",
                    "Flexible Wiring with Cable Channel (under Battery limit)",
                    "PVC",
                    "1 Lot",
                    "Polycab/RR",
                  ],
                  [
                    "20",
                    "Plumbing Material",
                    [
                      "Only internal plumbing to be done",
                      "(Under Battery limit )",
                      "UPVC - for all lines ",
                      "MSEP / PPR for Air line ",
                    ],
                    "UPVC/MSEP",
                    "1 Lot",
                    "Prince/Equiv.",
                  ],
                  [
                    "21",
                    `${packagedOrCivil === "packaged" ? "Packaged/Module System" : "Base Frame"}`,
                    `${
                      packagedOrCivil === "packaged"
                        ? [
                            "Size: As per Standard",
                            "MS Sheet - 5mm Thickness",
                            "Epoxy Paint: Outside",
                          ]
                        : ["For Pump & Blowers Arrangement"]
                    }`,
                    "MSEP",
                    "1 Job",
                    "AEPL ",
                  ],
                ].map((row, index) => {
                  if (Array.isArray(row)) {
                    return new TableRow({
                      children: row.map(
                        (c, colIndex) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            margins: {
                              top: 40,
                              bottom: 40,
                              left: 80,
                              right: 80,
                            },
                            children: [
                              new Paragraph({
                                alignment: [0, 3, 4, 5].includes(colIndex)
                                  ? AlignmentType.CENTER
                                  : AlignmentType.LEFT,
                                children: Array.isArray(c)
                                  ? c.map(
                                      (line) =>
                                        new TextRun({
                                          text: line,
                                          break: 1,
                                          color: "4b4b4b",
                                          size: 20,
                                        }),
                                    )
                                  : [
                                      new TextRun({
                                        text: String(c).trim(),
                                        color: "4b4b4b",
                                        size: 20,
                                      }),
                                    ],
                              }),
                            ],
                          }),
                      ),
                    });
                  }
                  // 🔹 Special row (colspan + shading)
                  const specialRow = row as {
                    colspan: number;
                    text: string;
                    shading?: string;
                  };
                  return new TableRow({
                    children: [
                      new TableCell({
                        columnSpan: specialRow.colspan,
                        verticalAlign: VerticalAlign.CENTER,
                        shading: {
                          fill: specialRow.shading || "F0F0F0",
                        },
                        margins: {
                          top: 80,
                          bottom: 80,
                          left: 200,
                          right: 200,
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: specialRow.text.trim(),
                                color: "4b4b4b",
                                bold: true,
                                size: 20,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  });
                }),
              ],
            }),

            new Paragraph({
              children: [new PageBreak()],
            }),

            //  ---------------------------------------------- new page

            new Paragraph({
              children: [
                new TextRun({
                  text: "Note",
                  bold: true,
                  size: 24,
                  italics: true,
                }),
              ],
            }),
            ...[
              "Supplier will supply required size of 20 fts of piping material for feed line & 20 fts of piping material for treated line along with pre-fabricated structure. Excess material required at site for further connections will be under client scope.",
              "Supplier will supply 30 fts of required wire for feed pump to panel & level sensors of feed pump to panel. Any extra material required will be under client scope.",
            ].map(
              (f) =>
                new Paragraph({
                  children: [new TextRun({ text: f })],
                  bullet: {
                    level: 0,
                  },
                  indent: { left: 300 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
            ),

            new Paragraph({ text: " " }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Additional Items - On Request - Chargeable: Please Tick and send (✓)",
                  bold: true,
                  highlight: "yellow",
                  underline: {},
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Table({
              width: { size: 80, type: WidthType.PERCENTAGE },
              alignment: AlignmentType.CENTER,
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
                ...[
                  ["Automatic Bar Screen", "  "],
                  ["Parabolic Fine Screen", "  "],
                  ["Sludge Pumps", ""],
                  ["Sludge De-Water Bag system", ""],
                  ["Pressure Transmitters", ""],
                  ["Membrane Lifting System", ""],
                  ["DO Sensor with VFD Provision", ""],
                  ["FRP Coating inside – Packaged Plant", ""],
                  ["MS Railing on Packaged Plant", ""],
                  ["GSM / 5G Based operation Control", ""],
                  ["Close Loop Electro mechanical room", ""],
                  ["Changes of Make (if any)", ""],
                ].map(
                  (row, index) =>
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

            new Paragraph({ text: " " }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Price Schedule:",
                  bold: true,
                  italics: true,
                  highlight: "yellow",
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
                // --- Header Row ---
                new TableRow({
                  children: [
                    "No.",
                    "System - type",
                    ["Price (INR)", "@Ex-works."], // Multi-line header
                  ].map(
                    (h) =>
                      new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        shading: { fill: "F2F2F2" }, // Optional: light grey header background
                        margins: {
                          top: 100,
                          bottom: 100,
                          left: 100,
                          right: 100,
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: Array.isArray(h)
                              ? h.map(
                                  (line, i) =>
                                    new TextRun({
                                      text: line,
                                      break: i > 0 ? 1 : 0,
                                      bold: true,
                                      size: 20,
                                    }),
                                )
                              : [
                                  new TextRun({
                                    text: h,
                                    bold: true,
                                    size: 20,
                                  }),
                                ],
                          }),
                        ],
                      }),
                  ),
                }),
                // --- Data Row ---
                new TableRow({
                  children: [
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          text: "1.",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      margins: { top: 80, bottom: 80, left: 200, right: 200 },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${Technology_Type === "MBR" ? "X-Flocs®" : "M-Flocs®"} ${Technology_Type} Based ${treatment_Type} `,
                              color: "006bbd",
                              bold: true,
                              break: 1,
                            }),
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: `Plant Capacity: ${flowRate} KLD ${packagedOrCivil === "packaged" ? "Packaged/Module System" : "Civil Based System"}`,
                                  color: "006bbd",
                                  size: 18,
                                  bold: true,
                                  break: 1,
                                }),
                              ],
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: `${FinalOfferPrice}/-`,
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "" }),

            // Terms & conditions:
            new Paragraph({
              children: [
                new TextRun({
                  text: "Terms & conditions:",
                  bold: true,
                  size: 22,
                  italics: true,
                }),
              ],
            }),

            ...[
              "GST 18% Extra as actual.",
              "Freight, Packing, unloading under client scope.",
              "Installation on chargeable basis Rs.15000/day. or under client scope.",
              "If any Safety Instructions, training or Equipment’s required while installation of plants, please inform us at the time of P.O.",
              "Payment 50% Advance Alonge with Purchase Order with proper format.",
              "Final Payment 50% at the time of material delivery / before delivery.",
              "Design, drawing & placement GA will be provided against Purchase Order only.",
              "Warehouse Charges: will be 0.5% of the Project Value, if not take delivery as per schedule agreed at the time of order finalization.",
            ].map(
              (t) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: t,
                      size: 22,
                    }),
                  ],
                  bullet: {
                    level: 0,
                  },
                  indent: { left: 300 },
                }),
            ),
            new Paragraph({ text: "" }),

            // Freight & Transportation:
            new Paragraph({
              children: [
                new TextRun({
                  text: "Freight & Transportation:",
                  bold: true,
                  size: 22,
                  italics: true,
                }),
              ],
            }),
            ...[
              "Loading / Unloading charges have to be paid by Client to the transporter directly, with duly signed copy of authorized signatory on 'packing list'.",
              "Checking & verifying all the materials, as mentioned in packing list is a due responsibility of client. Any misplacement or damaged equipments afterwards will not be acceptable.",
              "Any damage during the unloading of materials or shifting of equipments to the particular place will not be entertained & the whole and soul responsibility will be of client.",
              "Any unskilled labor and/or any unloading equipment required during the unloading/ shifting of materials at site will be the responsibility of concerned party/person present at site only.",
            ].map(
              (t) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: t,
                      size: 22,
                    }),
                  ],
                  bullet: {
                    level: 0,
                  },
                  indent: { left: 300 },
                }),
            ),
            new Paragraph({ text: "" }),

            // delivery
            new Paragraph({
              children: [
                new TextRun({
                  text: "Delivery:",
                  bold: true,
                  size: 22,
                  italics: true,
                }),
                new TextRun({
                  text: " 4-6 week from the date of Purchase Order and Advance Payment.",
                }),
              ],
            }),
            new Paragraph({ text: "" }),

            // Validity
            new Paragraph({
              children: [
                new TextRun({
                  text: "Validity:",
                  bold: true,
                  size: 22,
                  italics: true,
                }),
                new TextRun({
                  text: " 30 days from the date of offer.",
                }),
              ],
            }),
            new Paragraph({ text: "" }),

            //Subject to Surat Jurisdiction only
            new Paragraph({
              children: [
                new TextRun({
                  text: "Subject to Surat Jurisdiction only",
                  bold: true,
                  size: 22,
                  italics: true,
                }),
              ],
            }),
            new Paragraph({ text: "" }),

            new Paragraph({
              children: [
                new TextRun({
                  text: "For, Authorized Signatory",
                  bold: true,
                  size: 22,
                  color: "#006bbd",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: authorized_Person,
                  bold: true,
                  size: 22,
                  color: "#006bbd",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Albion Ecotech Pvt. Ltd.",
                  bold: true,
                  size: 22,
                  color: "#006bbd",
                }),
              ],
            }),
            new Paragraph({
              children: [new PageBreak()],
            }),

            // ----------------- new Page
            new Paragraph({
              children: [
                new TextRun({
                  text: "Exclusions from supplier's scope:",
                  bold: true,
                  size: 22,
                  underline: {},
                }),
              ],
            }),

            ...[
              "Design &construction of civil tanks & preparation of RCC structural drawings, civil BOQ etc.",
              "All civil works including grading / leveling of site foundations, pipe and underground cable trenches, grouting, platforms, pipe supports, inserts, puddle pipes, structural supports for air grids &pipes.",
              "Safest or age of equipment supplied by us, at your site.",
              "Construction of approach roads with fencing & weather protection shed for Distribution board, blowers, pumps, electrical motors etc., etc.",
              "Utilities at site .e.g. Water, Chemicals, Electricity etc.",
              "Supplyofalltypesoflaboratoryequipmentoritstestreportsfromany3rdparty, during & after commissioning.",
              "Emergency power supply and plant illumination system.",
              "All piping, cabling etc. beyond the termination points as mention our offer.",
              "Firefighting system including appliances &lightening protection.",
              "Man power for operation& maintenance of the plant.",
              "Initial commissioning consumables, chemicals, lubricants etc.",
              "NOC/Approval from Pollution Control Board.",
              "Any other item not specifically mentioned in our scope.",
            ].map(
              (t) =>
                new Paragraph({
                  text: t,
                  bullet: {
                    level: 0,
                  },
                  indent: { left: 300 },
                }),
            ),
            new Paragraph({
              children: [new PageBreak()],
            }),

            // ------------------- NEW pAGE
            new Paragraph({ text: " " }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Client Scope of work ",
                  bold: true,
                  italics: true,
                  highlight: "yellow",
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
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
                  children: ["No.", "Equipment Description", "Quantity"].map(
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
                                color: "FFFFFF",
                                size: 22,
                              }),
                            ],
                          }),
                        ],
                        shading: { fill: "A9A9A9" },
                      }),
                  ),
                }),
                ...[
                  ["1", "Bar Screen Chamber - as per design", "1 No."],
                  ["2", "Oil Grease Chamber - as per design", "1 No."],
                  ["3", "Equalization Tank - as per design", "1 No."],
                  ["4", "Treated / Flush Water Tank - as per design ", "1 No."],
                  [
                    "5",
                    "Sludge storage area/bed as per agreed design ",
                    "1 No.",
                  ],
                  [
                    "6",
                    "Electrical Three phase power with neutral and earthing with MCB/MCB box and Wiring Cable near location of system ",
                    "1 No.",
                  ],
                  [
                    "7",
                    "On site piping work till raw water feed to system and  after treated water line connections",
                    "1 No.",
                  ],
                  ["8", "Fresh water line For Washing purpose", "1 No."],
                  [
                    "9",
                    "Levelled floor, Weather Proof Mechanical Room as per agreed design",
                    "1 No.",
                  ],
                  [
                    "10",
                    "Proper lighting as per sites requirement",
                    "1 (If require)",
                  ],
                ].map((row, index) => {
                  return new TableRow({
                    children: row.map(
                      (c) =>
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
                                  text: c.trim(),
                                  color: "4b4b4b",
                                }),
                              ],
                            }),
                          ],
                        }),
                    ),
                  });
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
