const { cloneDeep, get, omit, forOwn, each, map, trim, merge } = require('lodash')
const reformRec = require('./reform-rec')

module.exports = ({ rec, token, transformer = {} }) => {
  const newTrans = {}
  const deleted = []
  forOwn(transformer, (v, k) => {
    if (k.includes(',')) {
      deleted.push(k)
      each(map(k.split(','), m => trim(m)), key => {
        newTrans[key] = v
      })
    }
  })
  if (deleted.length > 0) {
    transformer = omit(transformer, deleted)
    transformer = merge(transformer, newTrans)
  }
  let nRec = {}
  let cRec = cloneDeep(rec)
  if (get(transformer, '_common._before')) get(transformer, '_common._before')({ rec })
  if (get(transformer, `${token}._before`)) get(transformer, `${token}._before`)({ rec })
  if (get(transformer, '_common._omit')) cRec = omit(cRec, get(transformer, '_common._omit'))
  if (get(transformer, `${token}._omit`)) cRec = omit(cRec, get(transformer, `${token}._omit`))
  forOwn(cRec, (value, key) => {
    reformRec({ token, key, value, cRec, nRec, rec, transformer })
  })
  if (get(transformer, '_common._after')) get(transformer, '_common._after')({ cRec, nRec, rec })
  if (get(transformer, `${token}._after`)) get(transformer, `${token}._after`)({ cRec, nRec, rec })
  return nRec
}
