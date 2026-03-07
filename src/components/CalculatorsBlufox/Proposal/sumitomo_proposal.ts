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

export async function generateSumitomoProposal(
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
    // Perform calculations based on formulas
    if (module == "12B6") {
      membraneSurfaceAreaPerMBR = 6;
    } else if (module == "12B9") {
      membraneSurfaceAreaPerMBR = 9;
    } else if (module == "12B12") {
      membraneSurfaceAreaPerMBR = 12;
    }

    const effectiveFlowRate = flowRate / 20; //hr;
    const perTrainFlowRate = (effectiveFlowRate / noOfTrain).toFixed(2);
    const RasPumpFlow = ((flowRate / 24) * 3).toFixed(2);
    const TotalNumberOfModule = Math.ceil(
      (flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR),
    );
    const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
    const MembraneSurfaceAreaPerTrain =
      NoofModulePerTrain * membraneSurfaceAreaPerMBR;
    const TotalMembraneSurfaceArea = (
      TotalNumberOfModule * membraneSurfaceAreaPerMBR
    ).toFixed(1);

    const RequiredTotalFlowrateforpeakflux = (flowRate / workingHr).toFixed(2);
    const RequiredBackwashFlowRate = (
      Number(RequiredTotalFlowrateforpeakflux) * 1.5
    ).toFixed(2);
    let RequiredtotalAirFlowRate = (
      TotalNumberOfModule *
      membraneSurfaceAreaPerMBR *
      0.25
    ).toFixed(1);

    let ModuleSize = "";
    if (module == "12B6") {
      ModuleSize = "1300 x 156 x 164";
    } else if (module == "12B9") {
      ModuleSize = "1855 x 156 x 164";
    } else if (module == "12B12") {
      ModuleSize = "2410 x 156 x 164";
    }

    setProgress(15, "Loading Images...");
    const headerImgData = await loadImage("/Images for Proposal/header.jpg");
    const footerImgData = await loadImage("/Images for Proposal/footer.jpg");
    const membraneImg = await loadImage(
      "/Images for Proposal/Sumitomo img 1.jpg",
    );
    const membraneImg2 = await loadImage(
      "/Images for Proposal/Sumitomo img 2.jpg",
    );
    const pidImg = await loadImage("/Images for Proposal/MembraneP&ID.jpg");
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
      `Techno Commercial offer for SUMITOMO Hollow Fibre - MBR Membranes ${flowRate}KLD ${treatment_Type}`,
      37,
      currentY,
    );
    currentY += 10;
    doc.addImage(membraneImg, "JPEG", 30, currentY, 150, 60);
    currentY += 80;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Product Features:", 15, currentY);
    currentY += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);

    const addBullet = (title: string, desc: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(`\u2022 ${title}`, 15, currentY);
      currentY += 5;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(desc, 170);
      doc.text(lines, 15, currentY, { align: "justify", maxWidth: 170 });
      currentY += lines.length * 5 + 2;
    };

    addBullet(
      "Energy saving:",
      "Proprietary aeration system efficiently scours membranes, significantly reducing aeration energy. Large membrane surface area per projection area minimizes installation space.",
    );
    addBullet(
      "Durability:",
      "High tensile strength Poreflon hollow fibre resists shaking and flexing, ensuring long-term operational life.",
    );
    addBullet(
      "Wide wastewater compatibility:",
      "Stable treatment performance even with oil-contaminated and refractory organic wastewater.",
    );
    addBullet(
      "Chemical resistance:",
      "Can be chemically cleaned across full pH range (0–14), including high-concentration alkalis, with excellent flow rate recovery.",
    );
    addBullet(
      "Easy handling:",
      "Hydrophilic-treated PTFE hollow fibres allow easy dry transport and installation.",
    );
    addBullet(
      "Zero Sludge Discharge capability:",
      "High volumetric loading, low sludge loading, long sludge age, and infinite sludge age operation enable theoretically zero sludge release.",
    );
    addBullet(
      "Improved degradation efficiency:",
      "Extended sludge age significantly enhances degradation of refractory organic compounds.",
    );

    // Page 3 - More Features & Process
    doc.addPage();
    currentY = headerHeight + 15;
    doc.addImage(membraneImg2, "JPEG", 20, currentY + 5, 170, 80);
    currentY += 100;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Application:", 25, currentY);
    currentY += 5; //195 total
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const applications = [
      "• Domestic, Sewage water treatment",
      "• Chemical, textile wastewater treatment",
      "• Electronic wastewater treatment",
      "• Garbage wastewater treatment",
      "• Bio-chemical wastewater treatment",
      "• High concentration organic wastewater",
      "• High SS wastewater treatment ",
    ];
    applications.forEach((application) => {
      currentY += 5;
      doc.text(application, 30, currentY);
    });

    doc.addPage();
    currentY = headerHeight + 15;
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

    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Product Parameter:", 15, currentY);
    currentY += 5;
    autoTable(doc, {
      startY: currentY,
      head: [
        [
          {
            content: "Model No.",
            rowSpan: 2,
            colSpan: 3,
            styles: { halign: "center", valign: "middle" },
          },
          {
            content: "SPMW",
            colSpan: 5,
            styles: { halign: "center", fontStyle: "bold" },
          },
        ],
        ["12B6", "12B9", "12B12", "12B38", "12B57"],
      ],
      body: [
        [
          {
            content: "Membrane",
            rowSpan: 6,
            styles: { valign: "middle", halign: "center" },
          },
          "Nominal pore size",
          "µm",
          "0.1",
          "0.1",
          "0.1",
          "0.1",
          "0.1",
        ],
        ["Inner diameter", "mm", "1.1", "1.1", "1.1", "1.1", "1.1"],
        ["Outer diameter", "mm", "2.3", "2.3", "2.2", "2.3", "2.3"],
        ["Membrane area", "m²", "6", "9", "12", "38", "57"],
        [
          "Material",
          "-",
          {
            content: "PTFE",
            colSpan: 5,
            styles: { halign: "center", fontStyle: "bold" },
          },
        ],
        [
          "Hydrophilic treatment",
          "-",
          { content: "Hydrophilic", colSpan: 5, styles: { halign: "center" } },
        ],

        // ===== Material =====
        [
          {
            content: "Material",
            rowSpan: 3,
            styles: { valign: "middle", halign: "center" },
          },
          { content: "Cap", colSpan: 2, styles: { halign: "center" } },
          {
            content: "ABS resin (Joint nut: SUS303)",
            colSpan: 5,
            styles: { halign: "center" },
          },
        ],
        [
          { content: "Potting", colSpan: 2, styles: { halign: "center" } },
          {
            content: "Heat- & chemical-resistant epoxy resin",
            colSpan: 5,
            styles: { halign: "center" },
          },
        ],
        [
          {
            content: "Supporting bar",
            colSpan: 2,
            styles: { halign: "center" },
          },
          { content: "SUS304", colSpan: 3, styles: { halign: "center" } },
          { content: "-", colSpan: 2, styles: { halign: "center" } },
        ],

        // ===== Dimensions =====
        [
          {
            content: "Dimensions",
            rowSpan: 2,
            styles: { valign: "middle", halign: "center" },
          },
          "Length",
          "mm",
          "1300",
          "1855",
          "2410",
          "2200",
          "3220",
        ],
        [
          "Bottom section",
          "mm",
          { content: "156 x 164", colSpan: 3, styles: { halign: "center" } },
          { content: "50 x 840", colSpan: 2, styles: { halign: "center" } },
        ],

        // ===== Operation condition =====
        [
          {
            content: "Operation condition",
            rowSpan: 6,
            styles: { valign: "middle", halign: "center" },
          },
          "Filtration Method",
          "-",
          {
            content: "Suction filtration",
            colSpan: 5,
            styles: { halign: "center" },
          },
        ],
        [
          {
            content: "Trans Membrane Pressure",
            rowSpan: 2,
            styles: { valign: "middle", halign: "center" },
          },
          "Filtration",
          {
            content: ">-60 kPa (-0.6 Bar)",
            colSpan: 5,
            styles: { halign: "center" },
          },
        ],
        [
          "Backwash",
          {
            content: "<100 kPa (1.0 Bar)",
            colSpan: 5,
            styles: { halign: "center" },
          },
        ],
        [
          "Maximum temperature limit",
          "°C",
          { content: "50", colSpan: 5, styles: { halign: "center" } },
        ],
        [
          "Operating pH range",
          "-",
          { content: "0–14", colSpan: 5, styles: { halign: "center" } },
        ],
        [
          "Cleaning pH range",
          "-",
          { content: "0–14", colSpan: 5, styles: { halign: "center" } },
        ],
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

    // Offer Parameters
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
        ["Flow Rate of the system", "KLD", `${flowRate}`],
        [
          "Effective flow Rate (Considering loss of relax & Backwash)",
          "m3/hr",
          `${effectiveFlowRate.toFixed(2)}`,
        ],
        ["Design Frame/Train Qty", "Nos", `${noOfTrain}`],
        ["Per Frame/Train Flow Rate ", "m3/hr", `${perTrainFlowRate}`],
        ["Design Flux (Avg.)", "LMH", `${flux}`],
        ["Total MBR Module Required", "Nos", `${TotalNumberOfModule}`],
        ["Per Frame MBR Module Required", "No.", `${NoofModulePerTrain}`],
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
        ["Total MBR Air Required", "m3/hr", `${RequiredtotalAirFlowRate}`],
        ["MBR Frame/Train Size (Each)", "L x W x H mm", ""],
        ["MBR Frame MOC", "-", `SS304`],
        ["MBR Tank Volume Required (Approx.)", "m3", ""],
        [
          "Permeate Pump Flow @ 12-13m Head",
          "m3/hr",
          `${RequiredTotalFlowrateforpeakflux}`,
        ],
        [
          "Back Wash Pump Flow @ 10m Head ",
          "m3/hr",
          `${RequiredBackwashFlowRate}`,
        ],
        ["RAS Pump Flow @ 15m Head ", "m3/hr", `${RasPumpFlow}`],
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
    doc.text(
      "3. Follow the chemicals for CIP & CEB as per manual.",
      15,
      currentY + 20,
      { maxWidth: 170, align: "justify" },
    );

    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Typical P&ID", 15, currentY);
    doc.addImage(pidImg, "JPEG", 20, currentY + 5, 170, 215);

    // Commercial
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
          `SUMITOMO® - PTFE MBR membranes 
Plant Capacity: ${flowRate} KLD ${treatment_Type}
with SS304 Skid(Frame)`,
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
      "1)  Ex. work from India, China or Japan which is easy and convince for client  ",
      "2)  Freight & Packing will be charges extra as actual.",
      "3)  Payment 50% Advance and 50% before delivery.",
      "4)  Offer Validity 30 days from offer date.",
      "5)  Installation under client scope only.",
      "6)  Delivery 15-60 days of Purchase Order along with advance payment.",
      "7)  Membrane Warranty will be one year against manufacturing defect only.",
      "8)  Client has to submit the feed water data, Process flow diagram, P&ID, Programming cycle design before commissioning of the plant, if client wants to understand the CEB / CIP process, supplier can provide video training support to client.",
      "9) Any other terms and conditions will be as per Blufox standard terms and conditions.",
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

export async function generateSumitomoWordProposal(
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
    if (module == "12B6") {
      membraneSurfaceAreaPerMBR = 6;
    } else if (module == "12B9") {
      membraneSurfaceAreaPerMBR = 9;
    } else if (module == "12B12") {
      membraneSurfaceAreaPerMBR = 12;
    }

    const effectiveFlowRate = flowRate / 20;
    const perTrainFlowRate = (effectiveFlowRate / noOfTrain).toFixed(2);
    const RasPumpFlow = ((flowRate / 24) * 3).toFixed(2);
    const TotalNumberOfModule = Math.ceil(
      (flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR),
    );
    const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
    const MembraneSurfaceAreaPerTrain =
      NoofModulePerTrain * membraneSurfaceAreaPerMBR;
    const TotalMembraneSurfaceArea = (
      TotalNumberOfModule * membraneSurfaceAreaPerMBR
    ).toFixed(1);
    const RequiredTotalFlowrateforpeakflux = (flowRate / workingHr).toFixed(2);
    const RequiredBackwashFlowRate = (
      Number(RequiredTotalFlowrateforpeakflux) * 1.5
    ).toFixed(2);
    let RequiredtotalAirFlowRate = (
      TotalNumberOfModule *
      membraneSurfaceAreaPerMBR *
      0.25
    ).toFixed(1);

    let ModuleSize = "";
    if (module == "12B6") {
      ModuleSize = "1300 x 156 x 164";
    } else if (module == "12B9") {
      ModuleSize = "1855 x 156 x 164";
    } else if (module == "12B12") {
      ModuleSize = "2410 x 156 x 164";
    }
    const formattedDate = formatToDDMMYYYY(date);

    setProgress(20, "Loading Image Assets...");
    const headerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/header.jpg"),
    );
    const footerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/footer.jpg"),
    );
    const membraneImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/Sumitomo img 1.jpg"),
    );
    const membraneImg2Buffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/Sumitomo img 2.jpg"),
    );
    const pidImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MembraneP&ID.jpg"),
    );
    const cycleImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MBR working cycle programming.jpg"),
    );

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
                  text: `Techno Commercial offer for SUMITOMO Hollow Fibre - MBR Membranes  ${flowRate}KLD ${treatment_Type}`,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: membraneImgBuffer,
                  transformation: { width: 500, height: 200 },
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
                  text: "Product Features:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Energy saving: ",
                  bold: true,
                  size: 20,
                }),
                new TextRun({
                  text: "Proprietary aeration system efficiently scours membranes, significantly reducing aeration energy. Large membrane surface area per projection area minimizes installation space.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Durability: ",
                  bold: true,
                  size: 20,
                  break: 1,
                }),
                new TextRun({
                  text: "High tensile strength Poreflon hollow fibre resists shaking and flexing, ensuring long-term operational life.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Wide wastewater compatibility: ",
                  bold: true,
                  size: 20,
                  break: 1,
                }),
                new TextRun({
                  text: "Stable treatment performance even with oil-contaminated and refractory organic wastewater.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Chemical resistance: ",
                  bold: true,
                  size: 20,
                  break: 1,
                }),
                new TextRun({
                  text: "Can be chemically cleaned across full pH range (0–14), including high-concentration alkalis, with excellent flow rate recovery.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Easy handling: ",
                  bold: true,
                  size: 20,
                  break: 1,
                }),
                new TextRun({
                  text: "Hydrophilic-treated PTFE hollow fibres allow easy dry transport and installation.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Zero Sludge Discharge capability: ",
                  bold: true,
                  size: 20,
                  break: 1,
                }),
                new TextRun({
                  text: "High volumetric loading, low sludge loading, long sludge age, and infinite sludge age operation enable theoretically zero sludge release.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "• Improved degradation efficiency: ",
                  bold: true,
                  size: 20,
                  break: 1,
                }),
                new TextRun({
                  text: "Extended sludge age significantly enhances degradation of refractory organic compounds.",
                  size: 20,
                  break: 1,
                }),
              ],
            }),
            new Paragraph({ children: [new PageBreak()] }),
            
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: membraneImg2Buffer,
                  transformation: { width: 600, height: 300 },
                  type: "jpg",
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Application:",
                  bold: true,
                  italics: true,
                  color: "00008B",
                  size: 28,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            // Use indent property for bullet point indentation in Word output
            new Paragraph({
              text: "• Domestic, Sewage water treatment",
              indent: { left: 350 },
            }),
            new Paragraph({
              text: "• Chemical, textile wastewater treatment",
              indent: { left: 350 },
            }),
            new Paragraph({
              text: "• Electronic wastewater treatment",
              indent: { left: 350 },
            }),
            new Paragraph({
              text: "• Garbage wastewater treatment",
              indent: { left: 350 },
            }),
            new Paragraph({
              text: "• Bio-chemical wastewater treatment",
              indent: { left: 350 },
            }),
            new Paragraph({
              text: "• High concentration organic wastewater",
              indent: { left: 350 },
            }),
            new Paragraph({
              text: "• High SS wastewater treatment ",
              indent: { left: 350 },
            }),
            new Paragraph({ children: [new PageBreak()] }),

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
                  text: "Product Parameter:",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
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
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Model No.",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      rowSpan: 2,
                      columnSpan: 3,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "SPMW",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "12B6",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "12B9",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "12B12",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "12B38",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "a9a9a9", color: "FFFFFF" },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "12B57",
                              bold: true,
                              size: 24,
                              color: "FFFFFF",
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),

                // ===== MEMBRANE =====
                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Membrane",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      rowSpan: 6,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Nominal pore size",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "µm",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "0.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "0.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "0.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "0.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "0.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Inner diameter",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "mm",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1.1",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Outer diameter",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "mm",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "2.3",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "2.3",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "2.2",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "2.3",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "2.3",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Membrane area",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "m²",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "6",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "9",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "12",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "38",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "57",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Material",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "-",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "PTFE",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Hydrophilic treatment",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "-",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Hydrophilic",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                // ===== MATERIAL =====
                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Material",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      rowSpan: 3,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Cap",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "ABS resin (Joint nut: SUS303)",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Potting",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Heat- & chemical-resistant epoxy resin",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Supporting bar",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "SUS304",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 3,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "-",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                  ],
                }),

                // ===== DIMENSIONS =====
                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Dimensions",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      rowSpan: 2,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Length",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "mm",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1300",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "1855",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "2410",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "2200",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "3220",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Bottom section",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "mm",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "156 x 164",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 3,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "50 x 840",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                  ],
                }),

                // ===== OPERATION CONDITION =====
                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Operation condition",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      rowSpan: 6,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Filtration Method",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "-",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Suction filtration",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Trans Membrane Pressure",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      rowSpan: 2,
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Filtration",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: ">-60 kPa (-0.6 Bar)",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Backwash",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "<100 kPa (1.0 Bar)",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Maximum temperature limit",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "°C",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "50",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "Operating pH range",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "-",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      children: [
                        new Paragraph({
                          text: "0–14",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "Cleaning pH range",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "-",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      margins: {
                        top: 50,
                        bottom: 50,
                        left: 150,
                        right: 150,
                      },
                      shading: { fill: "F0F0F0" },
                      children: [
                        new Paragraph({
                          text: "0–14",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 5,
                    }),
                  ],
                }),
              ],
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
                        shading: { fill: "a9a9a9" },
                      }),
                  ),
                }),
                ...[
                  ["Flow Rate of the system", "KLD", `${flowRate}`],
                  [
                    "Effective flow Rate (Considering loss of relax & Backwash)",
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
                    "Nos",
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
                  ["MBR Frame/Train Size (Each)", "L x W x H mm", ""],
                  ["MBR Frame MOC", "-", `SS304`],
                  ["MBR Tank Volume Required (Approx.)", "m3", ""],
                  [
                    "Permeate Pump Flow @ 12-13m Head",
                    "m3/hr",
                    `${RequiredTotalFlowrateforpeakflux}`,
                  ],
                  [
                    "Back Wash Pump Flow @ 10m Head ",
                    "m3/hr",
                    `${RequiredBackwashFlowRate}`,
                  ],
                  ["RAS Pump Flow @ 15m Head ", "m3/hr", `${RasPumpFlow}`],
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
            new Paragraph({
              text: "3. Follow the chemicals for CIP & CEB as per manual.",
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
                        new Paragraph({
                          text: "SUMITOMO® - PTFE MBR Membranes",
                        }),
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
