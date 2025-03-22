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
        card.className = 'bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-200';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold text-gray-800">${entry.title}</h3>
                <span class="text-sm text-gray-500">${entry.category || '未分类'}</span>
            </div>
            <p class="text-gray-600 mb-2">${entry.username}</p>
            <div class="flex justify-between items-center">
                <button class="text-blue-500 hover:text-blue-600 view-btn">查看</button>
                <button class="text-gray-500 hover:text-gray-600 edit-btn">编辑</button>
            </div>
        `;

        // 查看按钮点击事件
        card.querySelector('.view-btn').addEventListener('click', async () => {
            try {
                const decrypted = await decryptPassword(entry.password, entry.iv);
                showPasswordModal(entry.title, entry.username, decrypted);
            } catch (error) {
                console.error('解密失败:', error);
                alert('无法显示密码');
            }
        });

        // 编辑按钮点击事件
        card.querySelector('.edit-btn').addEventListener('click', () => {
            document.getElementById('passwordForm').dataset.editId = entry.id;
            document.getElementById('title').value = entry.title;
            document.getElementById('username').value = entry.username;
            document.getElementById('category').value = entry.category || '';
            document.getElementById('notes').value = entry.notes || '';
            document.getElementById('addNewBtn').click();
        });

        return card;
    };

    // 显示密码模态框
    const showPasswordModal = (title, username, password) => {
        const modal = document.getElementById('viewPasswordModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalUsername = document.getElementById('modalUsername');
        const modalPassword = document.getElementById('modalPassword');
        
        modalTitle.textContent = title;
        modalUsername.textContent = username;
        modalPassword.value = password;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    // 复制密码到剪贴板
    document.getElementById('copyPasswordBtn').addEventListener('click', () => {
        const passwordInput = document.getElementById('modalPassword');
        passwordInput.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const copyBtn = document.getElementById('copyPasswordBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制';
        copyBtn.classList.add('bg-green-500');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('bg-green-500');
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
            const key = await deriveKey(masterKey);
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            
            return {
                data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
                iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
            };
        } catch (error) {
            console.error('加密失败:', error);
            throw error;
        }
    };

    // 解密密码数据
    const decryptPassword = async (encryptedData, iv) => {
        try {
            const key = await deriveKey(masterKey);
            const decoder = new TextDecoder();
            const encryptedArray = new Uint8Array(encryptedData.match(/.{2}/g).map(byte => parseInt(byte, 16)));
            const ivArray = new Uint8Array(iv.match(/.{2}/g).map(byte => parseInt(byte, 16)));
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivArray },
                key,
                encryptedArray
            );
            
            return decoder.decode(decrypted);
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
    };

    // 查看密码
    window.viewPassword = async (id) => {
        try {
            const entry = currentVault.entries.find(e => e.id === id);
            if (entry) {
                const decryptedPassword = await decryptPassword(entry.password, entry.iv);
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
                const decryptedPassword = await decryptPassword(entry.password, entry.iv);
                
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

    // 初始化应用
    await init();
    bindEventListeners();
}); 