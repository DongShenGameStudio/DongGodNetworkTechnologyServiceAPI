// 东神网络科技服务API
const DongGodNetworkTechnologyServiceAPI = (function() {
    // 加载信息中转站脚本
    async function loadRelayStation() {
        if (typeof DongGodNetworkTechnologyServicesInformationRelayStation === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'DongGodNetworkTechnologyServices-InformationRelayStation.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }
    
    // 验证用户（使用明文密码）
    async function verifyUser(username, password) {
        try {
            await loadRelayStation();
            
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
            
            // 验证密码（明文比较）
            const isValid = await DongGodNetworkTechnologyServicesInformationRelayStation.verifyPassword(userNumber, password);
            
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