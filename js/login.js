document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const masterPassword = document.getElementById('masterPassword').value;
        
        try {
            // 计算密码哈希
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(masterPassword);
            const hash = await crypto.subtle.digest('SHA-256', passwordBuffer);
            const hashHex = Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            // 验证用户名和密码
            const isValid = await StorageManager.verifyMasterHash(username, hashHex);
            
            if (isValid) {
                // 存储登录状态和用户信息
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', username);
                sessionStorage.setItem('masterKey', masterPassword);
                window.location.href = 'dashboard.html';
            } else {
                alert('用户名或主密码错误');
            }
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请重试');
        }
    });
}); 