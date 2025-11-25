// 东神网络科技服务API - 简化版
const DongGodNetworkTechnologyServiceAPI = (function() {
    let userData = null;
    
    // 加载用户数据
    async function loadUserData() {
        if (userData) return userData;
        
        try {
            // 加载所有JSON数据
            const urls = [
                'UserMobilePhoneNumberCorrespondingNumberTable.json',
                'UserEmailAddressNumberToNumberTable.json',
                'Number-To-PasswordTable.json',
                'NicknameOfTheUserCorrespondingToTheNumber.json',
                'ChineseCurrencyCorrespondingToTheNumber.json'
            ];
            
            const responses = await Promise.all(urls.map(url => fetch(url)));
            const data = await Promise.all(responses.map(response => response.json()));
            
            // 存储数据
            userData = {
                phoneToNumber: data[0],
                emailToNumber: data[1],
                numberToPassword: data[2],
                numberToNickname: data[3],
                numberToCurrency: data[4]
            };
            
            return userData;
        } catch (error) {
            console.error('加载用户数据失败:', error);
            throw new Error('无法加载用户数据');
        }
    }
    
    // 验证用户
    async function verifyUser(username, password) {
        try {
            const data = await loadUserData();
            
            // 获取用户编号
            let userNumber = null;
            
            // 检查是手机号还是邮箱
            if (username.includes('@')) {
                // 邮箱登录
                userNumber = data.emailToNumber[username];
            } else {
                // 手机号登录
                userNumber = data.phoneToNumber[username];
            }
            
            if (!userNumber) {
                return null;
            }
            
            // 验证密码（明文比较）
            if (data.numberToPassword[userNumber] === password) {
                // 获取用户信息
                const nickname = data.numberToNickname[userNumber] || '未知用户';
                const currency = data.numberToCurrency[userNumber] || '0';
                
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