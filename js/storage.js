// 本地文件存储管理
const StorageManager = {
    // 保存主密码哈希和用户信息
    saveMasterHash: async (username, hash) => {
        try {
            const response = await fetch('/api/save-master-hash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, hash })
            });
            if (!response.ok) {
                throw new Error('保存主密码哈希失败');
            }
        } catch (error) {
            console.error('保存主密码哈希失败:', error);
            throw error;
        }
    },

    // 获取所有用户列表
    getUserList: async () => {
        try {
            const response = await fetch('/api/get-user-list');
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.users;
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return [];
        }
    },

    // 验证用户主密码
    verifyMasterHash: async (username, hash) => {
        try {
            const response = await fetch('/api/verify-master-hash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, hash })
            });
            if (!response.ok) {
                return false;
            }
            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error('验证主密码失败:', error);
            return false;
        }
    },

    // 保存用户的密码库
    saveVault: async (username, encryptedData) => {
        const vault = JSON.stringify(encryptedData, null, 2);
        try {
            const response = await fetch('/api/save-vault', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, vault })
            });
            if (!response.ok) {
                throw new Error('保存失败');
            }
        } catch (error) {
            console.error('保存密码库失败:', error);
            throw error;
        }
    },

    // 加载用户的密码库
    loadVault: async (username) => {
        try {
            const response = await fetch(`/api/load-vault/${encodeURIComponent(username)}`);
            if (!response.ok) {
                return null;
            }
            const data = await response.json();
            return data.vault;
        } catch (error) {
            console.error('加载密码库失败:', error);
            return null;
        }
    },

    // 删除用户
    deleteUser: async (username) => {
        try {
            const response = await fetch(`/api/delete-user/${encodeURIComponent(username)}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('删除用户失败:', error);
            return false;
        }
    },

    // 清除所有数据
    clearAll: async () => {
        try {
            await fetch('/api/clear-all', { method: 'POST' });
        } catch (error) {
            console.error('清除数据失败:', error);
            throw error;
        }
    },

    // 导出加密的密码库
    exportVault: () => {
        const vault = StorageManager.loadVault();
        if (!vault) return null;
        
        const blob = new Blob([JSON.stringify(vault, null, 2)], { type: 'application/json' });
        return URL.createObjectURL(blob);
    },

    // 导入加密的密码库
    importVault: async (fileContent) => {
        try {
            const vault = JSON.parse(fileContent);
            await StorageManager.saveVault(vault);
            return true;
        } catch (error) {
            console.error('导入失败:', error);
            return false;
        }
    }
}; 