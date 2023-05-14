const { isString, isPlainObject, isFunction, isEmpty, get } = require('lodash')

module.exports = ({ token, key, value, cRec, nRec, rec, transformer }) => {
  let definition
  let setNull
  if (transformer[token]) {
    setNull = get(transformer, `${token}._setNull`) || get(transformer, '_common._setNull')
    definition = get(transformer, `${token}.${key}`) || get(transformer, `_common.${key}`)
  } else {
    setNull = get(transformer, '_common._setNull')
    definition = get(transformer, `_common.${key}`)
  }
  if (value === '' && setNull) value = null
  if (!definition) {
    nRec[key] = value
    return
  }
  let item = {}
  if (isString(definition)) item = { key: definition, value }
  else if (isPlainObject(definition)) item = definition
  else if (isFunction(definition)) {
    const result = def(value, cRec)
    if (isPlainObject(result)) item = result
    else item = { value: result }
  }

  if (isEmpty(item)) nRec[key] = value
  else {
    const k = item.key || get(transformer, `_common.${key}`, key)
    nRec[k] = (isFunction(item.value) ? item.value(value, rec) : item.value) || value
  }
}
