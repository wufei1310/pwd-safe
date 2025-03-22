// 主面板功能管理
document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录状态
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = sessionStorage.getItem('currentUser');
    const masterKey = sessionStorage.getItem('masterKey');
    let currentVault = null;

    // 初始化
    const init = async () => {
        try {
            // 加载密码库
            currentVault = await StorageManager.loadVault(currentUser);
            if (!currentVault) {
                currentVault = { entries: [] };
            }
            await refreshPasswordList();
        } catch (error) {
            console.error('初始化失败:', error);
            alert('加载密码失败');
        }
    };

    // 刷新密码列表
    const refreshPasswordList = async () => {
        const passwordList = document.getElementById('passwordList');
        passwordList.innerHTML = ''; // 清空现有列表

        if (!currentVault || !currentVault.entries) return;

        currentVault.entries.forEach(entry => {
            const card = createPasswordCard(entry);
            passwordList.appendChild(card);
        });
    };

    // 创建密码卡片
    const createPasswordCard = (entry) => {
        const card = document.createElement('div');
        card.className = 'glass-effect p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-semibold text-gray-800">${entry.title}</h3>
                <span class="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">${entry.category || '未分类'}</span>
            </div>
            <p class="text-gray-600 mb-4">${entry.username}</p>
            <div class="flex justify-between items-center">
                <button class="text-blue-500 hover:text-blue-600 flex items-center view-btn">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    查看
                </button>
                <button class="text-gray-500 hover:text-gray-600 flex items-center edit-btn">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    编辑
                </button>
            </div>
        `;

        // 查看按钮点击事件
        card.querySelector('.view-btn').addEventListener('click', async () => {
            try {
                const decrypted = await decryptPassword(
                    entry.password,
                    entry.iv,
                    entry.authTag,
                    entry.salt
                );
                showPasswordModal(entry.title, entry.username, decrypted, entry.website);
            } catch (error) {
                console.error('解密失败:', error);
                alert('无法显示密码');
            }
        });

        // 编辑按钮点击事件
        card.querySelector('.edit-btn').addEventListener('click', async () => {
            try {
                const decrypted = await decryptPassword(
                    entry.password,
                    entry.iv,
                    entry.authTag,
                    entry.salt
                );
                const form = document.getElementById('passwordForm');
                form.dataset.editId = entry.id;
                document.getElementById('title').value = entry.title;
                document.getElementById('username').value = entry.username;
                document.getElementById('password').value = decrypted;
                document.getElementById('website').value = entry.website || '';
                document.getElementById('category').value = entry.category || '';
                
                // 显示模态框
                document.getElementById('passwordModal').classList.remove('hidden');
            } catch (error) {
                console.error('编辑失败:', error);
                alert('无法编辑密码');
            }
        });

        return card;
    };

    // 显示密码模态框
    const showPasswordModal = (title, username, password, website) => {
        const modal = document.getElementById('viewPasswordModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalUsername = document.getElementById('modalUsername');
        const modalPassword = document.getElementById('modalPassword');
        const modalWebsite = document.getElementById('modalWebsite');
        const websiteLink = modalWebsite.querySelector('a');
        const websiteUrl = modalWebsite.querySelector('.website-url');
        
        modalTitle.textContent = title;
        modalUsername.textContent = username;
        modalPassword.value = password;

        // 处理网站链接
        if (website) {
            let url = website;
            // 如果URL没有协议前缀，添加 https://
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            websiteLink.href = url;
            websiteUrl.textContent = website;
            modalWebsite.style.display = 'block';
        } else {
            modalWebsite.style.display = 'none';
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // 添加动画效果
        const modalContent = modal.querySelector('div');
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
    };

    // 复制密码到剪贴板
    document.getElementById('copyPasswordBtn').addEventListener('click', () => {
        const passwordInput = document.getElementById('modalPassword');
        passwordInput.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const copyBtn = document.getElementById('copyPasswordBtn');
        const originalText = copyBtn.textContent;
        const originalBg = copyBtn.className;
        
        copyBtn.innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            已复制
        `;
        copyBtn.className = copyBtn.className.replace('bg-blue-500', 'bg-green-500');
        
        setTimeout(() => {
            copyBtn.innerHTML = `
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                </svg>
                复制
            `;
            copyBtn.className = originalBg;
        }, 1000);
    });

    // 关闭模态框
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        const modal = document.getElementById('viewPasswordModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // 点击模态框背景关闭
    document.getElementById('viewPasswordModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.add('hidden');
            e.currentTarget.classList.remove('flex');
        }
    });

    // 生成随机密码
    const generatePassword = (length = 16) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    };

    // 从主密码生成加密密钥
    const deriveKey = async (password) => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const salt = new Uint8Array(16); // 使用固定的salt以确保每次生成相同的密钥
        
        // 使用 PBKDF2 从主密码派生密钥
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    };

    // 加密密码数据
    const encryptPassword = async (password) => {
        try {
            const masterPassword = sessionStorage.getItem('masterKey');
            const response = await fetch('/api/encrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password,
                    masterPassword
                })
            });

            if (!response.ok) {
                throw new Error('加密请求失败');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '加密失败');
            }

            return result.encrypted;
        } catch (error) {
            console.error('加密失败:', error);
            throw error;
        }
    };

    // 解密密码数据
    const decryptPassword = async (encryptedData, iv, authTag, salt) => {
        try {
            const masterPassword = sessionStorage.getItem('masterKey');
            console.log('解密请求数据:', {
                encryptedData,
                iv,
                authTag,
                salt,
                masterPassword
            });
            const response = await fetch('/api/decrypt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    encryptedData,
                    iv,
                    authTag,
                    salt,
                    masterPassword
                })
            });

            if (!response.ok) {
                throw new Error('解密请求失败');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '解密失败');
            }

            return result.decrypted;
        } catch (error) {
            console.error('解密失败:', error);
            throw error;
        }
    };

    // 绑定事件监听器
    const bindEventListeners = () => {
        // 添加新密码按钮
        document.getElementById('addNewBtn').addEventListener('click', () => {
            document.getElementById('passwordForm').reset();
            document.getElementById('passwordModal').classList.remove('hidden');
        });

        // 生成随机密码按钮
        document.getElementById('generatePasswordBtn')?.addEventListener('click', () => {
            document.getElementById('password').value = generatePassword();
        });

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', () => {
            document.getElementById('passwordModal').classList.add('hidden');
        });

        // 退出按钮
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'index.html';
        });

        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('#passwordList > div');
            
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const username = card.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || username.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // 密码表单提交
        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                id: Date.now().toString(),
                title: document.getElementById('title').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                website: document.getElementById('website').value,
                category: document.getElementById('category').value,
                createdAt: new Date().toISOString()
            };

            try {
                await savePassword(formData);
                document.getElementById('passwordModal').classList.add('hidden');
                document.getElementById('passwordForm').reset();
            } catch (error) {
                alert('保存失败，请重试');
            }
        });

        // 导出密码
        document.getElementById('exportBtn').addEventListener('click', exportPasswords);
    };

    // 查看密码
    window.viewPassword = async (id) => {
        try {
            const entry = currentVault.entries.find(e => e.id === id);
            if (entry) {
                const decryptedPassword = await decryptPassword(
                    entry.password,
                    entry.iv,
                    entry.authTag,
                    entry.salt
                );
                alert(`
                    标题: ${entry.title}
                    用户名: ${entry.username}
                    密码: ${decryptedPassword}
                    网站: ${entry.website}
                    分类: ${entry.category}
                `);
            }
        } catch (error) {
            console.error('查看密码失败:', error);
            alert('查看密码失败');
        }
    };

    // 编辑密码
    window.editPassword = async (id) => {
        try {
            const entry = currentVault.entries.find(e => e.id === id);
            if (entry) {
                const decryptedPassword = await decryptPassword(
                    entry.password,
                    entry.iv,
                    entry.authTag,
                    entry.salt
                );
                
                document.getElementById('title').value = entry.title;
                document.getElementById('username').value = entry.username;
                document.getElementById('password').value = decryptedPassword;
                document.getElementById('website').value = entry.website;
                document.getElementById('category').value = entry.category;
                
                // 存储当前编辑的ID
                document.getElementById('passwordForm').dataset.editId = id;
                document.getElementById('passwordModal').classList.remove('hidden');
            }
        } catch (error) {
            console.error('编辑密码失败:', error);
            alert('编辑密码失败');
        }
    };

    // 删除密码
    window.deletePassword = async (id) => {
        if (confirm('确定要删除这个密码吗？')) {
            try {
                currentVault.entries = currentVault.entries.filter(e => e.id !== id);
                await StorageManager.saveVault(currentUser, currentVault);
                await refreshPasswordList();
            } catch (error) {
                console.error('删除密码失败:', error);
                alert('删除失败');
            }
        }
    };

    // 保存密码
    const savePassword = async (formData) => {
        try {
            // 加密密码
            const encrypted = await encryptPassword(formData.password);
            formData.password = encrypted.data;
            formData.iv = encrypted.iv;
            formData.authTag = encrypted.authTag;
            formData.salt = encrypted.salt;

            // 保存到密码库
            if (!currentVault.entries) {
                currentVault.entries = [];
            }
            
            // 检查是否是编辑现有密码
            const editId = document.getElementById('passwordForm').dataset.editId;
            if (editId) {
                const index = currentVault.entries.findIndex(e => e.id === editId);
                if (index >= 0) {
                    currentVault.entries[index] = { ...formData, id: editId };
                } else {
                    currentVault.entries.push(formData);
                }
                delete document.getElementById('passwordForm').dataset.editId;
            } else {
                currentVault.entries.push(formData);
            }

            await StorageManager.saveVault(currentUser, currentVault);
            await refreshPasswordList();
        } catch (error) {
            console.error('保存密码失败:', error);
            throw error;
        }
    };

    // 导出密码
    const exportPasswords = async () => {
        try {
            const response = await fetch('/api/export-passwords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: currentUser,
                    masterPassword: sessionStorage.getItem('masterKey')
                })
            });

            if (!response.ok) {
                throw new Error('导出请求失败');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '导出失败');
            }

            // 格式化导出数据
            const exportData = result.data.map(entry => ({
                标题: entry.title,
                用户名: entry.username,
                密码: entry.password,
                网站: entry.website || '',
                分类: entry.category || '',
                创建时间: new Date(entry.createdAt).toLocaleString()
            }));

            // 转换为CSV格式
            const headers = ['标题', '用户名', '密码', '网站', '分类', '创建时间'];
            const csv = [
                headers.join(','),
                ...exportData.map(row => headers.map(header => {
                    const value = row[header] || '';
                    // 处理包含逗号的值
                    return value.includes(',') ? `"${value}"` : value;
                }).join(','))
            ].join('\n');

            // 创建并下载文件
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `密码导出_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('密码导出成功！');
        } catch (error) {
            console.error('导出密码失败:', error);
            alert('导出失败，请重试');
        }
    };

    // 初始化应用
    await init();
    bindEventListeners();
}); 