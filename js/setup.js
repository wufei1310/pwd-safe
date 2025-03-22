document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setupForm');
    const usernameInput = document.getElementById('username');
    const newPasswordInput = document.getElementById('newMasterPassword');
    const confirmPasswordInput = document.getElementById('confirmMasterPassword');
    const strengthDiv = document.getElementById('passwordStrength');

    // 检查密码强度
    const checkPasswordStrength = (password) => {
        let strength = 0;
        let feedback = [];

        if (password.length < 8) {
            feedback.push('密码长度至少需要8个字符');
        } else {
            strength += 1;
        }

        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^A-Za-z0-9]/)) strength += 1;

        if (strength < 3) {
            feedback.push('建议包含大小写字母、数字和特殊字符');
        }

        return {
            score: strength,
            feedback: feedback.join(', ')
        };
    };

    // 检查用户名是否已存在
    const checkUsername = async (username) => {
        const users = await StorageManager.getUserList();
        return users.some(user => user.username === username);
    };

    // 密码强度实时检查
    newPasswordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(newPasswordInput.value);
        strengthDiv.textContent = strength.feedback || '密码强度: ' + '🔒'.repeat(strength.score);
        strengthDiv.className = 'text-sm ' + (strength.score >= 3 ? 'text-green-600' : 'text-orange-500');
    });

    // 表单提交处理
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 验证用户名
        if (await checkUsername(username)) {
            alert('用户名已存在');
            return;
        }

        // 验证密码
        if (newPassword !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        const strength = checkPasswordStrength(newPassword);
        if (strength.score < 3) {
            if (!confirm('当前密码强度较弱，是否继续？')) {
                return;
            }
        }

        try {
            // 生成密码哈希
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(newPassword);
            const hash = await crypto.subtle.digest('SHA-256', passwordBuffer);
            const hashHex = Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            // 保存用户信息和主密码哈希
            await StorageManager.saveMasterHash(username, hashHex);

            // 初始化空的密码库
            const emptyVault = {
                entries: [],
                createdAt: new Date().toISOString()
            };
            await StorageManager.saveVault(username, emptyVault);

            alert('用户创建成功！');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('创建用户失败:', error);
            alert('创建失败，请重试');
        }
    });
}); 