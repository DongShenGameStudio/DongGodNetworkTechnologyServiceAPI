/**
 * 东神网络科技服务 API（浏览器端）
 * 改动点：
 * 1. 手机号/邮箱先转 SHA-256 再查表
 * 2. 密码继续 SHA-256 比对
 * 3. 其余逻辑不变，完全兼容 file:///
 */
window.DongGodAPI = (function () {

  async function init() {
    await window.DongGodRelay.init();   // 等表拉完
  }

  /* ===== 对外唯一接口 ===== */
  async function login(ident, rawPwd) {
    // 1. 把用户输入的 ident 统一算 SHA-256
    const identHash = await sha256(ident.trim());
    // 2. 用 identHash 查 UID
    const uid = window.DongGodRelay.getUID(identHash);
    if (!uid) return { ok: false, msg: '用户不存在' };

    // 3. 密码同样 SHA-256
    const pwdHash = await sha256(rawPwd);
    const realPwd = window.DongGodRelay.getPwd(uid);
    if (pwdHash !== realPwd) return { ok: false, msg: '密码错误' };

    // 4. 成功返回
    return {
      ok: true,
      uid,
      nick: window.DongGodRelay.getNick(uid),
      money: window.DongGodRelay.getMoney(uid)
    };
  }

  /* ===== 纯 JS SHA-256（file:/// 可用） ===== */
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let result = '';

    let words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    const hash = (sha256.h = sha256.h || []);
    const k = (sha256.k = sha256.k || []);
    let primeCounter = k[lengthProperty];
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (let j = 0; j < ascii[lengthProperty]; j++) {
      const i = ascii.charCodeAt(j);
      if (i >> 8) return;
      words[j >> 2] |= i << ((3 - j) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = asciiBitLength;

    for (let j = 0; j < words[lengthProperty];) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash.slice(0);
      hash.splice(0, 8);

      for (let i = 0; i < 64; i++) {
        const w15 = w[i - 15];
        const w2 = w[i - 2];
        const a = hash[0];
        const e = hash[4];
        const temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);
        const temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash.unshift((temp1 + temp2) | 0);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (let j = 0; j < 8; j++) {
      for (let k = 3; k + 1; k--) {
        const b = (hash[j] >> (k * 8)) & 255;
        result += (b < 16 ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  return { init, login };
})();