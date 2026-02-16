import PDFDocument from 'pdfkit'
import { POLICIES } from '../../lib/policies'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const docKey = typeof req.query.doc === 'string' ? req.query.doc : ''
  const policy = POLICIES[docKey]
  if (!policy) return res.status(400).json({ error: 'Unknown policy' })

  const fileName = `flico-${policy.key}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
  res.setHeader('Cache-Control', 'no-store')

  const pdf = new PDFDocument({ size: 'LETTER', margin: 54 })
  pdf.pipe(res)

  pdf.fontSize(22).text(policy.title)
  pdf.moveDown(0.5)
  pdf.fontSize(10).fillColor('#555555').text(`Last updated: ${policy.lastUpdated}`)
  pdf.fillColor('#000000')
  pdf.moveDown(1)

  if (policy.description) {
    pdf.fontSize(12).text(policy.description)
    pdf.moveDown(1)
  }

  for (const section of policy.sections) {
    pdf.fontSize(14).text(section.heading, { underline: true })
    pdf.moveDown(0.4)

    for (const b of section.blocks || []) {
      if (b.type === 'p') {
        pdf.fontSize(11).text(String(b.text || ''), { lineGap: 4 })
        pdf.moveDown(0.6)
      }
      if (b.type === 'ul') {
        for (const it of b.items || []) {
          pdf.fontSize(11).text(`• ${String(it)}`, { indent: 14, lineGap: 4 })
        }
        pdf.moveDown(0.6)
      }
    }
    pdf.moveDown(0.5)
  }

  pdf.end()
}

