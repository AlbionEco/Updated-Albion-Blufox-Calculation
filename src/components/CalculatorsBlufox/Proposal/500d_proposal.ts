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
export async function generate500DProposal(
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
    if (module == "500D") {
      membraneSurfaceAreaPerMBR = 31.6;
    }

    const TotalNumberOfModule = Math.ceil(
      (flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR),
    );
    const TotalMembraneSurfaceArea = (
      TotalNumberOfModule * membraneSurfaceAreaPerMBR
    ).toFixed(1);

    let boxpipe = 0;
    if (TotalNumberOfModule >= 15) {
      boxpipe = 100;
    } else {
      boxpipe = 80;
    }
    let RequiredtotalAirFlowRate = 0;
    if (module.substring(0, 4) == "500D") {
      RequiredtotalAirFlowRate = Number(TotalMembraneSurfaceArea) * 0.3;
    }
    RequiredtotalAirFlowRate = parseFloat(RequiredtotalAirFlowRate.toFixed(2));

    setProgress(15, "Loading Images...");
    const headerImgData = await loadImage("/Images for Proposal/header.jpg");
    const footerImgData = await loadImage("/Images for Proposal/footer.jpg");
    const membraneImg = await loadImage("/Images for Proposal/500D 1.jpg");
    const membraneImg2 = await loadImage("/Images for Proposal/500D 2.jpg");
    const membraneImg3 = await loadImage("/Images for Proposal/500D 3.jpg");
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
      `Techno Commercial offer for BLUFOX® BF500D 31.6m2 MBR Membranes`,
      37,
      currentY,
    );
    currentY += 10;
    doc.addImage(membraneImg, "JPEG", 50, currentY, 100, 100);
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

    // Page 4 - Operating Conditions & Specs
    doc.addPage();
    currentY = headerHeight + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Note:", 15, currentY);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Raw Water has been biological treated and gridded with 2mm treatment.",
      30,
      currentY,
    );
    currentY += 5;
    autoTable(doc, {
      startY: currentY,
      head: [["Parameters", "Unit"]],
      body: [
        ["Material of Fiber ", "Reinforced PVDF with PET Layer Support "],
        ["Element Header ", "ABS resin (Heavy Duty) "],
        ["Pore size", "0.04 Micron "],
        ["Fiber Size (OD/ID) ", "1.9mm / 0.8mm "],
        ["Surface Area ", "31.6m2"],
        ["Operation Pressure", "-2.95 to -17.71 inHg"],
        ["Backwash Pressure", "Max 0.15 MPa"],
        ["Operating Temp", "10 - 40 Degree "],
        ["Backwash Time", "30 ~ 120 sec."],
        ["Turbidity outlet", "<3-1 NTU "],
        ["NaClO tolerance", "5000ppm"],
        ["Element Dimension", "2198 x 844 x 49(mm)"],
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
    currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Work Method Process ", 15, currentY);
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(
      "MBR system work in base of “Continuous Blower, Intermittent Permeate” with 7/8mins Work and 2mins Stop. Backwash per 3-4hrs with 2mins, CEB per 7day with 90mins ",
      15,
      currentY,
      { maxWidth: 175, align: "justify" },
    );

    //new page
    doc.addPage();
    currentY = headerHeight + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("MBR Size: ZD 500D Series", 25, currentY);
    currentY += 10;

    doc.addImage(membraneImg2, "JPEG", 40, currentY, 130, 200);

    //new page
    doc.addPage();
    currentY = headerHeight + 10;
    doc.addImage(membraneImg3, "JPEG", 55, currentY, 90, 90);

  currentY += 100;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Commercial Offer:", 15, currentY);
    doc.setFontSize(11);
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

    // --- PAYMENT TERMS HEADING ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Terms and Conditions:", 15, currentY);
    currentY += 7;

    // --- TERMS BULLET POINTS ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const termsConditions = [
       "1. GST 18% extra.",
            "2. Freight will be charges extra.",
            "3. Installation under client scope.",
            "4. Prices Validity 30 days (USD fluctuation).",
            "5. Delivery of Goods discussion at the time of order.",
            "6. Standard warranty one year from the date of supply against manufacturing defect."
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
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(0, 0, 139);
    doc.text("Payment Terms & Conditions:", 15, currentY);
    currentY += 5;
    // description 1
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(
      "100% advance along with purchase order along with GST.",
      15,
      currentY,
      { maxWidth: 180, align: "justify" },
    );


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

    doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Warehouse Charges: ', 25, currentY);
        currentY += 7;
        //Content 2 bullet points justified
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const warehouseText = [
            "1. Charges will be 0.5% on Plant Value, if not picked up as per the dispatch schedule agreed at the time of order finalization. ",
            "2. If applicable, need to be clear separately before the dispatch of material"
        ];
        warehouseText.forEach(text => {
            let lines = doc.splitTextToSize(text, 165);
            let blockHeight = lines.length * 5;
            doc.text(lines, 30, currentY);
            currentY += blockHeight + 2;
        });
        currentY += 5;

        //Heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Freight & Transportation: ', 25, currentY);
        currentY += 7;
        //Content 2 bullet points justified
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const freightText = [
            "• Loading / Unloading charges must be paid by Client to the transporter directly, with duly signed copy of authorized signatory on ‘packing list’. ",
            "• Checking & verifying all the materials, as mentioned in packing list is a due responsibility of client. Any misplacement or damaged equipment afterwards will not be acceptable. ",
            "• Any damage during the unloading of materials or shifting of equipment’s to the particular place will not be entertained & the whole and soul responsibility will be of client. ",
            "• Any unskilled labour and/or any unloading equipment required during the unloading/ shifting of materials at site will be the responsibility of concerned party/person present at site only."
        ];
        freightText.forEach(text => {
            let lines = doc.splitTextToSize(text, 165);
            let blockHeight = lines.length * 5;
            doc.text(lines, 30, currentY);
            currentY += blockHeight + 2;
        });
        currentY += 5;

 //Delivery
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Delivery: ', 25, currentY);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("4-8 weeks from date of Purchase order with advance payment Subject to Surat Jurisdiction only", 42, currentY, { maxWidth: 145, align: "justify" });
        currentY += 20;


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

export async function generate500DWordProposal(
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
    if (module == "500D") {
      membraneSurfaceAreaPerMBR = 31.6;
    }

    const TotalNumberOfModule = Math.ceil(
      (flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR),
    );
    const TotalMembraneSurfaceArea = (
      TotalNumberOfModule * membraneSurfaceAreaPerMBR
    ).toFixed(1);

    let boxpipe = 0;
    if (TotalNumberOfModule >= 15) {
      boxpipe = 100;
    } else {
      boxpipe = 80;
    }
    let RequiredtotalAirFlowRate = 0;
    if (module.substring(0, 4) == "500D") {
      RequiredtotalAirFlowRate = Number(TotalMembraneSurfaceArea) * 0.3;
    }
    RequiredtotalAirFlowRate = parseFloat(RequiredtotalAirFlowRate.toFixed(2));


    const formattedDate = formatToDDMMYYYY(date);

    setProgress(20, "Loading Image Assets...");
    const headerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/header.jpg"),
    );
    const footerBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/footer.jpg"),
    );
    const membraneImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/500D 1.jpg"),
    );

    const cycleImgBuffer = base64ToUint8Array(
      await loadImage("/Images for Proposal/MBR working cycle programming.jpg"),
    );
    const membraneImg2 = await loadImage("/Images for Proposal/500D 2.jpg");
    const membraneImg3 = await loadImage("/Images for Proposal/500D 3.jpg");


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
                    } ),
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
                  text: `Techno Commercial offer for BLUFOX® BF500D 31.6m2 MBR Membranes`, 
                  size: 24
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: membraneImgBuffer,
                  transformation: { width: 350, height: 350 },
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
    new TextRun({text: "Note: ", bold: true}),
    new TextRun({ text: "Raw water has been biologically treated and screened with 2 mm treatment." })
  ]}),
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
                  children: ["Parameters", "Unit"].map(
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
                 ['Material of Fiber ', 'Reinforced PVDF with PET Layer Support '],
                ['Element Header ', 'ABS resin (Heavy Duty) '],
                ['Pore size', '0.04 Micron '],
                ['Fiber Size (OD/ID) ', '1.9mm / 0.8mm '],
                ['Surface Area ', '31.6m2'],
                ['Operation Pressure', '-2.95 to -17.71 inHg'],
                ['Backwash Pressure', 'Max 0.15 MPa'],
                ['Operating Temp', '10 - 40 Degree '],
                ['Backwash Time', '30 ~ 120 sec.'],
                ['Turbidity outlet', '<3-1 NTU '],
                ['NaClO tolerance', '5000ppm'],
                ['Element Dimension', '2198 x 844 x 49(mm)']
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
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Work Method Process", bold: true })] }),
            new Paragraph({ text: "MBR system work in base of “Continuous Blower, Intermittent Permeate” with 7/8mins Work and 2mins Stop. Backwash per 3-4hrs with 2mins, CEB per 7day with 90mins" }),
            new Paragraph({ children: [new PageBreak()] }),

             new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "MBR Size: ZD 500D Series",
                  bold: true,
                  size: 28,
                  color: "00008B",
                  italics: true,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
new Paragraph({
  children: [
    new ImageRun({ 
      data: membraneImg2,
      transformation: { width: 530, height: 750 },
       type: "jpg",
    }),
  ],
}),

new Paragraph({ children: [new PageBreak()] }),

new Paragraph({
  children: [
    new ImageRun({ 
      data: membraneImg3,
      transformation: { width: 300, height: 300 },
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
            // line height exactly 400 TWIPs (~14pt) for spacing
            new Paragraph({ children: [new TextRun({ text: "Terms & Conditions:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "1. GST 18% extra.", indent: { left: 350 } }),
            new Paragraph({ text: "2. Freight will be charges extra.", indent: { left: 350 } }),
            new Paragraph({ text: "3. Installation under client scope.", indent: { left: 350 } }),
            new Paragraph({ text: "4. Prices Validity 30 days (USD fluctuation).", indent: { left: 350 } }),
            new Paragraph({ text: "5. Delivery of Goods discussion at the time of order.", indent: { left: 350 } }),
            new Paragraph({ text: "6. Standard warranty one year from the date of supply against manufacturing defect.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

new Paragraph({ text: "" }),
            // line height exactly 400 TWIPs (~14pt) for spacing
            new Paragraph({ children: [new TextRun({ text: "Payment Terms & Conditions:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "100% advance along with purchase order along with GST." }),

            new Paragraph({ children: [new PageBreak()] }),
 new Paragraph({ children: [new TextRun({ text: "Warehouse Charges:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "1. Charges will be 0.5% on Plant Value, if not picked up as per the dispatch schedule agreed at the time of order finalization.", indent: { left: 350 } }),
            new Paragraph({ text: "2. If applicable, need to be clear separately before the dispatch of material", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            //Freight & Transportation
            new Paragraph({ children: [new TextRun({ text: "Freight & Transportation:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "• Loading / Unloading charges must be paid by Client to the transporter directly, with duly signed copy of authorized signatory on ‘packing list’.", indent: { left: 350 } }),
            new Paragraph({ text: "• Checking & verifying all the materials, as mentioned in packing list is a due responsibility of client. Any misplacement or damaged equipment afterwards will not be acceptable.", indent: { left: 350 } }),
            new Paragraph({ text: "• Any damage during the unloading of materials or shifting of equipment’s to the particular place will not be entertained & the whole and soul responsibility will be of client.", indent: { left: 350 } }),
            new Paragraph({ text: "• Any unskilled labour and/or any unloading equipment required during the unloading/ shifting of materials at site will be the responsibility of concerned party/person present at site only.", indent: { left: 350 } }),
new Paragraph({ text: "" }),
            //Delivery Time
            new Paragraph({
                children: [
                    new TextRun({ text: "Delivery: ", bold: true, italics: true, color: "00008B"}),
                    new TextRun({ text: "4–8 weeks from the date of Purchase Order with advance payment. Subject to Surat jurisdiction only.", bold: false, italics: false,color: "000000", 
                    }), 
                ],
                spacing: { line: 380 },
                alignment: AlignmentType.JUSTIFIED
            }),


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
                  size: 24,
                  color: "00008B",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: authorized_Person,
                  bold: true,
                  size: 24,
                  color: "00008B",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Blufox Ecoventures LLP.",
                  bold: true,
                  size: 24,
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