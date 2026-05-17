import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export function exportToExcel(data: Record<string, any>[], columns: { header: string; key: string }[], filename: string) {
  const rows = data.map(item => {
    const row: Record<string, any> = {}
    columns.forEach(col => {
      row[col.header] = item[col.key] ?? ""
    })
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows, { header: columns.map(c => c.header) })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}.xlsx`)
}
