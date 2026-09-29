export const REGISTRATION_COLUMNS = [
  { key: "sr_no", header: "S.No.", width: 8 },
  { key: "applicant_id", header: "आवेदक आईडी (Applicant ID)", width: 20 },
  { key: "full_name", header: "पूरा नाम (Full Name)", width: 26 },
  { key: "nominator_category", header: "नामांकनकर्ता श्रेणी (Nominator Category)", width: 24 },
  { key: "relat_with_child", header: "बच्चे से संबंध (Relation With Child)", width: 22 },
  { key: "phone", header: "मोबाइल (Phone)", width: 16 },
  { key: "email", header: "ईमेल (Email)", width: 24 },
  { key: "id_proof_type", header: "पहचान पत्र प्रकार (ID Proof Type)", width: 24 },
  { key: "id_proof_no", header: "पहचान पत्र संख्या (ID Proof No.)", width: 20 },
  { key: "village", header: "ग्राम/मोहल्ला (Village)", width: 20 },
  { key: "post_office", header: "तहसील/डाकघर (Post Office)", width: 20 },
  { key: "project", header: "विकासखण्ड/नगर निकाय (Project)", width: 22 },
  { key: "district", header: "जनपद (District)", width: 18 },
  { key: "pincode", header: "पिन कोड (Pincode)", width: 14 },
  { key: "status", header: "स्थिति (Status)", width: 16 },
  { key: "step_status", header: "चरण स्थिति (Step Status)", width: 18 },
];

const CHART_PALETTE = [
  "#4f46e5",
  "#16715b",
  "#1d85e9",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#db2777",
  "#65a30d",
];

const formatText = (value) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  return text.length ? text : "-";
};

const countBy = (rows, key) => {
  const map = new Map();
  rows.forEach((row) => {
    const label = formatText(row?.[key]);
    map.set(label, (map.get(label) || 0) + 1);
  });
  return map;
};

const topEntries = (map, limit) => {
  const entries = Array.from(map.entries()).filter(([label]) => label !== "-");
  entries.sort((a, b) => b[1] - a[1]);
  return limit ? entries.slice(0, limit) : entries;
};

const classifyStepStatus = (stepStatus) => {
  const value = String(stepStatus || "").trim();
  if (!value || value === "-") return "अन्य / Other";
  if (value === "Final Submitted") return "फाइनल जमा (Final Submitted)";
  if (value.toLowerCase() === "pending") return "लंबित (Pending)";
  if (value.startsWith("step-")) {
    const num = value.replace("step-", "").trim();
    return `चरण ${num} (Step ${num})`;
  }
  return value;
};

export const buildReportData = ({ applications = [], formStatusList = [], filters = {} }) => {
  const rows = applications.map((app, index) => ({
    sr_no: index + 1,
    applicant_id: formatText(app.applicant_id),
    full_name: formatText(app.full_name),
    nominator_category: formatText(app.nominator_category),
    relat_with_child: formatText(app.relat_with_child),
    phone: formatText(app.phone),
    email: formatText(app.email),
    id_proof_type: formatText(app.id_proof_type),
    id_proof_no: formatText(app.id_proof_no),
    village: formatText(app.village),
    post_office: formatText(app.post_office),
    project: formatText(app.project),
    district: formatText(app.district),
    pincode: formatText(app.pincode),
    status: formatText(app.status),
    step_status: formatText(app.step_status),
  }));

  const total = rows.length;
  const finalSubmitted = applications.filter((app) => app.step_status === "Final Submitted").length;
  const inProgress = applications.filter((app) => String(app.step_status || "").startsWith("step-")).length;
  const pending = applications.filter((app) => String(app.step_status || "").toLowerCase() === "pending").length;
  const other = total - finalSubmitted - inProgress - pending;

  const statusMap = countBy(applications, "status");
  const stepStatusMap = countBy(applications, "step_status");
  const districtMap = countBy(applications, "district");
  const projectMap = countBy(applications, "project");
  const categoryMap = countBy(applications, "nominator_category");

  const summary = {
    total,
    finalSubmitted,
    inProgress,
    pending,
    other: other > 0 ? other : 0,
    districts: Array.from(districtMap.entries()).filter(([label]) => label !== "-").length,
    projects: Array.from(projectMap.entries()).filter(([label]) => label !== "-").length,
    formRecords: Array.isArray(formStatusList) ? formStatusList.length : 0,
    generatedAt: new Date().toLocaleString("en-IN", { hour12: false }),
  };

  const activeFilters = Object.entries(filters || {})
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`);

  return {
    rows,
    summary,
    filters: activeFilters,
    charts: {
      stepStatus: topEntries(stepStatusMap).map(([label, value]) => ({
        label: classifyStepStatus(label),
        value,
      })),
      status: topEntries(statusMap).map(([label, value]) => ({ label, value })),
      district: topEntries(districtMap, 12).map(([label, value]) => ({ label, value })),
      project: topEntries(projectMap, 12).map(([label, value]) => ({ label, value })),
      category: topEntries(categoryMap).map(([label, value]) => ({ label, value })),
    },
  };
};

const renderChartImage = async (config, { width = 1200, height = 620 } = {}) => {
  const { default: Chart } = await import("chart.js/auto");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const chart = new Chart(ctx, {
    ...config,
    options: {
      ...config.options,
      responsive: false,
      animation: false,
      devicePixelRatio: 2,
    },
  });

  await new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    } else {
      setTimeout(resolve, 120);
    }
  });

  const image = canvas.toDataURL("image/png", 1);
  chart.destroy();
  return image;
};

const baseChartOptions = {
  responsive: false,
  animation: false,
  plugins: {
    legend: { position: "bottom", labels: { font: { size: 16 }, boxWidth: 18, padding: 14 } },
    title: { display: true, text: "", font: { size: 22, weight: "bold" }, color: "#17324d" },
  },
};

const gridOptions = {
  ...baseChartOptions,
  plugins: { ...baseChartOptions.plugins, legend: { display: false } },
  scales: {
    x: { ticks: { font: { size: 14 }, maxRotation: 45, minRotation: 0 }, grid: { display: false } },
    y: { beginAtZero: true, ticks: { precision: 0, font: { size: 14 } }, grid: { color: "#e5e7eb" } },
  },
};

export const buildReportChartImages = async (charts) => {
  const images = {};

  images.statusDistribution = charts.stepStatus.length
    ? await renderChartImage({
        type: "doughnut",
        data: {
          labels: charts.stepStatus.map((item) => item.label),
          datasets: [
            {
              data: charts.stepStatus.map((item) => item.value),
              backgroundColor: charts.stepStatus.map((_, i) => CHART_PALETTE[i % CHART_PALETTE.length]),
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          ...baseChartOptions,
          title: { ...baseChartOptions.plugins.title, text: "चरण स्थिति वितरण (Step Status Distribution)" },
          plugins: { ...baseChartOptions.plugins, legend: { ...baseChartOptions.plugins.legend, position: "right" } },
          cutout: "55%",
        },
      })
    : "";

  images.districtChart = charts.district.length
    ? await renderChartImage({
        type: "bar",
        data: {
          labels: charts.district.map((item) => item.label),
          datasets: [
            {
              label: "आवेदन संख्या (Applications)",
              data: charts.district.map((item) => item.value),
              backgroundColor: "#4f46e5",
              borderRadius: 6,
            },
          ],
        },
        options: { ...gridOptions, plugins: { ...gridOptions.plugins, title: { ...gridOptions.plugins.title, text: "जनपदवार आवेदन (District Wise Applications)" } } },
      })
    : "";

  images.projectChart = charts.project.length
    ? await renderChartImage({
        type: "bar",
        data: {
          labels: charts.project.map((item) => item.label),
          datasets: [
            {
              label: "आवेदन संख्या (Applications)",
              data: charts.project.map((item) => item.value),
              backgroundColor: "#16715b",
              borderRadius: 6,
            },
          ],
        },
        options: { ...gridOptions, plugins: { ...gridOptions.plugins, title: { ...gridOptions.plugins.title, text: "विकासखण्ड/नगर निकाय अनुसार आवेदन (Project Wise Applications)" } } },
      })
    : "";

  images.categoryChart = charts.category.length
    ? await renderChartImage({
        type: "bar",
        data: {
          labels: charts.category.map((item) => item.label),
          datasets: [
            {
              label: "आवेदन संख्या (Applications)",
              data: charts.category.map((item) => item.value),
              backgroundColor: "#1d85e9",
              borderRadius: 6,
            },
          ],
        },
        options: { ...gridOptions, plugins: { ...gridOptions.plugins, title: { ...gridOptions.plugins.title, text: "नामांकनकर्ता श्रेणी अनुसार आवेदन (Nominator Category)" } } },
      })
    : "";

  return images;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildSummaryCards = (summary) => {
  const cards = [
    { label: "कुल आवेदन (Total Applications)", value: summary.total },
    { label: "फाइनल जमा (Final Submitted)", value: summary.finalSubmitted },
    { label: "प्रगति पर (In Progress)", value: summary.inProgress },
    { label: "लंबित (Pending)", value: summary.pending },
    { label: "कुल जनपद (Districts)", value: summary.districts },
    { label: "कुल प्रोजेक्ट (Projects)", value: summary.projects },
    { label: "फॉर्म रिकॉर्ड (Form Records)", value: summary.formRecords },
  ];

  return `<div class="cards">${cards
    .map(
      (card) => `<div class="card">
        <div class="card-label">${escapeHtml(card.label)}</div>
        <div class="card-value">${escapeHtml(card.value)}</div>
      </div>`
    )
    .join("")}</div>`;
};

const buildBreakdownTable = (title, entries, total) => {
  if (!entries || !entries.length) return "";
  const rows = entries
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.label)}</td>
        <td class="num">${escapeHtml(item.value)}</td>
        <td class="num">${total ? ((item.value / total) * 100).toFixed(2) : "0.00"}%</td>
      </tr>`
    )
    .join("");

  return `<section class="block">
      <h3 class="block-title">${escapeHtml(title)}</h3>
      <table class="breakdown">
        <thead><tr><th>विवरण (Description)</th><th class="num">संख्या (Count)</th><th class="num">प्रतिशत (Percentage)</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`;
};

const buildRegistrationTable = (rows) => {
  const head = REGISTRATION_COLUMNS.map((col) => `<th>${escapeHtml(col.header)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${REGISTRATION_COLUMNS.map((col) => `<td>${escapeHtml(row[col.key])}</td>`).join("")}</tr>`
    )
    .join("");

  return `<table class="registration">
      <thead><tr>${head}</tr></thead>
      <tbody>${body || `<tr><td colspan="${REGISTRATION_COLUMNS.length}" class="empty">कोई आवेदन नहीं मिला (No applications found)</td></tr>`}</tbody>
    </table>`;
};

const buildPrintHtml = ({ report, images }) => {
  const { summary, rows, filters, charts } = report;
  const chartBlocks = [
    { src: images.statusDistribution, caption: "चित्र 1: चरण स्थिति वितरण (Figure 1: Step Status Distribution)" },
    { src: images.districtChart, caption: "चित्र 2: जनपदवार आवेदन (Figure 2: District Wise Applications)" },
    { src: images.projectChart, caption: "चित्र 3: प्रोजेक्ट अनुसार आवेदन (Figure 3: Project Wise Applications)" },
    { src: images.categoryChart, caption: "चित्र 4: नामांकनकर्ता श्रेणी (Figure 4: Nominator Category)" },
  ]
    .filter((block) => block.src)
    .map(
      (block) => `<figure>
        <img src="${block.src}" alt="${escapeHtml(block.caption)}" />
        <figcaption>${escapeHtml(block.caption)}</figcaption>
      </figure>`
    )
    .join("");

  const filterLine = filters.length
    ? `<p class="filters"><strong>लागू फ़िल्टर (Applied Filters):</strong> ${escapeHtml(filters.join(" | "))}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8" />
<title>IT Cell Dashboard Report</title>
<style>
  @page { size: A3 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Noto Sans Devanagari", "Mangal", Arial, sans-serif;
    color: #1f2937;
    margin: 0;
    padding: 18px 24px;
    font-size: 12px;
  }
  h1 { text-align: center; font-size: 24px; margin: 0 0 4px; color: #17324d; }
  h2 { font-size: 18px; margin: 22px 0 8px; padding-bottom: 6px; border-bottom: 2px solid #4f46e5; color: #2c3e50; }
  h3 { font-size: 14px; margin: 0; color: #17324d; }
  .block { break-inside: avoid; page-break-inside: avoid; align-self: flex-start; }
  .block-title {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 7px 12px;
    margin: 0;
  }
  .subtitle { text-align: center; color: #475569; margin: 0 0 4px; font-size: 14px; }
  .meta { text-align: center; color: #64748b; font-size: 12px; margin: 0; }
  .filters { text-align: center; color: #334155; font-size: 12px; margin: 6px 0 0; }
  .cards { display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0 4px; }
  .card { flex: 1 1 150px; border: 1px solid #d7dce5; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
  .card-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .card-value { font-size: 20px; font-weight: 700; color: #17324d; }
  .grid { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; }
  figure { flex: 1 1 46%; margin: 0; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; page-break-inside: avoid; }
  figure img { width: 100%; height: auto; display: block; }
  figcaption { text-align: center; font-size: 11px; color: #475569; margin-top: 6px; }
  table { border-collapse: collapse; width: 100%; }
  .breakdown { width: auto; min-width: 60%; margin-bottom: 0; border-radius: 0 0 8px 8px; }
  .breakdown th, .breakdown td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 11px; }
  .breakdown th { background: #e0e7ff; text-align: left; }
  .num { text-align: right; }
  .registration { margin-top: 8px; font-size: 10px; }
  .registration th, .registration td { border: 1px solid #b6c0cd; padding: 4px 6px; text-align: left; }
  .registration th { background: #eef2ff; color: #17324d; font-size: 10px; }
  .registration tbody tr:nth-child(even) { background: #f8fafc; }
  .registration thead { display: table-header-group; }
  .empty { text-align: center; padding: 14px; color: #64748b; }
  .footer { margin-top: 14px; text-align: center; color: #64748b; font-size: 10px; }
</style>
</head>
<body>
  <h1>मुख्यमंत्री राज्य बाल वीरता पुरस्कार</h1>
  <p class="subtitle">IT Cell Dashboard - Student Registration Report / छात्र पंजीकरण रिपोर्ट</p>
  <p class="meta">Generated On / रिपोर्ट तिथि: ${escapeHtml(summary.generatedAt)}</p>
  ${filterLine}
  ${buildSummaryCards(summary)}
  ${chartBlocks ? `<h2>चित्र विवरण (Graphical Representation)</h2><div class="grid">${chartBlocks}</div>` : ""}
  <h2>सारांश विवरण (Summary Breakdown)</h2>
  <div class="grid">
    ${buildBreakdownTable("चरण स्थिति (Step Status)", charts.stepStatus, summary.total)}
    ${buildBreakdownTable("स्थिति (Status)", charts.status, summary.total)}
    ${buildBreakdownTable("जनपद (District)", charts.district, summary.total)}
    ${buildBreakdownTable("विकासखण्ड/नगर निकाय (Project)", charts.project, summary.total)}
  </div>
  <h2>छात्र पंजीकरण विवरण (Student Registration Details)</h2>
  ${buildRegistrationTable(rows)}
  <p class="footer">IT Cell, मुख्यमंत्री राज्य बाल वीरता पुरस्कार - Generated by Dashboard Report</p>
</body>
</html>`;
};

export const exportDashboardPdf = async ({ applications, formStatusList, filters }) => {
  const report = buildReportData({ applications, formStatusList, filters });
  const images = await buildReportChartImages(report.charts);
  const html = buildPrintHtml({ report, images });

  const printWindow = window.open("", "_blank", "width=1280,height=900");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups to export the PDF report.");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  await new Promise((resolve) => {
    const deadline = Date.now() + 4000;
    const checkReady = () => {
      const imagesReady = Array.from(printWindow.document.images).every((img) => img.complete);
      if (imagesReady || Date.now() > deadline) {
        printWindow.removeEventListener("load", checkReady);
        setTimeout(resolve, 250);
        return;
      }
      setTimeout(checkReady, 120);
    };
    printWindow.addEventListener("load", checkReady);
    setTimeout(checkReady, 300);
  });

  printWindow.focus();
  printWindow.print();
};

// ──────────────────────────────────────────────────────────────
// EXCEL EXPORT HELPERS
// ──────────────────────────────────────────────────────────────

const applyBorder = (cell) => {
  cell.border = {
    top: { style: "thin", color: { argb: "FFB6C0CD" } },
    left: { style: "thin", color: { argb: "FFB6C0CD" } },
    bottom: { style: "thin", color: { argb: "FFB6C0CD" } },
    right: { style: "thin", color: { argb: "FFB6C0CD" } },
  };
};

/**
 * Style a header row — only touches cells that already have a value.
 * Pass { includeEmpty: false } so merged / empty cells are not affected.
 */
const styleHeaderRow = (row) => {
  row.eachCell({ includeEmpty: false }, (cell) => {
    cell.font = { bold: true, color: { argb: "FF17324D" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF2FF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    applyBorder(cell);
  });
  row.height = 34;
};

/**
 * Add a breakdown table that spans the FULL width of the sheet.
 * Merges cells so Description / Count / Percentage columns are
 * proportionally sized regardless of how many sheet columns exist.
 *
 * @param {ExcelJS.Worksheet} sheet
 * @param {number} startRow
 * @param {string} title
 * @param {Array<{label:string,value:number}>} entries
 * @param {number} total
 * @param {number} lastCol  — total columns in the sheet (e.g. 17)
 * @returns {number} next free row (with +1 spacer)
 */
const addBreakdownBlock = (sheet, startRow, title, entries, total, lastCol = 3) => {
  // Column split: Description 55%, Count ~22%, Percentage ~23%
  const descEnd = Math.max(3, Math.floor(lastCol * 0.55));
  const countEnd = descEnd + Math.max(1, Math.floor((lastCol - descEnd) / 2));

  // ── Title row ──────────────────────────────────────────────
  sheet.mergeCells(startRow, 1, startRow, lastCol);
  const titleRow = sheet.getRow(startRow);
  const titleCell = titleRow.getCell(1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 12, color: { argb: "FF17324D" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E7FF" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  for (let c = 1; c <= lastCol; c++) applyBorder(titleRow.getCell(c));
  titleRow.height = 26;

  // ── Header row ─────────────────────────────────────────────
  const hr = startRow + 1;
  sheet.mergeCells(hr, 1, hr, descEnd);
  sheet.mergeCells(hr, descEnd + 1, hr, countEnd);
  sheet.mergeCells(hr, countEnd + 1, hr, lastCol);

  const headerRow = sheet.getRow(hr);
  headerRow.getCell(1).value = "विवरण (Description)";
  headerRow.getCell(descEnd + 1).value = "संख्या (Count)";
  headerRow.getCell(countEnd + 1).value = "प्रतिशत (Percentage)";

  for (let c = 1; c <= lastCol; c++) {
    const cell = headerRow.getCell(c);
    cell.font = { bold: true, color: { argb: "FF17324D" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF2FF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    applyBorder(cell);
  }
  headerRow.height = 30;

  // ── Data rows ─────────────────────────────────────────────
  let row = hr + 1;

  if (entries && entries.length) {
    entries.forEach((item, idx) => {
      sheet.mergeCells(row, 1, row, descEnd);
      sheet.mergeCells(row, descEnd + 1, row, countEnd);
      sheet.mergeCells(row, countEnd + 1, row, lastCol);

      const dataRow = sheet.getRow(row);

      dataRow.getCell(1).value = item.label;
      dataRow.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };

      dataRow.getCell(descEnd + 1).value = item.value;
      dataRow.getCell(descEnd + 1).numFmt = "0";
      dataRow.getCell(descEnd + 1).alignment = { vertical: "middle", horizontal: "right" };

      dataRow.getCell(countEnd + 1).value = total ? Number(((item.value / total) * 100).toFixed(2)) : 0;
      dataRow.getCell(countEnd + 1).numFmt = '0.00"%"';
      dataRow.getCell(countEnd + 1).alignment = { vertical: "middle", horizontal: "right" };

      for (let c = 1; c <= lastCol; c++) {
        applyBorder(dataRow.getCell(c));
        if (idx % 2 === 1) {
          dataRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        }
      }
      dataRow.height = 20;
      row++;
    });
  } else {
    sheet.mergeCells(row, 1, row, lastCol);
    const emptyCell = sheet.getCell(row, 1);
    emptyCell.value = "कोई आकड़ा उपलब्ध नहीं (No data available)";
    emptyCell.alignment = { horizontal: "center", vertical: "middle" };
    emptyCell.font = { italic: true, color: { argb: "FF6B7280" } };
    for (let c = 1; c <= lastCol; c++) applyBorder(sheet.getCell(row, c));
    row++;
  }

  return row + 1; // +1 spacer row
};

// ──────────────────────────────────────────────────────────────
// MAIN EXCEL EXPORT
// ──────────────────────────────────────────────────────────────

export const exportDashboardExcel = async ({ applications, formStatusList, filters }) => {
  const { default: ExcelJS } = await import("exceljs");
  const report = buildReportData({ applications, formStatusList, filters });
  const images = await buildReportChartImages(report.charts);
  const { summary, rows, charts } = report;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IT Cell Dashboard";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Dashboard Report", {
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 8, // A3
    },
    properties: { tabColor: { argb: "FF4F46E5" } },
  });

  const lastCol = REGISTRATION_COLUMNS.length;

  // Set column widths from REGISTRATION_COLUMNS
  REGISTRATION_COLUMNS.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width;
  });

  let cursor = 1;

  // ═══════════════════════════════════════════════════════════
  // 1. TITLE
  // ═══════════════════════════════════════════════════════════
  sheet.mergeCells(cursor, 1, cursor, lastCol);
  const titleCell = sheet.getCell(cursor, 1);
  titleCell.value = "मुख्यमंत्री राज्य बाल वीरता पुरस्कार";
  titleCell.font = { bold: true, size: 18, color: { argb: "FF17324D" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(cursor).height = 34;
  cursor++;

  // ═══════════════════════════════════════════════════════════
  // 2. SUBTITLE
  // ═══════════════════════════════════════════════════════════
  sheet.mergeCells(cursor, 1, cursor, lastCol);
  const subCell = sheet.getCell(cursor, 1);
  subCell.value = "IT Cell Dashboard - Student Registration Report / छात्र पंजीकरण रिपोर्ट";
  subCell.font = { bold: true, size: 12, color: { argb: "FF475569" } };
  subCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(cursor).height = 22;
  cursor++;

  // ═══════════════════════════════════════════════════════════
  // 3. META (Generated On + Filters)
  // ═══════════════════════════════════════════════════════════
  sheet.mergeCells(cursor, 1, cursor, lastCol);
  const metaCell = sheet.getCell(cursor, 1);
  const filterText = filters.length ? `   |   Applied Filters: ${filters.join(" | ")}` : "";
  metaCell.value = `Generated On: ${summary.generatedAt}${filterText}`;
  metaCell.font = { size: 10, italic: true, color: { argb: "FF64748B" } };
  metaCell.alignment = { horizontal: "center", vertical: "middle" };
  cursor++;

  cursor++; // spacer

  // ═══════════════════════════════════════════════════════════
  // 4. DASHBOARD SUMMARY (label-value pairs, full width)
  // ═══════════════════════════════════════════════════════════
  sheet.mergeCells(cursor, 1, cursor, lastCol);
  const summaryTitle = sheet.getCell(cursor, 1);
  summaryTitle.value = "डैशबोर्ड सारांश (Dashboard Summary)";
  summaryTitle.font = { bold: true, size: 14, color: { argb: "FF2C3E50" } };
  summaryTitle.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(cursor).height = 26;
  cursor++;

  const summaryItems = [
    { label: "कुल आवेदन (Total Applications)", value: summary.total },
    { label: "फाइनल जमा (Final Submitted)", value: summary.finalSubmitted },
    { label: "प्रगति पर (In Progress)", value: summary.inProgress },
    { label: "लंबित (Pending)", value: summary.pending },
    { label: "अन्य (Other)", value: summary.other },
    { label: "कुल जनपद (Districts)", value: summary.districts },
    { label: "कुल प्रोजेक्ट (Projects)", value: summary.projects },
    { label: "फॉर्म रिकॉर्ड (Form Records)", value: summary.formRecords },
  ];

  // Display summary as 2 pairs per row (label-value | label-value)
  const halfCol = Math.ceil(lastCol / 2); // 9
  const labelEnd = Math.floor(halfCol * 0.65); // ~5 cols for label
  const valEnd = halfCol; // remaining cols for value
  const label2Start = halfCol + 1;
  const label2End = halfCol + Math.floor((lastCol - halfCol) * 0.65);
  const val2End = lastCol;

  for (let i = 0; i < summaryItems.length; i += 2) {
    const left = summaryItems[i];
    const right = summaryItems[i + 1];
    const row = sheet.getRow(cursor);

    // Left label
    sheet.mergeCells(cursor, 1, cursor, labelEnd);
    const lLabel = row.getCell(1);
    lLabel.value = left.label;
    lLabel.font = { bold: true, size: 11, color: { argb: "FF334155" } };
    lLabel.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    lLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };

    // Left value
    sheet.mergeCells(cursor, labelEnd + 1, cursor, valEnd);
    const lVal = row.getCell(labelEnd + 1);
    lVal.value = left.value;
    lVal.font = { bold: true, size: 13, color: { argb: "FF17324D" } };
    lVal.alignment = { horizontal: "center", vertical: "middle" };
    lVal.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };

    if (right) {
      // Right label
      sheet.mergeCells(cursor, label2Start, cursor, label2End);
      const rLabel = row.getCell(label2Start);
      rLabel.value = right.label;
      rLabel.font = { bold: true, size: 11, color: { argb: "FF334155" } };
      rLabel.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      rLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };

      // Right value
      sheet.mergeCells(cursor, label2End + 1, cursor, val2End);
      const rVal = row.getCell(label2End + 1);
      rVal.value = right.value;
      rVal.font = { bold: true, size: 13, color: { argb: "FF17324D" } };
      rVal.alignment = { horizontal: "center", vertical: "middle" };
      rVal.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    }

    for (let c = 1; c <= lastCol; c++) applyBorder(row.getCell(c));
    sheet.getRow(cursor).height = 24;
    cursor++;
  }

  cursor++; // spacer

  // ═══════════════════════════════════════════════════════════
  // 5. SUMMARY BREAKDOWN TABLES (full width, merged cells)
  // ═══════════════════════════════════════════════════════════
  sheet.mergeCells(cursor, 1, cursor, lastCol);
  const bdTitle = sheet.getCell(cursor, 1);
  bdTitle.value = "सारांश विवरण (Summary Breakdown)";
  bdTitle.font = { bold: true, size: 14, color: { argb: "FF2C3E50" } };
  bdTitle.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(cursor).height = 26;
  cursor++;

  cursor = addBreakdownBlock(sheet, cursor, "चरण स्थिति (Step Status)", charts.stepStatus, summary.total, lastCol);
  cursor = addBreakdownBlock(sheet, cursor, "स्थिति (Status)", charts.status, summary.total, lastCol);
  cursor = addBreakdownBlock(sheet, cursor, "जनपद (District)", charts.district, summary.total, lastCol);
  cursor = addBreakdownBlock(sheet, cursor, "विकासखण्ड/नगर निकाय (Project)", charts.project, summary.total, lastCol);

  cursor++; // spacer

  // ═══════════════════════════════════════════════════════════
  // 6. CHART IMAGES
  // ═══════════════════════════════════════════════════════════
  const chartImages = [
    { src: images.statusDistribution, title: "चित्र 1: चरण स्थिति वितरण (Step Status Distribution)" },
    { src: images.districtChart, title: "चित्र 2: जनपदवार आवेदन (District Wise Applications)" },
    { src: images.projectChart, title: "चित्र 3: विकासखण्ड अनुसार आवेदन (Project Wise Applications)" },
    { src: images.categoryChart, title: "चित्र 4: नामांकनकर्ता श्रेणी (Nominator Category)" },
  ].filter((item) => item.src);

  if (chartImages.length) {
    sheet.mergeCells(cursor, 1, cursor, lastCol);
    const chartSectionTitle = sheet.getCell(cursor, 1);
    chartSectionTitle.value = "चित्र विवरण (Graphical Representation)";
    chartSectionTitle.font = { bold: true, size: 14, color: { argb: "FF2C3E50" } };
    chartSectionTitle.alignment = { horizontal: "left", vertical: "middle" };
    sheet.getRow(cursor).height = 26;
    cursor++;

    chartImages.forEach((item) => {
      // Chart label — spans full width
      sheet.mergeCells(cursor, 1, cursor, lastCol);
      const labelCell = sheet.getCell(cursor, 1);
      labelCell.value = item.title;
      labelCell.font = { bold: true, size: 11, color: { argb: "FF334155" } };
      labelCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      labelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEF2FF" } };
      for (let c = 1; c <= lastCol; c++) applyBorder(sheet.getCell(cursor, c));
      sheet.getRow(cursor).height = 22;
      cursor++;

      // Image
      const imageId = workbook.addImage({
        base64: item.src.split(",")[1],
        extension: "png",
      });

      const displayWidth = 780;
      const displayHeight = Math.round((displayWidth * 620) / 1200); // ~403

      sheet.addImage(imageId, {
        tl: { col: 0.5, row: cursor },
        ext: { width: displayWidth, height: displayHeight },
        editAs: "oneCell",
      });

      // Ensure enough rows have height for the image
      const rowsNeeded = Math.ceil(displayHeight / 20) + 2;
      for (let r = 0; r < rowsNeeded; r++) {
        sheet.getRow(cursor + r).height = 20;
      }
      cursor += rowsNeeded + 1; // +1 spacer between charts
    });
  }

  cursor++; // spacer

  // ═══════════════════════════════════════════════════════════
  // 7. REGISTRATION DETAILS TABLE
  // ═══════════════════════════════════════════════════════════
  sheet.mergeCells(cursor, 1, cursor, lastCol);
  const tableTitle = sheet.getCell(cursor, 1);
  tableTitle.value = "छात्र पंजीकरण विवरण (Student Registration Details)";
  tableTitle.font = { bold: true, size: 14, color: { argb: "FF2C3E50" } };
  tableTitle.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(cursor).height = 26;
  cursor++;

  const headerRowIndex = cursor;
  const headerRow = sheet.getRow(headerRowIndex);
  REGISTRATION_COLUMNS.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
  });
  styleHeaderRow(headerRow);

  if (rows.length) {
    rows.forEach((rowData, index) => {
      const dataRow = sheet.getRow(headerRowIndex + 1 + index);
      REGISTRATION_COLUMNS.forEach((col, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1);
        cell.value = rowData[col.key];
        cell.alignment = { vertical: "middle", horizontal: col.key === "sr_no" ? "center" : "left" };
        applyBorder(cell);
        if (index % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        }
      });
    });

    sheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex + rows.length, column: lastCol },
    };
  } else {
    // Empty state
    sheet.mergeCells(cursor + 1, 1, cursor + 1, lastCol);
    const emptyCell = sheet.getCell(cursor + 1, 1);
    emptyCell.value = "कोई आवेदन नहीं मिला (No applications found)";
    emptyCell.font = { italic: true, size: 12, color: { argb: "FF6B7280" } };
    emptyCell.alignment = { horizontal: "center", vertical: "middle" };
    for (let c = 1; c <= lastCol; c++) applyBorder(sheet.getCell(cursor + 1, c));
    sheet.getRow(cursor + 1).height = 30;
  }

  // Freeze only the first 3 rows (title area) so summary + tables + charts
  // can scroll freely.  Do NOT freeze at headerRowIndex — that would lock
  // everything above the registration table.
  sheet.views = [{ state: "frozen", ySplit: 3 }];

  // ── Generate file ──────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${getReportFileBaseName()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const getReportFileBaseName = () =>
  `it-cell-dashboard-report-${new Date().toISOString().slice(0, 10)}`;