document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const masterPassword = document.getElementById('masterPassword').value;
        
        try {
            // 直接发送用户名和密码到服务器进行验证
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password: masterPassword
                })
            });

            const data = await response.json();
            
            if (data.success) {
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