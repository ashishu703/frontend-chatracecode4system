/**
 * Format date string to IST format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date in IST
 */
const formatDateToIST = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return dateString
  }
}

module.exports = {
  formatDateToIST
}
