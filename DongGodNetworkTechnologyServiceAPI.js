// 东神网络科技服务API
const DongGodNetworkTechnologyServiceAPI = (function() {
    // 加载信息中转站脚本
    async function loadRelayStation() {
        if (typeof DongGodNetworkTechnologyServicesInformationRelayStation === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://dongshengamestudio.github.io/DongGodNetworkTechnologyServices-InformationRelayStation/DongGodNetworkTechnologyServices-InformationRelayStation.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }
    
    // 计算SHA-256哈希
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // 验证用户
    async function verifyUser(username, password) {
        try {
            await loadRelayStation();
            const passwordHash = await sha256(password);
            
            // 获取用户编号
            let userNumber = null;
            
            // 检查是手机号还是邮箱
            if (username.includes('@')) {
                // 邮箱登录
                userNumber = await DongGodNetworkTechnologyServicesInformationRelayStation.getUserNumberByEmail(username);
            } else {
                // 手机号登录
                userNumber = await DongGodNetworkTechnologyServicesInformationRelayStation.getUserNumberByPhone(username);
            }
            
            if (!userNumber) {
                return null;
            }
            
            // 验证密码
            const isValid = await DongGodNetworkTechnologyServicesInformationRelayStation.verifyPassword(userNumber, passwordHash);
            
            if (isValid) {
                // 获取用户信息
                const nickname = await DongGodNetworkTechnologyServicesInformationRelayStation.getUserNickname(userNumber);
                const currency = await DongGodNetworkTechnologyServicesInformationRelayStation.getUserCurrency(userNumber);
                
                return {
                    number: userNumber,
                    nickname: nickname,
                    currency: currency
                };
            }
            
            return null;
        } catch (error) {
            console.error('用户验证失败:', error);
            return null;
        }
    }
    
    return {
        verifyUser: verifyUser
    };
})();