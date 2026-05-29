// 下载单个TXT文件
export function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 一键打包下载ZIP
export async function downloadZipPackage(fileList) {
  // 动态加载JSZip
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  fileList.forEach((file) => {
    zip.file(file.filename, file.content)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '剪辑脚本全套素材包.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
