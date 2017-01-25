/**
 * Tools
 * 
 */
// https://www.npmjs.com/package/validator
import validator from 'validator'
import md5 from 'js-md5'
import randomstring from 'randomstring'
import moment from 'moment'
const Tools = {
    isRubTemporary(key) {
        return /^_/g.test(key)
    },
    replaceParams(uri, fields) {
        let params = uri.split('/')
        let str = ''
        params.forEach(param => {
            if (param.length > 0) {
                if (param.startsWith(':')) {
                    let field = param.substring(1)
                    str = str + '/' + fields[field].value
                } else {
                    str = str + '/' + param
                }
            }
        })
        return str
    }
}
export { Tools }