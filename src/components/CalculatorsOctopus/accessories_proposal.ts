import * as docx from "docx";
import { saveAs } from "file-saver";
import {
  loadImage,
  base64ToUint8Array,
  formatToDDMMYYYY,
} from "./octopusutils";

declare module "file-saver";

export interface AccessoriesProposalInputs {
  ref_Number: string;
  to_Client: string;
  date: string;
  sub: string;
  items: {
    [key: string]: {
      selected: boolean;
      qty: string;
      unit: string;
      spec?: string;
      type?: string;
      dia?: string;
      hp?: string;
      size?: string;
      steps?: string;
      watt?: string;
      label: string;
      category: string;
    };
  };
  authorized_Person: string;
    special_Terms: string;
}

export async function generateAccessoriesWordProposal(
  inputs: AccessoriesProposalInputs,
  setProgress: (percent: number, message: string) => void,
) {
  try {
    setProgress(10, "Initializing Word Document...");
    const { ref_Number, to_Client, date, sub, items, authorized_Person } =
      inputs;

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
    // Load product images
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

    const PoolOverflowImg = await loadImage(
      "/Octopus Images/Overflow Grading.jpg",
    );

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

    const wallBrushImg = await loadImage("/Octopus Images/Wall Brush.jpg");

    const algaeBrushImg = await loadImage("/Octopus Images/Algae Brush.jpg");

    const telescopicHandleImg = await loadImage(
      "/Octopus Images/Telescopic Handle.jpg",
    );
    const vacuumHeadImg = await loadImage(
      "/Octopus Images/Aluminum Vacuum Head.jpg",
    );
    const leafNetBagImg = await loadImage(
      "/Octopus Images/Deluxe Leaf Net Bag.jpg",
    );
    const hosePipePEImg = await loadImage(
      "/Octopus Images/Hose Pipe PE Hose Pipe.jpg",
    );
    const hosePipeEVAImg = await loadImage(
      "/Octopus Images/Hose Pipe EVA Hose Pipe.jpg",
    );
    const testKitImg = await loadImage("/Octopus Images/Test Kit.jpg");

    const SideMountedPoolFilterImg = await loadImage(
      "/Octopus Images/Side Mounted Pool Filter.jpg",
    );

    const CommercialPoolFilterImg = await loadImage(
      "/Octopus Images/Commercial Pool Filter.jpg",
    );

    const MainDrainImg = await loadImage("/Octopus Images/Main drain.jpg");
    const InletNozzelImg = await loadImage("/Octopus Images/Inlet Nozzel.jpg");

    setProgress(40, "Creating Document Content...");

    const doc = new docx.Document({
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
                      transformation: { width: 500, height: 500 },
                      floating: {
                        horizontalPosition: {
                          relative: "page",
                          align: "center",
                        },
                        verticalPosition: { relative: "page", align: "center" },
                        wrap: { type: docx.TextWrappingType.NONE },
                        behindDocument: true,
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
                new docx.TextRun({ text: `Ref: ${ref_Number}`, bold: true }),
                new docx.TextRun({
                  text: `\t\t\t\t\t\t\tDate: ${formatToDDMMYYYY(date)}`,
                  bold: true,
                }),
              ],
            }),
            new docx.Paragraph({
              children: [new docx.TextRun({ text: "To:", bold: true })],
            }),
            new docx.Paragraph({
              children: inputs.to_Client.split("\n").map(
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
                  text: `Sub: ${sub}`,
                  bold: true,
                  underline: {},
                }),
              ],
              spacing: { before: 200, after: 200 },
            }),

            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: [
                // 🔹 Header Row
                new docx.TableRow({
                  children: [
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: "No.", bold: true }),
                          ],
                          alignment: docx.AlignmentType.CENTER,
                        }),
                      ],
                      verticalAlign: docx.VerticalAlign.CENTER,
                      margins: { left: 100, right: 100 },
                      width: { size: 5, type: docx.WidthType.PERCENTAGE },
                      shading: { fill: "E0E0E0" },
                    }),

                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({
                              text: "Product Details",
                              bold: true,
                            }),
                          ],
                          alignment: docx.AlignmentType.CENTER,
                        }),
                      ],
                      verticalAlign: docx.VerticalAlign.CENTER,
                      margins: { left: 100, right: 100 },
                      width: { size: 25, type: docx.WidthType.PERCENTAGE },
                      shading: { fill: "E0E0E0" },
                    }),

                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: "Quantity", bold: true }),
                          ],
                          alignment: docx.AlignmentType.CENTER,
                        }),
                      ],
                      verticalAlign: docx.VerticalAlign.CENTER,
                      margins: { left: 100, right: 100 },
                      width: { size: 10, type: docx.WidthType.PERCENTAGE },
                      shading: { fill: "E0E0E0" },
                    }),

                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: "Image", bold: true }),
                          ],
                          alignment: docx.AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 15, type: docx.WidthType.PERCENTAGE },
                      shading: { fill: "E0E0E0" },
                    }),
                  ],
                }),

                // 🔹 Dynamic Rows
                ...Object.keys(items)
                  .filter((key) => items[key].selected)
                  .map((key, index) => {
                    const item = items[key];

                    let imgData = PoolCleaningAccessoriesImg;
                    if (key === "poolFilter" && item.type === "Top Mounted") {
                      imgData = TopMountedPoolFilterImg;
                    } else if (
                      key === "poolFilter" &&
                      item.type === "Side Mounted"
                    ) {
                      imgData = SideMountedPoolFilterImg;
                    } else if (
                      key === "poolFilter" &&
                      item.type === "Commercial"
                    ) {
                      imgData = CommercialPoolFilterImg;
                    }

                    if (key === "pump") imgData = PoolPumpImg;

                    if (key === "media")
                      imgData =
                        item.type === "AFM" ? AFMMediaImg : SandMediaImg;

                    if (key === "fittings") imgData = FilterWaterOutletImg;

                    if (key === "wallBrush") imgData = wallBrushImg;
                    if (key === "algaeBrush") imgData = algaeBrushImg;
                    if (key === "telescopicHandle")
                      imgData = telescopicHandleImg;
                    if (key === "vacuumHead") imgData = vacuumHeadImg;
                    if (key === "leafNetBag") imgData = leafNetBagImg;
                    if (key === "hosePipe" && item.type === "PE Hose Pipe")
                      imgData = hosePipePEImg;
                    if (key === "hosePipe" && item.type === "EVA Hose Pipe")
                      imgData = hosePipeEVAImg;

                    if (key === "testKit") imgData = testKitImg;
                    if (key === "vacuumNozzle") imgData = PoolvaccumNozzleImg;
                    if (key === "disinfectionChemical")
                      imgData = PoolDisinfectionChemicalImg;
                    if (key === "poolLadder") imgData = PoolLadderImg;
                    if (key === "underwaterLight") imgData = PoolLightsImg;
                    if (key === "ssCascade") imgData = CascadeImg;
                    if (key === "pipelessFilter")
                      imgData = PoolPipelessFilterImg;
                    if (key === "roboticCleaner")
                      imgData = RoboticPoolCleanerImg;
                    if (key === "uvSterilizer") imgData = uvSterilizerImg;
                    if (key === "saltChlorinator") imgData = saltChlorinatorImg;
                    if (key === "poolSkimmer") 
                      imgData = PoolSkimmerImg;
                    if (key === "overflow") 
                      imgData = PoolOverflowImg;
                    if (key === "mainDrain")
                      imgData = MainDrainImg;
                    if (key === "inletNozzle")
                      imgData = InletNozzelImg;

                    let specText = item.spec || "";
                    if (key === "poolFilter")
                      specText = `${item.type} Pool Filter - ${item.dia} Dia`;
                    if (key === "pump") specText = `${item.hp} HP`;
                    if (key === "media")
                      specText = `${item.type} Filtration Media`;
                    if (key === "wallBrush") specText = `${item.size}`;
                    if (key === "algaeBrush") specText = `${item.size}`;
                    if (key === "vacuumHead") specText = `${item.size}`;
                    if (key === "hosePipe")
                      specText = `${item.type} - ${item.size}`;
                    if (key === "poolLadder")
                      specText = `SS304 Pool Ladder - ${item.steps}`;
                    if (key === "underwaterLight") specText = `${item.watt}`;
                    if (key === "overflow")
                      specText = `Overflow Grading ${item.size}`;

                    if (key === "pipelessFilter")
                      specText = [
                        `Model Aqua `,
                        `Technical Specs:`,
                        `Dimension (L x W x H): 1110 x 670 x 780 mm `,
                        `Flow:	20 m3/Hr.`,
                        `Filter Pump:	1.5 HP `,
                        `Light:	9 Watt LED Light`,
                        `Swim Jet:	1Pc `,
                        `Filter Bag Micron:	5 Micron (1No.)`,
                        `Power Supply:	220 Volt –Single Phase`,
                        `MOC Material:	FRP (White)`,
                      ].join(`\n`);

                    return new docx.TableRow({
                      children: [
                        // No.
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [
                                new docx.TextRun({
                                  text: (index + 1).toString(),
                                }),
                              ],
                              alignment: docx.AlignmentType.CENTER,
                            }),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                        }),

                        // Product Details
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [new docx.TextRun(item.label)],
                            }),

                            key === "pipelessFilter"
                              ? new docx.Paragraph({
                                  children: specText.split("\n").map(
                                    (line) =>
                                      new docx.TextRun({
                                        text: line,
                                        break: 1,
                                      }),
                                  ),
                                })
                              : new docx.Paragraph({
                                  children: [new docx.TextRun(specText)],
                                }),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                        }),

                        // Quantity
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [
                                new docx.TextRun(`${item.qty} ${item.unit}`),
                              ],
                            }),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                        }),

                        // Image
                        new docx.TableCell({
                          children: [
                            new docx.Paragraph({
                              children: [
                                new docx.ImageRun({
                                  data: base64ToUint8Array(imgData),
                                  transformation: { width: 120, height: 120 },
                                  type: "jpg",
                                }),
                              ],
                              alignment: docx.AlignmentType.CENTER,
                            }),
                          ],
                          verticalAlign: docx.VerticalAlign.CENTER,
                        }),
                      ],
                    });
                  }),

                // 🔹 GRAND TOTAL ROW
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
                              text: "₹ 0/-",
                              bold: true,
                            }),
                          ],
                          alignment: docx.AlignmentType.RIGHT,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new docx.Paragraph({ text: "", spacing: { before: 400 } }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: "Terms and Conditions:",
                  bold: true,
                  underline: {},
                }),
              ],
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

            new docx.Paragraph({ text: "", spacing: { before: 400 } }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: "Authorized Signatory:", bold: true }),
              ],
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: authorized_Person, bold: true }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await docx.Packer.toBlob(doc);
    saveAs(blob, `Accessories_Proposal_${ref_Number}.docx`);
    setProgress(100, "Proposal Generated Successfully!");
  } catch (error) {
    console.error("Error generating proposal:", error);
    setProgress(0, "Error generating proposal");
  }
}
