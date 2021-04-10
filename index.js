const fnProxyPropName = Symbol('FnProxyConfig');
const proxyObjPropName = Symbol('proxyObjPropName');

const prefixFnsInfosKeys = 'prefixFnInfos';
const rearFnsInfosKeys = 'rearFnInfos';

const configFuncPropName = Symbol('configFuncPropName');
const execFnsPropName = Symbol('execFnsPropName');
const proxyGetFnPropName = Symbol('proxyGetFnPropName');

class ProxyObjMethod {
  constructor(target) {
    if (typeof target !== 'object' || !target) {
      throw new Error('The type "object" is required for target');
    }
    this.targetObj = target;
  /* {[fnName]: {
         [prefixFnsInfosKeys]: [ {conditionFunc: Fn, funcs: Fn } ],
         [rearFnsInfosKeys]: [ {conditionFunc: Fn, funcs: Fn } ],
      }
    }
  */
    this[fnProxyPropName] = {};
    this[proxyObjPropName] = null;
  }

  rear (funcPropName, configFns, conditionFunc = () => true) {
    this[configFuncPropName](false, funcPropName, configFns, conditionFunc);
    return this;
  }

  prefix (funcPropName, configFns, conditionFunc = () => true) {
    this[configFuncPropName](true, funcPropName, configFns, conditionFunc);
    return this;
  }

  end () {
    if (this[proxyObjPropName]) return this[proxyObjPropName];

    const bindedProxyGet = this[proxyGetFnPropName].bind(this);
    this[proxyObjPropName] = new Proxy(this.targetObj, { get: bindedProxyGet });
    return this[proxyObjPropName];
  }

  // @private 
  [configFuncPropName] (isPrefixConfig, funcPropName, configFns, conditionFunc) {
    if (typeof funcPropName !== 'string' || !funcPropName) {
      throw new Error('Invalid funcPropName');
    }

    Array.isArray(configFns) || (configFns = [configFns]);
    for(const fn of configFns) {
      if (typeof fn !== 'function') {
        throw new Error('Invaid config-function');
      }
    }

    if (typeof conditionFunc !== 'function') {
      throw new Error('Invaid condition function');
    }

    this[fnProxyPropName][funcPropName] || (this[fnProxyPropName][funcPropName] = {});
    const originFnInfo = this[fnProxyPropName][funcPropName];

    const configKey = isPrefixConfig ? prefixFnsInfosKeys : rearFnsInfosKeys;
    originFnInfo[configKey] || (originFnInfo[configKey] = []);

    originFnInfo[configKey].push({ conditionFunc, funcs: configFns });
  }

  // @private 
  [proxyGetFnPropName] (target, propName, proxy) {
    if (
      typeof target[propName] !== 'function' ||
      !Reflect.has(this[fnProxyPropName], propName)
    ) return target[propName];

    const originFnInfo = this[fnProxyPropName][propName];
    const execFn = this[execFnsPropName];
    return async function exec (...args) {
      let retValMap = {};

      if (originFnInfo[prefixFnsInfosKeys]) {
        for (const fnInfo of originFnInfo[prefixFnsInfosKeys]) {
          if (fnInfo.conditionFunc(target)) {
            const moreRetValMap = await execFn(fnInfo.funcs, args, retValMap);
            retValMap = {...retValMap, ...moreRetValMap};
          }
        }
      }

      retValMap[target[propName].name || 'result'] = await target[propName](
        ...args, { ...retValMap }
      );

      if (originFnInfo[rearFnsInfosKeys]) {
        for (const fnInfo of originFnInfo[rearFnsInfosKeys]) {
          if (fnInfo.conditionFunc(target)) {
            const moreRetValMap = await execFn(fnInfo.funcs, args, retValMap);
            retValMap = {...retValMap, ...moreRetValMap};
          }
        }
      }

      return retValMap[target[propName].name || 'result'];
    }   
  }

  // @private 
  async [execFnsPropName] (fnsInfo, args, retValMap) {
    if (!Array.isArray(fnsInfo)) throw new Error('Invalid fnsInfo');

    const results = await Promise.all(
      fnsInfo.map(fn => fn(...args, {...retValMap}))
    );

    const newRetValMap = {};
    for (let i = 0; i < fnsInfo.length; i++) {
      if (fnsInfo[i].name) {
        newRetValMap[fnsInfo[i].name] = results[i];
      }
    }
    return newRetValMap;
  }
}

module.exports = ProxyObjMethod;  
