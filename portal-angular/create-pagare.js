const docx = require("docx");
const fs = require("fs");

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

const doc = new Document({
    creator: "InnovaConsulting",
    title: "Pagaré a la Orden",
    description: "Plantilla de Pagaré para pruebas del BPM",
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                text: "PAGARÉ A LA ORDEN",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            }),
            new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { line: 360 },
                children: [
                    new TextRun({ text: "Debo y pagaré incondicionalmente a la orden de la institución financiera o a quien sus derechos represente, la cantidad de " }),
                    new TextRun({ text: "<MontoPrestamo>", bold: true, color: "0000FF" }),
                    new TextRun({ text: " dólares de los Estados Unidos de América. Este monto devengará un interés anual del " }),
                    new TextRun({ text: "<TasaInteres>", bold: true, color: "0000FF" }),
                    new TextRun({ text: "% desde su emisión hasta su total cancelación." }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 200, line: 360 },
                children: [
                    new TextRun({ text: "En caso de mora, me obligo a pagar la tasa máxima de interés de mora permitida por la ley. Renuncio a fuero y domicilio, y me someto a los jueces competentes de la ciudad." }),
                ],
            }),
            new Paragraph({
                text: "DATOS DEL DEUDOR",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
                spacing: { line: 360 },
                children: [
                    new TextRun({ text: "Nombre completo: ", bold: true }),
                    new TextRun({ text: "<NombreCompleto>", color: "0000FF" })
                ],
            }),
            new Paragraph({
                spacing: { line: 360 },
                children: [
                    new TextRun({ text: "Identificación (Cédula/RUC): ", bold: true }),
                    new TextRun({ text: "<Identificacion>", color: "0000FF" })
                ],
            }),
            new Paragraph({
                spacing: { line: 360 },
                children: [
                    new TextRun({ text: "Dirección domiciliaria: ", bold: true }),
                    new TextRun({ text: "<Direccion>", color: "0000FF" })
                ],
            }),
            new Paragraph({
                spacing: { before: 800, after: 200 },
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "_____________________________________" })
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "Firma del Deudor" })
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "C.I. <Identificacion>" })
                ],
            })
        ]
    }]
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("plantilla_pagare.docx", buffer);
    console.log("Plantilla Word creada exitosamente: plantilla_pagare.docx");
}).catch(err => {
    console.error("Error creando el documento", err);
});
