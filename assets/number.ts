const thousandSeparator = (1111).toLocaleString('fr').replace(/1/g, '')
const decimalSeparator = (1.1).toLocaleString('fr').replace(/1/g, '')

export const toInt = (value?: string|number) => {
  if (!value) {
    return 0
  }

  if (typeof value === 'number') {
    return value
  }

  return parseFloat(
    value
      .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
      .replace(new RegExp('\\' + decimalSeparator), '.')
  )
}
