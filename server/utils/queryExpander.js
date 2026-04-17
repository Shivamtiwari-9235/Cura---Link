function expandQuery(query, disease) {
  const combined = `${query} ${disease} latest treatment research clinical trial 2024`
  return combined.replace(/\s+/g, ' ').trim()
}

module.exports = { expandQuery }