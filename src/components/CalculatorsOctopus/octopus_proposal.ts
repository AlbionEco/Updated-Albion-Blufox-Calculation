import * as docx from "docx";
import { saveAs } from "file-saver";
import {
  loadImage,
  base64ToUint8Array,
  formatToDDMMYYYY,
} from "./octopusutils";

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface TableRow {
  vol: number;
  flow: number;
  hrs: number;
  filterDia: number;
  pumpHP: number;
  nozzleQty: number;
  inletNozzle: number;
  bottomDrain: number;
  skimmer: number;
  mediaQty: number;
  sandMedia: number;
}

export const TABLE: TableRow[] = [
  {
    vol: 10000,
    flow: 6000,
    hrs: 2,
    filterDia: 450,
    pumpHP: 0.75,
    nozzleQty: 3,
    inletNozzle: 900,
    bottomDrain: 1500,
    skimmer: 4000,
    mediaQty: 100,
    sandMedia: 1500,
  },
  {
    vol: 20000,
    flow: 10000,
    hrs: 2,
    filterDia: 550,
    pumpHP: 1,
    nozzleQty: 3,
    inletNozzle: 900,
    bottomDrain: 1500,
    skimmer: 4000,
    mediaQty: 100,
    sandMedia: 1500,
  },
  {
    vol: 30000,
    flow: 10000,
    hrs: 3,
    filterDia: 550,
    pumpHP: 1,
    nozzleQty: 3,
    inletNozzle: 900,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 100,
    sandMedia: 1500,
  },
  {
    vol: 40000,
    flow: 15000,
    hrs: 3,
    filterDia: 650,
    pumpHP: 1.5,
    nozzleQty: 5,
    inletNozzle: 1250,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 150,
    sandMedia: 2250,
  },
  {
    vol: 50000,
    flow: 15000,
    hrs: 4,
    filterDia: 650,
    pumpHP: 1.5,
    nozzleQty: 5,
    inletNozzle: 1250,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 150,
    sandMedia: 2250,
  },
  {
    vol: 60000,
    flow: 15000,
    hrs: 4,
    filterDia: 650,
    pumpHP: 1.5,
    nozzleQty: 5,
    inletNozzle: 1250,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 150,
    sandMedia: 2250,
  },
  {
    vol: 70000,
    flow: 18000,
    hrs: 5,
    filterDia: 700,
    pumpHP: 2,
    nozzleQty: 6,
    inletNozzle: 1500,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 250,
    sandMedia: 3750,
  },
  {
    vol: 80000,
    flow: 18000,
    hrs: 5,
    filterDia: 700,
    pumpHP: 2,
    nozzleQty: 6,
    inletNozzle: 1500,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 250,
    sandMedia: 3750,
  },
  {
    vol: 90000,
    flow: 18000,
    hrs: 6,
    filterDia: 700,
    pumpHP: 2,
    nozzleQty: 6,
    inletNozzle: 1500,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 250,
    sandMedia: 3750,
  },
  {
    vol: 100000,
    flow: 20000,
    hrs: 5,
    filterDia: 800,
    pumpHP: 3,
    nozzleQty: 7,
    inletNozzle: 1750,
    bottomDrain: 1500,
    skimmer: 8000,
    mediaQty: 350,
    sandMedia: 5250,
  },
  {
    vol: 125000,
    flow: 22000,
    hrs: 6,
    filterDia: 800,
    pumpHP: 3,
    nozzleQty: 8,
    inletNozzle: 2000,
    bottomDrain: 3000,
    skimmer: 12000,
    mediaQty: 350,
    sandMedia: 5250,
  },
  {
    vol: 150000,
    flow: 25000,
    hrs: 6,
    filterDia: 900,
    pumpHP: 3,
    nozzleQty: 9,
    inletNozzle: 2250,
    bottomDrain: 3000,
    skimmer: 12000,
    mediaQty: 450,
    sandMedia: 6750,
  },
  {
    vol: 175000,
    flow: 25000,
    hrs: 7,
    filterDia: 900,
    pumpHP: 3,
    nozzleQty: 10,
    inletNozzle: 2500,
    bottomDrain: 3000,
    skimmer: 12000,
    mediaQty: 450,
    sandMedia: 6750,
  },
  {
    vol: 200000,
    flow: 29000,
    hrs: 7,
    filterDia: 900,
    pumpHP: 3,
    nozzleQty: 12,
    inletNozzle: 3000,
    bottomDrain: 3000,
    skimmer: 12000,
    mediaQty: 450,
    sandMedia: 6750,
  },
];

export function inr(n: number | null | undefined) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "₹\u202f" + Math.round(n).toLocaleString("en-IN");
}

export function getRow(vol: number): TableRow {
  if (vol <= TABLE[0].vol) return TABLE[0];
  if (vol >= TABLE[TABLE.length - 1].vol) return TABLE[TABLE.length - 1];
  for (let i = 0; i < TABLE.length - 1; i++) {
    if (vol > TABLE[i].vol && vol <= TABLE[i + 1].vol) return TABLE[i + 1];
  }
  return TABLE[TABLE.length - 1];
}

export interface OctopusProposalInputs {
  quotation_Number: string;
  client_Name: string;
  date: string;
  special_Terms: string;
  selectedPools: string[];
  mainPoolLength: string;
  mainPoolWidth: string;
  mainPoolDepth: string;
  babyPoolLength: string;
  babyPoolWidth: string;
  babyPoolDepth: string;
  poolVolume: string;
  flowRate: string;
  workHours: string;
  mediaType: string;
  layoutType: string;
  authorized_Person: string;
  gutterLength: string;
  gutterWidth: string;
  accessories: string[];
  poolLadderUnits: string;
  poolLadderUnits_steps: string;
  poolLightingUnits: string;
  poolLightingUnits_watt: string;
  cascadeUnits: string;
  pipelessUnits: string;
  roboticCleanerUnits: string;
  uvSterilizerUnits: string;
  saltChlorinatorUnits: string;
}

export async function generateOctopusWordProposal(
  inputs: OctopusProposalInputs,
  setProgress: (percent: number, message: string) => void,
) {
  try {
    setProgress(10, "Initializing Word Document...");
    const {
      quotation_Number,
      client_Name,
      date,
      special_Terms,
      poolVolume: rawpoolVolume,
      selectedPools = ["mainPool"],
      mainPoolLength = "0",
      mainPoolWidth = "0",
      mainPoolDepth = "0",
      babyPoolLength = "0",
      babyPoolWidth = "0",
      babyPoolDepth = "0",
      authorized_Person,
      layoutType,
      mediaType,
      accessories = [],
      poolLadderUnits = "1",
      poolLadderUnits_steps = "",
      poolLightingUnits = "1",
      poolLightingUnits_watt = "",
      cascadeUnits = "1",
      pipelessUnits = "1",
      roboticCleanerUnits = "1",
      uvSterilizerUnits = "1",
      saltChlorinatorUnits = "1",
    } = inputs;

    const poolVolume = parseFloat(rawpoolVolume) || 0;

    let poolTypeLabel = "";
    if (
      selectedPools.includes("mainPool") &&
      selectedPools.includes("babyPool")
    ) {
      poolTypeLabel = "Main & Baby Pool";
    } else if (selectedPools.includes("mainPool")) {
      poolTypeLabel = "Main Pool";
    } else if (selectedPools.includes("babyPool")) {
      poolTypeLabel = "Baby Pool";
    }

    const row = getRow(poolVolume);

    const accessoryItems = [];
    if (accessories.includes("PoolLadder")) {
      const qty = parseInt(poolLadderUnits) || 1;
      const steps = poolLadderUnits_steps ? ` (${poolLadderUnits_steps})` : "";
      accessoryItems.push({
        name: `Pool Ladder (SS304)${steps}`,
        qty,
        unit: 15000,
        spec: [`SS304 Pool Ladder - ${poolLadderUnits_steps || "3 Steps"}`],
      });
    }
    if (accessories.includes("PoolLighting")) {
      const qty = parseInt(poolLightingUnits) || 1;
      const watt = poolLightingUnits_watt ? ` (${poolLightingUnits_watt})` : "";
      accessoryItems.push({
        name: `LED Underwater Light${watt}`,
        qty,
        unit: 8500,
        spec: [
          `LED Underwater Light - 12V / ${poolLightingUnits_watt || "10W"}`,
        ],
      });
    }
    if (accessories.includes("Cascade")) {
      const qty = parseInt(cascadeUnits) || 1;
      accessoryItems.push({
        name: "SS Cascade",
        qty,
        unit: 12000,
      });
    }
    if (accessories.includes("PipelessPoolFiltrationSystem")) {
      const qty = parseInt(pipelessUnits) || 1;
      accessoryItems.push({
        name: "Pipeless Filtration System",
        qty,
        unit: 145000,
      });
    }

    if (accessories.includes("RoboticPoolCleaner")) {
      const qty = parseInt(roboticCleanerUnits) || 1;
      accessoryItems.push({
        name: "Robotic Pool Cleaner",
        qty,
        unit: 0,
      });
    }

    if (accessories.includes("UVSterilizer")) {
      const qty = parseInt(uvSterilizerUnits) || 1;
      accessoryItems.push({
        name: "UV Sterilizer",
        qty,
        unit: 0,
      });
    }

    if (accessories.includes("SaltChlorinator")) {
      const qty = parseInt(saltChlorinatorUnits) || 1;
      accessoryItems.push({
        name: "HQ SQ Salt Chlorinator",
        qty,
        unit: 0,
      });
    }

    setProgress(30, "Loading Images...");
    const headerBuffer = base64ToUint8Array(
      await loadImage("/Octopus Images/Octopus Header.jpg"),
    );
    const footerBuffer = base64ToUint8Array(
      await loadImage("/Octopus Images/Octopus Footer.jpg"),
    );
    const watermarkBuffer = base64ToUint8Array(
      await loadImage("/Octopus Images/Octopus Watermark.jpg"),
    );
    const TopMountedPoolFilterImg = await loadImage(
      "/Octopus Images/Top Mounted Pool Filter.jpg",
    );

    const RoboticPoolCleanerImg = await loadImage(
      "/Octopus Images/Robotic Pool Cleaner.jpg",
    );

    const uvSterilizerImg = await loadImage(
      "/Octopus Images/UV Sterilizer.jpg",
    );

    const saltChlorinatorImg = await loadImage(
      "/Octopus Images/HQ SQ Salt Chlorinator.jpg",
    );

    const PoolPumpImg = await loadImage("/Octopus Images/Pool Pump.jpg");
    const PoolSkimmerImg = await loadImage("/Octopus Images/Pool Skimmer.jpg");
    const PoolPipelessFilterImg = await loadImage(
      "/Octopus Images/Pool Pipeless filter.jpg",
    );
    const PoolLightsImg = await loadImage("/Octopus Images/Pool Lights.jpg");
    const PoolLadderImg = await loadImage("/Octopus Images/Pool Ladder.jpg");
    const PoolCleaningAccessoriesImg = await loadImage(
      "/Octopus Images/Pool Cleaning accessories.jpg",
    );
    const FilterWaterOutletImg = await loadImage(
      "/Octopus Images/Filter water Outlet.jpg",
    );
    const CascadeImg = await loadImage("/Octopus Images/Cascade.jpg");
    const PoolDisinfectionChemicalImg = await loadImage(
      "/Octopus Images/Pool disinfection chemical.jpg",
    );
    const PoolvaccumNozzleImg = await loadImage(
      "/Octopus Images/Vaccume Nozzel.jpg",
    );
    const AFMMediaImg = await loadImage("/Octopus Images/AFM Media.jpg");
    const SandMediaImg = await loadImage("/Octopus Images/Sand Media.jpg");

    setProgress(40, "Creating Document Content...");

    const doc = new docx.Document({
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
              },
              alignment: docx.AlignmentType.LEFT,
            },
          },
        },
      },
      sections: [
        {
          headers: {
            default: new docx.Header({
              children: [
                new docx.Paragraph({
                  children: [
                    new docx.ImageRun({
                      data: headerBuffer,
                      transformation: { width: 795, height: 90 },
                      type: "jpg",
                    }),
                  ],
                  indent: { left: -1200, right: -1200 },
                  spacing: { before: 0, after: 0 },
                }),

                new docx.Paragraph({
                  children: [
                    new docx.ImageRun({
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
                          type: docx.TextWrappingType.NONE,
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
            default: new docx.Footer({
              children: [
                new docx.Paragraph({
                  children: [
                    new docx.ImageRun({
                      data: footerBuffer,
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
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `Ref: ${quotation_Number}`,
                  bold: true,
                }),
                new docx.TextRun({
                  text: `\t\t\t\t\t\t\tDate: ${formatToDDMMYYYY(date)}`,
                  bold: true,
                }),
              ],
            }),
            new docx.Paragraph({
              children: [new docx.TextRun({ text: " " })],
            }),
            new docx.Paragraph({
              children: [new docx.TextRun({ text: `To:`, bold: true })],
            }),
            new docx.Paragraph({
              children: inputs.client_Name.split("\n").map(
                (line) =>
                  new docx.TextRun({
                    text: line,
                    break: 1,
                  }),
              ),
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `Sub: Proposal for ${poolTypeLabel} Filtration System`,
                  bold: true,
                  underline: {},
                }),
              ],
              spacing: { before: 200, after: 200 },
            }),
            ...(selectedPools.includes("mainPool")
              ? [
                  new docx.Paragraph({
                    children: [
                      new docx.TextRun({
                        text: `Main Pool Dimensions: ${mainPoolLength}ft x ${mainPoolWidth}ft x ${mainPoolDepth}ft`,
                      }),
                    ],
                  }),
                ]
              : []),
            ...(selectedPools.includes("babyPool")
              ? [
                  new docx.Paragraph({
                    children: [
                      new docx.TextRun({
                        text: `Baby Pool Dimensions: ${babyPoolLength}ft x ${babyPoolWidth}ft x ${babyPoolDepth}ft`,
                      }),
                    ],
                  }),
                ]
              : []),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `Total Volume: ${poolVolume} Litres`,
                }),
              ],
              spacing: { after: 400 },
            }),

            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },

              rows: [
                new docx.TableRow({
                  children: ["No.", "Item", "Units", "Image"].map(
                    (text) =>
                      new docx.TableCell({
                        children: [
                          new docx.Paragraph({
                            children: [new docx.TextRun({ text, bold: true })],
                          }),
                        ],
                        shading: { fill: "f2f2f2" },
                        verticalAlign: docx.VerticalAlign.CENTER,
                      }),
                  ),
                }),
                ...[
                  {
                    no: "1",
                    img: TopMountedPoolFilterImg,
                    item: "Filter",
                    units: "1 Nos.",
                    spec: [`${row.filterDia}mm Filter`, `Make: Octopus`],
                  },
                  {
                    no: "2",
                    img: PoolPumpImg,
                    item: "Pump",
                    units: "1 Nos.",
                    spec: [`${row.pumpHP} HP Pump`, `Make: LX / Equiv.`],
                  },
                  {
                    no: "3",
                    img: `${mediaType === "AFMMedia" ? AFMMediaImg : SandMediaImg}`,
                    item: "Media",
                    units: `${row.mediaQty} kg`,
                    spec: `${mediaType === "AFMMedia" ? "AFM" : "Sand"}  Media`,
                  },
                  {
                    no: "4",
                    img:
                      layoutType === "Skimmer"
                        ? PoolSkimmerImg
                        : FilterWaterOutletImg,
                    item: "Fittings",
                    units: "1 Set",
                    spec: `Inlets, Drains, ${layoutType}`,
                  },
                  {
                    no: "5",
                    img: PoolCleaningAccessoriesImg,
                    item: `Cleaning Accessories`,
                    units: "1 Set",
                    spec: [
                      `Maintenance Kit`,
                      `• Wall Brush`,
                      `• Algae Brush`,
                      `• Telescopic Handle`,
                      `• Aluminum Vacuum Head`,
                      `• Deluxe Leaf Net Bag`,
                      `• Hose Pipe`,
                      `• Test Kit`,
                    ],
                  },
                  {
                    no: "6",
                    img: PoolvaccumNozzleImg,
                    item: "Vacuum Nozzle ",
                    units: "1 Nos.",
                    spec: "Standard Vacuum Nozzle",
                  },
                  {
                    no: "7",
                    img: PoolDisinfectionChemicalImg,
                    item: "Pool Disinfection Chemical",
                    units: "50 kg",
                    spec: "Standard Scope",
                  },
                  ...accessoryItems.map((item, idx) => {
                    let accImg = null;
                    if (item.name.includes("Ladder")) accImg = PoolLadderImg;
                    if (item.name.includes("Light")) accImg = PoolLightsImg;
                    if (item.name.includes("Cascade")) accImg = CascadeImg;
                    if (item.name.includes("Pipeless"))
                      accImg = PoolPipelessFilterImg;
                    if (item.name.includes("Robotic"))
                      accImg = RoboticPoolCleanerImg;
                    if (item.name.includes("UV Sterilizer"))
                      accImg = uvSterilizerImg;
                    if (item.name.includes("Salt Chlorinator"))
                      accImg = saltChlorinatorImg;
                    return {
                      no: (6 + idx).toString(),
                      img: accImg,
                      item: item.name,
                      units: `${item.qty} Nos.`,
                      spec: (item as any).spec || " ",
                    };
                  }),
                  {
                    no: (6 + accessoryItems.length).toString(),
                    img: null,
                    item: "Plumbing",
                    units: "1 Set",
                    spec: "Standard Scope",
                  },
                ].map(
                  (row) =>
                    new docx.TableRow({
                      children: [
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [new docx.TextRun({ text: row.no })],
                            }),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                          margins: { left: 100, right: 100 },
                        }),
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [new docx.TextRun({ text: row.item })],
                            }),
                            ...(Array.isArray(row.spec)
                              ? row.spec.map(
                                  (line) =>
                                    new docx.Paragraph({
                                      children: [
                                        new docx.TextRun({
                                          text: line,
                                          size: 18,
                                        }),
                                      ],
                                      spacing: { before: 100, after: 0 },
                                    }),
                                )
                              : typeof row.spec === "string"
                                ? [
                                    new docx.Paragraph({
                                      children: [
                                        new docx.TextRun({
                                          text: row.spec,
                                          size: 18,
                                        }),
                                      ],
                                      spacing: { before: 100, after: 0 },
                                    }),
                                  ]
                                : []),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                          margins: { left: 100, right: 100 },
                        }),
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [new docx.TextRun({ text: row.units })],
                            }),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                          margins: { left: 100, right: 100 },
                        }),
                        new docx.TableCell({
                          children: row.img
                            ? [
                                new docx.Paragraph({
                                  children: [
                                    new docx.ImageRun({
                                      data: base64ToUint8Array(row.img),
                                      transformation:
                                        row.img === PoolCleaningAccessoriesImg
                                          ? {
                                              width: 200,
                                              height: 250,
                                            }
                                          : {
                                              width: 200,
                                              height: 200,
                                            },
                                      type: "jpg",
                                    }),
                                  ],
                                  alignment: docx.AlignmentType.CENTER,
                                }),
                              ]
                            : [],
                          verticalAlign: docx.VerticalAlign.CENTER,
                        }),
                      ],
                    }),
                ),
                new docx.TableRow({
                  children: [
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({
                              text: "GRAND TOTAL",
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                      columnSpan: 3,
                    }),
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({
                              text: `₹ 0/-`,
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                      columnSpan: 2,
                    }),
                  ],
                }),
              ],
            }),

            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: `Terms & Conditions:`, bold: true }),
              ],
              spacing: { before: 400 },
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: "1. Above Prices ex. work only." }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: "2. GST 18 % will be extra." }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: "3. Freight and unloading under client scope.",
                }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: "4. Payment 50% Advance and 50% before delivery.",
                }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: "5. Offer Validity 30 days from offer date.",
                }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: "6. Subject to Surat jurisdiction." }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: "7. Local plumber, electrician and labor under client scope.",
                }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: "8. All plumbing, wiring and civil work under client scope.",
                }),
              ],
            }),

            ...(special_Terms
              ? [
                  new docx.Paragraph({
                    children: [
                      new docx.TextRun({
                        text: `\nSpecial Terms:`,
                        bold: true,
                      }),
                    ],
                    spacing: { before: 200 },
                  }),
                  new docx.Paragraph({
                    children: [new docx.TextRun({ text: special_Terms })],
                  }),
                ]
              : []),

            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `Authorized Signatory,`,
                  bold: true,
                }),
              ],
              spacing: { before: 400 },
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: `${authorized_Person}`,
                  bold: true,
                }),
              ],
              spacing: { before: 100 },
            }),
          ],
        },
      ],
    });

    setProgress(80, "Finalizing Word File...");
    const blob = await docx.Packer.toBlob(doc);
    saveAs(blob, `Proposal_${quotation_Number}.docx`);
    setProgress(100, "Download Complete!");
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    alert("Error generating Word document: " + errorMessage);
  }
}
